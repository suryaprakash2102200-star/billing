'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { Receipt, Plus, Search, IndianRupee, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const statusColors = {
    Draft: 'default',
    Sent: 'info',
    Paid: 'success',
    Overdue: 'danger',
    Cancelled: 'secondary'
};

const paymentStatusColors = {
    Unpaid: 'danger',
    Partial: 'warning',
    Paid: 'success'
};

export default function InvoicesPage() {
    const router = useRouter();
    const { error: toastError } = useToast();
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        paymentStatus: '',
        search: ''
    });

    useEffect(() => {
        fetchInvoices();
    }, [filters]);

    const fetchInvoices = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
            if (filters.search) params.append('search', filters.search);

            const res = await fetch(`/api/invoices?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch invoices');

            setInvoices(data.invoices || []);
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this invoice?')) return;

        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete invoice');
            }

            setInvoices(invoices.filter(i => i._id !== id));
            // success toast is not imported directly here but useToast is.
        } catch (err) {
            toastError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage billing invoices</p>
                </div>
                <Button
                    onClick={() => router.push('/invoices/new')}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 gap-2"
                >
                    <Plus size={18} /> New Invoice
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer or invoice ID..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>

                    <select
                        value={filters.paymentStatus}
                        onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Payment Status</option>
                        <option value="Unpaid">Unpaid</option>
                        <option value="Partial">Partial</option>
                        <option value="Paid">Paid</option>
                    </select>
                </div>
            </Card>

            {/* Invoices List - Responsive View */}
            <Card className="border-0 shadow-sm bg-transparent md:bg-white md:overflow-hidden p-0 md:p-0">

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Invoice ID</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Total</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Paid</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Due</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Payment</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Due Date</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {invoices.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="py-12 text-center">
                                        <Receipt className="mx-auto text-gray-300 mb-4" size={48} />
                                        <p className="text-gray-500 font-medium">No invoices found</p>
                                        <p className="text-gray-400 text-sm mt-1">Create your first invoice</p>
                                        <Button
                                            onClick={() => router.push('/invoices/new')}
                                            className="mt-4 bg-primary-600 hover:bg-primary-700"
                                        >
                                            <Plus size={16} className="mr-2" /> New Invoice
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                invoices.map((invoice) => (
                                    <tr
                                        key={invoice._id}
                                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/invoices/${invoice._id}`)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-mono text-sm text-primary-600">{invoice.invoiceId}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{invoice.customerName}</div>
                                            <div className="text-xs text-gray-400">{invoice.customerPhone}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                <IndianRupee size={14} />
                                                {(invoice.total || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-green-600 font-medium">
                                            ₹{(invoice.amountPaid || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6 text-red-600 font-medium">
                                            ₹{(invoice.amountDue || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge type={paymentStatusColors[invoice.paymentStatus]}>
                                                {invoice.paymentStatus}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {invoice.dueDate
                                                ? new Date(invoice.dueDate).toLocaleDateString()
                                                : '-'
                                            }
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button
                                                    variant="outline"
                                                    className="text-xs py-1.5 h-auto"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/invoices/${invoice._id}`);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="text-xs py-1.5 h-auto px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(invoice._id);
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
                    {invoices.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <Receipt className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">No invoices found</p>
                            <Button
                                onClick={() => router.push('/invoices/new')}
                                className="mt-4 bg-primary-600 hover:bg-primary-700"
                            >
                                <Plus size={16} className="mr-2" /> New Invoice
                            </Button>
                        </div>
                    ) : (
                        invoices.map((invoice) => (
                            <div
                                key={invoice._id}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
                                onClick={() => router.push(`/invoices/${invoice._id}`)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-mono text-xs text-primary-600 mb-1">{invoice.invoiceId}</div>
                                        <h3 className="font-semibold text-gray-900">{invoice.customerName}</h3>
                                        <div className="text-sm text-gray-500">{invoice.customerPhone}</div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <Badge type={statusColors[invoice.status]}>{invoice.status}</Badge>
                                        <Badge type={paymentStatusColors[invoice.paymentStatus]} size="sm">
                                            {invoice.paymentStatus}
                                        </Badge>
                                    </div>
                                </div>

                                <div className="bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Total Amount</span>
                                        <span className="font-bold text-gray-900">₹{(invoice.total || 0).toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500">Paid / Due</span>
                                        <div className="font-medium">
                                            <span className="text-green-600">₹{(invoice.amountPaid || 0).toLocaleString()}</span>
                                            <span className="text-gray-300 mx-1">/</span>
                                            <span className="text-red-500">₹{(invoice.amountDue || 0).toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2 border-t border-gray-50 pt-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-sm py-2 h-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/invoices/${invoice._id}`);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="px-3 py-2 h-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(invoice._id);
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
