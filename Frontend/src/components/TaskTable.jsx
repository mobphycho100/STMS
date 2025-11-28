import React from 'react';

export default function TaskTable({ tasks = [], onSetCompleted, onSetNotDone, onView }) {
    const badgeClass = (status) => {
        if (!status) return 'badge badge-pending'; // Default for undefined/null
        const statusLower = status.toLowerCase();
        if (statusLower.includes('complete')) return 'badge badge-completed';
        if (statusLower.includes('not done') || statusLower.includes('notdone')) return 'badge badge-notdone';
        if (statusLower.includes('progress')) return 'badge badge-in-progress';
        if (statusLower.includes('hold')) return 'badge badge-hold';
        if (statusLower.includes('carry forward')) return 'badge badge-carry-forward';
        return 'badge badge-pending'; // Default for 'Yet to Start' and others
    };
    return (
        <div className="card divide-y">
            <div className="px-4 py-2 text-sm font-semibold text-gray-800">Tasks</div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-gray-800">
                    <thead>
                        <tr className="text-left table-header">
                            <th className="px-4 py-2 font-medium">Title</th>
                            <th className="px-4 py-2 font-medium">Category</th>
                            <th className="px-4 py-2 font-medium">Priority</th>
                            <th className="px-4 py-2 font-medium">Planned</th>
                            <th className="px-4 py-2 font-medium">Actual</th>
                            <th className="px-4 py-2 font-medium">Status</th>
                            <th className="px-4 py-2 text-right font-medium">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tasks.map((t) => {
                            const status = t.status || 'Yet to Start';
                            return (
                                <tr key={t.taskId || t.id} className="border-t hover:bg-gray-50">
                                    <td className="px-4 py-2">{t.title}</td>
                                    <td className="px-4 py-2 text-gray-700">{t.category || '-'}</td>
                                    <td className="px-4 py-2">
                                        <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-800">
                                            {t.priority || 'Medium'}
                                        </span>
                                    </td>
                                    <td className="px-4 py-2 text-gray-600">{t.plannedTime || '0:00'}</td>
                                    <td className="px-4 py-2 text-gray-600">{t.actualTime || '0:00'}</td>
                                    <td className="px-4 py-2">
                                        <span className={badgeClass(status)}>{status}</span>
                                    </td>
                                    <td className="px-4 py-2 text-right space-x-2">
                                        {status !== 'Completed' && status !== 'Not Done' && (
                                            <button
                                                onClick={() => onSetCompleted(t)}
                                                className="text-green-600 hover:text-green-800 text-xs px-2 py-1 border border-green-200 rounded hover:bg-green-50"
                                            >
                                                Complete
                                            </button>
                                        )}
                                        {status !== 'Not Done' && status !== 'Completed' && (
                                            <button
                                                onClick={() => onSetNotDone(t)}
                                                className="text-red-600 hover:text-red-800 text-xs px-2 py-1 border border-red-200 rounded hover:bg-red-50"
                                            >
                                                Not Done
                                            </button>
                                        )}
                                        <button
                                            onClick={() => onView(t)}
                                            className="text-blue-600 hover:text-blue-800 p-1 rounded-full hover:bg-blue-50"
                                            title="View details"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                        {tasks.length === 0 && (
                            <tr>
                                <td className="px-4 py-4 text-center text-gray-600" colSpan={7}>No tasks</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
