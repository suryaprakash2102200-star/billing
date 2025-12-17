'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LogOut, Menu } from 'lucide-react';
import { Button } from './ui/Button';

export default function Navbar({ user, toggleSidebar }) {
    const router = useRouter();

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        router.push('/login');
        router.refresh();
    };

    return (
        <nav className="bg-primary-600 h-16 flex items-center justify-between px-4 md:px-6 fixed w-full top-0 z-10 shadow-md transition-colors duration-300">
            <div className="flex items-center gap-4">
                <button onClick={toggleSidebar} className="md:hidden p-2 text-white hover:bg-primary-700 rounded-lg transition-colors">
                    <Menu size={20} />
                </button>
                <h1 className="text-xl font-bold text-white tracking-wide">
                    PhotoBiz Manager
                </h1>
            </div>

            <div className="flex items-center gap-4">
                <span className="hidden md:block text-sm font-medium text-primary-50">
                    {user?.name} ({user?.role})
                </span>
                <button
                    onClick={handleLogout}
                    className="p-2 text-primary-100 hover:text-white hover:bg-primary-700 rounded-lg transition-all"
                    title="Logout"
                >
                    <LogOut size={20} />
                </button>
            </div>
        </nav>
    );
}
