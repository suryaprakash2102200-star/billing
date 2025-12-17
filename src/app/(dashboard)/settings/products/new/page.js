'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { ArrowLeft, Plus, Trash2, Package } from 'lucide-react';

export default function NewProductPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [loading, setLoading] = useState(false);

    // Common categories for datalist
    const commonCategories = ['Printing', 'Signage', 'Branding', 'Installation', 'Design', 'Material'];

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        basePrice: '',
        unit: 'piece',
        hasVariants: false,
        variants: [{ name: '', size: '', price: '' }],
        customizable: true,
        sku: '',
        isActive: true
    });

    const addVariant = () => {
        setFormData({
            ...formData,
            variants: [...formData.variants, { name: '', size: '', price: '' }]
        });
    };

    const removeVariant = (index) => {
        setFormData({
            ...formData,
            variants: formData.variants.filter((_, i) => i !== index)
        });
    };

    const updateVariant = (index, field, value) => {
        const newVariants = [...formData.variants];
        newVariants[index] = { ...newVariants[index], [field]: value };
        setFormData({ ...formData, variants: newVariants });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                ...formData,
                basePrice: parseFloat(formData.basePrice) || 0,
                variants: formData.hasVariants
                    ? formData.variants.map(v => ({ ...v, price: parseFloat(v.price) || 0 }))
                    : []
            };

            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to create product');
            }

            success('Product created successfully');
            router.push('/settings/products');
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Button
                    variant="outline"
                    onClick={() => router.back()}
                    className="!p-2"
                >
                    <ArrowLeft size={20} />
                </Button>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Add New Product</h1>
                    <p className="text-gray-500 text-sm mt-1">Create a new product or service template</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <Card className="p-6">
                    <div className="space-y-4">
                        <Input
                            label="Product Name"
                            placeholder="e.g. Vinyl Banner Printing"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <input
                                list="categories"
                                type="text"
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                placeholder="Select or type category"
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                            />
                            <datalist id="categories">
                                {commonCategories.map(cat => <option key={cat} value={cat} />)}
                            </datalist>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                            <textarea
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                                rows={3}
                                placeholder="Product details, specifications..."
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Base Price (₹)"
                                type="number"
                                min="0"
                                value={formData.basePrice}
                                onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
                                required
                            />
                            <Input
                                label="Unit"
                                placeholder="piece, sqft, etc."
                                value={formData.unit}
                                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                            />
                        </div>

                        <Input
                            label="SKU (Optional)"
                            placeholder="PROD-001"
                            value={formData.sku}
                            onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        />

                        <div className="flex items-center gap-4 pt-2">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Active</span>
                            </label>

                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={formData.customizable}
                                    onChange={(e) => setFormData({ ...formData, customizable: e.target.checked })}
                                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                                />
                                <span className="text-sm font-medium text-gray-700">Allow Customization</span>
                            </label>
                        </div>
                    </div>
                </Card>

                {/* Variants Section */}
                <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="hasVariants"
                                checked={formData.hasVariants}
                                onChange={(e) => setFormData({ ...formData, hasVariants: e.target.checked })}
                                className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                            />
                            <label htmlFor="hasVariants" className="text-lg font-bold text-gray-900 cursor-pointer">
                                Enable Variants
                            </label>
                        </div>
                        {formData.hasVariants && (
                            <Button type="button" variant="outline" size="sm" onClick={addVariant} className="gap-2">
                                <Plus size={16} /> Add Variant
                            </Button>
                        )}
                    </div>

                    {formData.hasVariants && (
                        <div className="space-y-4">
                            {formData.variants.map((variant, index) => (
                                <div key={index} className="flex gap-4 items-start bg-gray-50 p-4 rounded-lg">
                                    <div className="flex-1 space-y-4 md:space-y-0 md:flex md:gap-4">
                                        <input
                                            type="text"
                                            placeholder="Variant Name (e.g. Small)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            value={variant.name}
                                            onChange={(e) => updateVariant(index, 'name', e.target.value)}
                                        />
                                        <input
                                            type="text"
                                            placeholder="Size (e.g. 12x18)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            value={variant.size}
                                            onChange={(e) => updateVariant(index, 'size', e.target.value)}
                                        />
                                        <input
                                            type="number"
                                            placeholder="Price (₹)"
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm"
                                            value={variant.price}
                                            onChange={(e) => updateVariant(index, 'price', e.target.value)}
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeVariant(index)}
                                        className="text-red-500 hover:text-red-700 p-2"
                                        disabled={formData.variants.length === 1}
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>

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
                        {loading ? 'Creating...' : 'Create Product'}
                    </Button>
                </div>
            </form>
        </div>
    );
}
