import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import { getSessionUser } from '@/lib/auth';

// Helper to extract userId from session
function extractUserId(sessionUser) {
    const rawUserId = sessionUser.userId;
    if (typeof rawUserId === 'string') return rawUserId;
    if (rawUserId && typeof rawUserId === 'object') {
        if (rawUserId.buffer) {
            const bytes = Object.values(rawUserId.buffer);
            return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        if (rawUserId.$oid) return rawUserId.$oid;
        if (rawUserId.toString && rawUserId.toString() !== '[object Object]') {
            return rawUserId.toString();
        }
    }
    return null;
}

// POST /api/inquiries/:id/convert - Convert inquiry to order
export async function POST(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = extractUserId(sessionUser);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        // Get the inquiry
        const inquiry = await Inquiry.findById(id).populate('lead');
        if (!inquiry) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        if (inquiry.status === 'Converted') {
            return NextResponse.json({ error: 'Inquiry already converted' }, { status: 400 });
        }

        const body = await req.json();
        const { deliveryDate, notes, totalAmount, advanceAmount, paymentMode } = body;

        // 1. Find or create customer
        let customer = await Customer.findOne({ phone: inquiry.customerPhone });

        if (!customer) {
            customer = await Customer.create({
                name: inquiry.customerName,
                phone: inquiry.customerPhone,
                email: inquiry.customerEmail,
                lead: inquiry.lead?._id,
                source: inquiry.lead ? 'Lead' : 'Direct'
            });
        }

        // 2. Create order
        const order = await Order.create({
            customer: customer._id,
            product: inquiry.product,
            quantity: inquiry.quantity,
            totalAmount: totalAmount || inquiry.estimatedValue || 0,
            advanceAmount: advanceAmount || 0,
            paymentMode: paymentMode || 'Cash',
            deliveryDate: deliveryDate,
            notes: notes,
            status: 'Received',
            createdBy: userId
        });

        // 3. Update inquiry status
        inquiry.status = 'Converted';
        inquiry.convertedToOrder = order._id;
        inquiry.timeline.push({
            action: 'Converted to Order',
            description: `Converted to Order #${order._id.toString().slice(-6).toUpperCase()}`,
            user: userId
        });
        await inquiry.save();

        // 4. Update customer stats
        customer.totalOrders += 1;
        customer.totalSpent += (totalAmount || inquiry.estimatedValue || 0);
        customer.lastOrderDate = new Date();
        await customer.save();

        // 5. If inquiry came from lead, update lead
        if (inquiry.lead) {
            const Lead = (await import('@/models/Lead')).default;
            await Lead.findByIdAndUpdate(inquiry.lead._id, {
                $push: {
                    timeline: {
                        action: 'Order Created',
                        description: 'Lead converted to paying customer',
                        user: userId
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            order,
            customer,
            message: 'Inquiry converted to order successfully'
        }, { status: 201 });
    } catch (error) {
        console.error('Convert inquiry error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to convert inquiry' },
            { status: 500 }
        );
    }
}
