import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

// Middleware should block unauthorized access generally, but we need check for 'admin' role specifically for this endpoint
export async function GET() {
    try {
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Check role from session or DB
        await dbConnect();
        const currentUser = await User.findById(sessionUser.userId);

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const users = await User.find({}).sort({ createdAt: -1 }).select('-password');
        return NextResponse.json({ users });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}

export async function POST(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        // Auth Check
        const currentUser = await User.findById(sessionUser.userId);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { name, email, password, role } = await req.json();

        // Validation
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check duplicate
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
        }

        // Hash password (using simple bcrytjs if imported, or just storing for now if no hook - BUT User model has no pre-save hook shown in view_file. 
        // Wait, I saw User.js, it was simple schema. I should check if bcrypt is used in auth routes. 
        // I will assume I need to hash it here if models doesn't. 
        // Actually, let's just create user directly and hope there is a pre-save hook I missed or I should import bcrypt.
        // Checking package.json -> "bcryptjs" is there. "app/api/auth/signup" handles hashing?
        // Let's verify signup route or just implement hashing here to be safe.
        // Better to check 'signup' logic. For now, I will hash it.

        // I'll import bcryptjs at top.

        const salt = await import('bcryptjs').then(m => m.genSalt(10));
        const hashedPassword = await import('bcryptjs').then(m => m.hash(password, salt));

        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'staff'
        });

        return NextResponse.json({
            success: true,
            user: {
                _id: user._id.toString(),
                name: user.name,
                email: user.email,
                role: user.role,
                createdAt: user.createdAt
            }
        });

    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }
}

export async function PUT(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();
        const currentUser = await User.findById(sessionUser.userId);

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const { userId, role } = await req.json();

        if (userId === currentUser._id.toString()) {
            return NextResponse.json({ error: 'Cannot change your own role' }, { status: 400 });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, { role }, { new: true }).select('-password');
        return NextResponse.json({ success: true, user: updatedUser });

    } catch (error) {
        return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }
}
