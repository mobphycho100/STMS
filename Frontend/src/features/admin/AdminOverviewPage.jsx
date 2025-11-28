import React, { useEffect } from 'react';
import useUserStore from '../../store/userStore';

export default function AdminOverviewPage() {
    const { users, loadUsers, loading } = useUserStore();
    useEffect(() => { loadUsers(); }, [loadUsers]);

    return (
        <div className="card">
            <div className="px-4 py-2 text-sm font-semibold text-gray-800">Users Compliance (Current Month)</div>
            <table className="w-full text-sm text-gray-800">
                <thead>
                    <tr className="text-left table-header">
                        <th className="px-4 py-2 font-medium">Name</th>
                        <th className="px-4 py-2 font-medium">Email</th>
                        <th className="px-4 py-2 font-medium">Role</th>
                        <th className="px-4 py-2 font-medium">Compliance</th>
                    </tr>
                </thead>
                <tbody>
                    {users.map((u) => (
                        <tr key={u.id} className="border-t bg-white">
                            <td className="px-4 py-2">{u.name}</td>
                            <td className="px-4 py-2">{u.email}</td>
                            <td className="px-4 py-2">{u.role}</td>
                            <td className="px-4 py-2">{u.compliancePercentage}%</td>
                        </tr>
                    ))}
                    {users.length === 0 && (
                        <tr><td colSpan={4} className="px-4 py-4 text-center text-gray-600">No users</td></tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
