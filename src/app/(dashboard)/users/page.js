'use client';
import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { useToast } from '@/context/ToastContext';
import { Trash2, UserPlus, Filter, ShieldCheck, Shield, X, Mail, User } from 'lucide-react';
import Modal from '@/components/ui/Modal'; // Assuming generic Modal exists, or we create a simple one here

export default function UsersPage() {
    const { success, error: toastError } = useToast();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);

    // Form State
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'staff' });
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = () => {
        fetch('/api/users')
            .then(async res => {
                if (res.status === 403) throw new Error('Authorized for Admins only');
                return res.json();
            })
            .then(data => {
                setUsers(data.users || []);
                setLoading(false);
            })
            .catch(err => {
                toastError(err.message);
                setLoading(false);
            });
    };

    const handleAddUser = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        try {
            // Reusing the signup API or creating a new POST endpoint in users
            // Let's use /api/auth/signup logic or similar, but /api/users is better for admin creation
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to create user');

            setUsers([...users, data.user]);
            success('User created successfully');
            setIsAddModalOpen(false);
            setFormData({ name: '', email: '', password: '', role: 'staff' });
        } catch (err) {
            toastError(err.message);
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;

        try {
            const res = await fetch(`/api/users/${userId}`, { method: 'DELETE' });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to delete');
            }

            setUsers(users.filter(u => u._id !== userId));
            success('User deleted');
        } catch (err) {
            toastError(err.message);
        }
    };

    const toggleRole = async (user) => {
        const newRole = user.role === 'admin' ? 'staff' : 'admin';
        try {
            const res = await fetch('/api/users', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user._id, role: newRole })
            });

            if (res.ok) {
                setUsers(users.map(u => u._id === user._id ? { ...u, role: newRole } : u));
                success(`Role updated to ${newRole}`);
            } else {
                const d = await res.json();
                toastError(d.error);
            }
        } catch (e) {
            toastError('Failed to update role');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500 text-sm mt-1">Manage system access and roles.</p>
                </div>
                <Button
                    onClick={() => setIsAddModalOpen(true)}
                    className="bg-primary-600 hover:bg-primary-700 text-white shadow-lg shadow-primary-500/30 gap-2"
                >
                    <UserPlus size={18} /> Add User
                </Button>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50/50 border-b border-gray-100">
                            <tr>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">User</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Role</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600">Date Added</th>
                                <th className="py-4 px-6 text-sm font-semibold text-gray-600 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {loading ? (
                                <tr><td colSpan="4" className="py-8 text-center text-gray-500">Loading users...</td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan="4" className="py-8 text-center text-gray-500">No users found.</td></tr>
                            ) : (
                                users.map(user => (
                                    <tr key={user._id} className="group hover:bg-gray-50/50 transition-colors">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-bold text-lg">
                                                    {user.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-medium text-gray-900">{user.name}</div>
                                                    <div className="text-sm text-gray-500">{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6">
                                            <Badge type={user.role === 'admin' ? 'info' : 'default'} className="capitalize">
                                                {user.role}
                                            </Badge>
                                        </td>
                                        <td className="py-4 px-6 text-gray-500 text-sm">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="py-4 px-6 text-right space-x-2">
                                            <Button
                                                variant="outline"
                                                className="text-xs py-1.5 h-auto border-gray-200 text-gray-600 hover:text-primary-600 hover:border-primary-200"
                                                onClick={() => toggleRole(user)}
                                                title={`Make ${user.role === 'admin' ? 'Staff' : 'Admin'}`}
                                            >
                                                {user.role === 'admin' ? <Shield size={14} className="mr-1" /> : <ShieldCheck size={14} className="mr-1" />}
                                                {user.role === 'admin' ? 'Demote' : 'Promote'}
                                            </Button>
                                            <Button
                                                variant="danger"
                                                className="!p-2 h-auto text-gray-400 hover:text-red-600 hover:bg-red-50 border-transparent shadow-none"
                                                onClick={() => handleDeleteUser(user._id)}
                                            >
                                                <Trash2 size={16} />
                                            </Button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>

            {/* Simple Modal Implementation directly here to avoid dependency issues if generic Modal is complex */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900">Add New User</h2>
                            <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleAddUser} className="p-6 space-y-4">
                            <Input
                                label="Full Name"
                                placeholder="John Doe"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                required
                                icon={User}
                            />
                            <Input
                                label="Email Address"
                                type="email"
                                placeholder="john@example.com"
                                value={formData.email}
                                onChange={e => setFormData({ ...formData, email: e.target.value })}
                                required
                                icon={Mail}
                            />
                            <Input
                                label="Password"
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={e => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Role</label>
                                <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${formData.role === 'staff' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setFormData({ ...formData, role: 'staff' })}
                                    >
                                        Staff
                                    </button>
                                    <button
                                        type="button"
                                        className={`flex-1 py-1.5 text-sm font-medium rounded-lg transition-all ${formData.role === 'admin' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30' : 'text-gray-500 hover:text-gray-700'}`}
                                        onClick={() => setFormData({ ...formData, role: 'admin' })}
                                    >
                                        Admin
                                    </button>
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="outline" className="flex-1" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                                <Button type="submit" className="flex-1 bg-primary-600 hover:bg-primary-700" disabled={formLoading}>
                                    {formLoading ? 'Creating...' : 'Create User'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
