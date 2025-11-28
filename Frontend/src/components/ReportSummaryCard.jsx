import React from 'react';

export default function ReportSummaryCard({ report }) {
    if (!report) return null;
    const b = report.summaryInsights || {};
    return (
        <div className="card p-4 text-gray-800">
            <div className="text-sm text-gray-600">Month</div>
            <div className="text-xl font-semibold mb-3">{report.month}</div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded bg-blue-50">
                    <div className="text-xs text-gray-600">Scheduled</div>
                    <div className="text-lg font-bold text-gray-800">{report.totalTasksScheduled}</div>
                </div>
                <div className="p-3 rounded bg-green-50">
                    <div className="text-xs text-gray-600">Completed</div>
                    <div className="text-lg font-bold text-gray-800">{report.totalTasksCompleted}</div>
                </div>
                <div className="p-3 rounded bg-amber-50">
                    <div className="text-xs text-gray-600">Compliance</div>
                    <div className="text-lg font-bold text-gray-800">{report.compliancePercentage}%</div>
                </div>
                <div className="p-3 rounded bg-gray-50">
                    <div className="text-xs text-gray-600">Pending Review</div>
                    <div className="text-lg font-bold text-gray-800">{b.pendingReview || 0}</div>
                </div>
            </div>
        </div>
    );
}
