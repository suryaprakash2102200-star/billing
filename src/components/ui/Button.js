import React from 'react';

export function Button({ children, className = '', variant = 'primary', ...props }) {
    const baseStyle = "inline-flex items-center justify-center px-5 py-2.5 rounded-xl font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
    const variants = {
        primary: "bg-primary-600 text-white hover:bg-primary-700 shadow-lg shadow-primary-500/30",
        secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300 shadow-sm",
        danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100",
        outline: "bg-transparent border border-gray-300 text-gray-600 hover:bg-gray-50 hover:text-gray-900",
    };

    return (
        <button className={`${baseStyle} ${variants[variant] || variants.primary} ${className}`} {...props}>
            {children}
        </button>
    );
}
