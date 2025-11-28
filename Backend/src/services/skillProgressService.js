const mongoose = require('mongoose');
const UserSkillProgress = require('../models/UserSkillProgress');
const Technology = require('../models/Technology');

/**
 * Ensure a progress document exists for the user and technology
 * If inserting, initialize topicProgress with technology topics (all unacknowledged)
 */
async function ensureProgressDoc(userId, technologyId, tech) {
    try {
        const initialTopicProgress = (tech?.topics || []).map(t => ({
            topicId: t.topicId,
            title: t.title || 'Untitled Topic',
            acknowledged: false,
            acknowledgedAt: null,
            unacknowledgedAt: null
        }));

        const progress = await UserSkillProgress.findOneAndUpdate(
            {
                userId: new mongoose.Types.ObjectId(userId),
                technologyId: new mongoose.Types.ObjectId(technologyId)
            },
            {
                $setOnInsert: {
                    userId: new mongoose.Types.ObjectId(userId),
                    technologyId: new mongoose.Types.ObjectId(technologyId),
                    topicProgress: initialTopicProgress
                }
            },
            {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true
            }
        );
        return progress;
    } catch (error) {
        console.error('Error in ensureProgressDoc:', error);
        throw error;
    }
}

/**
 * Merge technology topics with user progress
 */
function mergeProgressWithTech(tech, progressDoc) {
    try {
        if (!tech || !tech.topics || !Array.isArray(tech.topics)) {
            console.error('Invalid technology data:', { tech });
            return [];
        }

        // Create a map of topicId to topic data
        const topicMap = new Map();

        // First, add all topics from the technology
        tech.topics.forEach(topic => {
            if (!topic) return;

            const topicId = String(topic.topicId);
            if (!topicId) {
                console.error('Topic missing ID:', topic);
                return;
            }

            topicMap.set(topicId, {
                _id: topic._id,
                topicId,
                title: topic.title || 'Untitled Topic',
                acknowledged: false,
                acknowledgedAt: null,
                unacknowledgedAt: null
            });
        });

        // Then update with progress data if available
        if (progressDoc && Array.isArray(progressDoc.topicProgress)) {
            progressDoc.topicProgress.forEach(tp => {
                if (!tp) return;
                const topicId = String(tp.topicId);
                if (!topicId) return;
                // Only merge when the topic exists on the technology
                if (!topicMap.has(topicId)) return;
                const existingTopic = topicMap.get(topicId);
                topicMap.set(topicId, {
                    ...existingTopic,
                    acknowledged: !!tp.acknowledged,
                    acknowledgedAt: tp.acknowledgedAt || null,
                    unacknowledgedAt: tp.unacknowledgedAt || null
                });
            });
        }

        return Array.from(topicMap.values());
    } catch (error) {
        console.error('Error in mergeProgressWithTech:', error);
        return [];
    }
}

/**
 * Get user's progress for a specific technology
 */
async function getProgress(userId, technologyId) {
    try {
        if (!mongoose.Types.ObjectId.isValid(technologyId)) {
            throw new Error('Invalid technology ID');
        }

        const tech = await Technology.findById(technologyId).lean();
        let progress = null;
        if (userId && mongoose.Types.ObjectId.isValid(userId)) {
            // Ensure document exists (and initialize if inserting)
            await ensureProgressDoc(userId, technologyId, tech);
            progress = await UserSkillProgress.findOne({
                userId: new mongoose.Types.ObjectId(userId),
                technologyId: new mongoose.Types.ObjectId(technologyId)
            }).lean();
        }

        if (!tech) {
            console.error(`Technology not found: ${technologyId}`);
            throw new Error('Technology not found');
        }

        // Clean up DB: remove progress entries for topics not present on the technology
        if (progress && Array.isArray(progress.topicProgress) && tech.topics?.length) {
            const validIdSet = new Set(tech.topics.map(t => String(t.topicId)));
            const extras = progress.topicProgress.filter(tp => !validIdSet.has(String(tp.topicId)));
            if (extras.length > 0) {
                try {
                    await UserSkillProgress.updateOne(
                        {
                            userId: new mongoose.Types.ObjectId(userId),
                            technologyId: new mongoose.Types.ObjectId(technologyId)
                        },
                        {
                            $pull: {
                                topicProgress: {
                                    topicId: { $nin: tech.topics.map(t => t.topicId) }
                                }
                            }
                        }
                    );
                } catch (e) {
                    console.warn('Failed to cleanup extra topicProgress items:', e?.message || e);
                }
            }
            // Add missing topics as unacknowledged
            const currentIds = new Set((progress.topicProgress || []).map(tp => String(tp.topicId)));
            const missing = tech.topics.filter(t => !currentIds.has(String(t.topicId))).map(t => ({
                topicId: t.topicId,
                title: t.title || 'Untitled Topic',
                acknowledged: false,
                acknowledgedAt: null,
                unacknowledgedAt: null
            }));
            if (missing.length > 0) {
                await UserSkillProgress.updateOne(
                    {
                        userId: new mongoose.Types.ObjectId(userId),
                        technologyId: new mongoose.Types.ObjectId(technologyId)
                    },
                    {
                        $push: { topicProgress: { $each: missing } }
                    }
                );
                // Reload progress after add
                progress = await UserSkillProgress.findOne({
                    userId: new mongoose.Types.ObjectId(userId),
                    technologyId: new mongoose.Types.ObjectId(technologyId)
                }).lean();
            }
        }

        console.log('Progress data:', {
            userId,
            technologyId,
            hasTech: !!tech,
            hasProgress: !!progress,
            topicCount: tech.topics?.length || 0,
            progressTopicCount: progress?.topicProgress?.length || 0
        });

        const topics = mergeProgressWithTech(tech, progress || { topicProgress: [] });

        // Create a topicStatus map for easy lookups in the frontend
        const topicStatus = {};
        topics.forEach(topic => {
            if (topic && topic.topicId) {
                topicStatus[topic.topicId] = {
                    acknowledged: !!topic.acknowledged,
                    acknowledgedAt: topic.acknowledgedAt || null
                };
            }
        });

        return {
            technologyId: tech._id.toString(),
            technologyName: tech.name,
            topics: topics,
            topicStatus: topicStatus,
            stats: {
                total: topics.length,
                acknowledged: topics.filter(t => t.acknowledged).length,
                pending: topics.filter(t => !t.acknowledged).length
            },
            // New fields to satisfy strict response requirement
            technology: {
                id: tech._id.toString(),
                name: tech.name,
                description: tech.description || ''
            },
            userProgress: {
                topicProgress: (progress?.topicProgress || []).map(tp => ({
                    topicId: tp.topicId,
                    acknowledged: !!tp.acknowledged,
                    acknowledgedAt: tp.acknowledgedAt || null
                }))
            }
        };
    } catch (error) {
        console.error('Error in getProgress:', {
            error: error.message,
            stack: error.stack,
            userId,
            technologyId
        });

        throw error;
    }
}

/**
 * Acknowledge a topic for a user
 */
async function ackTopic(userId, technologyId, topicId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(technologyId) ||
            !mongoose.Types.ObjectId.isValid(topicId)) {
            throw new Error('Invalid ID format');
        }

        // Find the technology and topic
        const tech = await Technology.findById(technologyId).session(session);
        if (!tech) {
            throw new Error('Technology not found');
        }

        const topic = tech.topics.find(t => String(t.topicId) === String(topicId));

        if (!topic) {
            throw new Error('Topic not found in technology');
        }

        console.log(`Acknowledging topic:`, {
            userId,
            technologyId,
            topicId,
            topicTitle: topic.title
        });

        const baseFilter = {
            userId: new mongoose.Types.ObjectId(userId),
            technologyId: new mongoose.Types.ObjectId(technologyId)
        };

        // Try to update existing topic progress
        const updateRes = await UserSkillProgress.updateOne(
            { ...baseFilter, 'topicProgress.topicId': new mongoose.Types.ObjectId(topicId) },
            {
                $set: {
                    'topicProgress.$.acknowledged': true,
                    'topicProgress.$.acknowledgedAt': new Date(),
                    'topicProgress.$.title': topic.title || 'Untitled Topic',
                    'topicProgress.$.unacknowledgedAt': null
                }
            },
            { session }
        );

        // If no matching array element, push a new one
        if (!updateRes || updateRes.modifiedCount === 0) {
            await UserSkillProgress.updateOne(
                baseFilter,
                {
                    $setOnInsert: baseFilter,
                    $push: {
                        topicProgress: {
                            topicId: topic.topicId,
                            title: topic.title || 'Untitled Topic',
                            acknowledged: true,
                            acknowledgedAt: new Date(),
                            unacknowledgedAt: null
                        }
                    }
                },
                { session, upsert: true }
            );
        }

        await session.commitTransaction();
        session.endSession();

        console.log(`Successfully acknowledged topic ${topicId} for user ${userId}`);

        // Return the updated progress
        return await getProgress(userId, technologyId);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error in ackTopic:', {
            error: error.message,
            stack: error.stack,
            userId,
            technologyId,
            topicId
        });

        throw error;
    }
}

/**
 * Unacknowledge a topic for a user
 */
async function unackTopic(userId, technologyId, topicId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Validate inputs
        if (!mongoose.Types.ObjectId.isValid(technologyId) ||
            !mongoose.Types.ObjectId.isValid(topicId)) {
            throw new Error('Invalid ID format');
        }

        // Find the technology and topic
        const tech = await Technology.findById(technologyId).session(session);
        if (!tech) {
            throw new Error('Technology not found');
        }

        const topic = tech.topics.find(t => String(t.topicId) === String(topicId));

        if (!topic) {
            throw new Error('Topic not found in technology');
        }

        console.log(`Unacknowledging topic:`, {
            userId,
            technologyId,
            topicId,
            topicTitle: topic.title
        });

        // Update the topic progress (if present)
        const baseFilter = {
            userId: new mongoose.Types.ObjectId(userId),
            technologyId: new mongoose.Types.ObjectId(technologyId)
        };
        const result = await UserSkillProgress.updateOne(
            { ...baseFilter, 'topicProgress.topicId': new mongoose.Types.ObjectId(topicId) },
            {
                $set: {
                    'topicProgress.$.acknowledged': false,
                    'topicProgress.$.unacknowledgedAt': new Date(),
                    'topicProgress.$.acknowledgedAt': null
                }
            },
            { session }
        );

        if (!result || result.modifiedCount === 0) {
            console.log(`No matching topic progress found to unacknowledge`);
        }

        await session.commitTransaction();
        session.endSession();

        console.log(`Successfully unacknowledged topic ${topicId} for user ${userId}`);

        // Return the updated progress
        return await getProgress(userId, technologyId);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error in unackTopic:', {
            error: error.message,
            stack: error.stack,
            userId,
            technologyId,
            topicId
        });

        throw error;
    }
}

/**
 * Get user's progress across all technologies
 */
async function getUserProgress(userId) {
    try {
        const progress = await UserSkillProgress.find({ userId })
            .populate('technologyId', 'name description')
            .lean();

        return {
            success: true,
            data: progress.map(p => ({
                technologyId: p.technologyId._id,
                technologyName: p.technologyId.name,
                totalTopics: p.topicProgress.length,
                acknowledgedTopics: p.topicProgress.filter(t => t.acknowledged).length,
                lastUpdated: p.updatedAt
            }))
        };
    } catch (error) {
        console.error('Error in getUserProgress:', error);
        return {
            success: false,
            error: error.message || 'Failed to fetch user progress',
            data: null
        };
    }
}

module.exports = {
    getProgress,
    ackTopic,
    unackTopic,
    getUserProgress
};
