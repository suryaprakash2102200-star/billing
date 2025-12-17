'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Signup failed');
            }

            // If successful signup, redirect to login
            router.push('/login');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">
            {/* Branding Section (Hidden on mobile) */}
            <div className="hidden lg:flex flex-col justify-between p-12 lg:p-16 bg-primary-600 text-white relative overflow-hidden order-last">
                {/* Abstract Shapes */}
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-primary-700 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/2"></div>

                <div className="relative z-10 text-right">
                    <h1 className="text-3xl font-bold tracking-wide">Join PhotoBiz</h1>
                    <p className="mt-2 text-primary-100 text-lg">Start managing your orders efficiently.</p>
                </div>

                {/* Illustration */}
                <div className="relative z-10 flex items-center justify-end py-12">
                    <img
                        src="/signup-illustration.png"
                        alt="Create Account"
                        className="w-full max-w-sm object-contain drop-shadow-2xl"
                    />
                </div>

                <div className="relative z-10 space-y-4">
                    <div className="p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 ml-auto max-w-sm text-right">
                        <p className="font-medium">"The best way to predict the future is to create it."</p>
                        <p className="text-sm text-primary-200 mt-2">— Peter Drucker</p>
                    </div>
                </div>
            </div>

            {/* Signup Form Section */}
            <div className="flex flex-col justify-center items-center p-8 lg:p-24 overflow-y-auto">
                <div className="w-full max-w-md space-y-8">
                    <div className="text-center lg:text-left">
                        <div className="lg:hidden mb-8 inline-block p-3 rounded-xl bg-primary-50 text-primary-600">
                            {/* Mobile Logo placeholder */}
                            <span className="font-bold">PM</span>
                        </div>
                        <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Create Account</h2>
                        <p className="mt-2 text-gray-500">Set up your admin access.</p>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 p-4 rounded-xl text-sm border border-red-100 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-red-500 shrink-0"></div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <Input
                            label="Full Name"
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            className="bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                            className="bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                        />
                        <Input
                            label="Password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="bg-gray-50 border-gray-100 focus:bg-white transition-colors"
                        />
                        <div className="text-xs text-gray-500">
                            By creating an account, you agree to our Terms of Service and Privacy Policy.
                        </div>

                        <Button type="submit" className="w-full h-12 text-lg bg-primary-600 hover:bg-primary-700 shadow-lg shadow-primary-500/30" disabled={loading}>
                            {loading ? 'Creating Account...' : 'Sign Up'}
                        </Button>
                    </form>

                    <div className="pt-6 border-t border-gray-100 text-center">
                        <p className="text-gray-500">
                            Already have an account?{' '}
                            <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700 hover:underline transition-color">
                                Login here
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
