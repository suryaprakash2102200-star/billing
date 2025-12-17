import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Invoice from '@/models/Invoice';
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

// GET /api/invoices/:id
export async function GET(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const invoice = await Invoice.findById(id)
            .populate('order', 'product status totalAmount')
            .populate('customer', 'name phone email')
            .populate('createdBy', 'name email')
            .lean();

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({ invoice });
    } catch (error) {
        console.error('Get invoice error:', error);
        return NextResponse.json({ error: 'Failed to fetch invoice' }, { status: 500 });
    }
}

// PATCH /api/invoices/:id
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
        const { status, amountPaid, items, discount, taxRate, notes } = body;

        const invoice = await Invoice.findById(id);
        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        // Update status
        if (status) invoice.status = status;

        // Update amount paid
        if (amountPaid !== undefined) {
            invoice.amountPaid = amountPaid;
        }

        // Update items
        if (items) {
            invoice.items = items.map(item => ({
                ...item,
                total: (item.quantity * item.unitPrice) - (item.discount || 0)
            }));
        }

        // Update other fields
        if (discount !== undefined) invoice.discount = discount;
        if (taxRate !== undefined) invoice.taxRate = taxRate;
        if (notes !== undefined) invoice.notes = notes;

        await invoice.save();
        await invoice.populate('createdBy', 'name email');

        return NextResponse.json({
            success: true,
            invoice
        });
    } catch (error) {
        console.error('Update invoice error:', error);
        return NextResponse.json({ error: 'Failed to update invoice' }, { status: 500 });
    }
}

// DELETE /api/invoices/:id
export async function DELETE(req, { params }) {
    try {
        const { id } = await params;
        const sessionUser = await getSessionUser();

        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const invoice = await Invoice.findByIdAndDelete(id);

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: 'Invoice deleted successfully'
        });
    } catch (error) {
        console.error('Delete invoice error:', error);
        return NextResponse.json({ error: 'Failed to delete invoice' }, { status: 500 });
    }
}
