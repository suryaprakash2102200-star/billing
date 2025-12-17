'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { useToast } from '@/context/ToastContext';

export default function NewCustomerPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', instagramId: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/customers', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                success('Customer created');
                router.push('/customers');
                router.refresh();
            } else {
                const d = await res.json();
                toastError(d.error);
            }
        } catch {
            toastError('Failed to create');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Add New Customer</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    <Input label="Instagram ID" value={formData.instagramId} onChange={e => setFormData({ ...formData, instagramId: e.target.value })} />
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : 'Save Customer'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
