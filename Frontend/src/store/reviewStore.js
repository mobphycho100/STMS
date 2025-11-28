import { create } from 'zustand';
import api from '../utils/axios';

const useReviewStore = create((set) => ({
    pending: [],
    loading: false,

    load: async (filters = {}) => {
        set({ loading: true });
        try {
            const { data } = await api.get('/reviews/pending', { params: filters });
            if (data?.success) set({ pending: data.data });
        } finally {
            set({ loading: false });
        }
    },

    approve: async (dailyLogId, taskId, comment) => {
        const { data } = await api.post(`/reviews/${dailyLogId}/tasks/${taskId}/approve`, { comment });
        return data?.success;
    },

    reject: async (dailyLogId, taskId, comment) => {
        const { data } = await api.post(`/reviews/${dailyLogId}/tasks/${taskId}/reject`, { comment });
        return data?.success;
    },
}));

export default useReviewStore;
