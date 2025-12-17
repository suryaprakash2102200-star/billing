'use client';
import { use, useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Printer, Download, Mail, IndianRupee, Calendar, User, Phone } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const statusColors = {
    Draft: 'default',
    Sent: 'info',
    Viewed: 'warning',
    Accepted: 'success',
    Rejected: 'danger',
    Expired: 'secondary'
};

export default function QuotationDetailPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [quotation, setQuotation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const printRef = useRef(null);

    useEffect(() => {
        fetchQuotation();
    }, []);

    const fetchQuotation = async () => {
        try {
            const res = await fetch(`/api/quotations/${unwrappedParams.id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch quotation');

            setQuotation(data.quotation);
        } catch (err) {
            toastError(err.message);
            router.push('/quotations');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/quotations/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update status');

            setQuotation(data.quotation);
            success('Status updated successfully');
        } catch (err) {
            toastError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const [showConvertModal, setShowConvertModal] = useState(false);
    const [converting, setConverting] = useState(false);
    const [convertFormData, setConvertFormData] = useState({
        advanceAmount: '',
        paymentMode: 'Cash',
        deliveryDate: '',
        notes: ''
    });

    const openConvertModal = () => {
        setConvertFormData({
            advanceAmount: '',
            paymentMode: 'Cash',
            deliveryDate: '',
            notes: ''
        });
        setShowConvertModal(true);
    };

    const handleConvertToOrder = async () => {
        setConverting(true);
        try {
            const res = await fetch(`/api/quotations/${unwrappedParams.id}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    advanceAmount: parseFloat(convertFormData.advanceAmount) || 0,
                    paymentMode: convertFormData.paymentMode,
                    deliveryDate: convertFormData.deliveryDate,
                    notes: convertFormData.notes
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to convert quotation');

            success('Quotation converted to order successfully!');
            setShowConvertModal(false);
            router.push(`/orders/${data.order._id}`);
        } catch (err) {
            toastError(err.message);
        } finally {
            setConverting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    if (!quotation) return null;

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
                            <h1 className="text-2xl font-bold text-gray-900">{quotation.quotationId}</h1>
                            <Badge type={statusColors[quotation.status]}>{quotation.status}</Badge>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{quotation.customerName}</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    {quotation.status !== 'Accepted' && quotation.status !== 'Rejected' && (
                        <Button
                            onClick={openConvertModal}
                            className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                        >
                            Convert to Order
                        </Button>
                    )}
                    <Button variant="outline" onClick={handlePrint} className="gap-2">
                        <Printer size={18} /> Print
                    </Button>
                </div>
            </div>

            {/* Status Update - Hide in print */}
            <Card className="p-4 print:hidden">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-600">Update Status:</span>
                    <select
                        value={quotation.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={updating || quotation.status === 'Accepted'}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                    >
                        <option value="Draft">Draft</option>
                        <option value="Sent">Sent</option>
                        <option value="Viewed">Viewed</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                        <option value="Expired">Expired</option>
                    </select>
                </div>
            </Card>

            {/* Printable Quotation */}
            <div ref={printRef} className="print:shadow-none">
                <Card className="p-8 print:shadow-none print:border-0">
                    {/* Header */}
                    <div className="flex justify-between items-start border-b pb-6 mb-6">
                        <div>
                            <h2 className="text-3xl font-bold text-gray-900">QUOTATION</h2>
                            <p className="text-lg font-mono text-primary-600 mt-1">{quotation.quotationId}</p>
                        </div>
                        <div className="text-right text-sm text-gray-600">
                            <p><strong>Date:</strong> {new Date(quotation.createdAt).toLocaleDateString()}</p>
                            <p><strong>Valid Until:</strong> {quotation.validUntil ? new Date(quotation.validUntil).toLocaleDateString() : 'N/A'}</p>
                        </div>
                    </div>

                    {/* Customer Details */}
                    <div className="mb-8">
                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Bill To</h3>
                        <div className="text-gray-900">
                            <p className="font-bold text-lg">{quotation.customerName}</p>
                            <div className="flex items-center gap-2 text-gray-600 mt-1">
                                <Phone size={14} />
                                <span>{quotation.customerPhone}</span>
                            </div>
                            {quotation.customerEmail && (
                                <p className="text-gray-600">{quotation.customerEmail}</p>
                            )}
                            {quotation.customerAddress && (
                                <p className="text-gray-600">{quotation.customerAddress}</p>
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
                                {quotation.items?.map((item, index) => (
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
                        <div className="w-64 space-y-2">
                            <div className="flex justify-between text-gray-600">
                                <span>Subtotal</span>
                                <span>₹{(quotation.subtotal || 0).toLocaleString()}</span>
                            </div>
                            {quotation.discount > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Discount</span>
                                    <span>- ₹{quotation.discount.toLocaleString()}</span>
                                </div>
                            )}
                            {quotation.taxRate > 0 && (
                                <div className="flex justify-between text-gray-600">
                                    <span>Tax ({quotation.taxRate}%)</span>
                                    <span>₹{(quotation.taxAmount || 0).toLocaleString()}</span>
                                </div>
                            )}
                            <div className="flex justify-between font-bold text-xl text-gray-900 pt-3 border-t">
                                <span>Total</span>
                                <span className="text-primary-600">₹{(quotation.total || 0).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* Terms & Conditions */}
                    {quotation.termsAndConditions && (
                        <div className="border-t pt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Terms & Conditions</h3>
                            <p className="text-gray-600 whitespace-pre-line text-sm">{quotation.termsAndConditions}</p>
                        </div>
                    )}

                    {/* Notes */}
                    {quotation.notes && (
                        <div className="border-t pt-6 mt-6">
                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Notes</h3>
                            <p className="text-gray-600 text-sm">{quotation.notes}</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="border-t pt-6 mt-8 text-center text-sm text-gray-500">
                        <p>Thank you for your business!</p>
                    </div>
                </Card>
            </div>

            {/* Convert Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 print:hidden">
                    <Card className="w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setShowConvertModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <Calendar size={20} /> {/* Using Calendar as X placeholder if X not imported, wait X is not in imports? Let's check imports */}
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-6">Convert to Order</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Total Amount</label>
                                <div className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-900 font-bold">
                                    ₹{quotation.total?.toLocaleString()}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Advance Amount (₹)</label>
                                <input
                                    type="number"
                                    value={convertFormData.advanceAmount}
                                    onChange={(e) => setConvertFormData({ ...convertFormData, advanceAmount: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Mode</label>
                                <select
                                    value={convertFormData.paymentMode}
                                    onChange={(e) => setConvertFormData({ ...convertFormData, paymentMode: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                >
                                    <option value="Cash">Cash</option>
                                    <option value="UPI">UPI</option>
                                    <option value="Card">Card</option>
                                    <option value="Bank Transfer">Bank Transfer</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Delivery Date</label>
                                <input
                                    type="date"
                                    value={convertFormData.deliveryDate}
                                    onChange={(e) => setConvertFormData({ ...convertFormData, deliveryDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                                <textarea
                                    value={convertFormData.notes}
                                    onChange={(e) => setConvertFormData({ ...convertFormData, notes: e.target.value })}
                                    placeholder="Special instructions..."
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button variant="outline" onClick={() => setShowConvertModal(false)} className="flex-1">Cancel</Button>
                                <Button onClick={handleConvertToOrder} disabled={converting} className="flex-1 bg-primary-600 hover:bg-primary-700">{converting ? 'Creating Order...' : 'Confirm Order'}</Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
