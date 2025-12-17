'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';

export default function PaymentsPage() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('');

    useEffect(() => {
        // Fetch all, client side filter (or api filter if refined)
        // Actually API handles filtering, but let's fetch all and valid
        fetch('/api/payments')
            .then(res => res.json())
            .then(data => {
                setPayments(data.payments || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, []);

    const pendingPayments = payments.filter(p => p.status !== 'Paid');
    const filteredHistory = payments.filter(p =>
        p.status === 'Paid' &&
        (p.orderId?._id?.toLowerCase().includes(filter.toLowerCase()) ||
            p.paymentMode?.toLowerCase().includes(filter.toLowerCase()))
    );

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Payment Tracker</h1>
                    <p className="text-gray-500 text-sm mt-1">Monitor pending dues and payment history</p>
                </div>
            </div>

            {/* Pending Payments Section */}
            <Card className="border-0 shadow-sm overflow-hidden bg-transparent md:bg-white p-0 md:p-0">
                <div className="p-4 border-b border-gray-100 bg-red-50/50 md:rounded-t-lg mb-4 md:mb-0 rounded-lg shadow-sm md:shadow-none">
                    <h2 className="text-lg font-bold text-red-700 flex items-center gap-2">
                        Pending & Partial Payments
                        <Badge type="danger" className="ml-2 bg-red-200">{pendingPayments.length}</Badge>
                    </h2>
                </div>

                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Order Ref</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Total Amount</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Paid</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Balance Due</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {pendingPayments.length > 0 ? (
                                pendingPayments.map(p => (
                                    <tr key={p._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <Link href={`/orders/${p.orderId?._id}`} className="font-mono text-sm text-blue-600 hover:underline font-medium">
                                                #{p.orderId?._id?.slice(-6) || 'N/A'}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">₹{p.totalAmount?.toLocaleString()}</td>
                                        <td className="py-4 px-6 text-green-600">₹{p.advancePaid?.toLocaleString()}</td>
                                        <td className="py-4 px-6">
                                            <span className="text-red-600 font-bold bg-red-50 px-2 py-1 rounded">
                                                ₹{p.balanceAmount?.toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge type={p.status === 'Partial' ? 'warning' : 'danger'}>{p.status}</Badge>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <Link href={`/orders/${p.orderId?._id}`}>
                                                <Button variant="outline" className="text-xs py-1.5 h-auto hover:bg-primary-50 hover:text-primary-600 hover:border-primary-200">
                                                    Update Payment
                                                </Button>
                                            </Link>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <div className="flex flex-col items-center justify-center text-gray-500">
                                            <div className="bg-green-100 p-3 rounded-full mb-3">
                                                <Badge type="success" className="text-xl">✓</Badge>
                                            </div>
                                            <p className="font-medium">All clear!</p>
                                            <p className="text-sm mt-1">No pending payments found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards for Pending */}
                <div className="md:hidden space-y-4">
                    {pendingPayments.length > 0 ? (
                        pendingPayments.map(p => (
                            <div key={p._id} className="bg-white p-4 rounded-xl border border-red-100 shadow-sm active:scale-[0.99] transition-transform">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1">Order #{p.orderId?._id?.slice(-6) || 'N/A'}</div>
                                        <Badge type={p.status === 'Partial' ? 'warning' : 'danger'}>{p.status}</Badge>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm text-gray-500">Due Amount</div>
                                        <div className="text-lg font-bold text-red-600">₹{p.balanceAmount?.toLocaleString()}</div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg text-sm mb-4 space-y-2">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Total Amount</span>
                                        <span className="font-medium">₹{p.totalAmount?.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Paid So Far</span>
                                        <span className="text-green-600 font-medium">₹{p.advancePaid?.toLocaleString()}</span>
                                    </div>
                                </div>

                                <Link href={`/orders/${p.orderId?._id}`} className="block">
                                    <Button className="w-full justify-center">Update Payment</Button>
                                </Link>
                            </div>
                        ))
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-gray-100 text-center text-gray-500">
                            <p className="font-medium">No pending payments</p>
                        </div>
                    )}
                </div>
            </Card>

            {/* Payment History Section */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4">
                <h2 className="text-xl font-bold text-gray-900">Payment History</h2>
                <div className="relative w-full sm:w-64">
                    <input
                        type="text"
                        placeholder="Search history..."
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full pl-4 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                    />
                </div>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden bg-transparent md:bg-white p-0 md:p-0">
                {/* Desktop History Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Order Ref</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Total Amount</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Payment Mode</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Last Updated</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredHistory.length > 0 ? (
                                filteredHistory.map(p => (
                                    <tr key={p._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <Link href={`/orders/${p.orderId?._id}`} className="font-mono text-sm text-blue-600 hover:underline">
                                                #{p.orderId?._id?.slice(-6) || 'N/A'}
                                            </Link>
                                        </td>
                                        <td className="py-4 px-6 font-medium text-gray-900">₹{p.totalAmount?.toLocaleString()}</td>
                                        <td className="py-4 px-6">
                                            <Badge type="success" className="bg-green-100 text-green-700 border-green-200">Paid</Badge>
                                        </td>
                                        <td className="py-4 px-6 text-gray-600">{p.paymentMode || 'Cash'}</td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {new Date(p.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" className="py-12 text-center text-gray-500">
                                        No payment history found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards for History */}
                <div className="md:hidden space-y-4">
                    {filteredHistory.length > 0 ? (
                        filteredHistory.map(p => (
                            <div key={p._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-start mb-2">
                                    <span className="font-mono text-xs text-blue-600">#{p.orderId?._id?.slice(-6) || 'N/A'}</span>
                                    <span className="text-xs text-gray-400">{new Date(p.updatedAt).toLocaleDateString()}</span>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-gray-900">₹{p.totalAmount?.toLocaleString()}</h3>
                                    <Badge type="success" size="sm">Paid</Badge>
                                </div>
                                <div className="text-xs text-gray-500 flex items-center gap-2">
                                    <span className="bg-gray-100 px-2 py-1 rounded">{p.paymentMode || 'Cash'}</span>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-dashed">
                            No payment history found.
                        </div>
                    )}
                </div>
            </Card>
        </div>
    );
}
