import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
import { getSessionUser } from '@/lib/auth';

// Helper to extract userId from session
function extractUserId(sessionUser) {
    const rawUserId = sessionUser.userId;
    if (typeof rawUserId === 'string') return rawUserId;
    if (rawUserId && typeof rawUserId === 'object') {
        if (rawUserId.buffer) {
            const bytes = Object.values(rawUserId.buffer);
            return bytes.map(b => b.toString(16).padStart(2, '0')).join('');
        }
        if (rawUserId.$oid) return rawUserId.$oid;
        if (rawUserId.toString && rawUserId.toString() !== '[object Object]') {
            return rawUserId.toString();
        }
    }
    return null;
}

// GET /api/inquiries/:id
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const inquiry = await Inquiry.findById(id)
            .populate('lead', 'name phone email source status')
            .populate('createdBy', 'name email')
            .populate('notes.createdBy', 'name')
            .populate('timeline.user', 'name')
            .lean();

        if (!inquiry) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        return NextResponse.json({ inquiry });
    } catch (error) {
        console.error('Get inquiry error:', error);
        return NextResponse.json({ error: 'Failed to fetch inquiry' }, { status: 500 });
    }
}

// PATCH /api/inquiries/:id
export async function PATCH(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const userId = extractUserId(sessionUser);
        if (!userId) {
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        const body = await req.json();
        const { status, note, product, customRequirement, quantity, estimatedValue } = body;

        const inquiry = await Inquiry.findById(id);
        if (!inquiry) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        // Track status changes
        if (status && status !== inquiry.status) {
            inquiry.timeline.push({
                action: 'Status Changed',
                description: `Status updated from ${inquiry.status} to ${status}`,
                user: userId
            });
            inquiry.status = status;
        }

        // Add note
        if (note) {
            inquiry.notes.push({
                text: note,
                createdBy: userId
            });
            inquiry.timeline.push({
                action: 'Note Added',
                description: 'New note added',
                user: userId
            });
        }

        // Update other fields
        if (product) inquiry.product = product;
        if (customRequirement !== undefined) inquiry.customRequirement = customRequirement;
        if (quantity) inquiry.quantity = quantity;
        if (estimatedValue !== undefined) inquiry.estimatedValue = estimatedValue;

        await inquiry.save();
        await inquiry.populate('createdBy', 'name email');
        await inquiry.populate('lead', 'name phone source');
        await inquiry.populate('notes.createdBy', 'name');
        await inquiry.populate('timeline.user', 'name');

        return NextResponse.json({
            success: true,
            inquiry
        });
    } catch (error) {
        console.error('Update inquiry error:', error);
        return NextResponse.json({ error: 'Failed to update inquiry' }, { status: 500 });
    }
}

// DELETE /api/inquiries/:id
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check admin role
        const User = (await import('@/models/User')).default;
        const userId = extractUserId(sessionUser);
        const currentUser = await User.findById(userId);

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const inquiry = await Inquiry.findByIdAndDelete(id);

        if (!inquiry) {
            return NextResponse.json({ error: 'Inquiry not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Inquiry deleted successfully'
        });
    } catch (error) {
        console.error('Delete inquiry error:', error);
        return NextResponse.json({ error: 'Failed to delete inquiry' }, { status: 500 });
    }
}
