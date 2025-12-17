'use client';
import { useState, useEffect, useRef } from 'react';
import { useToast } from '@/context/ToastContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { GripVertical, Trash2, Plus, Save, ChevronUp, ChevronDown } from 'lucide-react';

export default function StageSettingsPage() {
    const { success, error: toastError } = useToast();
    const [stages, setStages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newStageName, setNewStageName] = useState('');

    useEffect(() => {
        fetch('/api/stages')
            .then(res => res.json())
            .then(data => {
                setStages(data.stages || []);
                setLoading(false);
            });
    }, []);

    const handleMove = (index, direction) => {
        const newStages = [...stages];
        if (direction === -1 && index > 0) {
            [newStages[index], newStages[index - 1]] = [newStages[index - 1], newStages[index]];
        } else if (direction === 1 && index < newStages.length - 1) {
            [newStages[index], newStages[index + 1]] = [newStages[index + 1], newStages[index]];
        }
        newStages.forEach((s, i) => s.order = i);
        setStages(newStages);
    };

    const handleSaveOrder = async () => {
        try {
            await fetch('/api/stages', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stages: stages.map(s => ({ _id: s._id, order: s.order })) })
            });
            success('Order saved successfully!');
        } catch (error) {
            console.error(error);
            toastError('Failed to save order');
        }
    };

    const handleAddStage = async () => {
        if (!newStageName.trim()) return;
        try {
            const res = await fetch('/api/stages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newStageName })
            });
            const data = await res.json();
            if (data.stage) {
                setStages([...stages, data.stage]);
                setNewStageName('');
                success('Stage added');
            }
        } catch (error) {
            toastError('Failed to add stage');
        }
    };

    const handleDelete = async (id) => {
        if (!confirm('Archive this stage? Orders might be hidden.')) return;
        try {
            await fetch(`/api/stages/${id}`, { method: 'DELETE' });
            setStages(stages.filter(s => s._id !== id));
            success('Stage archived');
        } catch (error) {
            toastError('Failed to delete');
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-8 mt-10">
            <div className="text-center">
                <h1 className="text-2xl font-bold text-gray-900">Manage Kanban Stages</h1>
                <p className="text-gray-500 mt-1">Manage the stages for your Kanban board. use arrows to reorder.</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-8">
                {/* Input Area */}
                <div className="flex gap-4 items-center">
                    <input
                        type="text"
                        placeholder="e.g. Quality Check"
                        value={newStageName}
                        onChange={(e) => setNewStageName(e.target.value)}
                        className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all"
                        onKeyDown={(e) => e.key === 'Enter' && handleAddStage()}
                    />
                    <Button onClick={handleAddStage} disabled={!newStageName} className="h-12 px-6 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-xl shadow-lg shadow-primary-200 transition-all whitespace-nowrap shrink-0 flex items-center justify-center">
                        <Plus size={20} className="mr-2" /> Add Stage
                    </Button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Current Stages Order</h2>
                <div className="space-y-3">
                    {stages.map((stage, index) => (
                        <div
                            key={stage._id}
                            className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-xl hover:shadow-md hover:border-primary-200 transition-all group select-none relative"
                        >
                            <div className="flex flex-col gap-1">
                                {index > 0 && (
                                    <button onClick={() => handleMove(index, -1)} className="p-1 text-gray-400 hover:text-primary-600 rounded bg-gray-50 hover:bg-primary-50">
                                        <ChevronUp size={16} />
                                    </button>
                                )}
                                {index < stages.length - 1 && (
                                    <button onClick={() => handleMove(index, 1)} className="p-1 text-gray-400 hover:text-primary-600 rounded bg-gray-50 hover:bg-primary-50">
                                        <ChevronDown size={16} />
                                    </button>
                                )}
                            </div>

                            <div className="bg-gray-50 p-3 rounded-lg text-gray-400">
                                <span className="font-mono font-bold">{index + 1}</span>
                            </div>

                            <div className="flex-1">
                                <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                                <p className="text-xs text-gray-500 mt-0.5">Order: {stage.order}</p>
                            </div>

                            {stage.isDefault && <span className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-full font-bold">Default</span>}

                            <Button variant="danger" className="!p-2 text-gray-400 hover:text-red-600" onClick={() => handleDelete(stage._id)}>
                                <Trash2 size={18} />
                            </Button>
                        </div>
                    ))}
                </div>

                {stages.length > 0 && (
                    <div className="flex justify-end pt-4">
                        <Button onClick={handleSaveOrder} className="bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg shadow-primary-200">
                            Save New Order
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}
