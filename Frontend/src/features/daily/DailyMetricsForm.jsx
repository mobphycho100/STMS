import React, { useState, useEffect } from 'react';

export default function DailyMetricsForm({ initial = {}, onSave }) {
    const [practiceSessionCount, setPractice] = useState(initial.practiceSessionCount || 0);
    const [doubtsLoggedCount, setDoubts] = useState(initial.doubtsLoggedCount || 0);
    const [conceptExplanationCount, setConcepts] = useState(initial.conceptExplanationCount || 0);
    const [standupAttendance, setStandup] = useState(initial.standupAttendance || 'ABSENT');
    const [syncupAttendance, setSyncup] = useState(initial.syncupAttendance || 'ABSENT');

    useEffect(() => {
        setPractice(initial.practiceSessionCount || 0);
        setDoubts(initial.doubtsLoggedCount || 0);
        setConcepts(initial.conceptExplanationCount || 0);
        setStandup(initial.standupAttendance || 'ABSENT');
        setSyncup(initial.syncupAttendance || 'ABSENT');
    }, [initial]);

    const submit = (e) => {
        e.preventDefault();
        onSave({ practiceSessionCount, doubtsLoggedCount, conceptExplanationCount, standupAttendance, syncupAttendance });
    };

    return (
        <form onSubmit={submit} className="card p-4 space-y-3">
            <div className="text-sm font-semibold text-gray-800">Daily Metrics</div>
            <div className="grid grid-cols-2 gap-3">
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Practice Sessions</label>
                    <input type="number" min="0" className="input" value={practiceSessionCount} onChange={(e) => setPractice(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Doubts Logged</label>
                    <input type="number" min="0" className="input" value={doubtsLoggedCount} onChange={(e) => setDoubts(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs text-gray-600 mb-1">Concept Explanations</label>
                    <input type="number" min="0" className="input" value={conceptExplanationCount} onChange={(e) => setConcepts(e.target.value)} />
                </div>
                <div className="flex items-end gap-3">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Stand-up</label>
                        <select className="select" value={standupAttendance} onChange={(e) => setStandup(e.target.value)}>
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                        </select>
                    </div>
                    <div className="flex-1">
                        <label className="block text-xs text-gray-600 mb-1">Sync-up</label>
                        <select className="select" value={syncupAttendance} onChange={(e) => setSyncup(e.target.value)}>
                            <option value="PRESENT">PRESENT</option>
                            <option value="ABSENT">ABSENT</option>
                        </select>
                    </div>
                </div>
            </div>
            <div className="pt-2">
                <button className="btn-primary">Save Metrics</button>
            </div>
        </form>
    );
}
