'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Phone, Mail, Calendar, User, Instagram, MessageCircle, MapPin, Users, Globe, Clock } from 'lucide-react';
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

export default function LeadDetailPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    useEffect(() => {
        fetchLead();
    }, []);

    const fetchLead = async () => {
        try {
            const res = await fetch(`/api/leads/${unwrappedParams.id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch lead');

            setLead(data.lead);
        } catch (err) {
            toastError(err.message);
            router.push('/leads');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/leads/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to update status');

            setLead(data.lead);
            success('Status updated successfully');
        } catch (err) {
            toastError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!lead) return null;

    const SourceIcon = sourceIcons[lead.source] || Users;

    return (
        <div className="max-w-5xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="!p-2"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{lead.name}</h1>
                        <p className="text-gray-500 text-sm mt-1">Lead Details</p>
                    </div>
                </div>
                <Badge type={statusColors[lead.status]} className="text-sm px-4 py-2">
                    {lead.status}
                </Badge>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Phone size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Phone</div>
                                    <div className="font-medium text-gray-900">{lead.phone}</div>
                                </div>
                            </div>

                            {lead.email && (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Mail size={18} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="font-medium text-gray-900">{lead.email}</div>
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <SourceIcon size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Source</div>
                                    <div className="font-medium text-gray-900">{lead.source}</div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Calendar size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Created</div>
                                    <div className="font-medium text-gray-900">
                                        {new Date(lead.createdAt).toLocaleDateString('en-US', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    {lead.notes && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Notes</h2>
                            <p className="text-gray-600 whitespace-pre-wrap">{lead.notes}</p>
                        </Card>
                    )}

                    {/* Timeline */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Activity Timeline</h2>
                        <div className="space-y-4">
                            {lead.timeline && lead.timeline.length > 0 ? (
                                lead.timeline.map((entry, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <Clock size={14} className="text-primary-600" />
                                            </div>
                                            {index < lead.timeline.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="font-medium text-gray-900">{entry.action}</div>
                                            {entry.description && (
                                                <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-2">
                                                {new Date(entry.timestamp).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-500 text-sm">No activity yet</p>
                            )}
                        </div>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Status Update */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
                        <select
                            value={lead.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating || lead.status === 'Converted'}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <option value="New">New</option>
                            <option value="Contacted">Contacted</option>
                            <option value="Qualified">Qualified</option>
                            <option value="Converted">Converted</option>
                            <option value="Dropped">Dropped</option>
                        </select>
                        {lead.status === 'Converted' && (
                            <p className="text-xs text-gray-500 mt-2">
                                This lead has been converted to an inquiry
                            </p>
                        )}
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                disabled={lead.status === 'Converted'}
                                onClick={() => router.push(`/inquiries/new?lead=${unwrappedParams.id}`)}
                            >
                                Convert to Inquiry
                            </Button>
                            <Button
                                variant="outline"
                                className="w-full justify-start"
                                onClick={() => router.push(`/leads/${unwrappedParams.id}/edit`)}
                            >
                                Edit Lead
                            </Button>
                        </div>
                    </Card>

                    {/* Created By */}
                    {lead.createdBy && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Created By</h2>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                                    <User size={18} className="text-primary-600" />
                                </div>
                                <div>
                                    <div className="font-medium text-gray-900">{lead.createdBy.name}</div>
                                    <div className="text-sm text-gray-500">{lead.createdBy.email}</div>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}
