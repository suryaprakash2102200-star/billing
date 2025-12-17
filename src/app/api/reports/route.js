import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Order from '@/models/Order';
import Customer from '@/models/Customer';
import Payment from '@/models/Payment';

export async function GET() {
    try {
        await dbConnect();

        // 1. Total Sales (Sum of all orders' totalAmount)
        // We can aggregate from Orders or Payments. Orders represents "Booked Revenue".
        const totalSalesData = await Order.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: '$payment.totalAmount' } // Assuming order has payment.totalAmount populated or we need to look at schema
                }
            }
        ]);
        const totalSales = totalSalesData[0]?.total || 0;

        // Note: The Order model schema has `payment: { totalAmount, advancePaid, balanceAmount }` based on previous files, 
        // OR we might need to check if it's referenced. 
        // Let's check the Order Model schema quickly to be sure, but usually we put `totalAmount` on the order itself 
        // or inside a payment sub-object.
        // Actually, looking at `api/orders/route.js` from previous turns, Order has a `payment` reference.
        // So we might need to aggregate on the *Payment* model for sales if the amount is there, 
        // or populate. Aggregation with lookup is expensive if not needed.
        // Let's use the Payment model for financial totals as it definitely has `totalAmount`.

        const salesAggregation = await Payment.aggregate([
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: '$totalAmount' },
                    pendingAmount: { $sum: '$balanceAmount' }
                }
            }
        ]);

        const totalRevenue = salesAggregation[0]?.totalSales || 0;
        const totalPending = salesAggregation[0]?.pendingAmount || 0;

        // 2. Total Orders Count
        const totalOrders = await Order.countDocuments();

        // 3. Total Customers Count
        const totalCustomers = await Customer.countDocuments();

        return NextResponse.json({
            stats: {
                totalSales: totalRevenue,
                totalOrders: totalOrders,
                totalCustomers: totalCustomers,
                pendingPayments: totalPending
            }
        });

    } catch (err) {
        console.error('Error fetching report stats:', err);
        return NextResponse.json({ error: 'Failed to fetch report stats' }, { status: 500 });
    }
}
