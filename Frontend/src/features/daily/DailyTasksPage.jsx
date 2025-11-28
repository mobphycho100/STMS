import React, { useEffect, useMemo, useState } from 'react';
import useTaskStore from '../../store/taskStore';
import useDailyLogStore from '../../store/dailyLogStore';
import TaskTable from '../../components/TaskTable';
import DailyMetricsForm from './DailyMetricsForm';
import CustomTaskForm from '../tasks/CustomTaskForm';
import Modal from '../../components/Modal';
import { TaskStatus, TaskType } from '../../utils/constants';
import useAuthStore from '../../store/authStore';

function today() {
    const d = new Date();
    return d.toISOString().slice(0, 10);
}

export default function DailyTasksPage() {
    const [date, setDate] = useState(today());
    const { defaultTasks, customTasks, loadDefaultTasks, loadCustomTasks, createCustom, deleteCustom } = useTaskStore();
    const { log, load, upsert, patchTask } = useDailyLogStore();
    const currentUser = useAuthStore((s) => s.user);

    const [taskState, setTaskState] = useState({});
    const [reasonModal, setReasonModal] = useState({ open: false, task: null });
    const [saving, setSaving] = useState(false);
    const [view, setView] = useState({ open: false, task: null, form: {} });

    // Load tasks and log
    useEffect(() => {
        loadDefaultTasks();
        loadCustomTasks();
    }, [loadDefaultTasks, loadCustomTasks]);

    useEffect(() => {
        if (date) load(date);
    }, [date, load]);

    // Merge tasks with existing log statuses and include all required fields
    const allTasks = useMemo(() => {
        const d = (defaultTasks || []).filter((t) => t.isActive).map((t) => ({
            id: t._id,
            title: t.title,
            type: TaskType.DEFAULT,
            priority: t.priority,
            plannedTime: t.plannedTime,
            actualTime: t.actualTime,
            status: t.status,
            remarks: t.remarks
        }));
        const c = (customTasks || []).map((t) => ({
            id: t._id,
            title: t.title,
            type: TaskType.CUSTOM,
            priority: t.priority,
            plannedTime: t.plannedTime,
            actualTime: t.actualTime,
            status: t.status,
            remarks: t.remarks,
            createdBy: t.createdBy,
            assignedTo: t.assignedTo
        }));
        return [...d, ...c];
    }, [defaultTasks, customTasks]);

    useEffect(() => {
        const map = {};
        const existing = (log?.tasks || []).reduce((acc, t) => {
            acc[String(t.taskId)] = { status: t.status, reason: t.reasonForNonCompletion || '' };
            return acc;
        }, {});
        for (const t of allTasks) {
            // Prefer existing daily-log status if present, otherwise fall back to task document's status
            map[t.id] = {
                taskId: t.id,
                type: t.type,
                title: t.title,
                status: existing[t.id]?.status || t.status || 'Yet to Start',
                reason: existing[t.id]?.reason || '',
            };
        }
        setTaskState(map);
    }, [allTasks, log]);

    const setCompleted = async (t) => {
        try {
            const newStatus = 'Completed';
            // Update local state immediately for better UX
            setTaskState((s) => ({
                ...s,
                [t.id || t.taskId]: {
                    ...s[t.id || t.taskId],
                    status: newStatus,
                    reason: ''
                }
            }));

            // Update backend
            if (t.type === TaskType.CUSTOM) {
                await useTaskStore.getState().updateCustom(t.id || t.taskId, {
                    status: newStatus
                });
            } else {
                await useDailyLogStore.getState().patchTask(
                    t.id || t.taskId,
                    { status: newStatus }
                );
            }

            // Refresh tasks to ensure consistency
            await useTaskStore.getState().loadCustomTasks();
            await useTaskStore.getState().loadDefaultTasks();
        } catch (error) {
            console.error('Failed to update task status:', error);
            // Revert on error
            setTaskState((s) => ({
                ...s,
                [t.id || t.taskId]: {
                    ...s[t.id || t.taskId],
                    status: t.status,
                },
            }));
        }
    };

    const openNotDone = (t) => setReasonModal({ open: true, task: t });
    const closeReason = () => setReasonModal({ open: false, task: null });
    const submitReason = async (reason) => {
        if (!reasonModal.task) return;
        const task = reasonModal.task;

        try {
            // Update local state immediately for better UX
            setTaskState((s) => ({
                ...s,
                [task.id || task.taskId]: {
                    ...s[task.id || task.taskId],
                    status: 'Not Done',
                    reason,
                },
            }));

            // Update backend
            if (task.type === TaskType.CUSTOM) {
                await useTaskStore.getState().updateCustom(task.id || task.taskId, {
                    status: 'Not Done',
                    remarks: reason
                });
            } else {
                await useDailyLogStore.getState().patchTask(
                    task.id || task.taskId,
                    {
                        status: 'Not Done',
                        reasonForNonCompletion: reason
                    }
                );
            }

            // Refresh tasks to ensure consistency
            useTaskStore.getState().loadCustomTasks();
            useTaskStore.getState().loadDefaultTasks();
            closeReason();
        } catch (error) {
            console.error('Failed to update task status:', error);
            // Revert on error
            setTaskState((s) => ({
                ...s,
                [task.id || task.taskId]: {
                    ...s[task.id || task.taskId],
                    status: task.status,
                },
            }));
        }
    };

    const saveAll = async (metrics) => {
        setSaving(true);
        try {
            const tasks = Object.values(taskState).map((t) => ({
                taskId: t.taskId,
                type: t.type,
                status: t.status,
                reasonForNonCompletion: t.status === TaskStatus.NOT_DONE ? t.reason || 'No reason' : undefined,
            }));
            await upsert({ date, ...metrics, tasks });
        } finally {
            setSaving(false);
        }
    };

    const addCustom = async (payload) => {
        await createCustom(payload);
    };
    const removeCustom = async (id) => {
        await deleteCustom(id);
    };

    const onViewTask = (t) => {
        // Find full task document by id/type
        let doc = null;
        if (t.type === TaskType.CUSTOM) {
            doc = customTasks.find((x) => x._id === (t.id || t.taskId));
        } else if (t.type === TaskType.DEFAULT) {
            doc = defaultTasks.find((x) => x._id === (t.id || t.taskId));
        }
        if (!doc) return;

        // Get current state for this task if it exists
        const currentState = taskState[t.id || t.taskId] || {};

        const form = {
            title: doc.title || '',
            description: doc.description || '',
            priority: currentState.priority || doc.priority || 'Medium',
            status: currentState.status || doc.status || 'Yet to Start',
            plannedTime: currentState.plannedTime || doc.plannedTime || '1:00',
            actualTime: currentState.actualTime || doc.actualTime || '0:00',
            remarks: currentState.remarks || doc.remarks || '',
        };

        setView({
            open: true,
            task: {
                ...doc,
                _id: doc._id || t.id || t.taskId, // Ensure we have the correct ID
                type: t.type
            },
            form
        });
    };

    const closeView = () => setView({ open: false, task: null, form: {} });

    const canEditInModal = (task) => {
        if (!task) return false;
        if (currentUser?.role === 'ADMIN') return true; // admin can edit any
        // user permissions for custom tasks
        if (task.type === TaskType.CUSTOM) {
            const isOwner = String(task.createdBy) === String(currentUser?.id);
            const isAssigned = task.assignedTo && String(task.assignedTo) === String(currentUser?.id);
            return isOwner || isAssigned;
        }
        return false;
    };

    const limitedEdit = (task) => {
        if (!task) return false;
        if (currentUser?.role === 'ADMIN') return false;
        if (task.type === TaskType.CUSTOM) {
            const isAssigned = task.assignedTo && String(task.assignedTo) === String(currentUser?.id);
            const isOwner = String(task.createdBy) === String(currentUser?.id);
            return isAssigned && !isOwner;
        }
        return false;
    };

    const saveView = async () => {
        const doc = view.task;
        if (!doc) return;

        try {
            // Only custom tasks are savable here with our current API
            if (doc.type !== TaskType.CUSTOM) return closeView();

            const body = { ...view.form };

            // Update local state immediately for better UX
            setTaskState(prev => ({
                ...prev,
                [doc._id]: {
                    ...prev[doc._id],
                    ...body,
                    status: body.status || prev[doc._id]?.status || 'Yet to Start',
                    priority: body.priority || prev[doc._id]?.priority || 'Medium'
                }
            }));

            // Update backend
            if (limitedEdit(doc)) {
                // Restrict fields for limited edit mode
                const allowed = {
                    status: body.status,
                    actualTime: body.actualTime,
                    remarks: body.remarks
                };
                await useTaskStore.getState().updateCustom(doc._id, allowed);
            } else {
                await useTaskStore.getState().updateCustom(doc._id, body);
            }

            // Refresh tasks to ensure consistency
            await useTaskStore.getState().loadCustomTasks();
            await useTaskStore.getState().loadDefaultTasks();

            closeView();
        } catch (error) {
            console.error('Failed to update task:', error);
            // Optionally show an error message to the user
        }
    };

    const deleteView = async () => {
        const doc = view.task;
        if (!doc) return;
        if (doc.type !== TaskType.CUSTOM) return closeView();
        // Only allow delete if admin or owner
        const isOwner = String(doc.createdBy) === String(currentUser?.id);
        if (currentUser?.role === 'ADMIN' || isOwner) {
            await useTaskStore.getState().deleteCustom(doc._id);
        }
        closeView();
    };

    const combinedDisplay = useMemo(() => {
        return allTasks.map(task => {
            const state = taskState[task.id] || {};
            // Merge task doc and local state; local state takes precedence when meaningful
            const merged = { ...task, ...state };

            return {
                id: task.id,
                taskId: task.id,
                // Spread merged so updated fields from either doc or state are present
                ...merged,
                // Normalize display values
                priority: merged.priority || '-',
                plannedTime: merged.plannedTime || '-',
                actualTime: merged.actualTime || '-',
                status: merged.status || 'Yet to Start',
            };
        });
    }, [allTasks, taskState]);

    return (
        <div className="space-y-4">
            <div className="flex items-end gap-3">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Date</label>
                    <input type="date" className="input" value={date} onChange={(e) => setDate(e.target.value)} />
                </div>
            </div>

            <DailyMetricsForm initial={log || {}} onSave={saveAll} />

            <TaskTable
                tasks={combinedDisplay}
                onSetCompleted={(t) => setCompleted(t)}
                onSetNotDone={(t) => openNotDone(t)}
                onView={(t) => onViewTask(t)}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <CustomTaskForm onSubmit={addCustom} />
                </div>
                <div className="card p-4">
                    <div className="text-sm font-semibold mb-3 text-gray-800">Default Tasks</div>
                    <div className="text-sm text-gray-600 space-y-2">
                        {defaultTasks.filter((t) => t.isActive).map((t) => (
                            <div key={t._id} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded">
                                <span>{t.title}</span>
                                <span className="text-xs text-gray-500">{t.priority || '-'}</span>
                            </div>
                        ))}
                        {defaultTasks.filter((t) => t.isActive).length === 0 && (
                            <div className="text-center text-gray-500 py-4">No default tasks available</div>
                        )}
                    </div>
                </div>
            </div>

            <Modal open={reasonModal.open} title="Reason for not completing" onClose={closeReason}>
                <form onSubmit={(e) => { e.preventDefault(); const text = e.target.reason.value.trim(); submitReason(text); }} className="space-y-3">
                    <textarea name="reason" className="input" placeholder="Enter reason" required />
                    <div className="flex justify-end gap-2">
                        <button type="button" className="btn-secondary" onClick={closeReason}>Cancel</button>
                        <button className="btn-primary">Save</button>
                    </div>
                </form>
            </Modal>

            <Modal open={view.open} title="Task Details" onClose={closeView}>
                {view.task && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            saveView();
                        }}
                        className="space-y-3"
                    >
                        <div className="text-sm text-gray-600">Type: {view.task.type}</div>
                        <div>
                            <label className="block text-sm mb-1">{view.task.type === TaskType.CUSTOM ? 'Type of Task' : 'Title'}</label>
                            {view.task.type === TaskType.CUSTOM ? (
                                // For custom tasks show a dropdown of known task types and allow editing when permitted
                                (() => {
                                    const taskTypes = ['Practice Session', 'Miscellaneous Tasks', 'Learning'];
                                    const current = view.form.title || '';
                                    const showExtra = !taskTypes.includes(current) && current !== '';
                                    return (
                                        <>
                                            <select
                                                className="select w-full"
                                                value={current}
                                                onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, title: e.target.value } }))}
                                                disabled={!canEditInModal(view.task) || limitedEdit(view.task)}
                                            >
                                                {taskTypes.map(t => (
                                                    <option key={t} value={t}>{t}</option>
                                                ))}
                                                {showExtra && <option value={current}>{current}</option>}
                                            </select>
                                            {(!canEditInModal(view.task) || limitedEdit(view.task)) ? null : null}
                                        </>
                                    );
                                })()
                            ) : (
                                <input
                                    className="input"
                                    value={view.form.title}
                                    onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, title: e.target.value } }))}
                                    disabled={!canEditInModal(view.task) || limitedEdit(view.task)}
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Description</label>
                            <textarea
                                className="input"
                                value={view.form.description}
                                onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, description: e.target.value } }))}
                                disabled={!canEditInModal(view.task) || limitedEdit(view.task)}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                                <label className="block text-sm mb-1">Priority</label>
                                <select
                                    className="select w-full"
                                    value={view.form.priority}
                                    onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, priority: e.target.value } }))}
                                    disabled={!canEditInModal(view.task) || limitedEdit(view.task)}
                                >
                                    {['Highest', 'High', 'Medium', 'Low', 'Adhoc'].map(priority => (
                                        <option key={priority} value={priority}>{priority}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Status</label>
                                <select
                                    className="select"
                                    value={view.form.status}
                                    onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, status: e.target.value } }))}
                                    disabled={!canEditInModal(view.task)}
                                >
                                    {['Completed', 'Not Done', 'Yet to Start', 'On Hold', 'In Progress', 'Carry Forward'].map((s) => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Planned Time (H:MM)</label>
                                <input
                                    className="input"
                                    value={view.form.plannedTime}
                                    onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, plannedTime: e.target.value } }))}
                                    disabled={!canEditInModal(view.task) || limitedEdit(view.task)}
                                    pattern="^\d{1,2}:\d{2}$"
                                    placeholder="e.g. 1:30"
                                />
                            </div>
                            <div>
                                <label className="block text-sm mb-1">Actual Time (H:MM)</label>
                                <input
                                    className="input"
                                    value={view.form.actualTime}
                                    onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, actualTime: e.target.value } }))}
                                    disabled={!canEditInModal(view.task)}
                                    pattern="^\d{1,2}:\d{2}$"
                                    placeholder="e.g. 0:45"
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm mb-1">Remarks</label>
                            <textarea
                                className="input"
                                value={view.form.remarks}
                                onChange={(e) => setView((v) => ({ ...v, form: { ...v.form, remarks: e.target.value } }))}
                                disabled={!canEditInModal(view.task)}
                            />
                        </div>
                        <div className="flex justify-between">
                            <div>
                                {view.task.type === TaskType.CUSTOM && (currentUser?.role === 'ADMIN' || String(view.task.createdBy) === String(currentUser?.id)) && (
                                    <button
                                        type="button"
                                        className="btn-secondary"
                                        onClick={deleteView}
                                    >
                                        Delete
                                    </button>
                                )}
                            </div>
                            <div className="flex gap-2">
                                <button type="button" className="btn-secondary" onClick={closeView}>Cancel</button>
                                {canEditInModal(view.task) && (
                                    <button className="btn-primary">Save</button>
                                )}
                            </div>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
}
