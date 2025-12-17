import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Stage from '@/models/Stage';

export async function PUT(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params; // await params for Next 15
        const body = await req.json();
        const stage = await Stage.findByIdAndUpdate(id, body, { new: true });
        return NextResponse.json({ stage });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req, { params }) {
    try {
        await dbConnect();
        const { id } = await params;
        // Soft delete
        await Stage.findByIdAndUpdate(id, { isArchived: true });
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
