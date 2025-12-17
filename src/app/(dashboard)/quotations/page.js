'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { FileText, Plus, Search, IndianRupee, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const statusColors = {
    Draft: 'default',
    Sent: 'info',
    Viewed: 'warning',
    Accepted: 'success',
    Rejected: 'danger',
    Expired: 'secondary'
};

export default function QuotationsPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [quotations, setQuotations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        search: ''
    });

    useEffect(() => {
        fetchQuotations();
    }, [filters]);

    const fetchQuotations = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.search) params.append('search', filters.search);

            const res = await fetch(`/api/quotations?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch quotations');

            setQuotations(data.quotations || []);
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
        if (!confirm('Are you sure you want to delete this quotation?')) return;

        try {
            const res = await fetch(`/api/quotations/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete quotation');
            }

            setQuotations(quotations.filter(q => q._id !== id));
            success('Quotation deleted successfully');
        } catch (err) {
            toastError(err.message);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quotations</h1>
                    <p className="text-gray-500 text-sm mt-1">Create and manage price quotations</p>
                </div>
                <Button
                    onClick={() => router.push('/quotations/new')}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 gap-2"
                >
                    <Plus size={18} /> New Quotation
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by customer or quotation ID..."
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
                        <option value="Viewed">Viewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </Card>

            {/* Quotations List - Responsive View */}
            <Card className="border-0 shadow-sm bg-transparent md:bg-white md:overflow-hidden p-0 md:p-0">

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Quotation ID</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Customer</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Items</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Total</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Valid Until</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {quotations.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="py-12 text-center">
                                        <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                                        <p className="text-gray-500 font-medium">No quotations found</p>
                                        <p className="text-gray-400 text-sm mt-1">Create your first quotation</p>
                                        <Button
                                            onClick={() => router.push('/quotations/new')}
                                            className="mt-4 bg-primary-600 hover:bg-primary-700"
                                        >
                                            <Plus size={16} className="mr-2" /> New Quotation
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                quotations.map((quotation) => (
                                    <tr
                                        key={quotation._id}
                                        className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                        onClick={() => router.push(`/quotations/${quotation._id}`)}
                                    >
                                        <td className="py-4 px-6">
                                            <div className="font-mono text-sm text-primary-600">{quotation.quotationId}</div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="font-medium text-gray-900">{quotation.customerName}</div>
                                            <div className="text-xs text-gray-400">{quotation.customerPhone}</div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-600">
                                            {quotation.items?.length || 0} items
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-1 font-semibold text-gray-900">
                                                <IndianRupee size={14} />
                                                {(quotation.total || 0).toLocaleString()}
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge type={statusColors[quotation.status]}>{quotation.status}</Badge>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-gray-500">
                                            {quotation.validUntil
                                                ? new Date(quotation.validUntil).toLocaleDateString()
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
                                                        router.push(`/quotations/${quotation._id}`);
                                                    }}
                                                >
                                                    View
                                                </Button>
                                                <Button
                                                    variant="danger"
                                                    className="text-xs py-1.5 h-auto px-2"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(quotation._id);
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
                    {quotations.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <FileText className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">No quotations found</p>
                            <Button
                                onClick={() => router.push('/quotations/new')}
                                className="mt-4 bg-primary-600 hover:bg-primary-700"
                            >
                                <Plus size={16} className="mr-2" /> New Quotation
                            </Button>
                        </div>
                    ) : (
                        quotations.map((quotation) => (
                            <div
                                key={quotation._id}
                                className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
                                onClick={() => router.push(`/quotations/${quotation._id}`)}
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-mono text-xs text-primary-600 mb-1">{quotation.quotationId}</div>
                                        <h3 className="font-semibold text-gray-900">{quotation.customerName}</h3>
                                        <div className="text-sm text-gray-500">{quotation.customerPhone}</div>
                                    </div>
                                    <Badge type={statusColors[quotation.status]}>{quotation.status}</Badge>
                                </div>

                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100 mb-4">
                                    <span className="text-sm text-gray-600">{quotation.items?.length || 0} items</span>
                                    <div className="flex items-center gap-1 font-bold text-gray-900">
                                        <IndianRupee size={15} />
                                        {(quotation.total || 0).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex gap-2 border-t border-gray-50 pt-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1 text-sm py-2 h-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(`/quotations/${quotation._id}`);
                                        }}
                                    >
                                        View Details
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="px-3 py-2 h-auto"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(quotation._id);
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
