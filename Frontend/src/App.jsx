import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import useAuthStore from './store/authStore';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleGuard from './routes/RoleGuard';
import LoginPage from './features/auth/LoginPage';
import SignupPage from './features/auth/SignupPage';
import AppLayout from './layout/AppLayout';
import AdminLayout from './layout/AdminLayout';
import DailyTasksPage from './features/daily/DailyTasksPage';
import DefaultTaskManagerPage from './features/admin/DefaultTaskManagerPage';
import TechnologyList from './features/skills/TechnologyList';
import MonthlyReportPage from './features/reports/MonthlyReportPage';
import AdminOverviewPage from './features/admin/AdminOverviewPage';
import ReviewDashboardPage from './features/admin/ReviewDashboardPage';
import DailyLogsViewerPage from './features/admin/DailyLogsViewerPage';
import AdminMonthlyReportsPage from './features/admin/MonthlyReportsPage';

export default function App() {
    const init = useAuthStore((s) => s.init);
    useEffect(() => {
        init();
    }, [init]);

    return (
        <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            <Route element={<ProtectedRoute />}>
                <Route path="/dashboard" element={<AppLayout />}>
                    <Route index element={<DailyTasksPage />} />
                    <Route path="daily" element={<DailyTasksPage />} />
                    <Route path="skills" element={<TechnologyList />} />
                    <Route path="reports" element={<MonthlyReportPage />} />
                </Route>

                <Route
                    path="/admin"
                    element={
                        <RoleGuard roles={["ADMIN"]}>
                            <AppLayout />
                        </RoleGuard>
                    }
                >
                    <Route index element={<AdminOverviewPage />} />
                    <Route path="tasks" element={<DefaultTaskManagerPage />} />
                    <Route path="reviews" element={<ReviewDashboardPage />} />
                    <Route path="daily-logs" element={<DailyLogsViewerPage />} />
                    <Route path="reports" element={<AdminMonthlyReportsPage />} />
                </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}
