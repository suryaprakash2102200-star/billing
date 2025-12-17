'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Trash2, Phone, Mail, MessageSquare, Instagram, Home, Calendar } from 'lucide-react';

import { useToast } from '@/context/ToastContext';

export default function OrderDetailPage({ params }) {
    const router = useRouter();
    const { id } = use(params);
    const { success, error: toastError } = useToast();
    const [order, setOrder] = useState(null);
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [status, setStatus] = useState('');

    // Payment update state
    const [paymentUpdate, setPaymentUpdate] = useState({
        totalAmount: 0,
        advancePaid: 0,
        mode: 'Cash'
    });

    useEffect(() => {
        fetch(`/api/orders/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.order) {
                    setOrder(data.order);
                    setStatus(data.order.status);
                }
                if (data.payment) {
                    setPayment(data.payment);
                    setPaymentUpdate({
                        totalAmount: data.payment.totalAmount,
                        advancePaid: data.payment.advancePaid,
                        mode: data.payment.paymentMode || 'Cash'
                    });
                }
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);

    const handleStatusUpdate = async () => {
        try {
            const res = await fetch(`/api/orders/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            if (res.ok) {
                setOrder(prev => ({ ...prev, status }));
                success('Order status updated!');
            }
        } catch (e) {
            toastError('Failed to update status');
        }
    };

    const handlePaymentUpdate = async () => {
        if (!payment) return;
        try {
            const res = await fetch(`/api/payments/${payment._id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paymentUpdate)
            });
            const data = await res.json();
            if (res.ok) {
                setPayment(data.payment);
                success('Payment details updated');
            } else {
                toastError(data.error || 'Update failed');
            }
        } catch (error) {
            toastError('Failed to update payment');
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this order?')) return;
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            if (res.ok) {
                success('Order deleted');
                router.push('/orders');
            }
        } catch {
            toastError('Error deleting');
        }
    }

    if (loading) return <div>Loading...</div>;
    if (!order) return <div>Order not found</div>;

    return (
        <div className="space-y-6">
            {/* Header / Breadcrumbs */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Link href="/dashboard" className="hover:text-blue-600"><Home size={16} /></Link>
                    <span>/</span>
                    <Link href="/orders" className="hover:text-blue-600">Orders</Link>
                    <span>/</span>
                    <span className="text-blue-600 font-medium">Order #{order._id.slice(-6)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 text-sm">
                    <Calendar size={16} />
                    <span>{new Date().toDateString()}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - Order Info */}
                <div className="lg:col-span-2 space-y-6">
                    <Card className="!p-6">
                        <div className="flex justify-between items-start mb-6">
                            <h2 className="text-xl font-bold text-gray-900">Order Details</h2>
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                                {order.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-y-6 gap-x-12 mb-8">
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">CUSTOMER</p>
                                <p className="text-lg font-bold text-gray-900">{order.customerName}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">PRODUCT</p>
                                <p className="text-lg font-bold text-gray-900">{order.productType}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">SIZE</p>
                                <p className="text-lg font-bold text-gray-900">{order.size}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">QUANTITY</p>
                                <span className="inline-block bg-gray-100 px-3 py-1 rounded-md font-bold text-gray-900">{order.quantity}</span>
                            </div>
                        </div>

                        <div>
                            <p className="font-semibold text-gray-900 mb-2">Notes</p>
                            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-4 text-yellow-900 italic">
                                "{order.notes || 'No specific notes for this order.'}"
                            </div>
                        </div>
                    </Card>

                    {/* Update Status */}
                    <Card className="!p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Update Status</h2>
                        <div className="flex gap-4">
                            <div className="relative flex-1">
                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value)}
                                    className="w-full appearance-none px-4 py-3 bg-white border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium text-gray-700"
                                >
                                    {['New', 'Designing', 'Printing', 'Ready', 'Delivered'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <Button onClick={handleStatusUpdate} className="bg-blue-600 px-8">Update</Button>
                        </div>
                    </Card>

                    <div className="flex justify-end">
                        <Button variant="danger" onClick={handleDelete} className="flex items-center gap-2">
                            <Trash2 size={16} /> Delete Order
                        </Button>
                    </div>
                </div>

                {/* Right Column - Contact & Payment */}
                <div className="space-y-6">
                    {/* Payment Details */}
                    {payment && (
                        <Card className="!p-6">
                            <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                                <h2 className="text-lg font-bold text-gray-900">Payment Info</h2>
                                <Badge type={
                                    payment.status === 'Paid' ? 'success' :
                                        payment.status === 'Pending' ? 'danger' : 'warning'
                                }>{payment.status}</Badge>
                            </div>

                            <div className="space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Total Amount"
                                        type="number"
                                        value={paymentUpdate.totalAmount}
                                        onChange={(e) => setPaymentUpdate({ ...paymentUpdate, totalAmount: e.target.value })}
                                    />
                                    <Input
                                        label="Advance Paid"
                                        type="number"
                                        value={paymentUpdate.advancePaid}
                                        onChange={(e) => setPaymentUpdate({ ...paymentUpdate, advancePaid: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 ml-1">PAYMENT MODE</label>
                                    <select
                                        value={paymentUpdate.mode}
                                        onChange={(e) => setPaymentUpdate({ ...paymentUpdate, mode: e.target.value })}
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all font-medium"
                                    >
                                        <option>UPI</option>
                                        <option>Cash</option>
                                    </select>
                                </div>

                                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                    <span className="font-bold text-gray-500">Balance Due</span>
                                    <span className={`text-2xl font-bold ${payment.balanceAmount > 0 ? 'text-red-500' : 'text-green-600'}`}>
                                        ₹{payment.balanceAmount}
                                    </span>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <Button
                                        onClick={() => setPaymentUpdate({ ...paymentUpdate, advancePaid: paymentUpdate.totalAmount })}
                                        variant="secondary"
                                        className="bg-green-50 text-green-700 hover:bg-green-100 border-green-200 text-xs"
                                    >
                                        Mark Full Paid
                                    </Button>
                                    <Button onClick={handlePaymentUpdate} className="bg-blue-600 hover:bg-blue-700 w-full text-xs">
                                        Save Changes
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    )}

                    <Card className="!p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-6">Contact Customer</h2>
                        <div className="space-y-4">
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="bg-green-100 p-3 rounded-full text-green-600">
                                    <Phone size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">PHONE NUMBER</p>
                                    <a href={`tel:${order.phone}`} className="text-lg font-bold text-gray-900 hover:text-blue-600">{order.phone}</a>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl">
                                <div className="bg-pink-100 p-3 rounded-full text-pink-500">
                                    <Instagram size={20} />
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">INSTAGRAM</p>
                                    <p className="text-lg font-bold text-gray-900">{order.instagramId || '-'}</p>
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                                <Mail size={16} /> Email
                            </Button>
                            <Button variant="outline" className="flex items-center justify-center gap-2 w-full">
                                <MessageSquare size={16} /> Chat
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
}
