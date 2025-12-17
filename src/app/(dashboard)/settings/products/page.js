'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/context/ToastContext';
import { Package, Plus, Search, IndianRupee, Pencil, Trash2 } from 'lucide-react';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function ProductsPage() {
    const router = useRouter();
    const { success, error: toastError } = useToast();
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchProducts();
    }, [search]);

    const fetchProducts = async () => {
        try {
            const params = new URLSearchParams();
            if (search) params.append('search', search);

            const res = await fetch(`/api/products?${params}`);
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || 'Failed to fetch products');

            setProducts(data.products || []);
        } catch (err) {
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, e) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete product');

            setProducts(products.filter(p => p._id !== id));
            success('Product deleted successfully');
        } catch (err) {
            toastError(err.message);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <LoadingSpinner />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Product Master</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your products and services</p>
                </div>
                <Button
                    onClick={() => router.push('/settings/products/new')}
                    className="bg-primary-600 hover:bg-primary-700 text-white gap-2"
                >
                    <Plus size={18} /> Add Product
                </Button>
            </div>

            {/* Filters */}
            <Card className="p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        type="text"
                        placeholder="Search products by name or category..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </Card>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-12 text-center bg-gray-50 rounded-xl border border-dashed border-gray-300">
                        <Package className="mx-auto text-gray-300 mb-4" size={48} />
                        <p className="text-gray-500 font-medium">No products found</p>
                        <p className="text-gray-400 text-sm mt-1">Get started by creating a new product template</p>
                    </div>
                ) : (
                    products.map((product) => (
                        <Card
                            key={product._id}
                            className="group hover:shadow-md transition-all duration-200 cursor-pointer"
                            onClick={() => router.push(`/settings/products/${product._id}`)}
                        >
                            <div className="p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="bg-primary-50 p-2.5 rounded-lg text-primary-600">
                                        <Package size={24} />
                                    </div>
                                    <Badge type={product.isActive ? 'success' : 'secondary'}>
                                        {product.isActive ? 'Active' : 'Inactive'}
                                    </Badge>
                                </div>

                                <h3 className="font-bold text-gray-900 mb-1">{product.name}</h3>
                                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{product.description || 'No description provided'}</p>

                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex justify-between">
                                        <span>Category</span>
                                        <span className="font-medium text-gray-900">{product.category || '-'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Base Price</span>
                                        <span className="font-bold text-primary-600">₹{product.basePrice?.toLocaleString()}</span>
                                    </div>
                                    {product.hasVariants && (
                                        <div className="flex justify-between">
                                            <span>Variants</span>
                                            <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                                {product.variants?.length || 0} variants
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="mt-4 pt-4 border-t flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-gray-500 hover:text-red-600"
                                        onClick={(e) => handleDelete(product._id, e)}
                                    >
                                        <Trash2 size={16} />
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="gap-1"
                                        onClick={() => router.push(`/settings/products/${product._id}`)}
                                    >
                                        <Pencil size={14} /> Edit
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
