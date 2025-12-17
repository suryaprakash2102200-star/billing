import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Product from '@/models/Product';
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

// GET /api/products - List all products
export async function GET(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const { searchParams } = new URL(req.url);
        const search = searchParams.get('search');
        const category = searchParams.get('category');
        const active = searchParams.get('active');

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } }
            ];
        }
        if (category) query.category = category;
        if (active === 'true') query.isActive = true;
        if (active === 'false') query.isActive = false;

        const products = await Product.find(query)
            .sort({ name: 1 })
            .lean();

        return NextResponse.json({ products });
    } catch (error) {
        console.error('Get products error:', error);
        return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }
}

// POST /api/products - Create new product
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
        const { name, description, category, basePrice, unit, hasVariants, variants, customizable, sku } = body;

        if (!name || basePrice === undefined) {
            return NextResponse.json(
                { error: 'Name and base price are required' },
                { status: 400 }
            );
        }

        const product = await Product.create({
            name,
            description,
            category,
            basePrice,
            unit,
            hasVariants,
            variants,
            customizable,
            sku,
            createdBy: userId
        });

        return NextResponse.json({
            success: true,
            product
        }, { status: 201 });
    } catch (error) {
        console.error('Create product error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to create product' },
            { status: 500 }
        );
    }
}
