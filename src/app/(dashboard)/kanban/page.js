'use client';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useToast } from '@/context/ToastContext';
import Modal from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import {
    Loader2, Settings, Plus, Search, Filter, MoreHorizontal,
    Calendar, User, Box, ArrowRight, MessageSquare, CheckCircle2, AlertCircle
} from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function KanbanPage() {
    const { success, error: toastError } = useToast();
    const [stages, setStages] = useState([]);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [draggedOrderId, setDraggedOrderId] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [stagesRes, ordersRes] = await Promise.all([
                fetch('/api/stages'),
                fetch('/api/orders')
            ]);
            const stagesData = await stagesRes.json();
            const ordersData = await ordersRes.json();

            setStages(stagesData.stages || []);
            setOrders(ordersData.orders || []);
        } catch (err) {
            console.error('Failed to fetch data:', err);
            toastError('Failed to load board data');
        } finally {
            setLoading(false);
        }
    };

    const handleDragStart = (e, orderId) => {
        setDraggedOrderId(orderId);
        e.dataTransfer.setData('text/plain', orderId);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';

        // Auto-scroll logic
        const container = e.currentTarget.closest('.kanban-container');
        if (container) {
            const buffer = 50; // Distance from edge to trigger scroll
            const scrollSpeed = 10;
            const rect = container.getBoundingClientRect();

            if (e.clientX < rect.left + buffer) {
                container.scrollLeft -= scrollSpeed;
            } else if (e.clientX > rect.right - buffer) {
                container.scrollLeft += scrollSpeed;
            }
        }
    };

    const handleDrop = async (e, stageName) => {
        e.preventDefault();
        const orderId = draggedOrderId;
        if (!orderId) return;

        const updatedOrders = orders.map(o =>
            o._id === orderId ? { ...o, status: stageName } : o
        );
        setOrders(updatedOrders);
        setDraggedOrderId(null);

        try {
            await fetch(`/api/orders/${orderId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: stageName })
            });
            success(`Moved to ${stageName}`);
        } catch (err) {
            console.error('Failed to update order status:', err);
            toastError('Failed to move order');
            fetchData();
        }
    };

    const filteredOrders = useMemo(() => {
        return orders.filter(o =>
            o.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o._id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            o.productType.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [orders, searchQuery]);

    // ...
    if (loading) return <LoadingSpinner />;

    return (
        <div className="h-[calc(100vh-100px)] flex flex-col p-6 bg-gray-50/50 ">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Kanban Board</h1>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all shadow-sm"
                        />
                    </div>

                    <button className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 shadow-sm transition-colors">
                        <Filter size={16} /> Filter
                    </button>

                    <Link href="/orders/new">
                        <button className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 shadow-md shadow-primary-200 transition-all">
                            <Plus size={16} /> New Order
                        </button>
                    </Link>

                    <Link href="/settings/stages" className="p-2 text-gray-400 hover:text-primary-600 transition-colors" title="Configure Stages">
                        <Settings size={20} />
                    </Link>
                </div>
            </div>

            {/* Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden pb-4 kanban-container scroll-smooth">
                <div className="flex h-full gap-6 min-w-max px-2">
                    {stages.map(stage => {
                        // Extract color intent from saved classes or default to primary
                        const baseColor = stage.color?.includes('blue') ? 'blue' :
                            stage.color?.includes('yellow') ? 'yellow' :
                                stage.color?.includes('green') ? 'green' :
                                    stage.color?.includes('primary') ? 'primary' : 'gray';

                        return (
                            <div
                                key={stage._id}
                                className="w-[85vw] md:w-[300px] flex flex-col h-full bg-gray-50/80 rounded-2xl p-2 border border-transparent hover:border-gray-200 transition-colors shrink-0"
                                onDragOver={handleDragOver}
                                onDrop={(e) => handleDrop(e, stage.name)}
                            >
                                {/* Column Header */}
                                <div className="flex items-center justify-between mb-3 px-2 pt-2">
                                    <div className="flex items-center gap-3">
                                        <h3 className="font-bold text-gray-700">{stage.name}</h3>
                                        <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold bg-${baseColor}-100 text-${baseColor}-700`}>
                                            {filteredOrders.filter(o => o.status === stage.name).length}
                                        </span>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreHorizontal size={16} />
                                    </button>
                                </div>

                                {/* Droppable Area */}
                                <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
                                    {/* Top Color Bar for Column */}
                                    <div className={`h-1 w-full rounded-full bg-${baseColor}-500/50 mb-2 opacity-50`} />

                                    {filteredOrders
                                        .filter(o => o.status === stage.name)
                                        .map(order => (
                                            <div
                                                key={order._id}
                                                draggable
                                                onDragStart={(e) => handleDragStart(e, order._id)}
                                                onClick={() => setSelectedOrder(order)}
                                                className={`
                                                    bg-white p-4 rounded-xl shadow-sm border-y border-r border-gray-100 border-l-4 cursor-pointer 
                                                    hover:shadow-md hover:border-r-primary-200 transition-all group relative 
                                                    animate-in fade-in zoom-in-95 duration-200
                                                    ${draggedOrderId === order._id ? 'opacity-50 scale-95 ring-2 ring-primary-400 ring-offset-2' : ''}
                                                    ${baseColor === 'blue' ? 'border-l-blue-500' :
                                                        baseColor === 'yellow' ? 'border-l-yellow-500' :
                                                            baseColor === 'green' ? 'border-l-green-500' :
                                                                baseColor === 'primary' ? 'border-l-primary-500' : 'border-l-gray-300'}
                                                `}
                                            >
                                                {/* Card Header */}
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-[10px] font-mono font-medium text-gray-400">
                                                        #{order._id.slice(-4)}
                                                    </span>
                                                    <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                                                        <Calendar size={10} />
                                                        <span>{new Date(order.orderDate).toLocaleDateString()}</span>
                                                    </div>
                                                </div>

                                                {/* Card Content */}
                                                <h4 className="font-bold text-gray-900 mb-1 leading-tight">{order.customerName}</h4>
                                                <p className="text-xs text-gray-500 mb-3">{order.productType}</p>

                                                <div className="flex items-center gap-2 mb-3">
                                                    <Badge type="default" className="text-[10px] px-2 py-0.5 font-medium bg-gray-50 text-gray-600 border-gray-200">{order.size}</Badge>
                                                    {order.paymentStatus === 'Paid' && (
                                                        <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded border border-green-100">Paid</span>
                                                    )}
                                                    {order.paymentStatus === 'Pending' && (
                                                        <span className="text-[10px] font-bold text-yellow-600 bg-yellow-50 px-2 py-0.5 rounded border border-yellow-100">Pending</span>
                                                    )}
                                                    {order.paymentStatus === 'Partial' && (
                                                        <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">Partial</span>
                                                    )}
                                                </div>

                                                {/* Card Footer */}
                                                <div className="flex items-center justify-between pt-2 border-t border-dashed border-gray-100 mt-2">
                                                    <div className={`w-2 h-2 rounded-full ${order.paymentStatus === 'Paid' ? 'bg-green-500' : 'bg-yellow-400'}`} />

                                                    {/* Overdue logic (mock based on random or date) - if deliveryDate exists and is past */}
                                                    {order.deliveryDate && new Date(order.deliveryDate) < new Date() && order.status !== 'Delivered' && (
                                                        <span className="flex items-center gap-1 text-[10px] text-red-600 font-bold">
                                                            <AlertCircle size={10} /> Overdue
                                                        </span>
                                                    )}

                                                    {order.status === 'Ready' && (
                                                        <CheckCircle2 size={16} className="text-green-500" />
                                                    )}
                                                </div>
                                            </div>
                                        ))}

                                    {/* Add Card Footer */}
                                    <Link href="/orders/new">
                                        <button className="w-full py-2.5 flex items-center justify-center gap-2 text-gray-500 bg-white hover:bg-primary-50 hover:text-primary-700 rounded-xl text-sm font-medium border border-gray-100 hover:border-primary-200 shadow-sm transition-all mt-2 group">
                                            <div className="bg-gray-100 group-hover:bg-primary-200 rounded-full p-0.5 transition-colors">
                                                <Plus size={12} />
                                            </div>
                                            Add Card
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        );
                    })}

                    {/* Add New Column Placeholder */}
                    <div className="w-[85vw] md:w-[300px] flex flex-col h-full pt-10 px-2 shrink-0">
                        <Link href="/settings/stages">
                            <button className="w-full h-32 flex flex-col items-center justify-center gap-3 text-gray-400 hover:text-purple-600 bg-white/50 hover:bg-white rounded-2xl border-2 border-dashed border-gray-200 hover:border-purple-200 transition-all group">
                                <div className="w-10 h-10 rounded-full bg-gray-100 group-hover:bg-purple-100 flex items-center justify-center transition-colors">
                                    <Plus size={20} />
                                </div>
                                <span className="font-bold text-sm">Add New Column</span>
                            </button>
                        </Link>
                    </div>

                </div>
            </div>

            {/* Reuse existing Modal implementation... */}
            <Modal
                isOpen={!!selectedOrder}
                onClose={() => setSelectedOrder(null)}
                title={`Order #${selectedOrder?._id.slice(-6)}`}
            >
                {/* Same modal content as before, just ensuring it's included */}
                {selectedOrder && (
                    <div className="space-y-6">
                        {/* Status Bar */}
                        <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-100">
                            <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Current Stage</span>
                            <Badge type="info" className="text-sm px-3 py-1">{selectedOrder.status}</Badge>
                        </div>

                        {/* Customer Info */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <User size={14} className="text-blue-500" /> Customer
                            </h3>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                                    <span className="text-sm text-gray-500">Name</span>
                                    <span className="text-base font-bold text-gray-900">{selectedOrder.customerName}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-500">Phone</span>
                                    <a href={`tel:${selectedOrder.phone}`} className="text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline bg-blue-50 px-2 py-1 rounded-md transition-colors">
                                        {selectedOrder.phone}
                                    </a>
                                </div>
                            </div>
                        </div>

                        {/* Product Info */}
                        <div>
                            <h3 className="text-xs font-bold text-gray-900 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <Box size={14} className="text-purple-500" /> Product Details
                            </h3>
                            <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Type</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedOrder.productType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Size</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedOrder.size}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Quantity</p>
                                        <p className="text-sm font-medium text-gray-900">{selectedOrder.quantity}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 mb-1">Date</p>
                                        <p className="text-sm font-medium text-gray-900">{new Date(selectedOrder.orderDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                {selectedOrder.notes && (
                                    <div className="mt-3 pt-3 border-t border-gray-50">
                                        <p className="text-xs text-gray-500 mb-1">Notes</p>
                                        <p className="text-sm italic text-gray-700 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
                                            "{selectedOrder.notes}"
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Payment Status in Modal */}
                        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 flex justify-between items-center">
                            <span className="font-bold text-sm text-gray-600">Payment Status</span>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${selectedOrder.paymentStatus === 'Paid' ? 'bg-green-100 text-green-700' :
                                selectedOrder.paymentStatus === 'Partial' ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700'
                                }`}>
                                {selectedOrder.paymentStatus}
                            </span>
                        </div>

                        <div className="flex gap-3 pt-2">
                            <Link href={`/orders/${selectedOrder._id}`} className="flex-1">
                                <button className="w-full py-2.5 bg-gray-900 text-white rounded-xl text-sm font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2 shadow-lg shadow-gray-200">
                                    Full Details <ArrowRight size={16} />
                                </button>
                            </Link>
                            <a href={`https://wa.me/${selectedOrder.phone}`} target="_blank" rel="noreferrer" className="flex-1">
                                <button className="w-full py-2.5 border border-green-200 bg-green-50 text-green-700 rounded-xl text-sm font-medium hover:bg-green-100 transition-all flex items-center justify-center gap-2">
                                    <MessageSquare size={16} /> WhatsApp
                                </button>
                            </a>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
