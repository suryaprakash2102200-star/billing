import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function GET() {
    try {
        await dbConnect();
        const customers = await Customer.find({}).sort({ totalOrders: -1 });
        return NextResponse.json({ customers });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        const existing = await Customer.findOne({ phone: body.phone });
        if (existing) {
            return NextResponse.json({ error: 'Customer phone already exists' }, { status: 400 });
        }

        const customer = await Customer.create(body);
        return NextResponse.json({ success: true, customer }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
}
