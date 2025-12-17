import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { hashPassword, getSessionUser } from '@/lib/auth';

export async function POST(req) {
    try {
        await dbConnect();

        // Check if any users exist
        const userCount = await User.countDocuments();
        console.log('Signup Debug - User Count:', userCount);
        const isFirstUser = userCount === 0;

        // Allow public signup. 
        // Logic: First user is Admin. Subsequent users are 'staff' by default unless created by an Admin (logic simplified for public signup form).


        const { name, email, password, role } = await req.json();

        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Force 'staff' role for public signups to prevent privilege escalation
        const startRole = isFirstUser ? 'admin' : 'staff';

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            role: startRole,
        });

        return NextResponse.json({
            success: true,
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        }, { status: 201 });

    } catch (error) {
        console.error('Signup error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
