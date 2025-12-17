'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Search, Filter, Trash2, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                setOrders(data.orders || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const filteredOrders = orders.filter(order =>
        order.customerName.toLowerCase().includes(filter.toLowerCase()) ||
        order.status.toLowerCase().includes(filter.toLowerCase())
    );



    // ...
    if (loading) return <LoadingSpinner />;

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this order?')) return;

        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete order');
            }

            setOrders(orders.filter(o => o._id !== id));
            // Consider simple toast here if context available, but OrdersPage uses simple console error for load.
            // Wait, OrdersPage doesn't import useToast. I need to check imports.
        } catch (err) {
            console.error(err);
            alert('Failed to delete order');
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and manage your customer orders</p>
                </div>
                <Button
                    onClick={() => window.location.href = '/orders/new'}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 gap-2"
                >
                    <Plus size={18} /> Create Order
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative col-span-1 md:col-span-2">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer name or status..."
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>
                    {/* Status Filter - adding placeholder for future extensibility or layout balance */}
                    <div className="hidden md:block"></div>
                </div>
            </Card>

            {/* Orders List - Responsive View */}
            <Card className="border-0 shadow-sm bg-transparent md:bg-white md:overflow-hidden p-0 md:p-0">

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Order ID</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Product</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Date</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <LoadingSpinner />
                                    </td>
                                </tr>
                            ) : filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <p className="text-gray-500 font-medium">No orders found</p>
                                        <p className="text-gray-400 text-sm mt-1">Create your first order to get started</p>
                                        <Button
                                            onClick={() => window.location.href = '/orders/new'}
                                            className="mt-4 bg-primary-600 hover:bg-primary-700"
                                        >
                                            <Plus size={16} className="mr-2" /> Create Order
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order._id}
                                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => window.location.href = `/orders/${order._id}`}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-mono text-sm text-primary-600">#{order._id.slice(-6)}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{order.customerName}</div>
                                            {order.customer?.phone && (
                                                <div className="text-xs text-gray-400">{order.customer.phone}</div>
                                            )}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="text-sm text-gray-900 font-medium">{order.productType}</div>
                                            <div className="text-xs text-gray-500">{order.size}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(order.orderDate).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge type={
                                                order.status === 'Delivered' ? 'success' :
                                                    order.status === 'New' ? 'info' :
                                                        'default'
                                            }>
                                                {order.status}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end items-center gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="text-xs py-1.5 h-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.location.href = `/orders/${order._id}`;
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="text-xs py-1.5 h-auto px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(order._id);
                                                    }}
                                                >
                                                    <Trash2 size={14} />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {loading ? (
                        <div className="text-center py-12">
                            <LoadingSpinner />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">No orders found</p>
                            <Button
                                onClick={() => window.location.href = '/orders/new'}
                                className="mt-4 bg-primary-600 hover:bg-primary-700"
                            >
                                <Plus size={16} className="mr-2" /> Create Order
                            </Button>
                        </div>
                    ) : (
                        filteredOrders.map((order) => (
                            <div
                                key={order._id}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
                                onClick={() => window.location.href = `/orders/${order._id}`}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-mono text-xs text-primary-600 mb-1">#{order._id.slice(-6)}</div>
                                        <h3 className="font-semibold text-gray-900">{order.customerName}</h3>
                                        <div className="text-sm text-gray-500">{order.customer?.phone}</div>
                                    </div>
                                    <Badge type={
                                        order.status === 'Delivered' ? 'success' :
                                            order.status === 'New' ? 'info' :
                                                'default'
                                    }>
                                        {order.status}
                                    </Badge>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 flex justify-between">
                                    <div className="text-sm">
                                        <span className="text-gray-500">Product: </span>
                                        <span className="font-medium text-gray-900">{order.productType}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">{order.size}</div>
                                </div>

                                <div className="flex gap-2 border-t border-gray-50 pt-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-sm py-2 h-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            window.location.href = `/orders/${order._id}`;
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="px-3 py-2 h-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(order._id);
                                        }}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </Card>
        </div>
    );
}
