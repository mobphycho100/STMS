import React from 'react';
import { Navigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function RoleGuard({ roles = [], children }) {
    const role = useAuthStore((s) => s.user?.role);
    if (!roles.includes(role)) return <Navigate to="/dashboard" replace />;
    return children;
}
