import { create } from 'zustand';
import api from '../utils/axios';

const useAdminLogStore = create((set) => ({
    tasks: [],
    loading: false,

    loadTasks: async (userId, date) => {
        if (!userId || !date) return;
        set({ loading: true });
        try {
            const resp = await api.get('/tasks/admin', { params: { userId, date } });
            if (resp?.data?.success && Array.isArray(resp.data.data) && resp.data.data.length > 0) {
                set({ tasks: resp.data.data });
            } else {
                // Fallback: derive from daily logs (read-only) to avoid empty UI
                const dl = await api.get('/daily-logs', { params: { userId, date } });
                if (dl?.data?.success) {
                    const log = dl.data.data || {};
                    const mapped = Array.isArray(log.tasks)
                        ? log.tasks.map((t) => ({
                            _id: t.taskId,
                            title: t.title,
                            type: t.type,
                            category: t.category,
                            priority: t.priority,
                            plannedTime: t.plannedTime,
                            actualTime: t.actualTime,
                            status: t.status,
                            reviewStatus: t.reviewStatus,
                            reasonForNonCompletion: t.reasonForNonCompletion,
                        }))
                        : [];
                    set({ tasks: mapped });
                } else {
                    set({ tasks: [] });
                }
            }
        } finally {
            set({ loading: false });
        }
    },

    clear: () => set({ tasks: [] }),
}));

export default useAdminLogStore;
