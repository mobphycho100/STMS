import { create } from 'zustand';
import api from '../utils/axios';

const useUserStore = create((set) => ({
    users: [],
    loading: false,

    loadUsers: async (month) => {
        set({ loading: true });
        try {
            const { data } = await api.get('/users', { params: month ? { month } : {} });
            if (data?.success) set({ users: data.data });
        } finally {
            set({ loading: false });
        }
    },
}));

export default useUserStore;
