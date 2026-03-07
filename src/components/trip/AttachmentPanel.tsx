import { useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { Id } from "../../../convex/_generated/dataModel";
import { api } from "../../../convex/_generated/api";

const FILE_ICONS: Record<string, { icon: string; color: string }> = {
    "application/pdf": { icon: "PDF", color: "bg-red-100 text-red-600" },
    "image/png": { icon: "PNG", color: "bg-blue-100 text-blue-600" },
    "image/jpeg": { icon: "JPG", color: "bg-blue-100 text-blue-600" },
    "image/webp": { icon: "WEBP", color: "bg-blue-100 text-blue-600" },
    "image/gif": { icon: "GIF", color: "bg-purple-100 text-purple-600" },
};

function getFileIcon(fileType: string) {
    if (FILE_ICONS[fileType]) return FILE_ICONS[fileType];
    if (fileType.startsWith("image/")) return { icon: "IMG", color: "bg-blue-100 text-blue-600" };
    return { icon: "FILE", color: "bg-gray-100 text-gray-600" };
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDate(ts: number) {
    return new Date(ts).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
    });
}

interface AttachmentPanelProps {
    tripId: Id<"trips">;
    userRole: "owner" | "editor" | "viewer";
}

const ACCEPTED_TYPES = [
    "application/pdf",
    "image/png",
    "image/jpeg",
    "image/webp",
    "image/gif",
].join(",");

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export function AttachmentPanel({ tripId, userRole }: AttachmentPanelProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<{ url: string; name: string; type: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const attachments = useQuery(api.attachments.getAttachments, { tripId });
    const generateUploadUrl = useMutation(api.attachments.generateUploadUrl);
    const saveAttachment = useMutation(api.attachments.saveAttachment);
    const deleteAttachment = useMutation(api.attachments.deleteAttachment);

    const readOnly = userRole === "viewer";
    const isOwner = userRole === "owner";

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > MAX_FILE_SIZE) {
            alert("File must be under 10 MB.");
            return;
        }

        setUploading(true);
        try {
            const uploadUrl = await generateUploadUrl({ tripId });

            const res = await fetch(uploadUrl, {
                method: "POST",
                headers: { "Content-Type": file.type },
                body: file,
            });

            if (!res.ok) throw new Error("Upload failed");

            const { storageId } = (await res.json()) as { storageId: Id<"_storage"> };

            await saveAttachment({
                tripId,
                storageId,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
            });
        } catch {
            alert("Failed to upload file. Please try again.");
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleDelete = async (attachmentId: Id<"attachments">) => {
        if (!confirm("Delete this attachment?")) return;
        await deleteAttachment({ attachmentId });
    };

    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-800">Trip Documents</h2>
                {!readOnly && (
                    <label
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors ${
                            uploading
                                ? "bg-amber-400 cursor-wait"
                                : "bg-amber-500 hover:bg-amber-600 cursor-pointer"
                        }`}
                    >
                        {uploading ? (
                            <>
                                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Uploading…
                            </>
                        ) : (
                            <>
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                                </svg>
                                Upload File
                            </>
                        )}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={ACCEPTED_TYPES}
                            onChange={handleUpload}
                            disabled={uploading}
                            className="sr-only"
                        />
                    </label>
                )}
            </div>

            {!attachments ? (
                <div className="flex items-center justify-center py-8">
                    <div className="w-5 h-5 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
                </div>
            ) : attachments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
                    <svg className="w-10 h-10 mx-auto text-gray-200 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                    </svg>
                    <p className="text-gray-400 text-sm">
                        No documents yet.{!readOnly && " Upload flight tickets, bookings or images."}
                    </p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50">
                    {attachments.map((att) => {
                        const { icon, color } = getFileIcon(att.fileType);
                        const isImage = att.fileType.startsWith("image/");

                        return (
                            <div
                                key={att._id}
                                className="group flex items-center gap-3 px-5 py-3 hover:bg-gray-50/50 transition-colors"
                            >
                                <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold ${color}`}>
                                    {icon}
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-800 truncate">
                                        {att.fileName}
                                    </p>
                                    <p className="text-xs text-gray-400">
                                        {formatFileSize(att.fileSize)} · {formatDate(att.createdAt)}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                                    {(isImage || att.fileType === "application/pdf") && att.fileUrl && (
                                        <button
                                            onClick={() =>
                                                setPreview({
                                                    url: att.fileUrl!,
                                                    name: att.fileName,
                                                    type: att.fileType,
                                                })
                                            }
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Preview"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        </button>
                                    )}
                                    {att.fileUrl && (
                                        <a
                                            href={att.fileUrl}
                                            download={att.fileName}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Download"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                            </svg>
                                        </a>
                                    )}
                                    {isOwner && (
                                        <button
                                            onClick={() => handleDelete(att._id)}
                                            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
                                            title="Delete"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Preview modal */}
            {preview && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                    onClick={() => setPreview(null)}
                >
                    <div
                        className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full mx-4 max-h-[85vh] flex flex-col overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-800 truncate">
                                {preview.name}
                            </h3>
                            <button
                                onClick={() => setPreview(null)}
                                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-gray-50">
                            {preview.type.startsWith("image/") ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    src={preview.url}
                                    alt={preview.name}
                                    className="max-w-full max-h-[70vh] rounded-lg object-contain"
                                />
                            ) : (
                                <iframe
                                    src={preview.url}
                                    title={preview.name}
                                    className="w-full h-[70vh] rounded-lg border border-gray-200"
                                    sandbox="allow-same-origin"
                                />
                            )}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
