import React from 'react';
import { Outlet } from 'react-router-dom';

export default function AdminLayout() {
    return (
        <div>
            <h2 className="text-xl font-semibold mb-4">Admin</h2>
            <Outlet />
        </div>
    );
}
