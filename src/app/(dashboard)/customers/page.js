'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Trash2, Edit, Plus } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

import { useToast } from '@/context/ToastContext';

export default function CustomersPage() {
    const { success, error: toastError } = useToast();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/customers')
            .then(res => res.json())
            .then(data => {
                setCustomers(data.customers || []);
                setLoading(false);
            });
    }, []);

    const handleDelete = async (id) => {
        if (!confirm('Are you sure? This action cannot be undone.')) return;
        try {
            const res = await fetch(`/api/customers/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setCustomers(customers.filter(c => c._id !== id));
                success('Customer deleted');
            } else {
                toastError('Failed to delete');
            }
        } catch {
            toastError('Error deleting');
        }
    };



    // ...
    if (loading) return <LoadingSpinner />;

    return (
        <div className="space-y-6 mt-10">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold">Customers</h1>
                <Link href="/customers/new">
                    <Button className="flex items-center gap-2"><Plus size={18} /> Add Customer</Button>
                </Link>
            </div>

            {/* Customers List - Responsive View */}
            <Card className="border-0 shadow-sm overflow-hidden bg-transparent md:bg-white p-0 md:p-0">
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left bg-white">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider md:w-1/4">Name</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider md:w-1/4">Phone</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider md:w-1/4">Instagram</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Orders</th>
                                <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {customers.map(c => (
                                <tr key={c._id} className="group hover:bg-gray-50/80 transition-colors">
                                    <td className="py-4 px-6 font-medium text-gray-900">{c.name}</td>
                                    <td className="py-4 px-6 text-gray-600">{c.phone}</td>
                                    <td className="py-4 px-6 text-pink-600 font-medium">{c.instagramId ? `@${c.instagramId}` : '-'}</td>
                                    <td className="py-4 px-6 text-center">
                                        <span className="bg-primary-50 text-primary-700 py-1 px-3 rounded-full text-sm font-bold">
                                            {c.totalOrders}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <Link href={`/customers/${c._id}`}>
                                            <Button variant="secondary" className="!p-2 hover:bg-primary-50 hover:text-primary-600"><Edit size={16} /></Button>
                                        </Link>
                                        <Button variant="danger" className="!p-2" onClick={() => handleDelete(c._id)}>
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {customers.length === 0 && !loading && (
                                <tr><td colSpan="5" className="py-8 text-center text-gray-500">No customers found.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Cards */}
                <div className="md:hidden space-y-4">
                    {customers.length === 0 && !loading ? (
                        <div className="text-center py-12 text-gray-500 bg-white rounded-lg border border-dashed">
                            No customers found.
                        </div>
                    ) : (
                        customers.map(c => (
                            <div key={c._id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-gray-900 text-lg">{c.name}</h3>
                                    <div className="bg-primary-50 text-primary-700 px-2 py-1 rounded text-xs font-bold">
                                        {c.totalOrders} Orders
                                    </div>
                                </div>
                                <div className="space-y-1 mb-4">
                                    <p className="text-gray-600 text-sm flex items-center gap-2">
                                        <span className="text-gray-400 w-4">📞</span> {c.phone}
                                    </p>
                                    {c.instagramId && (
                                        <p className="text-pink-600 text-sm flex items-center gap-2">
                                            <span className="text-gray-400 w-4">📸</span> @{c.instagramId}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 border-t border-gray-50 pt-3">
                                    <Link href={`/customers/${c._id}`} className="flex-1">
                                        <Button variant="outline" className="w-full justify-center text-sm py-2 h-auto">
                                            Edit Details
                                        </Button>
                                    </Link>
                                    <Button
                                        variant="danger"
                                        className="px-3 py-2 h-auto"
                                        onClick={() => handleDelete(c._id)}
                                    >
                                        <Trash2 size={18} />
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
