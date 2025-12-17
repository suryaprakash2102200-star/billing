import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quotation from '@/models/Quotation';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Inquiry from '@/models/Inquiry';
import { getSessionUser } from '@/lib/auth';

// Helper to extract userId
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

        const body = await req.json();
        const { advanceAmount, paymentMode, deliveryDate, notes } = body;

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        if (quotation.status === 'Accepted' || quotation.convertedToOrder) {
            return NextResponse.json({ error: 'Quotation already converted' }, { status: 400 });
        }

        // Create Order from Quotation
        // We'll create one order per item or one combined order? 
        // Typically one "Order" document might contain multiple items, but our Order model seems designed for single product type or mixed?
        // Let's check Order model again. It has `productType`, `size`, `quantity`. It seems designed for single line item orders.
        // If quotation has multiple items, we might need to create multiple orders or update Order model to support items.
        // For now, let's assume we pick the first item or comma separate them if multiple.

        // Strategy: Create one main order. If multiple items, list them in notes or modify Order model.
        // Given current Order model constraints, we'll try to map best effort.

        const mainItem = quotation.items[0];

        // Normalize product name to match Order enum case-insensitively
        const orderStatusEnum = ['Photo Frame', 'Digital Photo', 'Album'];
        const validProduct = orderStatusEnum.find(p => p.toLowerCase() === (mainItem.product || '').toLowerCase()) || 'Photo Frame';

        const orderData = {
            customerName: quotation.customerName,
            phone: quotation.customerPhone,
            email: quotation.customerEmail,
            productType: validProduct, // Use normalized product
            size: mainItem.description || 'Standard', // Mapping description to size/details
            quantity: quotation.items.reduce((sum, item) => sum + item.quantity, 0),
            status: 'New',
            amount: quotation.total,
            advanceAmount: advanceAmount || 0,
            paymentStatus: advanceAmount >= quotation.total ? 'Paid' : (advanceAmount > 0 ? 'Partial' : 'Pending'),
            paymentMode: paymentMode,
            deliveryDate: deliveryDate,
            notes: `Converted from Quotation #${quotation.quotationId}. ${notes || ''}\nItems: ${quotation.items.map(i => `${i.product} x${i.quantity}`).join(', ')}`,
            createdBy: userId,
            source: 'Quotation'
        };

        const order = await Order.create(orderData);

        // Create Payment Record for the new Order
        await Payment.create({
            orderId: order._id,
            totalAmount: quotation.total,
            advancePaid: advanceAmount || 0,
            paymentMode: paymentMode || 'Cash',
            status: advanceAmount >= quotation.total ? 'Paid' : (advanceAmount > 0 ? 'Partial' : 'Pending'),
            history: [{
                amount: advanceAmount || 0,
                mode: paymentMode || 'Cash',
                date: new Date(),
                recordedBy: userId
            }]
        });

        // Update Quotation status
        quotation.status = 'Accepted';
        quotation.convertedToOrder = order._id;
        await quotation.save();

        // Update linked Inquiry if exists
        if (quotation.inquiry) {
            await Inquiry.findByIdAndUpdate(quotation.inquiry, {
                status: 'Converted',
                order: order._id,
                $push: {
                    timeline: {
                        action: 'Converted to Order',
                        description: `Order #${order._id.toString().slice(-6)} created via Quotation`,
                        user: userId,
                        timestamp: new Date()
                    }
                }
            });
        }

        return NextResponse.json({
            success: true,
            order
        });

    } catch (error) {
        console.error('Convert quotation error:', error);
        return NextResponse.json({ error: 'Failed to convert quotation' }, { status: 500 });
    }
}
