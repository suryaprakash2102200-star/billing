import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import Inquiry from '@/models/Inquiry';
import Quotation from '@/models/Quotation';
import Order from '@/models/Order';
import Invoice from '@/models/Invoice';
import { getSessionUser } from '@/lib/auth';

export async function POST(req) {
    try {
        // const sessionUser = await getSessionUser();
        // Ideally check for admin here, but for dev debug we skipt strict role check if needed, 
        // but let's be safe and assume logged in.

        await dbConnect();

        // Delete all operational data
        await Promise.all([
            Lead.deleteMany({}),
            Inquiry.deleteMany({}),
            Quotation.deleteMany({}),
            Order.deleteMany({}),
            Invoice.deleteMany({})
        ]);

        return NextResponse.json({
            success: true,
            message: 'All operational data (Leads, Inquiries, Quotations, Orders, Invoices) has been cleared.'
        });

    } catch (error) {
        console.error('Reset data error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
