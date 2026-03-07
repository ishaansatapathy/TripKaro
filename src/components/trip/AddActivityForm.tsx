import { useState } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

interface AddActivityFormProps {
    dayId: string;
    onAdded?: () => void;
}

export function AddActivityForm({ dayId, onAdded }: AddActivityFormProps) {
    const { getToken } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [startTime, setStartTime] = useState("");
    const [endTime, setEndTime] = useState("");
    const [estimatedCost, setEstimatedCost] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        const token = await getToken();
        await apiFetch(`/api/days/${dayId}/activities`, token, {
            method: "POST",
            body: JSON.stringify({
                title: title.trim(),
                description: description.trim() || undefined,
                startTime: startTime || undefined,
                endTime: endTime || undefined,
                estimatedCost: estimatedCost ? Number(estimatedCost) : undefined,
            }),
        });

        setTitle("");
        setDescription("");
        setStartTime("");
        setEndTime("");
        setEstimatedCost("");
        setIsOpen(false);
        onAdded?.();
    };

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="w-full py-2.5 border-2 border-dashed border-gray-200 hover:border-emerald-300 rounded-xl text-sm text-gray-400 hover:text-emerald-600 transition-colors duration-200 flex items-center justify-center gap-2"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Activity
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="bg-emerald-50/50 rounded-xl p-4 border border-emerald-100 space-y-3">
            <input
                type="text"
                placeholder="Activity title *"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
            />

            <textarea
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
            />

            <div className="grid grid-cols-3 gap-2">
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Start</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">End</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                </div>
                <div>
                    <label className="text-xs text-gray-500 mb-1 block">Cost (₹)</label>
                    <input
                        type="number"
                        value={estimatedCost}
                        onChange={(e) => setEstimatedCost(e.target.value)}
                        className="w-full px-2 py-1.5 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                        min="0"
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 pt-1">
                <button
                    type="submit"
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-lg transition-colors"
                >
                    Add Activity
                </button>
                <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
