import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Payment from '@/models/Payment';
import Customer from '@/models/Customer';

export async function GET(req) {
    try {
        await dbConnect();
        // Sort by orderDate desc (newest first)
        const orders = await Order.find({}).sort({ orderDate: -1 }).populate('customer', 'name phone').lean();

        // Fetch associated payments
        const orderIds = orders.map(o => o._id);
        const payments = await Payment.find({ orderId: { $in: orderIds } }).lean();

        // Create a map for quick lookup
        const paymentMap = payments.reduce((acc, p) => {
            acc[p.orderId.toString()] = p;
            return acc;
        }, {});

        // Merge payment info into orders
        const ordersWithPayment = orders.map(o => ({
            ...o,
            payment: paymentMap[o._id.toString()] || null,
            paymentStatus: paymentMap[o._id.toString()]?.status || 'Pending',
            balanceAmount: paymentMap[o._id.toString()]?.balanceAmount || 0
        }));

        return NextResponse.json({ orders: ordersWithPayment });
    } catch (error) {
        console.error('Fetch Orders Error:', error);
        return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // 1. Find or Create Customer First
        let customer = await Customer.findOne({ phone: body.phone });
        if (!customer) {
            customer = await Customer.create({
                name: body.customerName,
                phone: body.phone,
                instagramId: body.instagramId,
            });
        } else {
            // Update info if changed
            customer.name = body.customerName;
            if (body.instagramId) customer.instagramId = body.instagramId;
            // Increment order count later
            await customer.save();
        }

        // 2. Create Order with Customer Link
        const order = await Order.create({
            customer: customer._id,
            customerName: body.customerName,
            phone: body.phone,
            instagramId: body.instagramId,
            productType: body.productType,
            size: body.size,
            quantity: body.quantity,
            photoReceived: body.photoReceived,
            status: 'New',
            notes: body.notes,
            deliveryDate: body.deliveryDate,
        });

        // 3. Create Payment Record
        const payment = await Payment.create({
            orderId: order._id,
            totalAmount: body.totalAmount,
            advancePaid: body.advancePaid || 0,
            paymentMode: body.paymentMode, // optional if 0 advance
        });

        // 4. Update stats
        customer.totalOrders += 1;
        await customer.save();

        return NextResponse.json({ success: true, order, payment }, { status: 201 });

    } catch (error) {
        console.error('Create Order Error:', error);
        return NextResponse.json({ error: error.message || 'Failed to create order' }, { status: 500 });
    }
}
