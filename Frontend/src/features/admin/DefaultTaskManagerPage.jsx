import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';

export default function DefaultTaskManagerPage() {
    const [tasks, setTasks] = useState([]);
    const [form, setForm] = useState({ title: '', priority: 'Medium', plannedTime: '1:00', description: '' });
    const [loading, setLoading] = useState(true);
    const [editId, setEditId] = useState(null);
    const [editForm, setEditForm] = useState({ title: '', priority: 'Medium', plannedTime: '1:00', description: '' });

    const load = async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/tasks/default');
            if (data?.success) setTasks(data.data);
        } catch (_) { }
        setLoading(false);
    };

    useEffect(() => {
        load();
    }, []);

    const create = async (e) => {
        e.preventDefault();
        if (!form.title.trim()) return;
        await api.post('/tasks/default', {
            title: form.title.trim(),
            priority: form.priority,
            plannedTime: form.plannedTime,
            description: form.description,
        });
        setForm({ title: '', priority: 'Medium', plannedTime: '1:00', description: '' });
        load();
    };

    const toggle = async (id, on) => {
        await api.patch(`/tasks/default/${id}/${on ? 'deactivate' : 'activate'}`);
        load();
    };

    const startEdit = (task) => {
        setEditId(task._id);
        setEditForm({
            title: task.title || '',
            priority: task.priority || 'Medium',
            plannedTime: task.plannedTime || '1:00',
            description: task.description || '',
        });
    };

    const cancelEdit = () => {
        setEditId(null);
        setEditForm({ title: '', priority: 'Medium', plannedTime: '1:00', description: '' });
    };

    const saveEdit = async (id) => {
        if (!editForm.title.trim()) return;
        await api.put(`/tasks/default/${id}`, {
            title: editForm.title.trim(),
            priority: editForm.priority,
            plannedTime: editForm.plannedTime,
            description: editForm.description,
        });
        cancelEdit();
        load();
    };

    const remove = async (id) => {
        if (!window.confirm('Delete this default task? This will not affect past logs.')) return;
        await api.delete(`/tasks/default/${id}`);
        load();
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Default Tasks</h3>
            <form onSubmit={create} className="card p-3 mb-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Title</label>
                        <input className="input w-full" placeholder="New default task title" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Priority</label>
                        <select className="select w-full" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
                            {['Highest', 'High', 'Medium', 'Low', 'Adhoc'].map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Planned Time (H:MM)</label>
                        <input className="input w-full" value={form.plannedTime} onChange={(e) => setForm((f) => ({ ...f, plannedTime: e.target.value }))} pattern="^\d{1,2}:\d{2}$" placeholder="e.g. 1:00" />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-1">Description</label>
                        <textarea className="input w-full" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
                    </div>
                </div>
                <div className="text-right">
                    <button className="btn-primary">Add</button>
                </div>
            </form>

            {loading ? (
                <div className="text-gray-600">Loading...</div>
            ) : (
                <div className="card divide-y">
                    {tasks.map((t) => (
                        <div key={t._id} className="flex items-center justify-between px-4 py-2">
                            <div className="flex-1 pr-3">
                                {editId === t._id ? (
                                    <div className="space-y-2 w-full">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            <input className="input w-full" value={editForm.title} onChange={(e) => setEditForm((f) => ({ ...f, title: e.target.value }))} />
                                            <select className="select w-full" value={editForm.priority} onChange={(e) => setEditForm((f) => ({ ...f, priority: e.target.value }))}>
                                                {['Highest', 'High', 'Medium', 'Low', 'Adhoc'].map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <input className="input w-full" value={editForm.plannedTime} onChange={(e) => setEditForm((f) => ({ ...f, plannedTime: e.target.value }))} pattern="^\d{1,2}:\d{2}$" placeholder="e.g. 1:00" />
                                            <textarea className="input w-full md:col-span-2" value={editForm.description} onChange={(e) => setEditForm((f) => ({ ...f, description: e.target.value }))} />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button className="btn-primary" onClick={() => saveEdit(t._id)}>Save</button>
                                            <button className="btn-secondary" onClick={cancelEdit}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <div className="font-medium text-gray-800">{t.title}</div>
                                        <div className="text-xs text-gray-500">{t.isActive ? 'Active' : 'Inactive'} • Priority: {t.priority || '-'} • Planned: {t.plannedTime || '-'}</div>
                                        {t.description && (<div className="text-xs text-gray-500 line-clamp-2">{t.description}</div>)}
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                {editId !== t._id && (
                                    <>
                                        <button className="btn-secondary" onClick={() => startEdit(t)}>Edit</button>
                                        <button className="btn-secondary text-red-600" onClick={() => remove(t._id)}>Delete</button>
                                    </>
                                )}
                                <button className="btn-secondary" onClick={() => toggle(t._id, t.isActive)}>
                                    {t.isActive ? 'Deactivate' : 'Activate'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
