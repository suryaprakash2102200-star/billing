'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Printer, IndianRupee, Calendar, Phone, X, CreditCard } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const statusColors = {
    Draft: 'default',
    Sent: 'info',
    Paid: 'success',
    Overdue: 'danger',
    Cancelled: 'secondary'
};

const paymentStatusColors = {
    Unpaid: 'danger',
    Partial: 'warning',
    Paid: 'success'
};

export default function InvoiceDetailPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState('');

    useEffect(() => {
        fetchInvoice();
    }, []);

    const fetchInvoice = async () => {
        try {
            const res = await fetch(`/api/invoices/${unwrappedParams.id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch invoice');

            setInvoice(data.invoice);
        } catch (err) {
            toastError(err.message);
            router.push('/invoices');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/invoices/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update status');

            setInvoice(data.invoice);
            success('Status updated successfully');
        } catch (err) {
            toastError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleRecordPayment = async () => {
        const amount = parseFloat(paymentAmount);
        if (!amount || amount <= 0) {
            toastError('Please enter a valid amount');
            return;
        }

        setUpdating(true);
        try {
            const newAmountPaid = (invoice.amountPaid || 0) + amount;

            const res = await fetch(`/api/invoices/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amountPaid: newAmountPaid })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to record payment');

            setInvoice(data.invoice);
            setShowPaymentModal(false);
            setPaymentAmount('');
            success('Payment recorded successfully');
        } catch (err) {
            toastError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!invoice) return null;

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header - Hide in print */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => router.back()}
                        className="!p-2"
                    >
                        <ArrowLeft size={20} />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{invoice.invoiceId}</h1>
                            <Badge type={paymentStatusColors[invoice.paymentStatus]}>{invoice.paymentStatus}</Badge>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{invoice.customerName}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Printer size={18} /> Print
                    </Button>
                    {invoice.paymentStatus !== 'Paid' && (
                        <Button
                            onClick={() => setShowPaymentModal(true)}
                            className="gap-2 bg-green-600 hover:bg-green-700"
                        >
                            <CreditCard size={18} /> Record Payment
                        </Button>
                    )}
                </div>
            </div>

            {/* Status Update - Hide in print */}
            <Card className="p-4 print:hidden">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Update Status:</span>
                    <select
                        value={invoice.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updating}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Paid">Paid</option>
                        <option value="Overdue">Overdue</option>
                        <option value="Cancelled">Cancelled</option>
                    </select>
                </div>
            </Card>

            {/* Printable Invoice */}
            <Card className="p-8 print:shadow-none print:border-0">
                {/* Header */}
                <div className="flex justify-between items-start border-b pb-6 mb-6">
                    <div>
                        <h2 className="text-3xl font-bold text-gray-900">INVOICE</h2>
                        <p className="text-lg font-mono text-primary-600 mt-1">{invoice.invoiceId}</p>
                    </div>
                    <div className="text-right text-sm text-gray-600">
                        <p><strong>Date:</strong> {new Date(invoice.createdAt).toLocaleDateString()}</p>
                        <p><strong>Due Date:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'N/A'}</p>
                    </div>
                </div>

                {/* Customer Details */}
                <div className="mb-8">
                    <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                    <div className="text-gray-900">
                        <p className="font-bold text-lg">{invoice.customerName}</p>
                        <div className="flex items-center gap-2 text-gray-600 mt-1">
                            <Phone size={14} />
                            <span>{invoice.customerPhone}</span>
                        </div>
                        {invoice.customerEmail && (
                            <p className="text-gray-600">{invoice.customerEmail}</p>
                        )}
                        {invoice.customerAddress && (
                            <p className="text-gray-600">{invoice.customerAddress}</p>
                        )}
                    </div>
                </div>

                {/* Items Table */}
                <div className="mb-8">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">#</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600">Item</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-center">Qty</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Unit Price</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Discount</th>
                                <th className="py-3 px-4 text-sm font-semibold text-gray-600 text-right">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {invoice.items?.map((item, index) => (
                                <tr key={index}>
                                    <td className="py-3 px-4 text-gray-600">{index + 1}</td>
                                    <td className="py-3 px-4">
                                        <div className="font-medium text-gray-900">{item.product}</div>
                                        {item.description && (
                                            <div className="text-sm text-gray-500">{item.description}</div>
                                        )}
                                    </td>
                                    <td className="py-3 px-4 text-center text-gray-600">{item.quantity}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">₹{item.unitPrice?.toLocaleString()}</td>
                                    <td className="py-3 px-4 text-right text-gray-600">
                                        {item.discount > 0 ? `₹${item.discount.toLocaleString()}` : '-'}
                                    </td>
                                    <td className="py-3 px-4 text-right font-medium text-gray-900">₹{item.total?.toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Totals */}
                <div className="flex justify-end mb-8">
                    <div className="w-72 space-y-2">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span>₹{(invoice.subtotal || 0).toLocaleString()}</span>
                        </div>
                        {invoice.discount > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Discount</span>
                                <span>- ₹{invoice.discount.toLocaleString()}</span>
                            </div>
                        )}
                        {invoice.taxRate > 0 && (
                            <div className="flex justify-between text-gray-600">
                                <span>Tax ({invoice.taxRate}%)</span>
                                <span>₹{(invoice.taxAmount || 0).toLocaleString()}</span>
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t">
                            <span>Total</span>
                            <span>₹{(invoice.total || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-green-600 font-medium">
                            <span>Amount Paid</span>
                            <span>- ₹{(invoice.amountPaid || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-red-600 pt-3 border-t">
                            <span>Amount Due</span>
                            <span>₹{(invoice.amountDue || 0).toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Terms */}
                {invoice.termsAndConditions && (
                    <div className="border-t pt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Terms & Conditions</h3>
                        <p className="text-gray-600 whitespace-pre-line text-sm">{invoice.termsAndConditions}</p>
                    </div>
                )}

                {/* Notes */}
                {invoice.notes && (
                    <div className="border-t pt-6 mt-6">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h3>
                        <p className="text-gray-600 text-sm">{invoice.notes}</p>
                    </div>
                )}

                {/* Footer */}
                <div className="border-t pt-6 mt-8 text-center text-sm text-gray-500">
                    <p>Thank you for your business!</p>
                </div>
            </Card>

            {/* Payment Modal */}
            {showPaymentModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
                    <Card className="w-full max-w-md p-6 relative">
                        <button
                            onClick={() => setShowPaymentModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard className="text-green-600" size={24} />
                            Record Payment
                        </h2>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500">Amount Due</span>
                                    <span className="font-bold text-red-600">₹{(invoice.amountDue || 0).toLocaleString()}</span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Payment Amount (₹)
                                </label>
                                <input
                                    type="number"
                                    value={paymentAmount}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    placeholder={invoice.amountDue?.toString()}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-lg"
                                    autoFocus
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowPaymentModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleRecordPayment}
                                    disabled={updating}
                                    className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                    {updating ? 'Recording...' : 'Record Payment'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
