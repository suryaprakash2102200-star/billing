import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CompanySettings from '@/models/CompanySettings';
import { getSessionUser } from '@/lib/auth';

// GET /api/settings/company - Get company settings
export async function GET() {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const settings = await CompanySettings.getSettings();

        return NextResponse.json({ settings });
    } catch (error) {
        console.error('Get company settings error:', error);
        return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
}

// PUT /api/settings/company - Update company settings
export async function PUT(req) {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const body = await req.json();

        let settings = await CompanySettings.findOne();

        if (!settings) {
            settings = await CompanySettings.create(body);
        } else {
            Object.assign(settings, body);
            settings.updatedAt = Date.now();
            await settings.save();
        }

        return NextResponse.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Update company settings error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to update settings' },
            { status: 500 }
        );
    }
}
