import React from 'react';

export function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 p-6 transition-all duration-200 hover:shadow-md ${className}`}>
            {children}
        </div>
    );
}
