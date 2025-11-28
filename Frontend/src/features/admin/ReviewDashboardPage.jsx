import React, { useEffect, useState } from 'react';
import useReviewStore from '../../store/reviewStore';
import ReviewModal from '../../components/ReviewModal';

export default function ReviewDashboardPage() {
    const { pending, load, approve, reject, loading } = useReviewStore();
    const [modal, setModal] = useState({ open: false, action: null, dailyLogId: null, taskId: null });

    useEffect(() => { load({}); }, [load]);

    const openModal = (action, dailyLogId, taskId) => setModal({ open: true, action, dailyLogId, taskId });
    const closeModal = () => setModal({ open: false, action: null, dailyLogId: null, taskId: null });

    const submit = async (comment) => {
        const { action, dailyLogId, taskId } = modal;
        if (action === 'approve') await approve(dailyLogId, taskId, comment);
        else await reject(dailyLogId, taskId, comment);
        closeModal();
        load({});
    };

    return (
        <div className="space-y-4">
            <div className="bg-white rounded shadow">
                <div className="px-4 py-2 text-sm font-semibold">Pending Reviews</div>
                <div className="divide-y">
                    {pending.map((log) => (
                        <div key={log.id} className="px-4 py-3">
                            <div className="text-sm text-gray-600 mb-2">Date: {log.date}</div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left bg-gray-50">
                                        <th className="px-3 py-2">Task</th>
                                        <th className="px-3 py-2">Type</th>
                                        <th className="px-3 py-2">Reason</th>
                                        <th className="px-3 py-2 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {log.tasks.map((t) => (
                                        <tr key={t.taskId} className="border-t">
                                            <td className="px-3 py-2">{t.taskId}</td>
                                            <td className="px-3 py-2">{t.type}</td>
                                            <td className="px-3 py-2">{t.reasonForNonCompletion}</td>
                                            <td className="px-3 py-2 text-right">
                                                <button className="text-green-600 mr-3" onClick={() => openModal('approve', log.id, t.taskId)}>Approve</button>
                                                <button className="text-red-600" onClick={() => openModal('reject', log.id, t.taskId)}>Reject</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))}
                    {pending.length === 0 && (
                        <div className="px-4 py-6 text-center text-gray-500">No pending items</div>
                    )}
                </div>
            </div>

            <ReviewModal open={modal.open} title={modal.action === 'approve' ? 'Approve Reason' : 'Reject Reason'} onClose={closeModal} onSubmit={submit} />
        </div>
    );
}
