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

    approve: async (taskId, comment) => {
        const { data } = await api.post(`/reviews/tasks/${taskId}/approve`, { comment });
        if (data?.success) {
            set((state) => ({ pending: state.pending.filter((i) => i.taskId !== taskId) }));
            return true;
        }
        return false;
    },

    reject: async (taskId, comment) => {
        const { data } = await api.post(`/reviews/tasks/${taskId}/reject`, { comment });
        if (data?.success) {
            set((state) => ({ pending: state.pending.filter((i) => i.taskId !== taskId) }));
            return true;
        }
        return false;
    },
}));

export default useReviewStore;
