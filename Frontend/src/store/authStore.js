import { create } from 'zustand';
import api from '../utils/axios';

const useAuthStore = create((set, get) => ({
    user: null,
    initializing: true,

    setUser: (user) => set({ user }),
    clearUser: () => set({ user: null }),

    init: async () => {
        if (!get().initializing) return;
        try {
            const { data } = await api.get('/auth/me');
            if (data?.success) {
                const { user } = data.data;
                set({ user });
            } else {
                set({ user: null });
            }
        } catch {
            set({ user: null });
        } finally {
            set({ initializing: false });
        }
    },

    login: async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        if (data?.success) {
            const { user } = data.data;
            set({ user });
            return user;
        }
        throw new Error(data?.error?.message || 'Login failed');
    },

    signup: async (payload) => {
        const { data } = await api.post('/auth/signup', payload);
        if (data?.success) {
            const { user } = data.data;
            set({ user });
            return user;
        }
        throw new Error(data?.error?.message || 'Signup failed');
    },

    logout: async () => {
        try {
            await api.post('/auth/logout');
        } catch { }
        set({ user: null });
    },
}));

export default useAuthStore;
