import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Customer from '@/models/Customer';

export async function GET(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const customer = await Customer.findById(id);
        if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        return NextResponse.json({ customer });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
    }
}

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const body = await req.json();
        const customer = await Customer.findByIdAndUpdate(id, body, { new: true });
        if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        return NextResponse.json({ success: true, customer });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to update customer' }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        const customer = await Customer.findByIdAndDelete(id);
        if (!customer) return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete customer' }, { status: 500 });
    }
}
