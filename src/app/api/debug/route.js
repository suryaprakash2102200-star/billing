import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import mongoose from 'mongoose';

export async function GET() {
    try {
        await dbConnect();
        const userCount = await User.countDocuments();
        const dbName = mongoose.connection.name;
        const host = mongoose.connection.host;

        return NextResponse.json({
            userCount,
            dbName,
            host,
            envUri: process.env.MONGODB_URI ? 'Defined' : 'Undefined'
        });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
