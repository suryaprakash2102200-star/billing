'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { Users, UserPlus, Search, Filter, Instagram, MessageCircle, MapPin, Globe, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const sourceIcons = {
    Instagram: Instagram,
    WhatsApp: MessageCircle,
    'Walk-in': MapPin,
    Referral: Users,
    Website: Globe,
    Other: Users
};

const statusColors = {
    New: 'info',
    Contacted: 'warning',
    Qualified: 'default',
    Converted: 'success',
    Dropped: 'danger'
};

export default function LeadsPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({
        status: '',
        source: '',
        search: ''
    });

    useEffect(() => {
        fetchLeads();
    }, [filters]);

    const fetchLeads = async () => {
        try {
            const params = new URLSearchParams();
            if (filters.status) params.append('status', filters.status);
            if (filters.source) params.append('source', filters.source);
            if (filters.search) params.append('search', filters.search);

            const res = await fetch(`/api/leads?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch leads');

            setLeads(data.leads || []);
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Are you sure you want to delete this lead?')) return;

        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete lead');
            }

            setLeads(leads.filter(l => l._id !== id));
            success('Lead deleted successfully');
        } catch (err) {
            toastError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lead Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Track and convert your leads</p>
                </div>
                <Button
                    onClick={() => router.push('/leads/new')}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 gap-2"
                >
                    <UserPlus size={18} /> Add Lead
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Search */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name or phone..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    {/* Status Filter */}
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="New">New</option>
                        <option value="Contacted">Contacted</option>
                        <option value="Qualified">Qualified</option>
                        <option value="Converted">Converted</option>
                        <option value="Dropped">Dropped</option>
                    </select>

                    {/* Source Filter */}
                    <select
                        value={filters.source}
                        onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">All Sources</option>
                        <option value="Instagram">Instagram</option>
                        <option value="WhatsApp">WhatsApp</option>
                        <option value="Walk-in">Walk-in</option>
                        <option value="Referral">Referral</option>
                        <option value="Website">Website</option>
                        <option value="Other">Other</option>
                    </select>
                </div>
            </Card>

            {/* Leads List - Responsive View */}
            <Card className="border-0 shadow-sm bg-transparent md:bg-white md:overflow-hidden p-0 md:p-0">

                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Lead</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Contact</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Source</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Created</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {leads.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center">
                                        <Users className="mx-auto text-gray-300 mb-4" size={48} />
                                        <p className="text-gray-500 font-medium">No leads found</p>
                                        <p className="text-gray-400 text-sm mt-1">Add your first lead to get started</p>
                                        <Button
                                            onClick={() => router.push('/leads/new')}
                                            className="mt-4 bg-primary-600 hover:bg-primary-700"
                                        >
                                            <UserPlus size={16} className="mr-2" /> Add Lead
                                        </Button>
                                    </td>
                                </tr>
                            ) : (
                                leads.map((lead) => {
                                    const SourceIcon = sourceIcons[lead.source] || Users;
                                    return (
                                        <tr
                                            key={lead._id}
                                            className="group hover:bg-gray-50/50 transition-colors cursor-pointer"
                                            onClick={() => router.push(`/leads/${lead._id}`)}
                                        >
                                            <td className="py-4 px-6">
                                                <div className="font-medium text-gray-900">{lead.name}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm text-gray-600">{lead.phone}</div>
                                                {lead.email && (
                                                    <div className="text-xs text-gray-400">{lead.email}</div>
                                                )}
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <SourceIcon size={16} className="text-gray-400" />
                                                    <span className="text-sm text-gray-600">{lead.source}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <Badge type={statusColors[lead.status]}>{lead.status}</Badge>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-500">
                                                {new Date(lead.createdAt).toLocaleDateString()}
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        variant="outline"
                                                        className="text-xs py-1.5 h-auto"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/leads/${lead._id}`);
                                                        }}
                                                    >
                                                        View
                                                    </Button>
                                                    <Button
                                                        variant="danger"
                                                        className="text-xs py-1.5 h-auto px-2"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDelete(lead._id);
                                                        }}
                                                    >
                                                        <Trash2 size={14} />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {leads.length === 0 ? (
                        <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <Users className="mx-auto text-gray-300 mb-4" size={48} />
                            <p className="text-gray-500 font-medium">No leads found</p>
                            <Button
                                onClick={() => router.push('/leads/new')}
                                className="mt-4 bg-primary-600 hover:bg-primary-700"
                            >
                                <UserPlus size={16} className="mr-2" /> Add Lead
                            </Button>
                        </div>
                    ) : (
                        leads.map((lead) => {
                            const SourceIcon = sourceIcons[lead.source] || Users;
                            return (
                                <div
                                    key={lead._id}
                                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm active:scale-[0.99] transition-transform"
                                    onClick={() => router.push(`/leads/${lead._id}`)}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <div>
                                            <h3 className="font-semibold text-gray-900">{lead.name}</h3>
                                            <div className="text-sm text-gray-500 mt-0.5">{lead.phone}</div>
                                        </div>
                                        <Badge type={statusColors[lead.status]}>{lead.status}</Badge>
                                    </div>

                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                                        <div className="flex items-center gap-1.5">
                                            <SourceIcon size={14} />
                                            {lead.source}
                                        </div>
                                        <div>•</div>
                                        <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                                    </div>

                                    <div className="flex gap-2 pt-3 border-t border-gray-50">
                                        <Button
                                            variant="outline"
                                            className="flex-1 text-sm py-2 h-auto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                router.push(`/leads/${lead._id}`);
                                            }}
                                        >
                                            View Details
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="px-3 py-2 h-auto"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleDelete(lead._id);
                                            }}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>
        </div>
    );
}
