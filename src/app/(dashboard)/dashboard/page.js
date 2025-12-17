'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/context/ToastContext';
import {
    Users,
    FileText,
    ShoppingBag,
    IndianRupee,
    Plus,
    ArrowRight,
    TrendingUp
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardPage() {
    const router = useRouter();
    const { error: toastError } = useToast();
    const [stats, setStats] = useState({
        leads: 0,
        inquiries: 0,
        orders: 0,
        revenue: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('/api/dashboard/stats');
                const data = await res.json();
                if (res.ok) {
                    setStats(data.stats);
                }
            } catch (err) {
                console.error('Failed to fetch stats:', err);
                // Don't toast error for dashboard stats to avoid annoyance on load
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const statCards = [
        {
            title: 'New Leads',
            value: stats.leads,
            icon: Users,
            color: 'text-blue-600',
            bg: 'bg-blue-50',
            href: '/leads'
        },
        {
            title: 'New Inquiries',
            value: stats.inquiries,
            icon: FileText,
            color: 'text-orange-600',
            bg: 'bg-orange-50',
            href: '/inquiries'
        },
        {
            title: 'Active Orders',
            value: stats.orders,
            icon: ShoppingBag,
            color: 'text-purple-600',
            bg: 'bg-purple-50',
            href: '/orders'
        },
        {
            title: 'Total Revenue',
            value: `₹${stats.revenue.toLocaleString()}`,
            icon: IndianRupee,
            color: 'text-green-600',
            bg: 'bg-green-50',
            href: '/invoices'
        }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Valid Greeting */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back! Here's what's happening today.</p>
            </div>

            {/* Quick Actions */}
            <div className="flex gap-4">
                <Button
                    onClick={() => router.push('/leads/new')}
                    className="bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/30 gap-2"
                >
                    <Plus size={18} /> New Lead
                </Button>
                <Button
                    onClick={() => router.push('/inquiries/new')}
                    className="bg-orange-600 hover:bg-orange-700 shadow-lg shadow-orange-500/30 gap-2"
                >
                    <Plus size={18} /> New Inquiry
                </Button>
                <Button
                    onClick={() => router.push('/quotations/new')}
                    className="bg-purple-600 hover:bg-purple-700 shadow-lg shadow-purple-500/30 gap-2"
                >
                    <Plus size={18} /> New Quotation
                </Button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statCards.map((stat, index) => (
                    <Card
                        key={index}
                        className="p-6 cursor-pointer hover:shadow-md transition-all duration-200 group"
                        onClick={() => router.push(stat.href)}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                                <h3 className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</h3>
                            </div>
                            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                        </div>
                        <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-primary-600 transition-colors">
                            View details <ArrowRight size={16} className="ml-1" />
                        </div>
                    </Card>
                ))}
            </div>

            {/* Recent Activity Section (Placeholder for now) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                        <Button variant="ghost" size="sm" onClick={() => router.push('/kanban')}>
                            View Board
                        </Button>
                    </div>
                    <div className="text-center py-8 text-gray-500">
                        <TrendingUp className="mx-auto mb-3 text-gray-300" size={32} />
                        <p>No recent activity to show</p>
                    </div>
                </Card>

                <Card className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-gray-900">Quick Links</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => router.push('/products')}>
                            <ShoppingBag className="text-gray-400" />
                            <span>Products</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => router.push('/customers')}>
                            <Users className="text-gray-400" />
                            <span>Customers</span>
                        </Button>
                        <Button variant="outline" className="h-auto py-4 flex flex-col gap-2" onClick={() => router.push('/settings')}>
                            <Users className="text-gray-400" />
                            <span>Settings</span>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
}
