import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
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

// GET /api/invoices - List all invoices
export async function GET(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const paymentStatus = searchParams.get('paymentStatus');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query = {};
        if (status) query.status = status;
        if (paymentStatus) query.paymentStatus = paymentStatus;
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { invoiceId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [invoices, total] = await Promise.all([
            Invoice.find(query)
                .populate('order', 'product status')
                .populate('customer', 'name phone')
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Invoice.countDocuments(query)
        ]);

        return NextResponse.json({
            invoices,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get invoices error:', error);
        return NextResponse.json({ error: 'Failed to fetch invoices' }, { status: 500 });
    }
}

// POST /api/invoices - Create new invoice
export async function POST(req) {
    try {
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
        const {
            orderId,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            items,
            discount,
            taxRate,
            amountPaid,
            termsAndConditions,
            notes,
            dueDays
        } = body;

        // Validation
        if (!customerName || !customerPhone || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Customer details and at least one item are required' },
                { status: 400 }
            );
        }

        // Calculate item totals
        const processedItems = items.map(item => ({
            ...item,
            total: (item.quantity * item.unitPrice) - (item.discount || 0)
        }));

        // Calculate Invoice Level Totals
        const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
        const validDiscount = discount || 0;
        const validTaxRate = taxRate || 0;
        const taxAmount = (subtotal - validDiscount) * (validTaxRate / 100);
        const total = subtotal - validDiscount + taxAmount;

        let paymentStatus = 'Unpaid';
        if ((amountPaid || 0) >= total) paymentStatus = 'Paid';
        else if ((amountPaid || 0) > 0) paymentStatus = 'Partial';

        // Calculate due date
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + (dueDays || 7));

        // Create invoice
        const invoice = await Invoice.create({
            order: orderId || undefined,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            items: processedItems,
            subtotal,
            discount: validDiscount,
            taxRate: validTaxRate,
            taxAmount,
            total, // Explicitly set total
            amountPaid: amountPaid || 0,
            amountDue: total - (amountPaid || 0),
            paymentStatus,
            termsAndConditions,
            notes,
            dueDate,
            createdBy: userId
        });

        await invoice.populate('createdBy', 'name email');

        // Sync with Payment Tracker
        if (orderId) {
            let payment = await Payment.findOne({ orderId });

            if (payment) {
                // Update existing payment
                const previousPaid = payment.advancePaid || 0;
                const newPaid = amountPaid || 0;

                // Only update if amount changed or total changed to reflect final invoice value
                if (newPaid !== previousPaid || payment.totalAmount !== total) {
                    payment.totalAmount = total;
                    payment.advancePaid = newPaid;

                    if (newPaid > previousPaid) {
                        payment.history.push({
                            amount: newPaid - previousPaid,
                            mode: 'Cash', // Default to Cash for invoice updates as field not present
                            date: new Date(),
                            recordedBy: userId,
                            notes: 'Updated via Invoice creation'
                        });
                    }
                    await payment.save();
                }
            } else {
                // Create missing payment record (retroactive fix for old orders)
                await Payment.create({
                    orderId,
                    totalAmount: total,
                    advancePaid: amountPaid || 0,
                    status: (amountPaid || 0) >= total ? 'Paid' : ((amountPaid || 0) > 0 ? 'Partial' : 'Pending'),
                    history: [{
                        amount: amountPaid || 0,
                        mode: 'Cash',
                        date: new Date(),
                        recordedBy: userId,
                        notes: 'Created via Invoice'
                    }]
                });
            }
        }

        return NextResponse.json({
            success: true,
            invoice
        }, { status: 201 });
    } catch (error) {
        console.error('Create invoice error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create invoice' },
            { status: 500 }
        );
    }
}
