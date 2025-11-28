import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import Sidebar from '../components/Sidebar';

export default function AppLayout() {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex flex-col">
            <header className="border-b bg-white">
                <div className="px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <span className="font-semibold text-gray-800">STMS</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-700">{user?.name}</span>
                        <button className="btn-secondary" onClick={() => { logout(); navigate('/login'); }}>Logout</button>
                    </div>
                </div>
            </header>
            <div className="flex flex-1">
                <Sidebar />
                <main className="flex-1 bg-[#F5F7FA]">
                    <div className="px-6 py-6 text-gray-800">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
