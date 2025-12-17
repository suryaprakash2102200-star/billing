'use client';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Kanban, Palette, ChevronRight, Building2, Package } from 'lucide-react';

export default function SettingsPage() {
    const settingsOptions = [
        {
            title: 'Company Settings',
            description: 'Manage business profile, tax, and bank details.',
            icon: Building2,
            href: '/settings/company',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        },
        {
            title: 'Product Master',
            description: 'Create products, services, and pricing templates.',
            icon: Package,
            href: '/settings/products',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            title: 'Kanban Stages',
            description: 'Configure stages, colors, and order for your board.',
            icon: Kanban,
            href: '/settings/stages',
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            title: 'Theme Settings',
            description: 'Customize application colors and appearance.',
            icon: Palette,
            href: '/settings/theme',
            color: 'text-pink-600',
            bg: 'bg-pink-50'
        }
        // Add more settings here like 'Users', 'Integrations' etc.
    ];

    return (
        <div className="space-y-6 mt-10">
            <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settingsOptions.map((option) => (
                    <Link key={option.title} href={option.href} className={option.href === '#' ? 'cursor-not-allowed opacity-60' : ''}>
                        <Card className="hover:shadow-md transition-all duration-200 group">
                            <div className="flex items-start justify-between">
                                <div className="flex gap-4">
                                    <div className={`p-3 rounded-xl ${option.bg} ${option.color}`}>
                                        <option.icon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
                                            {option.title}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            {option.description}
                                        </p>
                                    </div>
                                </div>
                                <ChevronRight className="text-gray-300 group-hover:text-purple-600 transition-colors" size={20} />
                            </div>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    );
}
