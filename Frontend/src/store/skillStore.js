import { create } from 'zustand';
import api from '../utils/axios';

const useSkillStore = create((set, get) => ({
    technologies: [],
    progress: null,
    loading: false,
    selectedTechId: null,

    loadTechnologies: async () => {
        set({ loading: true });
        try {
            const { data } = await api.get('/technologies');
            if (data?.success) set({ technologies: data.data });
        } finally {
            set({ loading: false });
        }
    },

    selectTechnology: async (technologyId) => {
        set({ selectedTechId: technologyId, loading: true });
        try {
            const { data } = await api.get('/skills/progress', { params: { technologyId } });
            if (data?.success) set({ progress: data.data });
        } finally {
            set({ loading: false });
        }
    },

    ack: async (technologyId, topicId) => {
        const { data } = await api.post('/skills/progress/ack', { technologyId, topicId });
        if (data?.success) set({ progress: data.data });
    },

    unack: async (technologyId, topicId) => {
        const { data } = await api.post('/skills/progress/unack', { technologyId, topicId });
        if (data?.success) set({ progress: data.data });
    },
}));

export default useSkillStore;
