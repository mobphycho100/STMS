import { create } from 'zustand';
import api from '../utils/axios';

const useReportStore = create((set) => ({
    report: null,
    loading: false,

    generate: async (month, userId) => {
        set({ loading: true });
        try {
            const { data } = await api.post('/reports/monthly/generate', userId ? { month, userId } : { month });
            if (data?.success) set({ report: data.data });
            return data?.data;
        } finally {
            set({ loading: false });
        }
    },

    get: async (month, userId) => {
        set({ loading: true });
        try {
            const params = userId ? { month, userId } : { month };
            const { data } = await api.get('/reports/monthly', { params });
            if (data?.success) set({ report: data.data });
            return data?.data;
        } catch (err) {
            // Gracefully handle not-found
            if (err?.response?.status === 404) {
                set({ report: null });
                return null;
            }
            throw err;
        } finally {
            set({ loading: false });
        }
    },
}));

export default useReportStore;
