import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

// TEMPORARY ENDPOINT - DELETE AFTER FIRST ADMIN SETUP
export async function POST() {
    try {
        await dbConnect();
        const result = await User.deleteMany({});

        return NextResponse.json({
            success: true,
            message: `Deleted ${result.deletedCount} users. You can now sign up as the first admin.`
        });
    } catch (error) {
        console.error('Reset error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
