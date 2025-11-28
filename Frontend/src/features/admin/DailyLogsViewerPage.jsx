import React, { useEffect, useState } from 'react';
import useUserStore from '../../store/userStore';
import useDailyLogStore from '../../store/dailyLogStore';
import DatePicker from '../../components/DatePicker';

function today() { const d = new Date(); return d.toISOString().slice(0, 10); }

export default function DailyLogsViewerPage() {
    const { users, loadUsers } = useUserStore();
    const { log, load, loading } = useDailyLogStore();
    const [userId, setUserId] = useState('');
    const [date, setDate] = useState(today());

    useEffect(() => { loadUsers(); }, [loadUsers]);
    useEffect(() => { if (userId && date) load(date, userId); }, [userId, date, load]);

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
                    <label className="block text-xs text-gray-600 mb-1">Date</label>
                    <DatePicker value={date} onChange={setDate} />
                </div>
            </div>

            {log ? (
                <div className="bg-white rounded shadow p-4 space-y-2">
                    <div className="text-sm text-gray-600">Metrics</div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                        <div>Practice: <b>{log.practiceSessionCount}</b></div>
                        <div>Doubts: <b>{log.doubtsLoggedCount}</b></div>
                        <div>Concepts: <b>{log.conceptExplanationCount}</b></div>
                        <div>Stand-up: <b>{log.standupAttendance}</b></div>
                        <div>Sync-up: <b>{log.syncupAttendance}</b></div>
                    </div>
                    <div className="pt-2">
                        <div className="text-sm font-semibold mb-2">Tasks</div>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="text-left bg-gray-50">
                                    <th className="px-3 py-2">Task ID</th>
                                    <th className="px-3 py-2">Type</th>
                                    <th className="px-3 py-2">Status</th>
                                    <th className="px-3 py-2">Review</th>
                                </tr>
                            </thead>
                            <tbody>
                                {log.tasks.map((t, i) => (
                                    <tr key={i} className="border-t">
                                        <td className="px-3 py-2">{t.taskId}</td>
                                        <td className="px-3 py-2">{t.type}</td>
                                        <td className="px-3 py-2">{t.status}</td>
                                        <td className="px-3 py-2">{t.reviewStatus}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-gray-500">Select user and date to view log.</div>
            )}
        </div>
    );
}
