import React, { useEffect, useState } from 'react';
import api from '../../utils/axios';

export default function DefaultTaskManagerPage() {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [loading, setLoading] = useState(true);

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
        if (!title.trim()) return;
        await api.post('/tasks/default', { title });
        setTitle('');
        load();
    };

    const toggle = async (id, on) => {
        await api.patch(`/tasks/default/${id}/${on ? 'deactivate' : 'activate'}`);
        load();
    };

    return (
        <div>
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Default Tasks</h3>
            <form onSubmit={create} className="flex gap-2 mb-4">
                <input className="input flex-1" placeholder="New default task title" value={title} onChange={(e) => setTitle(e.target.value)} />
                <button className="btn-primary">Add</button>
            </form>

            {loading ? (
                <div className="text-gray-600">Loading...</div>
            ) : (
                <div className="card divide-y">
                    {tasks.map((t) => (
                        <div key={t._id} className="flex items-center justify-between px-4 py-2">
                            <div>
                                <div className="font-medium text-gray-800">{t.title}</div>
                                <div className="text-xs text-gray-500">{t.isActive ? 'Active' : 'Inactive'}</div>
                            </div>
                            <div>
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
