import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

function LinkItem({ to, label }) {
    return (
        <NavLink
            to={to}
            className={({ isActive }) =>
                `block px-3 py-2 rounded text-sm ${isActive ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-50'}`
            }
            end
        >
            {label}
        </NavLink>
    );
}

export default function Sidebar() {
    const { user } = useAuthStore();
    const loc = useLocation();
    const isAdmin = user?.role === 'ADMIN';

    return (
        <aside className="w-56 shrink-0 border-r bg-[#F9FAFB] p-3">
            {!isAdmin ? (
                <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold text-gray-500 uppercase">User</div>
                    <LinkItem to="/dashboard/daily" label="Daily" />
                    <LinkItem to="/dashboard/skills" label="Skills" />
                    <LinkItem to="/dashboard/reports" label="Reports" />
                </div>
            ) : (
                <div className="space-y-1">
                    <div className="px-3 text-xs font-semibold text-gray-500 uppercase">Admin</div>
                    {/* <LinkItem to="/dashboard" label="Dashboard" /> */}
                    <LinkItem to="/admin" label="Overview" />
                    <LinkItem to="/admin/tasks" label="Default Tasks" />
                    <LinkItem to="/admin/reviews" label="Reviews" />
                    <LinkItem to="/admin/daily-logs" label="Daily Logs" />
                    <LinkItem to="/admin/reports" label="Reports" />
                </div>
            )}
        </aside>
    );
}
