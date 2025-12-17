import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Stage from '@/models/Stage';

export async function GET(req) {
    try {
        await dbConnect();

        // Check if any stages exist, if not seed defaults
        const count = await Stage.countDocuments({ isArchived: false });
        if (count === 0) {
            const defaults = [
                { name: 'New', order: 0, color: 'bg-blue-50 text-blue-700' },
                { name: 'Designing', order: 1, color: 'bg-yellow-50 text-yellow-700' },
                { name: 'Printing', color: 'bg-primary-50 text-primary-700' },
                { name: 'Ready', order: 3, color: 'bg-indigo-50 text-indigo-700' },
                { name: 'Delivered', order: 4, color: 'bg-green-50 text-green-700', isQualified: true },
            ];
            await Stage.insertMany(defaults);
        }

        const stages = await Stage.find({ isArchived: false }).sort({ order: 1 });
        return NextResponse.json({ stages });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        await dbConnect();
        const body = await req.json();

        // Get highest order to append to end
        const lastStage = await Stage.findOne().sort({ order: -1 });
        const newOrder = lastStage ? lastStage.order + 1 : 0;

        const stage = await Stage.create({ ...body, order: newOrder });
        return NextResponse.json({ stage }, { status: 201 });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req) {
    // Bulk reorder
    try {
        await dbConnect();
        const { stages } = await req.json(); // Expects array of { _id, order }

        const updates = stages.map(s =>
            Stage.findByIdAndUpdate(s._id, { order: s.order })
        );

        await Promise.all(updates);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
