'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Instagram, MessageCircle, MapPin, Users, Globe } from 'lucide-react';

const sources = [
    { value: 'Instagram', label: 'Instagram', icon: Instagram },
    { value: 'WhatsApp', label: 'WhatsApp', icon: MessageCircle },
    { value: 'Walk-in', label: 'Walk-in', icon: MapPin },
    { value: 'Referral', label: 'Referral', icon: Users },
    { value: 'Website', label: 'Website', icon: Globe },
    { value: 'Other', label: 'Other', icon: Users }
];

export default function NewLeadPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        source: 'Instagram',
        notes: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create lead');
            }

            success('Lead created successfully');
            router.push('/leads');
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
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
                    <h1 className="text-2xl font-bold text-gray-900">Add New Lead</h1>
                    <p className="text-gray-500 text-sm mt-1">Capture a new lead from any source</p>
                </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
                <Card className="p-6 space-y-6">
                    {/* Name */}
                    <Input
                        label="Full Name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />

                    {/* Phone */}
                    <Input
                        label="Phone Number"
                        type="tel"
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        required
                    />

                    {/* Email (Optional) */}
                    <Input
                        label="Email Address (Optional)"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />

                    {/* Source */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Lead Source
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {sources.map((source) => {
                                const Icon = source.icon;
                                const isSelected = formData.source === source.value;
                                return (
                                    <button
                                        key={source.value}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, source: source.value })}
                                        className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${isSelected
                                                ? 'border-primary-600 bg-primary-50 text-primary-700'
                                                : 'border-gray-200 hover:border-gray-300 text-gray-600'
                                            }`}
                                    >
                                        <Icon size={24} />
                                        <span className="text-sm font-medium">{source.label}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            placeholder="Add any additional information about this lead..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
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
                            {loading ? 'Creating...' : 'Create Lead'}
                        </Button>
                    </div>
                </Card>
            </form>
        </div>
    );
}
