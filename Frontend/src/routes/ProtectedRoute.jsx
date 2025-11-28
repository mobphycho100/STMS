import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuthStore from '../store/authStore';

export default function ProtectedRoute() {
    const user = useAuthStore((s) => s.user);
    const initializing = useAuthStore((s) => s.initializing);
    if (initializing) return null;
    if (!user) return <Navigate to="/login" replace state={{ message: 'Please sign in to continue.' }} />;
    return <Outlet />;
}
