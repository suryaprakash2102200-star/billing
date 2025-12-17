import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Payment from '@/models/Payment';

export async function GET(req) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const orderId = searchParams.get('orderId');

        let query = {};
        if (status) {
            query.status = status;
        }
        if (orderId) {
            query.orderId = orderId;
        }

        const payments = await Payment.find(query).populate('orderId').sort({ updatedAt: -1 });
        return NextResponse.json({ payments });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }
}
