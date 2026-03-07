import { useState, useRef, useEffect, useCallback } from "react";
import { useAuth, useUser } from "@clerk/react";
import { apiFetch } from "@/lib/api";

interface Comment {
    _id: string;
    userId: string;
    activityId: string;
    userName: string;
    message: string;
    createdAt: string;
}

interface CommentThreadProps {
    activityId: string;
    userRole?: string;
}

export function CommentThread({ activityId, userRole }: CommentThreadProps) {
    const { getToken } = useAuth();
    const { user } = useUser();

    const [comments, setComments] = useState<Comment[] | null>(null);
    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    const count = comments?.length ?? 0;
    const myUserId = user?.id;
    const canWrite = userRole === "Owner" || userRole === "Editor";

    const loadComments = useCallback(async () => {
        try {
            const token = await getToken();
            const data = await apiFetch(`/api/comments/activity/${activityId}`, token);
            setComments(data);
        } catch (err) {
            console.error("Failed to load comments:", err);
        }
    }, [activityId, getToken]);

    useEffect(() => {
        if (open) loadComments();
    }, [open, loadComments]);

    // Auto-scroll to bottom when new comments arrive
    useEffect(() => {
        if (open && scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [comments, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = message.trim();
        if (!trimmed || !canWrite) return;

        setSending(true);
        try {
            const token = await getToken();
            await apiFetch("/api/comments", token, {
                method: "POST",
                body: JSON.stringify({
                    activityId,
                    message: trimmed,
                    userName: user?.fullName || user?.firstName || "User",
                }),
            });
            setMessage("");
            await loadComments();
        } catch (err) {
            console.error("Failed to add comment:", err);
        } finally {
            setSending(false);
        }
    };

    const handleDelete = async (commentId: string) => {
        try {
            const token = await getToken();
            await apiFetch(`/api/comments/${commentId}`, token, { method: "DELETE" });
            await loadComments();
        } catch (err) {
            console.error("Failed to delete comment:", err);
        }
    };

    function timeAgo(ts: string | number) {
        const diff = Date.now() - new Date(ts).getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        const days = Math.floor(hrs / 24);
        return `${days}d ago`;
    }

    function getInitials(name: string) {
        return name
            .split(" ")
            .map((w) => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2);
    }

    return (
        <div className="mt-2">
            {/* Toggle button */}
            <button
                onClick={() => setOpen(!open)}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors py-1"
            >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                <span>
                    {count > 0 ? `${count} comment${count !== 1 ? "s" : ""}` : "Add comment"}
                </span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {/* Thread panel */}
            {open && (
                <div className="mt-1.5 border border-gray-100 rounded-xl overflow-hidden bg-white">
                    {/* Messages */}
                    <div ref={scrollRef} className="max-h-48 overflow-y-auto px-3 py-2 space-y-2.5">
                        {!comments ? (
                            <div className="flex items-center justify-center py-3">
                                <div className="w-3.5 h-3.5 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : comments.length === 0 ? (
                            <p className="text-center text-xs text-gray-300 py-3">No comments yet</p>
                        ) : (
                            comments.map((c) => {
                                const isMine = c.userId === myUserId;
                                return (
                                    <div key={c._id} className={`flex gap-2 ${isMine ? "flex-row-reverse" : ""}`}>
                                        {/* Avatar */}
                                        {!isMine && (
                                            <div className="w-6 h-6 rounded-full bg-gray-800 text-white flex items-center justify-center text-[8px] font-bold shrink-0 mt-0.5">
                                                {getInitials(c.userName)}
                                            </div>
                                        )}
                                        {/* Bubble */}
                                        <div className={`max-w-[80%] group ${isMine ? "text-right" : "text-left"}`}>
                                            {!isMine && (
                                                <p className="text-[9px] font-medium text-gray-400 mb-0.5 ml-0.5">
                                                    {c.userName}
                                                </p>
                                            )}
                                            <div className="relative inline-block">
                                                <div
                                                    className={`px-3 py-1.5 rounded-2xl text-xs leading-relaxed ${isMine
                                                        ? "bg-gray-900 text-white rounded-br-md"
                                                        : "bg-gray-100 text-gray-700 rounded-bl-md"
                                                        }`}
                                                >
                                                    {c.message}
                                                </div>
                                                {/* Delete button — only for own comments, and only if canWrite */}
                                                {isMine && canWrite && (
                                                    <button
                                                        onClick={() => handleDelete(c._id)}
                                                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                        title="Delete"
                                                    >
                                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                )}
                                            </div>
                                            <p className={`text-[8px] text-gray-300 mt-0.5 ${isMine ? "mr-1" : "ml-1"}`}>
                                                {timeAgo(c.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Input — only for owner/editor */}
                    {user && canWrite && (
                        <form onSubmit={handleSubmit} className="border-t border-gray-100 px-3 py-2 flex items-center gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Write a comment..."
                                className="flex-1 text-xs bg-gray-50 border border-gray-100 rounded-full px-3 py-1.5 outline-none focus:border-gray-300 transition-colors placeholder:text-gray-300"
                                disabled={sending}
                            />
                            <button
                                type="submit"
                                disabled={sending || !message.trim()}
                                className="w-7 h-7 rounded-full bg-gray-900 text-white flex items-center justify-center shrink-0 disabled:opacity-30 hover:bg-gray-700 transition-colors"
                            >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                </svg>
                            </button>
                        </form>
                    )}

                    {/* Read-only notice for viewers */}
                    {user && !canWrite && (
                        <div className="border-t border-gray-100 px-3 py-2 text-center">
                            <p className="text-[10px] text-gray-300">View only — editors can comment</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
