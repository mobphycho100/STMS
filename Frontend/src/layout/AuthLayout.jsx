import React from 'react';

export default function AuthLayout({ children, title }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#F5F7FA]">
            <div className="w-full max-w-md p-6 card">
                <h1 className="text-2xl font-semibold mb-4 text-gray-800">{title || 'STMS'}</h1>
                {children}
            </div>
        </div>
    );
}
