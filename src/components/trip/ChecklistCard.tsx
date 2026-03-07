import { useState } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";

interface ChecklistItem {
    _id: string;
    checklistId: string;
    text: string;
    completed: boolean;
}

interface ChecklistItemRowProps {
    item: ChecklistItem;
    readOnly: boolean;
    onChanged?: () => void;
}

function ChecklistItemRow({ item, readOnly, onChanged }: ChecklistItemRowProps) {
    const { getToken } = useAuth();

    const handleToggle = async () => {
        if (readOnly) return;
        const token = await getToken();
        await apiFetch(`/api/checklists/items/${item._id}`, token, {
            method: "PUT",
            body: JSON.stringify({ completed: !item.completed }),
        });
        onChanged?.();
    };

    const handleDelete = async () => {
        const token = await getToken();
        await apiFetch(`/api/checklists/items/${item._id}`, token, { method: "DELETE" });
        onChanged?.();
    };

    return (
        <div className="group flex items-center gap-3 py-1.5">
            <button
                onClick={handleToggle}
                disabled={readOnly}
                className={`shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
                    item.completed
                        ? "bg-emerald-500 border-emerald-500"
                        : "border-gray-300 hover:border-emerald-400"
                } ${readOnly ? "cursor-default" : "cursor-pointer"}`}
            >
                {item.completed && (
                    <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                )}
            </button>
            <span className={`flex-1 text-sm transition-all duration-200 ${
                item.completed ? "text-gray-400 line-through" : "text-gray-700"
            }`}>
                {item.text}
            </span>
            {!readOnly && (
                <button
                    onClick={handleDelete}
                    className="opacity-0 group-hover:opacity-100 p-1 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-all duration-150"
                >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            )}
        </div>
    );
}

interface Checklist {
    _id: string;
    tripId: string;
    title: string;
    items: ChecklistItem[];
}

interface ChecklistCardProps {
    checklist: Checklist;
    readOnly: boolean;
    isOwner: boolean;
    onChanged?: () => void;
}

export function ChecklistCard({ checklist, readOnly, isOwner, onChanged }: ChecklistCardProps) {
    const { getToken } = useAuth();
    const [newItemText, setNewItemText] = useState("");
    const items = checklist.items || [];

    const handleAddItem = async (e: React.FormEvent) => {
        e.preventDefault();
        const text = newItemText.trim();
        if (!text) return;
        const token = await getToken();
        await apiFetch("/api/checklists/items", token, {
            method: "POST",
            body: JSON.stringify({ checklistId: checklist._id, text }),
        });
        setNewItemText("");
        onChanged?.();
    };

    const handleDeleteChecklist = async () => {
        if (!confirm(`Delete "${checklist.title}" and all its items?`)) return;
        const token = await getToken();
        await apiFetch(`/api/checklists/${checklist._id}`, token, { method: "DELETE" });
        onChanged?.();
    };

    const completedCount = items.filter((i) => i.completed).length;
    const totalCount = items.length;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-5 py-3.5 bg-gradient-to-r from-violet-50 to-purple-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                        <svg className="w-4.5 h-4.5 text-violet-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                        </svg>
                        <h3 className="font-semibold text-gray-800 text-sm">{checklist.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                        {totalCount > 0 && (
                            <span className="text-xs text-gray-400">
                                {completedCount}/{totalCount}
                            </span>
                        )}
                        {isOwner && (
                            <button
                                onClick={handleDeleteChecklist}
                                className="p-1 rounded-md hover:bg-red-50 text-gray-300 hover:text-red-500 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {totalCount > 0 && (
                    <div className="mt-2 h-1.5 bg-white/60 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-violet-400 rounded-full transition-all duration-300"
                            style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
                        />
                    </div>
                )}
            </div>

            <div className="px-5 py-3">
                {items.length === 0 ? (
                    <p className="text-center text-xs text-gray-400 py-3">No items yet</p>
                ) : (
                    <div className="divide-y divide-gray-50">
                        {items.map((item) => (
                            <ChecklistItemRow key={item._id} item={item} readOnly={readOnly} onChanged={onChanged} />
                        ))}
                    </div>
                )}

                {!readOnly && (
                    <form onSubmit={handleAddItem} className="mt-2 flex items-center gap-2">
                        <input
                            value={newItemText}
                            onChange={(e) => setNewItemText(e.target.value)}
                            placeholder="Add item..."
                            className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:border-violet-300 focus:ring-1 focus:ring-violet-200 outline-none transition-all placeholder:text-gray-300"
                        />
                        <button
                            type="submit"
                            disabled={!newItemText.trim()}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-violet-500 hover:bg-violet-600 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg transition-colors"
                        >
                            Add
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
