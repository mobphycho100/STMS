import React, { useState, useEffect, useRef } from 'react';

// List of available priorities and statuses
const priorities = ['Highest', 'High', 'Medium', 'Low', 'Adhoc'];
const statuses = ['Yet to Start', 'In Progress', 'On Hold', 'Completed', 'Not Done', 'Carry Forward'];
const taskTypes = ['Practice Session', 'Miscellaneous Tasks', 'Learning'];

export default function CustomTaskForm({ onSubmit, initialData = {} }) {
    const [formData, setFormData] = useState({
        // For add-mode we use `type` dropdown; for edit-mode we keep `title` text
        title: '',
        type: taskTypes[0],
        description: '',
        priority: 'Medium',
        status: 'Yet to Start',
        plannedTime: '1:00',
        actualTime: '0:00',
        remarks: '',
        ...initialData
    });

    const hydratedRef = useRef(false);
    const lastIdRef = useRef(null);
    const toHMM = (time) => {
        if (!time) return '0:00';
        const [hours, minutes] = String(time).split(':');
        return `${parseInt(hours, 10) || 0}:${(minutes || '00').padStart(2, '0')}`;
    };

    useEffect(() => {
        const id = initialData?.id || null;
        if (!hydratedRef.current || lastIdRef.current !== id) {
            if (initialData && id) {
                setFormData({
                    title: initialData.title || '',
                    type: initialData.type || taskTypes[0],
                    description: initialData.description || '',
                    priority: initialData.priority || 'Medium',
                    status: initialData.status || 'Yet to Start',
                    plannedTime: toHMM(initialData.plannedTime || '1:00'),
                    actualTime: toHMM(initialData.actualTime || '0:00'),
                    remarks: initialData.remarks || ''
                });
            } else if (!hydratedRef.current) {
                setFormData(prev => ({
                    ...prev,
                    plannedTime: toHMM(prev.plannedTime || '1:00'),
                    actualTime: toHMM(prev.actualTime || '0:00'),
                }));
            }
            hydratedRef.current = true;
            lastIdRef.current = id;
        }
    }, [initialData?.id]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleTimeChange = (e) => {
        const { name, value } = e.target;
        // Simple validation for H:MM format
        const isValidTime = /^\d{1,2}:\d{2}$/.test(value);
        if (isValidTime || value === '') {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // In add mode we don't have title input; use selected type as title
        const titleToUse = initialData.id ? (formData.title || '').trim() : (formData.type || taskTypes[0]);
        if (!titleToUse) return;

        // Convert times to proper format
        const submissionData = {
            ...formData,
            title: titleToUse,
            description: (formData.description || '').trim(),
            // Ensure times have leading zeros if needed
            plannedTime: formatTime(formData.plannedTime),
            actualTime: formatTime(formData.actualTime)
        };

        onSubmit(submissionData);

        // Reset form if not in edit mode
        if (!initialData.id) {
            setFormData({
                title: '',
                type: taskTypes[0],
                description: '',
                priority: 'Medium',
                status: 'Yet to Start',
                plannedTime: '1:00',
                actualTime: '0:00',
                remarks: ''
            });
        }
    };

    const formatTime = (time) => {
        if (!time) return '0:00';
        const [hours, minutes] = time.split(':');
        return `${parseInt(hours, 10) || 0}:${(minutes || '00').padStart(2, '0')}`;
    };

    return (
        <div className="card p-4">
            <h3 className="font-medium mb-3">{initialData.id ? 'Edit' : 'Add'} Task</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="md:col-span-2">
                        {initialData.id ? (
                            <>
                                <label className="block text-sm mb-1">Title *</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="input w-full"
                                    value={formData.title}
                                    onChange={handleChange}
                                    required
                                />
                            </>
                        ) : (
                            <>
                                <label className="block text-sm mb-1">Type of Task</label>
                                <select
                                    name="type"
                                    className="select w-full"
                                    value={formData.type}
                                    onChange={handleChange}
                                >
                                    {taskTypes.map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Description</label>
                        <textarea
                            name="description"
                            className="input w-full"
                            rows="2"
                            value={formData.description}
                            onChange={handleChange}
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Priority</label>
                        <select
                            name="priority"
                            className="select w-full"
                            value={formData.priority}
                            onChange={handleChange}
                        >
                            {priorities.map(priority => (
                                <option key={priority} value={priority}>{priority}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Status</label>
                        <select
                            name="status"
                            className="select w-full"
                            value={formData.status}
                            onChange={handleChange}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Planned Time (H:MM)</label>
                        <input
                            type="text"
                            name="plannedTime"
                            className="input w-full"
                            value={formData.plannedTime}
                            onChange={handleTimeChange}
                            placeholder="1:30"
                            pattern="\d{1,2}:\d{2}"
                            title="Enter time in H:MM format"
                        />
                    </div>

                    <div>
                        <label className="block text-sm mb-1">Actual Time (H:MM)</label>
                        <input
                            type="text"
                            name="actualTime"
                            className="input w-full"
                            value={formData.actualTime}
                            onChange={handleTimeChange}
                            placeholder="0:00"
                            pattern="\d{1,2}:\d{2}"
                            title="Enter time in H:MM format"
                        />
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-sm mb-1">Remarks</label>
                        <textarea
                            name="remarks"
                            className="input w-full"
                            rows="2"
                            value={formData.remarks}
                            onChange={handleChange}
                        />
                    </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                    <button type="submit" className="btn-primary">
                        {initialData.id ? 'Update' : 'Add'} Task
                    </button>
                </div>
            </form>
        </div>
    );
}
