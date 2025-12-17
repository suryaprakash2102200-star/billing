import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quotation from '@/models/Quotation';
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

// GET /api/quotations/:id
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const quotation = await Quotation.findById(id)
            .populate('inquiry', 'inquiryId product customerName')
            .populate('customer', 'name phone email')
            .populate('createdBy', 'name email')
            .lean();

        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        return NextResponse.json({ quotation });
    } catch (error) {
        console.error('Get quotation error:', error);
        return NextResponse.json({ error: 'Failed to fetch quotation' }, { status: 500 });
    }
}

// PATCH /api/quotations/:id
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
        const { status, items, discount, taxRate, termsAndConditions, notes } = body;

        const quotation = await Quotation.findById(id);
        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        // Update status
        if (status) quotation.status = status;

        // Update items
        if (items) {
            quotation.items = items.map(item => ({
                ...item,
                total: (item.quantity * item.unitPrice) - (item.discount || 0)
            }));
        }

        // Update other fields
        if (discount !== undefined) quotation.discount = discount;
        if (taxRate !== undefined) quotation.taxRate = taxRate;
        if (termsAndConditions) quotation.termsAndConditions = termsAndConditions;
        if (notes !== undefined) quotation.notes = notes;

        await quotation.save();
        await quotation.populate('createdBy', 'name email');

        return NextResponse.json({
            success: true,
            quotation
        });
    } catch (error) {
        console.error('Update quotation error:', error);
        return NextResponse.json({ error: 'Failed to update quotation' }, { status: 500 });
    }
}

// DELETE /api/quotations/:id
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const quotation = await Quotation.findByIdAndDelete(id);

        if (!quotation) {
            return NextResponse.json({ error: 'Quotation not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Quotation deleted successfully'
        });
    } catch (error) {
        console.error('Delete quotation error:', error);
        return NextResponse.json({ error: 'Failed to delete quotation' }, { status: 500 });
    }
}
