import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import { getSessionUser } from '@/lib/auth';

// GET /api/leads - List all leads with filters
export async function GET(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const status = searchParams.get('status');
        const source = searchParams.get('source');
        const search = searchParams.get('search');
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');

        // Build query
        const query = {};
        if (status) query.status = status;
        if (source) query.source = source;
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { phone: { $regex: search, $options: 'i' } }
            ];
        }

        const skip = (page - 1) * limit;

        const [leads, total] = await Promise.all([
            Lead.find(query)
                .populate('createdBy', 'name email')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            Lead.countDocuments(query)
        ]);

        return NextResponse.json({
            leads,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error('Get leads error:', error);
        return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 });
    }
}

// POST /api/leads - Create new lead
export async function POST(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { name, phone, email, source, notes } = await req.json();

        // Validation
        if (!name || !phone || !source) {
            return NextResponse.json(
                { error: 'Name, phone, and source are required' },
                { status: 400 }
            );
        }
        // Extract userId - handle MongoDB ObjectId serialization in JWT
        let userId;
        const rawUserId = sessionUser.userId;

        if (typeof rawUserId === 'string') {
            // Already a string (24 char hex)
            userId = rawUserId;
        } else if (rawUserId && typeof rawUserId === 'object') {
            // ObjectId was serialized as object in JWT
            if (rawUserId.buffer) {
                // Convert buffer to hex string
                const buffer = rawUserId.buffer;
                const bytes = Object.values(buffer);
                userId = bytes.map(b => b.toString(16).padStart(2, '0')).join('');
            } else if (rawUserId.$oid) {
                // MongoDB extended JSON format
                userId = rawUserId.$oid;
            } else if (rawUserId.toString && rawUserId.toString() !== '[object Object]') {
                userId = rawUserId.toString();
            } else {
                // Fallback: try to extract from JSON
                const jsonStr = JSON.stringify(rawUserId);
                const match = jsonStr.match(/[a-f0-9]{24}/i);
                userId = match ? match[0] : null;
            }
        }

        if (!userId || userId.length !== 24) {
            console.error('Invalid userId extracted:', userId, 'from:', rawUserId);
            return NextResponse.json({ error: 'Invalid session' }, { status: 401 });
        }

        console.log('Final userId:', userId);

        // Create lead with initial timeline entry
        const lead = await Lead.create({
            name,
            phone,
            email,
            source,
            notes,
            createdBy: userId,
            timeline: [{
                action: 'Created',
                description: `Lead added from ${source}`,
                user: userId
            }]
        });

        // Populate createdBy for response
        await lead.populate('createdBy', 'name email');

        return NextResponse.json({
            success: true,
            lead
        }, { status: 201 });
    } catch (error) {
        console.error('Create lead error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create lead' },
            { status: 500 }
        );
    }
}
