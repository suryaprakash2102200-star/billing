'use client';
import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, UserPlus, Phone, Mail, Globe, MessageCircle, MapPin, Users, Instagram } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const sources = [
    { id: 'Instagram', label: 'Instagram', icon: Instagram, color: 'text-pink-600', bg: 'bg-pink-50' },
    { id: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle, color: 'text-green-600', bg: 'bg-green-50' },
    { id: 'Walk-in', label: 'Walk-in', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { id: 'Referral', label: 'Referral', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { id: 'Website', label: 'Website', icon: Globe, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { id: 'Other', label: 'Other', icon: Users, color: 'text-gray-600', bg: 'bg-gray-50' }
];

export default function EditLeadPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: '',
        notes: ''
    });

    useEffect(() => {
        fetchLead();
    }, []);

    const fetchLead = async () => {
        try {
            const res = await fetch(`/api/leads/${unwrappedParams.id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch lead');

            setFormData({
                name: data.lead.name || '',
                phone: data.lead.phone || '',
                email: data.lead.email || '',
                source: data.lead.source || '',
                notes: data.lead.notes || ''
            });
        } catch (err) {
            toastError(err.message);
            router.push('/leads');
        } finally {
            setLoading(false);
        }
    };

    const validateForm = () => {
        if (!formData.name.trim()) return 'Name is required';
        if (!formData.phone.trim()) return 'Phone is required';
        if (formData.phone.length < 10) return 'Please enter a valid phone number';
        if (!formData.source) return 'Please select a source';
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const error = validateForm();
        if (error) {
            toastError(error);
            return;
        }

        setSaving(true);

        try {
            const res = await fetch(`/api/leads/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to update lead');
            }

            success('Lead updated successfully');
            router.push(`/leads/${unwrappedParams.id}`);
        } catch (err) {
            toastError(err.message);
        } finally {
            setSaving(false);
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
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="!p-2"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Edit Lead</h1>
                    <p className="text-gray-500 text-sm mt-1">Update lead information</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Information</h2>
                    <div className="space-y-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+91 9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                            <Input
                                label="Email Address (Optional)"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Lead Source</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {sources.map((source) => (
                            <div
                                key={source.id}
                                onClick={() => setFormData({ ...formData, source: source.id })}
                                className={`
                                    cursor-pointer p-4 rounded-xl border-2 transition-all duration-200 flex flex-col items-center gap-3
                                    ${formData.source === source.id
                                        ? 'border-primary-500 bg-primary-50'
                                        : 'border-transparent bg-gray-50 hover:bg-gray-100'}
                                `}
                            >
                                <div className={`p-3 rounded-full ${source.bg} ${source.color}`}>
                                    <source.icon size={24} />
                                </div>
                                <span className={`font-medium ${formData.source === source.id ? 'text-primary-700' : 'text-gray-600'}`}>
                                    {source.label}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Additional Notes</h2>
                    <textarea
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 min-h-[100px] resize-y"
                        placeholder="Any specific requirements or details..."
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                </Card>

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
                        disabled={saving}
                        className="flex-1 bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30"
                    >
                        {saving ? 'Saving...' : 'Update Lead'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
