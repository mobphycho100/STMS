import React, { useEffect, useState } from 'react';
import useReviewStore from '../../store/reviewStore';
import ReviewModal from '../../components/ReviewModal';

export default function ReviewDashboardPage() {
    const { pending, load, approve, reject, loading } = useReviewStore();
    const [modal, setModal] = useState({ open: false, action: null, taskId: null });

    useEffect(() => { load({}); }, [load]);

    const openModal = (action, taskId) => setModal({ open: true, action, taskId });
    const closeModal = () => setModal({ open: false, action: null, taskId: null });

    const submit = async (comment) => {
        const { action, taskId } = modal;
        const ok = action === 'approve' ? await approve(taskId, comment) : await reject(taskId, comment);
        if (ok) closeModal();
    };

    console.log(pending)

    return (
        <div className="space-y-4">
            <div className="bg-white rounded shadow">
                <div className="px-4 py-2 text-sm font-semibold">Pending Reviews</div>
                <div className="divide-y">
                    {pending.map((t) => (
                        <div key={t.taskId} className="px-4 py-3">
                            <div className="flex items-center justify-between mb-2">
                                <div className="text-sm text-gray-600">User: {t.userName || t.userId} • Date: {t.date}</div>
                                <span className="px-2 py-1 rounded bg-yellow-100 text-yellow-800 text-xs">Pending</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-sm">
                                <div><span className="text-gray-500">Title:</span> {t.title}</div>
                                <div><span className="text-gray-500">Category:</span> {t.category}</div>
                                <div><span className="text-gray-500">Priority:</span> {t.priority}</div>
                                <div><span className="text-gray-500">Planned:</span> {t.plannedTime}</div>
                                <div><span className="text-gray-500">Actual:</span> {t.actualTime}</div>
                                <div className="md:col-span-6"><span className="font-semibold text-gray-700">Reason:</span> <span className="font-medium text-gray-900">{t.reasonForNonCompletion}</span></div>
                            </div>
                            <div className="mt-2 text-right">
                                <button className="text-green-600 mr-3" onClick={() => openModal('approve', t.taskId)}>Approve</button>
                                <button className="text-red-600" onClick={() => openModal('reject', t.taskId)}>Reject</button>
                            </div>
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
