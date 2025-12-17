import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Inquiry from '@/models/Inquiry';
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

// GET /api/inquiries - List all inquiries
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
                { product: { $regex: search, $options: 'i' } },
                { inquiryId: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [inquiries, total] = await Promise.all([
            Inquiry.find(query)
                .populate('lead', 'name phone source')
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Inquiry.countDocuments(query)
        ]);

        return NextResponse.json({
            inquiries,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get inquiries error:', error);
        return NextResponse.json({ error: 'Failed to fetch inquiries' }, { status: 500 });
    }
}

// POST /api/inquiries - Create new inquiry
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
        const { leadId, customerName, customerPhone, customerEmail, product, customRequirement, quantity, estimatedValue, notes } = body;

        // Validation
        if (!customerName || !customerPhone || !product) {
            return NextResponse.json(
                { error: 'Customer name, phone, and product are required' },
                { status: 400 }
            );
        }

        // Create inquiry
        const inquiryData = {
            customerName,
            customerPhone,
            customerEmail,
            product,
            customRequirement,
            quantity: quantity || 1,
            estimatedValue: estimatedValue || 0,
            createdBy: userId,
            timeline: [{
                action: 'Created',
                description: 'Inquiry created',
                user: userId
            }]
        };

        // If created from a lead
        if (leadId) {
            inquiryData.lead = leadId;
            inquiryData.timeline[0].description = 'Inquiry created from lead';

            // Update lead status to Converted
            await Lead.findByIdAndUpdate(leadId, {
                status: 'Converted',
                $push: {
                    timeline: {
                        action: 'Converted',
                        description: 'Converted to inquiry',
                        user: userId
                    }
                }
            });
        }

        // Add initial note if provided
        if (notes) {
            inquiryData.notes = [{
                text: notes,
                createdBy: userId
            }];
        }

        const inquiry = await Inquiry.create(inquiryData);

        // Update lead with inquiry reference
        if (leadId) {
            await Lead.findByIdAndUpdate(leadId, { convertedToInquiry: inquiry._id });
        }

        await inquiry.populate('createdBy', 'name email');
        await inquiry.populate('lead', 'name phone source');

        return NextResponse.json({
            success: true,
            inquiry
        }, { status: 201 });
    } catch (error) {
        console.error('Create inquiry error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create inquiry' },
            { status: 500 }
        );
    }
}
