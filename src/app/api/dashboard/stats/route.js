import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Lead from '@/models/Lead';
import Inquiry from '@/models/Inquiry';
import Order from '@/models/Order';
import Invoice from '@/models/Invoice';
import { getSessionUser } from '@/lib/auth';

export async function GET() {
    try {
        const sessionUser = await getSessionUser();
        if (!sessionUser) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        await dbConnect();

        const [
            leadCount,
            inquiryCount,
            orderCount,
            revenueResult
        ] = await Promise.all([
            Lead.countDocuments({ status: 'New' }),
            Inquiry.countDocuments({ status: 'New' }),
            Order.countDocuments({ status: { $ne: 'Cancelled' } }),
            Invoice.aggregate([
                { $match: { status: { $ne: 'Cancelled' } } },
                { $group: { _id: null, total: { $sum: "$amountPaid" } } }
            ])
        ]);

        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        return NextResponse.json({
            stats: {
                leads: leadCount,
                inquiries: inquiryCount,
                orders: orderCount,
                revenue: totalRevenue
            }
        });
    } catch (error) {
        console.error('Dashboard stats error:', error);
        return NextResponse.json({ error: 'Failed to fetch dashboard stats' }, { status: 500 });
    }
}
