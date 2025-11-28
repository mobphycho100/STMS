import React, { useEffect, useState } from 'react';
import useUserStore from '../../store/userStore';
import useReportStore from '../../store/reportStore';
import ReportSummaryCard from '../../components/ReportSummaryCard';

function currentMonth() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`; }

export default function AdminMonthlyReportsPage() {
    const { users, loadUsers } = useUserStore();
    const { report, generate, get, loading } = useReportStore();
    const [userId, setUserId] = useState('');
    const [month, setMonth] = useState(currentMonth());

    useEffect(() => { loadUsers(); }, [loadUsers]);

    return (
        <div className="space-y-3">
            <div className="bg-white rounded shadow p-3 flex items-end gap-3">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">User</label>
                    <select className="border rounded px-3 py-2" value={userId} onChange={(e) => setUserId(e.target.value)}>
                        <option value="">Select user</option>
                        {users.map((u) => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
                    </select>
                </div>
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Month</label>
                    <input type="month" className="border rounded px-3 py-2" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
                <button className="bg-blue-600 text-white px-4 py-2 rounded" disabled={!userId || loading} onClick={() => generate(month, userId)}>Generate</button>
                <button className="bg-gray-200 px-4 py-2 rounded" disabled={!userId || loading} onClick={() => get(month, userId)}>Fetch</button>
            </div>

            <ReportSummaryCard report={report} />
        </div>
    );
}
