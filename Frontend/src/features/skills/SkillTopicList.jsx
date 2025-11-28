import React, { useMemo } from 'react';

export default function SkillTopicList({ progress, onToggle, loading = false }) {
    // Memoize the topics to prevent unnecessary re-renders
    const topics = useMemo(() => {
        if (!progress?.topics?.length) return [];
        return progress.topics.map(topic => ({
            ...topic,
            // Ensure we have a stable ID and use topicId as the primary key
            id: topic.topicId,
            // Use the topicStatus map for the current acknowledged state
            acknowledged: progress.topicStatus?.[topic.topicId] || false,
        }));
    }, [progress]);

    if (!progress) return null;

    return (
        <div className="card">
            <div className="px-4 py-2 text-sm font-semibold text-gray-800">
                {progress.technologyName || 'Topics'}
                {loading && <span className="ml-2 text-xs text-gray-500">Loading...</span>}
            </div>
            <ul className="divide-y">
                {topics.map((topic) => {
                    const topicId = topic.topicId;
                    const isAcknowledged = progress.topicStatus?.[topicId] || false;

                    return (
                        <li
                            key={topic.topicId}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm text-gray-800 truncate">
                                    {topic.title || 'Untitled Topic'}
                                </div>
                                {topic.acknowledgedAt && (
                                    <div className="text-xs text-gray-500 mt-1">
                                        Completed: {new Date(topic.acknowledgedAt).toLocaleDateString()}
                                    </div>
                                )}
                            </div>
                            <div className="flex-shrink-0 ml-4">
                                <button
                                    type="button"
                                    onClick={() => onToggle(topic)}
                                    disabled={loading}
                                    className={`p-2 rounded-full ${isAcknowledged
                                        ? 'text-green-600 hover:bg-green-50'
                                        : 'text-gray-400 hover:bg-gray-100'
                                        } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                                    aria-label={isAcknowledged ? 'Mark as not done' : 'Mark as done'}
                                >
                                    {isAcknowledged ? (
                                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <circle cx="12" cy="12" r="10" strokeWidth="2" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </li>
                    );
                })}

                {topics.length === 0 && !loading && (
                    <li className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-500">No topics available</p>
                        <p className="text-xs text-gray-400 mt-1">Check back later or contact support</p>
                    </li>
                )}

                {loading && topics.length === 0 && (
                    <li className="px-4 py-6 text-center">
                        <p className="text-sm text-gray-500">Loading topics...</p>
                    </li>
                )}
            </ul>
        </div>
    );
}

// Add a display name for better debugging
SkillTopicList.displayName = 'SkillTopicList';
