import { useState } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { EditActivityModal } from "./EditActivityModal";
import { CommentThread } from "./CommentThread";

interface Activity {
    _id: string;
    dayId: string;
    title: string;
    description?: string;
    startTime?: string;
    endTime?: string;
    estimatedCost?: number;
    order: number;
}

interface ActivityCardProps {
    activity: Activity;
    dayId: string;
    onChanged?: () => void;
}

export function ActivityCard({ activity, onChanged }: ActivityCardProps) {
    const { getToken } = useAuth();
    const [showEdit, setShowEdit] = useState(false);

    const handleDelete = async () => {
        if (!confirm("Delete this activity?")) return;
        const token = await getToken();
        await apiFetch(`/api/activities/${activity._id}`, token, { method: "DELETE" });
        onChanged?.();
    };

    return (
        <>
            <div className="group relative bg-gray-50 hover:bg-white rounded-xl p-4 border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-sm">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm">{activity.title}</h4>

                        {(activity.startTime || activity.endTime) && (
                            <div className="flex items-center gap-1.5 mt-1.5 text-xs text-gray-500">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>
                                    {activity.startTime || "—"}
                                    {activity.endTime && ` → ${activity.endTime}`}
                                </span>
                            </div>
                        )}

                        {activity.description && (
                            <p className="mt-1.5 text-xs text-gray-500 line-clamp-2">{activity.description}</p>
                        )}

                        {activity.estimatedCost !== undefined && activity.estimatedCost > 0 && (
                            <div className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                                <span>₹{activity.estimatedCost.toLocaleString()}</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        <button
                            onClick={() => setShowEdit(true)}
                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                        </button>
                        <button
                            onClick={handleDelete}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>
                </div>

                <CommentThread activityId={activity._id} />
            </div>

            {showEdit && (
                <EditActivityModal activity={activity} onClose={() => setShowEdit(false)} onSaved={onChanged} />
            )}
        </>
    );
}
