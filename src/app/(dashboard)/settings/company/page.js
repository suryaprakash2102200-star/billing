'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { Building2, Save, ArrowLeft } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function CompanySettingsPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        companyName: '',
        tagline: '',
        phone: '',
        email: '',
        website: '',
        address: { line1: '', line2: '', city: '', state: '', pincode: '', country: 'India' },
        gstNumber: '',
        panNumber: '',
        defaultTaxRate: 18,
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        upiId: '',
        defaultPaymentTerms: '',
        defaultQuotationTerms: ''
    });

    useEffect(() => {
        fetchSettings();
    }, []);

    const fetchSettings = async () => {
        try {
            const res = await fetch('/api/settings/company');
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to fetch settings');

            if (data.settings) {
                setFormData(prev => ({
                    ...prev,
                    ...data.settings,
                    address: { ...prev.address, ...data.settings.address }
                }));
            }
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const updateAddress = (field, value) => {
        setFormData({
            ...formData,
            address: { ...formData.address, [field]: value }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/settings/company', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to save settings');

            success('Company settings saved successfully');
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
        <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="!p-2"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Company Settings</h1>
                    <p className="text-gray-500 text-sm mt-1">Configure your business details and defaults</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Building2 className="text-primary-600" size={20} /> Business Profile
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label="Company Name"
                            value={formData.companyName}
                            onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                            required
                        />
                        <Input
                            label="Tagline (Optional)"
                            value={formData.tagline}
                            onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                        />
                        <Input
                            label="Phone / Mobile"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                        <Input
                            label="Email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        />
                        <div className="col-span-full">
                            <Input
                                label="Website"
                                value={formData.website}
                                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                            />
                        </div>
                    </div>
                </Card>

                {/* Address */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Address</h2>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Address Line 1"
                                value={formData.address.line1}
                                onChange={(e) => updateAddress('line1', e.target.value)}
                            />
                            <Input
                                label="Address Line 2"
                                value={formData.address.line2}
                                onChange={(e) => updateAddress('line2', e.target.value)}
                            />
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <Input
                                label="City"
                                value={formData.address.city}
                                onChange={(e) => updateAddress('city', e.target.value)}
                            />
                            <Input
                                label="State"
                                value={formData.address.state}
                                onChange={(e) => updateAddress('state', e.target.value)}
                            />
                            <Input
                                label="Pincode"
                                value={formData.address.pincode}
                                onChange={(e) => updateAddress('pincode', e.target.value)}
                            />
                            <Input
                                label="Country"
                                value={formData.address.country}
                                onChange={(e) => updateAddress('country', e.target.value)}
                            />
                        </div>
                    </div>
                </Card>

                {/* Tax & Bank */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Financial Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Tax Info</h3>
                            <Input
                                label="GST Number"
                                value={formData.gstNumber}
                                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                            />
                            <Input
                                label="PAN Number"
                                value={formData.panNumber}
                                onChange={(e) => setFormData({ ...formData, panNumber: e.target.value })}
                            />
                            <Input
                                label="Default Tax Rate (%)"
                                type="number"
                                value={formData.defaultTaxRate}
                                onChange={(e) => setFormData({ ...formData, defaultTaxRate: e.target.value })}
                            />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Bank Details</h3>
                            <Input
                                label="Bank Name"
                                value={formData.bankName}
                                onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                            />
                            <Input
                                label="Account Number"
                                value={formData.accountNumber}
                                onChange={(e) => setFormData({ ...formData, accountNumber: e.target.value })}
                            />
                            <Input
                                label="IFSC Code"
                                value={formData.ifscCode}
                                onChange={(e) => setFormData({ ...formData, ifscCode: e.target.value })}
                            />
                            <Input
                                label="UPI ID"
                                value={formData.upiId}
                                onChange={(e) => setFormData({ ...formData, upiId: e.target.value })}
                            />
                        </div>
                    </div>
                </Card>

                {/* Terms Defaults */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Legal & Terms</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Default Quotation Terms
                            </label>
                            <textarea
                                value={formData.defaultQuotationTerms}
                                onChange={(e) => setFormData({ ...formData, defaultQuotationTerms: e.target.value })}
                                rows={4}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Default Payment Terms (Invoices)
                            </label>
                            <textarea
                                value={formData.defaultPaymentTerms}
                                onChange={(e) => setFormData({ ...formData, defaultPaymentTerms: e.target.value })}
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                        </div>
                    </div>
                </Card>

                <div className="flex justify-end gap-3 sticky bottom-6">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.back()}
                        className="bg-white"
                    >
                        Cancel
                    </Button>
                    <Button
                        type="submit"
                        disabled={saving}
                        className="bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30 gap-2"
                    >
                        <Save size={18} />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
