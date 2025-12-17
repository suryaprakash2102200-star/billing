import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSessionUser } from '@/lib/auth';

export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();
        if (!sessionUser) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        await dbConnect();

        // Auth Check
        const currentUser = await User.findById(sessionUser.userId);
        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        if (id === currentUser._id.toString()) {
            return NextResponse.json({ error: 'Cannot delete your own account' }, { status: 400 });
        }

        const deletedUser = await User.findByIdAndDelete(id);

        if (!deletedUser) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, message: 'User deleted' });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }
}
