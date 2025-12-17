'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, LayoutDashboard, ShoppingBag, CreditCard, Users, UserCog, UserPlus, FileText, ClipboardList, Receipt, TrendingUp } from 'lucide-react';

export default function Sidebar({ isOpen, closeSidebar, user, isCollapsed, toggleCollapse }) {
    const pathname = usePathname();

    const links = [
        { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { href: '/leads', label: 'Leads', icon: UserPlus },
        { href: '/inquiries', label: 'Inquiries', icon: FileText },
        { href: '/quotations', label: 'Quotations', icon: ClipboardList },
        { href: '/orders', label: 'Orders List', icon: ShoppingBag },
        { href: '/kanban', label: 'Kanban Board', icon: ShoppingBag },
        { href: '/invoices', label: 'Invoices', icon: Receipt },
        { href: '/payments', label: 'Payments', icon: CreditCard },
        { href: '/customers', label: 'Customers', icon: Users },
        { href: '/settings', label: 'Settings', icon: UserCog },
        { href: '/reports', label: 'Reports', icon: TrendingUp },
    ];

    if (user?.role === 'admin') {
        links.push({ href: '/users', label: 'Users', icon: UserCog });
    }

    return (
        <>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    onClick={closeSidebar}
                />
            )}

            <aside className={`fixed top-16 left-0 h-[calc(100vh-64px)] bg-white transform transition-all duration-300 ease-in-out z-30 
                ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 
                ${isCollapsed ? 'w-20' : 'w-64'}
            `}>
                <div className="h-full flex flex-col">
                    {/* Collapse Toggle (Desktop Only) */}
                    <div className="hidden md:flex p-2 justify-end">
                        <button
                            onClick={toggleCollapse}
                            className="p-1.5 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                        >
                            {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                        </button>
                    </div>
                    <div className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-200">
                        {links.map((link) => {
                            const Icon = link.icon;
                            const isActive = pathname.startsWith(link.href);

                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={closeSidebar}
                                    title={isCollapsed ? link.label : ''}
                                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative ${isActive
                                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
                                        } ${isCollapsed ? 'justify-center px-2' : ''}`}
                                >
                                    <Icon size={20} className={`shrink-0 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />

                                    {!isCollapsed && (
                                        <span className="font-medium whitespace-nowrap overflow-hidden transition-all duration-300">
                                            {link.label}
                                        </span>
                                    )}
                                </Link>
                            );
                        })}
                    </div>

                </div>
            </aside>
        </>
    );
}
