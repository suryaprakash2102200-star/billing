'use client';
'use client';
import { useEffect, useState, use } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { useToast } from '@/context/ToastContext';

export default function EditCustomerPage({ params }) {
    const router = useRouter();
    const { id } = use(params);
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({ name: '', phone: '', instagramId: '' });

    useEffect(() => {
        fetch(`/api/customers/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.customer) setFormData(data.customer);
                setLoading(false);
            });
    }, [id]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch(`/api/customers/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                success('Customer updated');
                router.push('/customers');
                router.refresh();
            } else {
                toastError('Failed to update');
            }
        } catch {
            toastError('Error updating');
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div>Loading...</div>;

    return (
        <div className="max-w-xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold">Edit Customer</h1>
            <Card>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input label="Name" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                    <Input label="Phone" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                    <Input label="Instagram ID" value={formData.instagramId} onChange={e => setFormData({ ...formData, instagramId: e.target.value })} />
                    <div className="flex gap-4 pt-4">
                        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancel</Button>
                        <Button type="submit" disabled={saving}>{saving ? 'Updating...' : 'Update Customer'}</Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
