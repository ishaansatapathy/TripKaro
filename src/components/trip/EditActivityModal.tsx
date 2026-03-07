import { useState } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

interface Activity {
    _id: string;
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    estimatedCost?: number;
}

interface EditActivityModalProps {
    activity: Activity;
    onClose: () => void;
    onSaved?: () => void;
}

export function EditActivityModal({ activity, onClose, onSaved }: EditActivityModalProps) {
    const { getToken } = useAuth();
    const [title, setTitle] = useState(activity.title);
    const [description, setDescription] = useState(activity.description || "");
    const [startTime, setStartTime] = useState(activity.startTime || "");
    const [endTime, setEndTime] = useState(activity.endTime || "");
    const [estimatedCost, setEstimatedCost] = useState(
        activity.estimatedCost !== undefined ? String(activity.estimatedCost) : ""
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const token = await getToken();
        await apiFetch(`/api/activities/${activity._id}`, token, {
            method: "PUT",
            body: JSON.stringify({
                title: title.trim(),
                description: description.trim() || undefined,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
            }),
        });

        onSaved?.();
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-800">Edit Activity</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3">
                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Title *</label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="text-xs text-gray-500 mb-1 block">Description</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Start</label>
                            <input
                                type="time"
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">End</label>
                            <input
                                type="time"
                                value={endTime}
                                onChange={(e) => setEndTime(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-gray-500 mb-1 block">Cost (₹)</label>
                            <input
                                type="number"
                                value={estimatedCost}
                                onChange={(e) => setEstimatedCost(e.target.value)}
                                className="w-full px-2 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                min="0"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <button
                            type="submit"
                            className="px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                        >
                            Save Changes
                        </button>
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
