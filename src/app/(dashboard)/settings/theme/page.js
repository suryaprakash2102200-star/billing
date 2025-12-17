'use client';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/context/ThemeContext';
import { Check } from 'lucide-react';

export default function ThemeSettingsPage() {
    const { currentTheme, setTheme, themes } = useTheme();

    return (
        <div className="max-w-4xl mx-auto mt-10 space-y-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Theme Settings</h1>
                <p className="text-gray-500 mt-1">Personalize the look and feel of your application.</p>
            </div>

            <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Primary Color</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {Object.entries(themes).map(([key, theme]) => (
                        <button
                            key={key}
                            onClick={() => setTheme(key)}
                            className={`
                                relative flex items-center gap-3 p-3 rounded-xl border-2 transition-all
                                ${currentTheme === key ? 'border-primary-600 bg-primary-50 ring-1 ring-primary-600' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                            `}
                        >
                            <div
                                className="w-8 h-8 rounded-full shadow-sm"
                                style={{ backgroundColor: theme.colors[500] }}
                            />
                            <span className="font-medium text-gray-900">{theme.name}</span>
                            {currentTheme === key && (
                                <div className="absolute top-2 right-2 text-primary-600">
                                    <Check size={16} />
                                </div>
                            )}
                        </button>
                    ))}
                </div>
            </Card>

            <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Preview</h3>
                <div className="flex gap-4 items-center">
                    <button className="px-5 py-2.5 rounded-xl font-semibold bg-primary-600 text-white shadow-lg shadow-primary-500/30">
                        Primary Button
                    </button>
                    <button className="px-5 py-2.5 rounded-xl font-semibold bg-white text-primary-700 border border-primary-200 hover:bg-primary-50">
                        Secondary Button
                    </button>
                    <div className="text-primary-600 font-medium">
                        Active Link Text
                    </div>
                </div>
            </div>
        </div>
    );
}
