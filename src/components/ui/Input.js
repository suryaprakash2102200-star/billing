import React from 'react';

export function Input({ label, error, className = '', ...props }) {
    return (
        <div className={`mb-5 ${className}`}>
            {label && <label className="block text-sm font-semibold text-gray-700 mb-2 ml-1">{label}</label>}
            <input
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 focus:bg-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 text-gray-900 ${error ? 'border-red-300 bg-red-50' : 'border-gray-200'
                    }`}
                {...props}
            />
            {error && <p className="mt-1.5 ml-1 text-sm text-red-500 font-medium">{error}</p>}
        </div>
    );
}
