'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { CreditCard, Loader2 } from 'lucide-react';

import { useToast } from '@/context/ToastContext';

export default function NewOrderPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        customerName: '',
        phone: '',
        instagramId: '',
        productType: 'Photo Frame',
        size: '',
        quantity: 1,
        photoReceived: false,
        deliveryDate: '',
        notes: '',
        totalAmount: '',
        advancePaid: '',
        paymentMode: 'UPI',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to create order');
            }

            success('Order created successfully!');
            router.push('/orders');
            router.refresh();
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Create New Order</h1>
                    <p className="text-gray-500 text-sm mt-1">Fill in the details to generate a new order.</p>
                </div>
                <div className="flex gap-4">
                    <Button variant="outline" onClick={() => router.back()} className="bg-white hover:bg-gray-50">Cancel</Button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Customer Details */}
                <Card className="!p-8 shadow-sm border-gray-100">
                    <h2 className="font-bold text-lg text-gray-900 mb-6">Customer Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Input
                            label="Customer Name"
                            name="customerName"
                            placeholder="Enter customer name"
                            value={formData.customerName}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Phone Number"
                            name="phone"
                            placeholder="Enter phone number"
                            value={formData.phone}
                            onChange={handleChange}
                            required
                        />
                        <div className="md:col-span-2">
                            <Input
                                label="Instagram ID"
                                name="instagramId"
                                placeholder="@username"
                                value={formData.instagramId}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                </Card>

                {/* Product Details */}
                <Card className="!p-8 shadow-sm border-gray-100">
                    <h2 className="font-bold text-lg text-gray-900 mb-6">Product Details</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Product Type</label>
                            <div className="relative">
                                <select
                                    name="productType"
                                    value={formData.productType}
                                    onChange={handleChange}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all appearance-none font-medium text-gray-700"
                                >
                                    <option>Photo Frame</option>
                                    <option>Digital Photo</option>
                                    <option>Album</option>
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>
                        <Input
                            label="Size"
                            name="size"
                            placeholder="e.g. 12x18"
                            value={formData.size}
                            onChange={handleChange}
                            required
                        />
                        <Input
                            label="Quantity"
                            type="number"
                            name="quantity"
                            value={formData.quantity}
                            onChange={handleChange}
                            min="1"
                            required
                        />
                        <Input
                            label="Delivery Date"
                            type="date"
                            name="deliveryDate"
                            value={formData.deliveryDate}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="flex items-center gap-3 mt-6">
                        <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${formData.photoReceived ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                            Photos Received
                        </label>
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, photoReceived: !formData.photoReceived })}
                            className="flex items-center gap-3 focus:outline-none group"
                        >
                            <span className={`text-sm font-medium transition-colors ${formData.photoReceived ? 'text-green-600' : 'text-gray-400'}`}>
                                {formData.photoReceived ? 'Yes, Received' : 'No, Pending'}
                            </span>
                            <div className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.photoReceived ? 'bg-primary-600' : 'bg-gray-200'}`}>
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.photoReceived ? 'translate-x-6' : 'translate-x-1'}`}
                                />
                            </div>
                        </button>
                    </div>

                    {/* Notes */}
                    <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Order Notes / Instructions</label>
                        <textarea
                            name="notes"
                            placeholder="Enter any specific requirements styling preferences, or design details..."
                            value={formData.notes}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all min-h-[100px]"
                        />
                    </div>

                </Card>

                {/* Payment & Submit */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <CreditCard className="text-orange-500" size={20} /> Payment Details
                    </h2>

                    <div className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <Input
                                label="Total Amount"
                                type="number"
                                name="totalAmount"
                                placeholder="₹ 0.00"
                                value={formData.totalAmount}
                                onChange={handleChange}
                                required
                            />
                            <Input
                                label="Advance Paid"
                                type="number"
                                name="advancePaid"
                                placeholder="₹ 0.00"
                                value={formData.advancePaid}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-3">Payment Mode</label>
                            <div className="flex flex-wrap gap-4">
                                {['UPI', 'Cash', 'Card', 'Bank Transfer'].map((mode) => (
                                    <label key={mode} className={`flex-1 cursor-pointer border rounded-xl p-4 flex items-center justify-center gap-2 transition-all ${formData.paymentMode === mode ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-gray-200 hover:border-gray-300'}`}>
                                        <input
                                            type="radio"
                                            name="paymentMode"
                                            value={mode}
                                            checked={formData.paymentMode === mode}
                                            onChange={handleChange}
                                            className="hidden"
                                        />
                                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${formData.paymentMode === mode ? 'border-primary-600' : 'border-gray-400'}`}>
                                            {formData.paymentMode === mode && <div className="w-2 h-2 rounded-full bg-primary-600" />}
                                        </div>
                                        <span className="font-medium">{mode}</span>
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button type="button" variant="outline" className="flex-1 py-4 text-gray-500" onClick={() => router.back()}>
                                Cancel
                            </Button>
                            <Button type="submit" className="min-w-[200px] text-lg py-6 bg-primary-600 hover:bg-primary-700" disabled={loading}>
                                {loading ? <Loader2 className="animate-spin" /> : 'Create Order'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </form>
        </div >
    );
}
