import React, { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-toastify';
import api from '../../utils/axios';
import useAuthStore from '../../store/authStore';

// Icons
const IconCheck = () => (
    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const IconLoading = () => (
    <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
);


// Default progress state
const defaultProgress = {
    technologyId: null,
    technologyName: '',
    topics: [],
    topicStatus: {},
    stats: {
        total: 0,
        acknowledged: 0,
        pending: 0
    }
};

export default function TechnologyList() {
    const { user } = useAuthStore();
    const [technologies, setTechnologies] = useState([]);
    const [selectedTechId, setSelectedTechId] = useState(null);
    const [progress, setProgress] = useState(defaultProgress);
    const [loading, setLoading] = useState({
        technologies: true,
        progress: false,
        action: null // 'ack', 'unack', null
    });
    const [progressCache, setProgressCache] = useState({});

    // Fetch all technologies on mount
    useEffect(() => {
        const fetchTechnologies = async () => {
            try {
                setLoading(prev => ({ ...prev, technologies: true }));
                const res = await api.get('/tech');
                const techList = res.data.data || [];
                setTechnologies(techList);

                if (techList.length > 0) {
                    setSelectedTechId(techList[0]._id);
                }
            } catch (error) {
                console.error('Error fetching technologies:', error);
                toast.error('Failed to load technologies');
            } finally {
                setLoading(prev => ({ ...prev, technologies: false }));
            }
        };

        fetchTechnologies();
    }, []);

    // Fetch user progress for selected technology
    const fetchProgress = useCallback(async (techId) => {
        if (!techId) return;

        try {
            setLoading(prev => ({ ...prev, progress: true }));

            const res = await api.get('/skills/progress', {
                params: {
                    technologyId: techId,
                    _t: Date.now() // Cache buster
                }
            });

            if (res.data.success && res.data.data) {
                const { topics = [], topicStatus = {}, ...rest } = res.data.data;

                const newProgress = {
                    ...rest,
                    topics,
                    topicStatus: topics.reduce((acc, topic) => {
                        const tid = topic.topicId;
                        if (tid) acc[tid] = topic.acknowledged;
                        return acc;
                    }, {})
                };

                // Update cache
                setProgressCache(prev => ({
                    ...prev,
                    [techId]: newProgress
                }));

                // Update state
                setProgress(newProgress);
                return newProgress;
            } else {
                throw new Error(res.data.error || 'Failed to fetch progress');
            }
        } catch (error) {
            console.error('Error fetching progress:', error);
            toast.error('Failed to load progress');
            return null;
        } finally {
            setLoading(prev => ({ ...prev, progress: false }));
        }
    }, []);

    // Fetch progress when selected technology changes (no cache)
    useEffect(() => {
        if (selectedTechId) {
            fetchProgress(selectedTechId);
        }
    }, [selectedTechId, fetchProgress]);

    // Toggle topic status (ack/unack)
    const toggleStatus = async (topic) => {
        if (loading.progress || loading.action || !selectedTechId) return;

        const topicId = topic.topicId;
        if (!topicId) {
            console.error('No topic ID provided');
            return;
        }

        const currentStatus = progress.topicStatus?.[topicId] || false;
        const newStatus = !currentStatus;
        const action = newStatus ? 'ack' : 'unack';

        try {
            // Set loading state for this specific action
            setLoading(prev => ({ ...prev, action }));

            // Optimistic update
            const updatedTopicStatus = {
                ...progress.topicStatus,
                [topicId]: newStatus
            };

            const updatedTopics = progress.topics.map(t => {
                const tid = t.topicId;
                return tid === topicId ? { ...t, acknowledged: newStatus } : t;
            });

            const updatedProgress = {
                ...progress,
                topicStatus: updatedTopicStatus,
                topics: updatedTopics,
                stats: {
                    ...progress.stats,
                    acknowledged: newStatus
                        ? progress.stats.acknowledged + 1
                        : Math.max(0, progress.stats.acknowledged - 1),
                    pending: newStatus
                        ? Math.max(0, progress.stats.pending - 1)
                        : progress.stats.pending + 1
                }
            };

            // Update UI optimistically
            setProgress(updatedProgress);
            setProgressCache(prev => ({
                ...prev,
                [selectedTechId]: {
                    ...updatedProgress,
                    _timestamp: Date.now()
                }
            }));

            // Make the API call
            const endpoint = newStatus ? '/skills/progress/ack' : '/skills/progress/unack';
            const response = await api.post(endpoint, {
                technologyId: selectedTechId,
                topicId: topicId,
            });

            if (!response.data?.success) {
                throw new Error(response.data?.error || 'Failed to update status');
            }

            // Refresh data from server to ensure consistency
            await fetchProgress(selectedTechId);

        } catch (error) {
            console.error('Error toggling topic status:', error);

            // Revert optimistic update on error
            const originalProgress = progressCache[selectedTechId] || defaultProgress;
            setProgress(originalProgress);

            // Show error message
            const actionText = newStatus ? 'acknowledge' : 'unacknowledge';
            toast.error(`Failed to ${actionText} topic: ${error.message}`);
        } finally {
            setLoading(prev => ({ ...prev, action: null }));
        }
    };

    // Calculate progress percentage for a technology
    const getProgressPercent = (techId) => {
        const techProgress = techId === selectedTechId ? progress : progressCache[techId];
        if (!techProgress?.topics?.length) return 0;

        const { total = 0, acknowledged = 0 } = techProgress.stats || {};
        return total > 0 ? Math.round((acknowledged / total) * 100) : 0;
    };

    // Render loading skeleton for technologies
    const renderTechSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3].map(i => (
                <div key={i} className="animate-pulse">
                    <div className="h-12 bg-gray-100 rounded-md"></div>
                    <div className="mt-2 h-2 bg-gray-100 rounded-full"></div>
                </div>
            ))}
        </div>
    );

    // Render loading skeleton for topics
    const renderTopicsSkeleton = () => (
        <div className="space-y-3">
            {[1, 2, 3, 4, 5].map(i => (
                <div key={i} className="h-16 bg-gray-100 rounded-md animate-pulse"></div>
            ))}
        </div>
    );

    return (
        <div className="flex flex-col md:flex-row gap-6 p-4 md:p-6">
            {/* Technology List Sidebar */}
            <div className="w-full md:w-64 flex-shrink-0">
                <h3 className="text-lg font-semibold mb-4">My Journey</h3>

                {loading.technologies ? (
                    renderTechSkeleton()
                ) : (
                    <div className="space-y-3">
                        {technologies.map(tech => {
                            const percent = getProgressPercent(tech._id);
                            const isSelected = selectedTechId === tech._id;


                            return (
                                <div key={tech._id} className="relative group">
                                    <button
                                        className={`w-full text-left px-4 py-3 rounded-md transition-all duration-200 ${isSelected
                                            ? 'bg-white shadow-md border-blue-100 border-2'
                                            : 'bg-gray-50 border border-gray-200 hover:border-blue-200 hover:shadow-sm'
                                            }`}
                                        onClick={() => setSelectedTechId(tech._id)}
                                        disabled={loading.progress}
                                    >
                                        <div className="flex items-center justify-between">
                                            <span className={`font-medium ${isSelected ? 'text-blue-700' : 'text-gray-800'}`}>
                                                {tech.name}
                                            </span>
                                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${isSelected
                                                ? 'bg-blue-100 text-blue-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {percent}%
                                            </span>
                                        </div>

                                        <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-green-500 transition-all duration-300"
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                    </button>

                                    {isSelected && (
                                        <div className="absolute left-full top-0 ml-2 hidden group-hover:block">
                                            <div className="bg-white p-2 rounded shadow-lg border border-gray-200 text-xs w-48">
                                                <div className="font-medium mb-1">{tech.name}</div>
                                                <div className="text-gray-600">{tech.description}</div>
                                                <div className="mt-2 flex justify-between text-xs">
                                                    <span className="text-green-600">{Math.round(percent)}% Complete</span>
                                                    <span className="text-gray-500">{progress.topics?.length || 0} topics</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Topic List */}
            <div className="flex-1 min-w-0">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div className="flex-1 min-w-0">
                                <h4 className="text-xl font-semibold text-gray-800 truncate">
                                    {progress.technologyName || 'Select a technology'}
                                </h4>

                                {progress.topics?.length > 0 && (
                                    <div className="mt-1 flex items-center gap-3">
                                        <div className="flex-1 max-w-xs">
                                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-500"
                                                    style={{
                                                        width: `${getProgressPercent(selectedTechId)}%`,
                                                        transition: 'width 0.5s ease-in-out'
                                                    }}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-sm">
                                            <span className="font-medium text-blue-600">
                                                {progress.stats.acknowledged || 0}
                                            </span>
                                            <span className="text-gray-400">/</span>
                                            <span className="text-gray-600">
                                                {progress.stats.total || 0} topics
                                            </span>
                                            <span className="text-blue-500 font-medium">
                                                ({getProgressPercent(selectedTechId)}%)
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {progress.topics?.length > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                        {progress.stats.pending} Pending
                                    </span>
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                        {progress.stats.acknowledged} Completed
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="p-4">
                        {loading.progress ? (
                            renderTopicsSkeleton()
                        ) : progress.topics?.length > 0 ? (
                            <div className="space-y-3">
                                {progress.topics.map((topic, idx) => {
                                    const topicId = topic.topicId;
                                    const isAcknowledged = progress.topicStatus?.[topicId] || false;
                                    const isUpdating = loading.action &&
                                        (loading.action === 'ack' ? isAcknowledged : !isAcknowledged);

                                    return (
                                        <div
                                            key={topic.topicId}
                                            className={`flex items-center justify-between p-4 rounded-lg border transition-colors duration-200 ${isAcknowledged
                                                ? 'bg-green-50 border-green-100'
                                                : 'bg-white hover:bg-gray-50 border-gray-100'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${isAcknowledged
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-gray-100 text-gray-500'
                                                    }`}>
                                                    {idx + 1}
                                                </div>

                                                <div className="min-w-0">
                                                    <div className={`text-sm font-medium ${isAcknowledged ? 'text-green-800' : 'text-gray-800'
                                                        }`}>
                                                        {topic.title}
                                                    </div>

                                                    {topic.description && (
                                                        <div className="text-xs text-gray-500 mt-1 truncate">
                                                            {topic.description}
                                                        </div>
                                                    )}

                                                    {isAcknowledged && topic.acknowledgedAt && (
                                                        <div className="text-xs text-green-600 mt-1">
                                                            Completed on {new Date(topic.acknowledgedAt).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div className="flex-shrink-0 ml-4">
                                                <button
                                                    className={`p-2 rounded-full transition-all duration-200 ${isAcknowledged
                                                        ? 'text-green-600 hover:bg-green-100'
                                                        : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                                                        } ${isUpdating ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    type="button"
                                                    title={isAcknowledged ? 'Mark as not done' : 'Mark as done'}
                                                    onClick={async (e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        await toggleStatus(topic);
                                                    }}
                                                    disabled={loading.action !== null}
                                                >
                                                    {isUpdating ? (
                                                        <IconLoading />
                                                    ) : isAcknowledged ? (
                                                        <IconCheck />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-current" />
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-12">
                                <div className="mx-auto w-16 h-16 text-gray-300 mb-4">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                    </svg>
                                </div>
                                <h4 className="text-lg font-medium text-gray-700 mb-1">
                                    {selectedTechId ? 'No topics found' : 'Select a technology'}
                                </h4>
                                <p className="text-gray-500 max-w-md mx-auto">
                                    {selectedTechId
                                        ? 'This technology does not have any topics yet.'
                                        : 'Choose a technology from the sidebar to view and track your progress.'}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Debug panel - only shown in development */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200 text-xs">
                        <div className="font-medium mb-2 text-gray-700">Debug Info</div>
                        <pre className="text-xs text-gray-600 overflow-auto max-h-40">
                            {JSON.stringify({
                                selectedTechId,
                                loading,
                                topicCount: progress.topics?.length,
                                acknowledged: progress.stats?.acknowledged,
                                cacheKeys: Object.keys(progressCache)
                            }, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
