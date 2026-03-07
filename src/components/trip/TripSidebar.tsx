interface TripSidebarProps {
    trip: { _id: string; title: string; startDate: string; endDate: string };
    members: { _id: string; userId: string; role: string }[];
}

function formatDate(dateStr: string) {
    return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    });
}

const roleBadgeColors: Record<string, string> = {
    Owner: "bg-emerald-100 text-emerald-700",
    Editor: "bg-blue-100 text-blue-700",
    Viewer: "bg-gray-100 text-gray-600",
};

export function TripSidebar({ trip, members }: TripSidebarProps) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-6 shadow-sm sticky top-8">
            <div>
                <h1 className="text-2xl font-bold text-gray-900 leading-tight">{trip.title}</h1>
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(trip.startDate)} — {formatDate(trip.endDate)}</span>
                </div>
            </div>

            <div className="border-t border-gray-100 pt-5">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Members</h3>
                <ul className="space-y-2.5">
                    {members.map((member) => (
                        <li key={member._id} className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-semibold">
                                    {member.userId.slice(0, 2).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-700 truncate max-w-[120px]">
                                    {member.userId.split("|").pop()?.slice(0, 12) || member.userId.slice(0, 12)}
                                </span>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeColors[member.role]}`}>
                                {member.role}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}
