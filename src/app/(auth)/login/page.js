'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

import { useToast } from '@/context/ToastContext';

export default function LoginPage() {
    const router = useRouter();
    const { error: toastError } = useToast();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            // Force hard navigation to ensure cookie is picked up
            window.location.href = '/dashboard';
        } catch (err) {
            setError(err.message);
            toastError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Branding Section (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-primary-600 text-white relative overflow-hidden">
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-700 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10">
                    <h1 className="text-3xl font-bold tracking-wide">PhotoBiz Manager</h1>
                    <p className="mt-2 text-primary-100 text-lg">Manage your photography business with elegance.</p>
                </div>

                {/* Illustration */}
                <div className="relative z-10 flex items-center justify-center py-12">
                    <img
                        src="/login-illustration.png"
                        alt="Secure Login"
                        className="w-full max-w-sm object-contain drop-shadow-2xl"
                    />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
                        <p className="font-medium">"Simplicity is the ultimate sophistication."</p>
                        <p className="text-sm text-primary-200 mt-2">— Leonardo da Vinci</p>
                    </div>
                </div>
            </div>

            {/* Login Form Section */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden mb-8 inline-block p-3 rounded-xl bg-primary-50 text-primary-600">
                            {/* Mobile Logo placeholder */}
                            <span className="font-bold">PM</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Welcome Back</h2>
                        <p className="mt-2 text-gray-500">Please sign in to your dashboard.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                        />
                        <div>
                            <Input
                                label="Password"
                                type="password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                                className="bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                            />
                            <div className="flex justify-end mt-2">
                                <Link href="#" className="text-sm font-medium text-primary-600 hover:text-primary-700 hover:underline">
                                    Forgot password?
                                </Link>
                            </div>
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30" disabled={loading}>
                            {loading ? 'Authenticating...' : 'Sign In'}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500">
                            Don't have an account?{' '}
                            <Link href="/signup" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-color">
                                Create Admin Account
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
