import React, { useState } from 'react';
import useReportStore from '../../store/reportStore';
import ReportSummaryCard from '../../components/ReportSummaryCard';

function currentMonth() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export default function MonthlyReportPage() {
    const [month, setMonth] = useState(currentMonth());
    const { report, generate, get, loading } = useReportStore();

    const onGenerate = async () => {
        await generate(month);
    };

    const onFetch = async () => {
        await get(month);
    };

    return (
        <div className="space-y-3">
            <div className="card p-3 flex items-end gap-3">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Month</label>
                    <input type="month" className="input" value={month} onChange={(e) => setMonth(e.target.value)} />
                </div>
                <button className="btn-primary" onClick={onGenerate} disabled={loading}>{loading ? 'Generating...' : 'Generate'}</button>
                <button className="btn-secondary" onClick={onFetch} disabled={loading}>{loading ? 'Fetching...' : 'Fetch Existing'}</button>
            </div>

            {loading && !report && (
                <div className="card p-4 text-sm text-gray-600">Loading...</div>
            )}

            {!loading && !report && (
                <div className="card p-4 text-sm text-gray-600">No report found for {month}. Click Generate to create one.</div>
            )}

            <ReportSummaryCard report={report} />
        </div>
    );
}
