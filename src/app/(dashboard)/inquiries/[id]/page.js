'use client';
import { use, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Phone, Mail, Calendar, User, Package, Clock, MessageSquare, FileText, Send, X, CreditCard } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const statusColors = {
    New: 'info',
    'Follow-up': 'warning',
    Quoted: 'default',
    Negotiation: 'secondary',
    Converted: 'success',
    Closed: 'danger'
};

export default function InquiryDetailPage({ params }) {
    const unwrappedParams = use(params);
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [inquiry, setInquiry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [newNote, setNewNote] = useState('');
    const [showConvertModal, setShowConvertModal] = useState(false);
    const [converting, setConverting] = useState(false);
    const [convertFormData, setConvertFormData] = useState({
        totalAmount: '',
        advanceAmount: '',
        paymentMode: 'Cash',
        deliveryDate: '',
        notes: ''
    });

    useEffect(() => {
        fetchInquiry();
    }, []);

    const fetchInquiry = async () => {
        try {
            const res = await fetch(`/api/inquiries/${unwrappedParams.id}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch inquiry');

            setInquiry(data.inquiry);
        } catch (err) {
            toastError(err.message);
            router.push('/inquiries');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (newStatus) => {
        setUpdating(true);
        try {
            const res = await fetch(`/api/inquiries/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to update status');

            setInquiry(data.inquiry);
            success('Status updated successfully');
        } catch (err) {
            toastError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const handleAddNote = async () => {
        if (!newNote.trim()) return;

        setUpdating(true);
        try {
            const res = await fetch(`/api/inquiries/${unwrappedParams.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ note: newNote })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to add note');

            setInquiry(data.inquiry);
            setNewNote('');
            success('Note added successfully');
        } catch (err) {
            toastError(err.message);
        } finally {
            setUpdating(false);
        }
    };

    const openConvertModal = () => {
        setConvertFormData({
            totalAmount: inquiry.estimatedValue || '',
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
            const res = await fetch(`/api/inquiries/${unwrappedParams.id}/convert`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    totalAmount: parseFloat(convertFormData.totalAmount) || 0,
                    advanceAmount: parseFloat(convertFormData.advanceAmount) || 0,
                    paymentMode: convertFormData.paymentMode,
                    deliveryDate: convertFormData.deliveryDate,
                    notes: convertFormData.notes
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to convert inquiry');

            success('Inquiry converted to order successfully!');
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

    if (!inquiry) return null;

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
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-bold text-gray-900">{inquiry.inquiryId}</h1>
                            <Badge type={statusColors[inquiry.status]}>{inquiry.status}</Badge>
                        </div>
                        <p className="text-gray-500 text-sm mt-1">{inquiry.customerName}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Customer Info */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <User size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Name</div>
                                    <div className="font-medium text-gray-900">{inquiry.customerName}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                    <Phone size={18} className="text-gray-600" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Phone</div>
                                    <div className="font-medium text-gray-900">{inquiry.customerPhone}</div>
                                </div>
                            </div>
                            {inquiry.customerEmail && (
                                <div className="flex items-center gap-3 md:col-span-2">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Mail size={18} className="text-gray-600" />
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Email</div>
                                        <div className="font-medium text-gray-900">{inquiry.customerEmail}</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </Card>

                    {/* Product Details */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Package className="text-orange-500" size={20} /> Product/Service Details
                        </h2>
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm text-gray-500">Product/Service</div>
                                <div className="font-medium text-gray-900 text-lg">{inquiry.product}</div>
                            </div>
                            {inquiry.customRequirement && (
                                <div>
                                    <div className="text-sm text-gray-500">Custom Requirements</div>
                                    <div className="text-gray-700">{inquiry.customRequirement}</div>
                                </div>
                            )}
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                                <div>
                                    <div className="text-sm text-gray-500">Quantity</div>
                                    <div className="font-bold text-2xl text-gray-900">{inquiry.quantity}</div>
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500">Estimated Value</div>
                                    <div className="font-bold text-2xl text-primary-600">
                                        ₹{(inquiry.estimatedValue || 0).toLocaleString()}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Notes */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MessageSquare className="text-blue-500" size={20} /> Notes
                        </h2>

                        {/* Add Note Form */}
                        <div className="flex gap-2 mb-4">
                            <input
                                type="text"
                                value={newNote}
                                onChange={(e) => setNewNote(e.target.value)}
                                placeholder="Add a note..."
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                            />
                            <Button
                                onClick={handleAddNote}
                                disabled={updating || !newNote.trim()}
                                className="bg-primary-600 hover:bg-primary-700"
                            >
                                <Send size={18} />
                            </Button>
                        </div>

                        {/* Notes List */}
                        <div className="space-y-3">
                            {inquiry.notes && inquiry.notes.length > 0 ? (
                                inquiry.notes.slice().reverse().map((note, index) => (
                                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                                        <p className="text-gray-700">{note.text}</p>
                                        <div className="text-xs text-gray-400 mt-2">
                                            {note.createdBy?.name || 'Unknown'} • {new Date(note.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-gray-400 text-sm">No notes yet</p>
                            )}
                        </div>
                    </Card>

                    {/* Timeline */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <Clock className="text-green-500" size={20} /> Activity Timeline
                        </h2>
                        <div className="space-y-4">
                            {inquiry.timeline && inquiry.timeline.length > 0 ? (
                                inquiry.timeline.slice().reverse().map((entry, index) => (
                                    <div key={index} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                                <Clock size={14} className="text-primary-600" />
                                            </div>
                                            {index < inquiry.timeline.length - 1 && (
                                                <div className="w-0.5 h-full bg-gray-200 mt-2" />
                                            )}
                                        </div>
                                        <div className="flex-1 pb-6">
                                            <div className="font-medium text-gray-900">{entry.action}</div>
                                            {entry.description && (
                                                <div className="text-sm text-gray-600 mt-1">{entry.description}</div>
                                            )}
                                            <div className="text-xs text-gray-400 mt-2">
                                                {entry.user?.name || 'System'} • {new Date(entry.timestamp).toLocaleString()}
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
                            value={inquiry.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating || inquiry.status === 'Converted'}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                        >
                            <option value="New">New</option>
                            <option value="Follow-up">Follow-up</option>
                            <option value="Quoted">Quoted</option>
                            <option value="Negotiation">Negotiation</option>
                            <option value="Converted">Converted</option>
                            <option value="Closed">Closed</option>
                        </select>
                    </Card>

                    {/* Quick Actions */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h2>
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full justify-start gap-2"
                                disabled={inquiry.status === 'Converted'}
                            >
                                <FileText size={18} /> Generate Quotation
                            </Button>
                            <Button
                                onClick={openConvertModal}
                                className="w-full justify-start gap-2 bg-primary-600 hover:bg-primary-700 text-white"
                                disabled={inquiry.status === 'Converted'}
                            >
                                <Package size={18} /> Convert to Order
                            </Button>
                        </div>
                    </Card>

                    {/* Lead Info */}
                    {inquiry.lead && (
                        <Card className="p-6">
                            <h2 className="text-lg font-bold text-gray-900 mb-4">Original Lead</h2>
                            <div className="text-sm">
                                <p className="text-gray-500">Source</p>
                                <p className="font-medium text-gray-900 mb-2">{inquiry.lead.source}</p>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => router.push(`/leads/${inquiry.lead._id}`)}
                                    className="w-full mt-2"
                                >
                                    View Lead
                                </Button>
                            </div>
                        </Card>
                    )}

                    {/* Meta Info */}
                    <Card className="p-6">
                        <h2 className="text-lg font-bold text-gray-900 mb-4">Details</h2>
                        <div className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Created</span>
                                <span className="text-gray-900">{new Date(inquiry.createdAt).toLocaleDateString()}</span>
                            </div>
                            {inquiry.createdBy && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Created By</span>
                                    <span className="text-gray-900">{inquiry.createdBy.name}</span>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>

            {/* Convert to Order Modal */}
            {showConvertModal && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <Card className="w-full max-w-lg p-6 relative">
                        <button
                            onClick={() => setShowConvertModal(false)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                        >
                            <X size={20} />
                        </button>

                        <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <CreditCard className="text-primary-600" size={24} />
                            Convert to Order
                        </h2>

                        <div className="space-y-4">
                            <div className="p-3 bg-gray-50 rounded-lg">
                                <p className="text-sm text-gray-500">Customer</p>
                                <p className="font-medium text-gray-900">{inquiry.customerName} • {inquiry.customerPhone}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Total Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={convertFormData.totalAmount}
                                        onChange={(e) => setConvertFormData({ ...convertFormData, totalAmount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="5000"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Advance Amount (₹)
                                    </label>
                                    <input
                                        type="number"
                                        value={convertFormData.advanceAmount}
                                        onChange={(e) => setConvertFormData({ ...convertFormData, advanceAmount: e.target.value })}
                                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        placeholder="2000"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Payment Mode
                                </label>
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
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Delivery Date
                                </label>
                                <input
                                    type="date"
                                    value={convertFormData.deliveryDate}
                                    onChange={(e) => setConvertFormData({ ...convertFormData, deliveryDate: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Notes (Optional)
                                </label>
                                <textarea
                                    value={convertFormData.notes}
                                    onChange={(e) => setConvertFormData({ ...convertFormData, notes: e.target.value })}
                                    placeholder="Any special instructions..."
                                    rows={2}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <Button
                                    variant="outline"
                                    onClick={() => setShowConvertModal(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handleConvertToOrder}
                                    disabled={converting}
                                    className="flex-1 bg-primary-600 hover:bg-primary-700"
                                >
                                    {converting ? 'Converting...' : 'Create Order'}
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}
        </div>
    );
}
