import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();

        const payment = await Payment.findById(id);
        if (!payment) return NextResponse.json({ error: 'Payment not found' }, { status: 404 });

        // Update allowed fields
        if (body.advancePaid !== undefined) payment.advancePaid = body.advancePaid;
        if (body.totalAmount !== undefined) payment.totalAmount = body.totalAmount;
        if (body.paymentMode !== undefined) payment.paymentMode = body.paymentMode;
        if (body.notes !== undefined) payment.notes = body.notes;

        // Recalculate handled by pre-save hook
        await payment.save();

        return NextResponse.json({ success: true, payment });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update payment' }, { status: 500 });
    }
}
