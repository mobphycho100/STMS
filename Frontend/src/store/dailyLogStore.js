import { create } from 'zustand';
import api from '../utils/axios';

const useDailyLogStore = create((set, get) => ({
    log: null,
    loading: false,

    load: async (date, userId) => {
        set({ loading: true });
        try {
            const params = userId ? { date, userId } : { date };
            const { data } = await api.get('/daily-logs', { params });
            if (data?.success) set({ log: data.data });
        } finally {
            set({ loading: false });
        }
    },

    upsert: async (payload) => {
        const { data } = await api.put('/daily-logs', payload);
        if (data?.success) {
            set({ log: data.data });
            return data.data;
        }
        throw new Error(data?.error?.message || 'Failed to save log');
    },

    patchTask: async (dailyLogId, taskId, body) => {
        const { data } = await api.patch(`/daily-logs/${dailyLogId}/tasks/${taskId}`, body);
        if (data?.success) {
            set({ log: data.data });
            return data.data;
        }
        throw new Error(data?.error?.message || 'Failed to update task');
    },
}));

export default useDailyLogStore;
