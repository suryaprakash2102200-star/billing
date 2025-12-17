'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Users, Package } from 'lucide-react';

export default function NewInquiryPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const leadId = searchParams.get('lead');

    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [leads, setLeads] = useState([]);
    const [selectedLead, setSelectedLead] = useState(null);

    const [formData, setFormData] = useState({
        leadId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        product: '',
        customRequirement: '',
        quantity: 1,
        estimatedValue: '',
        notes: ''
    });

    // Fetch available leads for dropdown
    useEffect(() => {
        fetchLeads();
    }, []);

    // Auto-select lead if coming from lead detail
    useEffect(() => {
        if (leadId && leads.length > 0) {
            const lead = leads.find(l => l._id === leadId);
            if (lead) handleLeadSelect(lead);
        }
    }, [leadId, leads]);

    const fetchLeads = async () => {
        try {
            // Fetch leads that haven't been converted yet
            const res = await fetch('/api/leads?status=New&status=Contacted&status=Qualified');
            const data = await res.json();
            if (res.ok) {
                // Filter out already converted leads
                const availableLeads = (data.leads || []).filter(l => l.status !== 'Converted');
                setLeads(availableLeads);
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        }
    };

    const handleLeadSelect = (lead) => {
        setSelectedLead(lead);
        setFormData({
            ...formData,
            leadId: lead._id,
            customerName: lead.name,
            customerPhone: lead.phone,
            customerEmail: lead.email || ''
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/inquiries', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    estimatedValue: formData.estimatedValue ? parseFloat(formData.estimatedValue) : 0
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create inquiry');
            }

            success('Inquiry created successfully');
            router.push('/inquiries');
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="!p-2"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Inquiry</h1>
                    <p className="text-gray-500 text-sm mt-1">Start a new customer inquiry</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Lead Selection */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Users className="text-primary-600" size={20} /> Select Lead (Optional)
                    </h2>
                    <p className="text-sm text-gray-500 mb-4">
                        Select an existing lead to auto-fill customer details, or enter manually below.
                    </p>

                    <select
                        value={formData.leadId}
                        onChange={(e) => {
                            const lead = leads.find(l => l._id === e.target.value);
                            if (lead) {
                                handleLeadSelect(lead);
                            } else {
                                setSelectedLead(null);
                                setFormData({ ...formData, leadId: '' });
                            }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">-- Select a Lead (or enter details manually) --</option>
                        {leads.map((lead) => (
                            <option key={lead._id} value={lead._id}>
                                {lead.name} - {lead.phone} ({lead.source})
                            </option>
                        ))}
                    </select>

                    {selectedLead && (
                        <div className="mt-4 p-3 bg-primary-50 rounded-lg border border-primary-100">
                            <span className="text-sm text-primary-700">
                                Lead selected: <strong>{selectedLead.name}</strong> from {selectedLead.source}
                            </span>
                        </div>
                    )}
                </Card>

                {/* Customer Details */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Customer Name"
                            placeholder="John Doe"
                            value={formData.customerName}
                            onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                            required
                        />
                        <Input
                            label="Phone Number"
                            type="tel"
                            placeholder="+91 9876543210"
                            value={formData.customerPhone}
                            onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                            required
                        />
                        <Input
                            label="Email (Optional)"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.customerEmail}
                            onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                            className="md:col-span-2"
                        />
                    </div>
                </Card>

                {/* Product/Service Details */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Package className="text-orange-500" size={20} /> Product/Service Details
                    </h2>
                    <div className="space-y-6">
                        <Input
                            label="Product/Service"
                            placeholder="Photo Frame, Canvas Print, Album, etc."
                            value={formData.product}
                            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Custom Requirements (Optional)
                            </label>
                            <textarea
                                value={formData.customRequirement}
                                onChange={(e) => setFormData({ ...formData, customRequirement: e.target.value })}
                                placeholder="Size, material, special instructions..."
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Quantity"
                                type="number"
                                min="1"
                                value={formData.quantity}
                                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                            />
                            <Input
                                label="Estimated Value (₹)"
                                type="number"
                                min="0"
                                placeholder="5000"
                                value={formData.estimatedValue}
                                onChange={(e) => setFormData({ ...formData, estimatedValue: e.target.value })}
                            />
                        </div>
                    </div>
                </Card>

                {/* Notes */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Initial Notes (Optional)</h2>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any initial notes about this inquiry..."
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                    />
                </Card>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={loading}
                        className="flex-1 bg-primary-600 hover:bg-primary-700"
                    >
                        {loading ? 'Creating...' : 'Create Inquiry'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
