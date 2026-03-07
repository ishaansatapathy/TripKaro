import { useState } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

interface AddDayButtonProps {
    tripId: string;
    onAdded?: () => void;
}

export function AddDayButton({ tripId, onAdded }: AddDayButtonProps) {
    const { getToken } = useAuth();
    const [showForm, setShowForm] = useState(false);
    const [date, setDate] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!date) return;
        const token = await getToken();
        await apiFetch(`/api/trips/${tripId}/days`, token, {
            method: "POST",
            body: JSON.stringify({ date }),
        });
        setDate("");
        setShowForm(false);
        onAdded?.();
    };

    if (!showForm) {
        return (
            <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors duration-200 shadow-sm"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                </svg>
                Add Day
            </button>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                autoFocus
            />
            <button
                type="submit"
                className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-medium rounded-xl transition-colors"
            >
                Add
            </button>
            <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-3 py-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
                Cancel
            </button>
        </form>
    );
}
