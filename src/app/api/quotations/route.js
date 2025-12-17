import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Quotation from '@/models/Quotation';
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

// GET /api/quotations - List all quotations
export async function GET(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        const query = {};
        if (status) query.status = status;
        if (search) {
            query.$or = [
                { customerName: { $regex: search, $options: 'i' } },
                { quotationId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [quotations, total] = await Promise.all([
            Quotation.find(query)
                .populate('inquiry', 'inquiryId product')
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Quotation.countDocuments(query)
        ]);

        return NextResponse.json({
            quotations,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get quotations error:', error);
        return NextResponse.json({ error: 'Failed to fetch quotations' }, { status: 500 });
    }
}

// POST /api/quotations - Create new quotation
export async function POST(req) {
    try {
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
        const {
            inquiryId,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            items,
            discount,
            taxRate,
            termsAndConditions,
            notes,
            validDays
        } = body;

        // Validation
        if (!customerName || !customerPhone || !items || items.length === 0) {
            return NextResponse.json(
                { error: 'Customer details and at least one item are required' },
                { status: 400 }
            );
        }

        // Calculate item totals
        const processedItems = items.map(item => ({
            ...item,
            total: (item.quantity * item.unitPrice) - (item.discount || 0)
        }));

        // Calculate validity date
        const validUntil = new Date();
        validUntil.setDate(validUntil.getDate() + (validDays || 7));

        // Calculate totals
        const subtotal = processedItems.reduce((sum, item) => sum + item.total, 0);
        const finalDiscount = discount || 0;
        const finalTaxRate = taxRate || 0;
        const taxAmount = (subtotal - finalDiscount) * (finalTaxRate / 100);
        const total = subtotal - finalDiscount + taxAmount;

        // Create quotation
        const quotation = await Quotation.create({
            inquiry: inquiryId || undefined,
            customerName,
            customerPhone,
            customerEmail,
            customerAddress,
            items: processedItems,
            discount: finalDiscount,
            taxRate: finalTaxRate,
            taxAmount,
            subtotal,
            total,
            termsAndConditions,
            notes,
            validUntil,
            createdBy: userId
        });

        // Update inquiry status if linked
        if (inquiryId) {
            await Inquiry.findByIdAndUpdate(inquiryId, {
                status: 'Quoted',
                quotation: quotation._id,
                $push: {
                    timeline: {
                        action: 'Quotation Created',
                        description: `Quotation ${quotation.quotationId} generated`,
                        user: userId
                    }
                }
            });
        }

        await quotation.populate('createdBy', 'name email');

        return NextResponse.json({
            success: true,
            quotation
        }, { status: 201 });
    } catch (error) {
        console.error('Create quotation error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create quotation' },
            { status: 500 }
        );
    }
}
