import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export default function ReportSummaryCard({ report }) {
    if (!report) return null;
    const b = report.summaryInsights || {};
    const growth = report.selfLearningGrowth || {};
    const topicsByTech = (b.newTopicsByTechnology) || {};
    const reviewData = [
        { name: 'Pending Review', value: b.pendingReview ?? 0 },
        { name: 'Approved', value: b.approved ?? 0 },
        { name: 'Rejected', value: b.rejected ?? 0 },
    ];
    const hoursData = [
        { name: 'Practice', hours: report.totalPracticeHours ?? 0 },
        { name: 'Misc', hours: report.totalMiscHours ?? 0 },
        { name: 'Learning', hours: report.totalLearningHours ?? 0 },
    ];
    const activityData = [
        { name: 'Practice Sessions', count: report.totalPracticeSessions ?? 0 },
        { name: 'Doubts', count: report.totalDoubtsLogged ?? 0 },
        { name: 'Concepts', count: report.totalConceptsExplained ?? 0 },
        { name: 'Stand-ups', count: report.standupsPresent ?? 0 },
        { name: 'Sync-ups', count: report.syncupsPresent ?? 0 },
    ];
    const topicBars = Object.entries(topicsByTech || {}).map(([k, v]) => ({ name: k, count: v }));
    const COLORS = ['#f59e0b', '#10b981', '#ef4444'];
    const hero = [
        { label: 'XP Points', value: report.xpPoints ?? 0, bg: 'from-fuchsia-500 to-pink-500' },
        { label: 'Compliance', value: `${report.compliancePercentage ?? 0}%`, bg: 'from-amber-500 to-yellow-500' },
        { label: 'Scheduled', value: report.totalTasksScheduled ?? 0, bg: 'from-sky-500 to-cyan-500' },
        { label: 'Completed', value: report.totalTasksCompleted ?? 0, bg: 'from-emerald-500 to-green-500' },
    ];
    return (
        <div className="card p-4 text-gray-800">
            <div className="text-sm text-gray-600">Month</div>
            <div className="text-xl font-semibold mb-3">{report.month}</div>

            {/* Hero summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                {hero.map((h) => (
                    <div key={h.label} className={`rounded-xl p-[1px] bg-gradient-to-r ${h.bg}`}>
                        <div className="rounded-xl p-3 bg-white flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">{h.label}</div>
                                <div className="text-2xl font-bold text-gray-800">{h.value}</div>
                            </div>
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${h.bg} opacity-20`} />
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded bg-white border">
                    <div className="text-sm font-semibold mb-2">Review Breakdown</div>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie data={reviewData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={3}>
                                    {reviewData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend verticalAlign="bottom" height={24} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="p-3 rounded bg-white border">
                    <div className="text-sm font-semibold mb-2">Activities</div>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={activityData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" hide={false} tick={{ fontSize: 12 }} interval={0} angle={-20} textAnchor="end" height={50} />
                                <YAxis allowDecimals={false} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="p-3 rounded bg-white border">
                    <div className="text-sm font-semibold mb-2">Time Spent (Hours)</div>
                    <div style={{ width: '100%', height: 220 }}>
                        <ResponsiveContainer>
                            <BarChart data={hoursData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Bar dataKey="hours" fill="#14b8a6" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                {topicBars.length > 0 && (
                    <div className="p-3 rounded bg-white border">
                        <div className="text-sm font-semibold mb-2">New Topics by Technology</div>
                        <div style={{ width: '100%', height: 220 }}>
                            <ResponsiveContainer>
                                <BarChart data={topicBars} layout="vertical" margin={{ left: 20 }}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis type="number" allowDecimals={false} />
                                    <YAxis type="category" dataKey="name" width={120} />
                                    <Tooltip />
                                    <Bar dataKey="count" fill="#f97316" radius={[0, 4, 4, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                )}
            </div>

            {/* Remaining stats in hero-tile style */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: 'Pending Tasks', value: b.pending ?? 0, bg: 'from-slate-400 to-slate-600' },
                    { label: 'Pending Review', value: b.pendingReview ?? 0, bg: 'from-gray-400 to-gray-600' },
                    { label: 'Approved', value: b.approved ?? 0, bg: 'from-emerald-500 to-green-500' },
                    { label: 'Rejected', value: b.rejected ?? 0, bg: 'from-rose-500 to-pink-500' },
                    { label: 'Practice Sessions', value: report.totalPracticeSessions ?? 0, bg: 'from-indigo-500 to-purple-500' },
                    { label: 'Practice Hours', value: report.totalPracticeHours ?? 0, bg: 'from-indigo-400 to-indigo-600' },
                    { label: 'Learning Hours', value: report.totalLearningHours ?? 0, bg: 'from-sky-400 to-sky-600' },
                    { label: 'Misc Hours', value: report.totalMiscHours ?? 0, bg: 'from-violet-400 to-violet-600' },
                    { label: 'Doubts Logged', value: report.totalDoubtsLogged ?? 0, bg: 'from-amber-400 to-amber-600' },
                    { label: 'Concepts Explained', value: report.totalConceptsExplained ?? 0, bg: 'from-amber-500 to-yellow-600' },
                    { label: 'Stand-ups Present', value: report.standupsPresent ?? 0, bg: 'from-lime-500 to-green-600' },
                    { label: 'Sync-ups Present', value: report.syncupsPresent ?? 0, bg: 'from-lime-400 to-emerald-600' },
                    { label: 'Total Topics (Ack)', value: growth.totalTopics ?? (report.acknowledgedTopics?.length || 0), bg: 'from-teal-400 to-teal-600' },
                    { label: 'New Topics (This Month)', value: growth.newTopicsCount ?? 0, bg: 'from-teal-500 to-cyan-600' },
                    { label: 'Growth', value: `${growth.growthPercentage ?? 0}%`, bg: 'from-teal-500 to-green-600' },
                    { label: 'Topics Across All Techs', value: b.totalTopicsAcrossTechnologies ?? 0, bg: 'from-teal-400 to-sky-600' },
                ].map((h) => (
                    <div key={h.label} className={`rounded-xl p-[1px] bg-gradient-to-r ${h.bg}`}>
                        <div className="rounded-xl p-3 bg-white flex items-center justify-between">
                            <div>
                                <div className="text-xs text-gray-500">{h.label}</div>
                                <div className="text-2xl font-bold text-gray-800">{h.value}</div>
                            </div>
                            <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${h.bg} opacity-20`} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
