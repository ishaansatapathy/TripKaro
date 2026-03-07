import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@clerk/react";
import { apiFetch } from "@/lib/api";
import { ActivityCard } from "./ActivityCard";
import { AddActivityForm } from "./AddActivityForm";

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

interface DayCardProps {
    day: { _id: string; date: string; order: number };
}

function formatDayDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        weekday: "long",
        month: "long",
        day: "numeric",
    });
}

export function DayCard({ day }: DayCardProps) {
    const { getToken } = useAuth();
    const [activities, setActivities] = useState<Activity[] | null>(null);

    const loadActivities = useCallback(async () => {
        try {
            const token = await getToken();
            const data = await apiFetch(`/api/days/${day._id}/activities`, token);
            setActivities(data);
        } catch (err) {
            console.error("Failed to load activities:", err);
        }
    }, [day._id, getToken]);

    useEffect(() => {
        loadActivities();
    }, [loadActivities]);

    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-gray-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">
                            {day.order}
                        </div>
                        <h3 className="font-semibold text-gray-800">{formatDayDate(day.date)}</h3>
                    </div>
                    <span className="text-xs text-gray-400">
                        {activities ? `${activities.length} activit${activities.length === 1 ? "y" : "ies"}` : "..."}
                    </span>
                </div>
            </div>

            <div className="p-4 space-y-3">
                {!activities ? (
                    <div className="flex items-center justify-center py-4">
                        <div className="w-4 h-4 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : activities.length === 0 ? (
                    <p className="text-center text-sm text-gray-400 py-4">No activities yet</p>
                ) : (
                    activities.map((activity) => (
                        <ActivityCard key={activity._id} activity={activity} dayId={day._id} onChanged={loadActivities} />
                    ))
                )}

                <AddActivityForm dayId={day._id} onAdded={loadActivities} />
            </div>
        </div>
    );
}
