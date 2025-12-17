import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
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

// GET /api/leads/:id - Get single lead
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const lead = await Lead.findById(id)
            .populate('createdBy', 'name email')
            .populate('timeline.user', 'name')
            .lean();

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({ lead });
    } catch (error) {
        console.error('Get lead error:', error);
        return NextResponse.json({ error: 'Failed to fetch lead' }, { status: 500 });
    }
}

// PATCH /api/leads/:id - Update lead
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

        const { status, notes, name, phone, email, source } = await req.json();

        const lead = await Lead.findById(id);
        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        // Track status changes in timeline
        if (status && status !== lead.status) {
            lead.timeline.push({
                action: 'Status Changed',
                description: `Status updated from ${lead.status} to ${status}`,
                user: userId
            });
            lead.status = status;
        }

        // Update other fields
        if (name) lead.name = name;
        if (phone) lead.phone = phone;
        if (email !== undefined) lead.email = email;
        if (source) lead.source = source;
        if (notes !== undefined) lead.notes = notes;

        await lead.save();
        await lead.populate('createdBy', 'name email');
        await lead.populate('timeline.user', 'name');

        return NextResponse.json({
            success: true,
            lead
        });
    } catch (error) {
        console.error('Update lead error:', error);
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 });
    }
}

// DELETE /api/leads/:id - Delete lead (admin only)
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        // Check if user is admin
        const User = (await import('@/models/User')).default;
        const currentUser = await User.findById(sessionUser.userId);

        if (!currentUser || currentUser.role !== 'admin') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const lead = await Lead.findByIdAndDelete(id);

        if (!lead) {
            return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Lead deleted successfully'
        });
    } catch (error) {
        console.error('Delete lead error:', error);
        return NextResponse.json({ error: 'Failed to delete lead' }, { status: 500 });
    }
}
