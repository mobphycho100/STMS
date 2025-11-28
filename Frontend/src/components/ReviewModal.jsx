import React, { useState } from 'react';
import Modal from './Modal';

export default function ReviewModal({ open, title, onClose, onSubmit }) {
    const [comment, setComment] = useState('');
    const submit = (e) => {
        e.preventDefault();
        onSubmit(comment);
        setComment('');
    };
    return (
        <Modal open={open} title={title} onClose={onClose}>
            <form onSubmit={submit} className="space-y-3">
                <div>
                    <label className="block text-sm text-gray-600 mb-1">Comment (optional)</label>
                    <textarea className="w-full border rounded px-3 py-2" value={comment} onChange={(e) => setComment(e.target.value)} />
                </div>
                <div className="flex justify-end gap-2">
                    <button type="button" className="px-3 py-2 rounded bg-gray-200" onClick={onClose}>Cancel</button>
                    <button className="px-3 py-2 rounded bg-blue-600 text-white">Submit</button>
                </div>
            </form>
        </Modal>
    );
}
