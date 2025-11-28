import React from 'react';

export default function Modal({ open, title, children, onClose }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="card w-full max-w-md">
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <button onClick={onClose} className="text-gray-500">✕</button>
                </div>
                <div className="p-4">{children}</div>
            </div>
        </div>
    );
}
