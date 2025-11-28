import { create } from 'zustand';
import api from '../utils/axios';

const useTaskStore = create((set, get) => ({
    defaultTasks: [],
    customTasks: [],
    loading: false,

    loadDefaultTasks: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/tasks/default?active=true');
            if (data?.success) set({ defaultTasks: data.data });
        } finally {
            set({ loading: false });
        }
    },

    loadCustomTasks: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/tasks/custom');
            if (data?.success) set({ customTasks: data.data });
        } finally {
            set({ loading: false });
        }
    },

    createCustom: async (payload) => {
        const { data } = await api.post('/tasks/custom', payload);
        if (data?.success) {
            await get().loadCustomTasks();
            return data.data;
        }
        throw new Error(data?.error?.message || 'Create failed');
    },

    updateCustom: async (id, payload) => {
        const { data } = await api.put(`/tasks/custom/${id}`, payload);
        if (data?.success) {
            await get().loadCustomTasks();
            return data.data;
        }
        throw new Error(data?.error?.message || 'Update failed');
    },

    deleteCustom: async (id) => {
        const { data } = await api.delete(`/tasks/custom/${id}`);
        if (data?.success) {
            await get().loadCustomTasks();
            return true;
        }
        throw new Error(data?.error?.message || 'Delete failed');
    },
}));

export default useTaskStore;
