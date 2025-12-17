'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Plus, Trash2, Receipt } from 'lucide-react';

export default function NewInvoiceForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const orderId = searchParams.get('order');

    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState([]);

    const [formData, setFormData] = useState({
        orderId: '',
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        customerAddress: '',
        items: [{ product: '', description: '', quantity: 1, unitPrice: '', discount: 0 }],
        discount: 0,
        taxRate: 0,
        amountPaid: 0,
        termsAndConditions: 'Payment due within 7 days of invoice date.',
        notes: '',
        dueDays: 7
    });

    useEffect(() => {
        fetchOrders();
    }, []);

    useEffect(() => {
        if (orderId && orders.length > 0) {
            const order = orders.find(o => o._id === orderId);
            if (order) handleOrderSelect(order);
        }
    }, [orderId, orders]);

    const fetchOrders = async () => {
        try {
            const res = await fetch('/api/orders');
            const data = await res.json();
            if (res.ok) {
                setOrders(data.orders || []);
            }
        } catch (err) {
            console.error('Failed to fetch orders:', err);
        }
    };

    const handleOrderSelect = (order) => {
        setFormData({
            ...formData,
            orderId: order._id,
            customerName: order.customerName || '',
            customerPhone: order.phone || '',
            // Email not in basic order fields but maybe available
            items: [{
                product: order.productType || 'Order',
                description: `${order.size} - ${order.status}`,
                quantity: order.quantity || 1,
                unitPrice: order.payment?.totalAmount ? (order.payment.totalAmount / (order.quantity || 1)).toString() : '',
                discount: 0
            }],
            amountPaid: order.payment?.advancePaid || 0
        });
    };

    const addItem = () => {
        setFormData({
            ...formData,
            items: [...formData.items, { product: '', description: '', quantity: 1, unitPrice: '', discount: 0 }]
        });
    };

    const removeItem = (index) => {
        if (formData.items.length > 1) {
            setFormData({
                ...formData,
                items: formData.items.filter((_, i) => i !== index)
            });
        }
    };

    const updateItem = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index] = { ...newItems[index], [field]: value };
        setFormData({ ...formData, items: newItems });
    };

    const calculateSubtotal = () => {
        return formData.items.reduce((sum, item) => {
            const qty = parseFloat(item.quantity) || 0;
            const price = parseFloat(item.unitPrice) || 0;
            const discount = parseFloat(item.discount) || 0;
            return sum + (qty * price) - discount;
        }, 0);
    };

    const calculateTotal = () => {
        const subtotal = calculateSubtotal();
        const discount = parseFloat(formData.discount) || 0;
        const taxRate = parseFloat(formData.taxRate) || 0;
        const taxAmount = (subtotal - discount) * (taxRate / 100);
        return subtotal - discount + taxAmount;
    };

    const calculateDue = () => {
        return calculateTotal() - (parseFloat(formData.amountPaid) || 0);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/invoices', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    items: formData.items.map(item => ({
                        ...item,
                        quantity: parseFloat(item.quantity) || 1,
                        unitPrice: parseFloat(item.unitPrice) || 0,
                        discount: parseFloat(item.discount) || 0
                    })),
                    discount: parseFloat(formData.discount) || 0,
                    taxRate: parseFloat(formData.taxRate) || 0,
                    amountPaid: parseFloat(formData.amountPaid) || 0
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create invoice');
            }

            success('Invoice created successfully');
            router.push(`/invoices/${data.invoice._id}`);
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
                    <h1 className="text-2xl font-bold text-gray-900">Create New Invoice</h1>
                    <p className="text-gray-500 text-sm mt-1">Generate a billing invoice</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Order Selection */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                        <Receipt className="text-primary-600" size={20} /> From Order (Optional)
                    </h2>
                    <select
                        value={formData.orderId}
                        onChange={(e) => {
                            const order = orders.find(o => o._id === e.target.value);
                            if (order) {
                                handleOrderSelect(order);
                            } else {
                                setFormData({ ...formData, orderId: '' });
                            }
                        }}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="">-- Select an Order (or enter details manually) --</option>
                        {orders.map((order) => (
                            <option key={order._id} value={order._id}>
                                {order.productType} - {order.customerName} (₹{order.payment?.totalAmount || '0'})
                            </option>
                        ))}
                    </select>
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
                        />
                        <Input
                            label="Address (Optional)"
                            placeholder="123 Main St, City"
                            value={formData.customerAddress}
                            onChange={(e) => setFormData({ ...formData, customerAddress: e.target.value })}
                        />
                    </div>
                </Card>

                {/* Line Items */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-gray-900">Line Items</h2>
                        <Button type="button" variant="outline" onClick={addItem} className="gap-2 text-sm">
                            <Plus size={16} /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {formData.items.map((item, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-xl space-y-4">
                                <div className="flex items-start justify-between">
                                    <span className="text-sm font-semibold text-gray-500">Item {index + 1}</span>
                                    {formData.items.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeItem(index)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    )}
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Product/Service Name"
                                        value={item.product}
                                        onChange={(e) => updateItem(index, 'product', e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Description (optional)"
                                        value={item.description}
                                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                    />
                                </div>
                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Quantity</label>
                                        <input
                                            type="number"
                                            min="1"
                                            value={item.quantity}
                                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Unit Price (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            placeholder="500"
                                            value={item.unitPrice}
                                            onChange={(e) => updateItem(index, 'unitPrice', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                            required
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Discount (₹)</label>
                                        <input
                                            type="number"
                                            min="0"
                                            value={item.discount}
                                            onChange={(e) => updateItem(index, 'discount', e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                {/* Totals & Payment */}
                <Card className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <h2 className="text-lg font-bold text-gray-900">Discounts & Payment</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    label="Overall Discount (₹)"
                                    type="number"
                                    min="0"
                                    value={formData.discount}
                                    onChange={(e) => setFormData({ ...formData, discount: e.target.value })}
                                />
                                <Input
                                    label="Tax Rate (%)"
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={formData.taxRate}
                                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                />
                            </div>
                            <Input
                                label="Amount Already Paid (₹)"
                                type="number"
                                min="0"
                                value={formData.amountPaid}
                                onChange={(e) => setFormData({ ...formData, amountPaid: e.target.value })}
                            />
                            <Input
                                label="Due In (days)"
                                type="number"
                                min="1"
                                value={formData.dueDays}
                                onChange={(e) => setFormData({ ...formData, dueDays: e.target.value })}
                            />
                        </div>
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3">
                            <h2 className="text-lg font-bold text-gray-900">Summary</h2>
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{calculateSubtotal().toLocaleString()}</span>
                            </div>
                            {formData.discount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Discount</span>
                                    <span>- ₹{parseFloat(formData.discount).toLocaleString()}</span>
                                </div>
                            )}
                            {formData.taxRate > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax ({formData.taxRate}%)</span>
                                    <span>₹{((calculateSubtotal() - (parseFloat(formData.discount) || 0)) * (parseFloat(formData.taxRate) / 100)).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t">
                                <span>Total</span>
                                <span>₹{calculateTotal().toLocaleString()}</span>
                            </div>
                            {formData.amountPaid > 0 && (
                                <div className="flex justify-between text-green-600">
                                    <span>Paid</span>
                                    <span>- ₹{parseFloat(formData.amountPaid).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl text-red-600 pt-3 border-t">
                                <span>Amount Due</span>
                                <span>₹{calculateDue().toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Terms & Notes */}
                <Card className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Terms & Notes</h2>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Terms & Conditions
                            </label>
                            <textarea
                                value={formData.termsAndConditions}
                                onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                                rows={3}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Additional Notes (Optional)
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                placeholder="Any additional notes..."
                                rows={2}
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                            />
                        </div>
                    </div>
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
                        {loading ? 'Creating...' : 'Create Invoice'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
