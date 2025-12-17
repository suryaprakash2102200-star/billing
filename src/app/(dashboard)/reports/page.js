'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { BarChart3, TrendingUp, Users, CreditCard } from 'lucide-react';

export default function ReportsPage() {
    const [stats, setStats] = useState({
        totalSales: 0,
        totalOrders: 0,
        totalCustomers: 0,
        pendingPayments: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/reports')
            .then(res => res.json())
            .then(data => {
                if (data.stats) {
                    setStats(data.stats);
                }
            })
            .catch(err => console.error('Failed to load reports:', err))
            .finally(() => setLoading(false));
    }, []);

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Reports & Analytics</h1>
                    <p className="text-gray-500 text-sm mt-1">Overview of your business performance</p>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    {
                        label: 'Total Sales',
                        value: `₹${stats.totalSales.toLocaleString()}`,
                        icon: TrendingUp,
                        color: 'text-green-600',
                        bg: 'bg-green-50'
                    },
                    {
                        label: 'Total Orders',
                        value: stats.totalOrders.toLocaleString(),
                        icon: BarChart3,
                        color: 'text-blue-600',
                        bg: 'bg-blue-50'
                    },
                    {
                        label: 'Total Customers',
                        value: stats.totalCustomers.toLocaleString(),
                        icon: Users,
                        color: 'text-purple-600',
                        bg: 'bg-purple-50'
                    },
                    {
                        label: 'Pending Payments',
                        value: `₹${stats.pendingPayments.toLocaleString()}`,
                        icon: CreditCard,
                        color: 'text-red-600',
                        bg: 'bg-red-50'
                    },
                ].map((stat, i) => (
                    <Card key={i} className="p-4 flex items-center gap-4 hover:shadow-md transition-shadow">
                        <div className={`p-3 rounded-lg ${stat.bg}`}>
                            <stat.icon className={stat.color} size={24} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                            <h3 className="text-2xl font-bold text-gray-900">{stat.value}</h3>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Placeholder for future charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="min-h-[400px] flex items-center justify-center p-8 text-center border-dashed">
                    <div>
                        <BarChart3 className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900">Sales Overview</h3>
                        <p className="text-gray-500">Chart data visualization coming soon</p>
                    </div>
                </Card>
                <Card className="min-h-[400px] flex items-center justify-center p-8 text-center border-dashed">
                    <div>
                        <Users className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-medium text-gray-900">Customer Growth</h3>
                        <p className="text-gray-500">Customer acquisition metrics coming soon</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
