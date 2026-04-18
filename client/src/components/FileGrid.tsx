import { File as FileType } from "@/types";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Download,
  Trash2,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Loader2,
  Play,
  Copy,
  Check,
} from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/fileUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface FileGridProps {
  files: FileType[];
  onPreview: (file: FileType) => void;
  onDelete: (file: FileType) => void;
  viewMode?: "grid" | "gallery";
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "image":
      return <ImageIcon className="h-8 w-8 text-primary" />;
    case "video":
      return <Video className="h-8 w-8 text-primary" />;
    case "text":
      return <FileText className="h-8 w-8 text-primary" />;
    default:
      return <File className="h-8 w-8 text-primary" />;
  }
}

function CopyLinkButton({ url, size = "sm" }: { url?: string; size?: "sm" | "icon" }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!url) return;
    const fullUrl = `${window.location.origin}${url}`;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  if (size === "icon") {
    return (
      <Button
        size="icon"
        variant="secondary"
        className="h-10 w-10 bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20"
        onClick={handleCopy}
        title="Copy link"
      >
        {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
      </Button>
    );
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      onClick={handleCopy}
      className="flex-1 hover:bg-primary/10 hover:text-primary"
      title="Copy link"
    >
      {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
    </Button>
  );
}

export default function FileGrid({ files, onPreview, onDelete, viewMode = "grid" }: FileGridProps) {
  const [downloadingId, setDownloadingId] = useState<number | null>(null);

  const downloadMutation = trpc.files.getDownloadUrl.useMutation({
    onSuccess: (data, variables) => {
      const file = files.find(f => f.id === variables.fileId);
      if (file) {
        const link = document.createElement("a");
        link.href = data.url;
        link.download = file.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
      setDownloadingId(null);
    },
    onError: () => {
      toast.error("Download failed");
      setDownloadingId(null);
    },
  });

  const handleDownload = async (fileId: number) => {
    setDownloadingId(fileId);
    await downloadMutation.mutateAsync({ fileId });
  };

  // ─── Gallery View ─────────────────────────────────────────────────────────
  if (viewMode === "gallery") {
    return (
      <div className="mt-8 grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 animate-fade-in">
        {files.map((file) => {
          const isImage = file.fileType === "image";
          const isVideo = file.fileType === "video";
          const isMedia = isImage || isVideo;

          return (
            <div
              key={file.id}
              className="group relative aspect-square rounded-2xl overflow-hidden bg-muted/20 hover:scale-[1.03] transition-all duration-300 cursor-pointer border border-border/30 hover:border-primary/30 shadow-sm hover:shadow-xl"
              onClick={() => onPreview(file)}
            >
              {/* Media Content */}
              {isImage ? (
                <img
                  src={file.url}
                  alt={file.filename}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  loading="lazy"
                />
              ) : isVideo ? (
                /* Video: show icon overlay (no thumbnail available without video element) */
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-purple-900/50 to-black/60 gap-2">
                  <div className="p-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 group-hover:scale-110 transition-transform">
                    <Play className="h-7 w-7 text-white fill-white" />
                  </div>
                  <span className="text-xs font-semibold text-white/70 px-2 text-center truncate w-full">
                    {file.filename}
                  </span>
                </div>
              ) : (
                /* Other files */
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted/10 p-3">
                  <div className="p-3 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                    {getFileIcon(file.fileType)}
                  </div>
                  <span className="text-xs font-semibold text-subtle px-2 text-center truncate w-full">
                    {file.filename}
                  </span>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                <div className="transform translate-y-3 group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white font-bold truncate text-sm mb-0.5" title={file.filename}>
                    {file.filename}
                  </p>
                  <p className="text-white/60 text-[10px] mb-3">
                    {formatFileSize(file.size)}
                  </p>

                  <div className="flex gap-1.5">
                    <Button
                      size="sm"
                      className="bg-white text-black hover:bg-white/90 font-bold flex-1 h-9 text-xs"
                      onClick={(e) => { e.stopPropagation(); onPreview(file); }}
                    >
                      <Eye className="h-3.5 w-3.5 mr-1.5" />
                      View
                    </Button>
                    <CopyLinkButton url={file.url} size="icon" />
                    <Button
                      size="icon"
                      variant="destructive"
                      className="h-9 w-9 backdrop-blur-md shrink-0"
                      onClick={(e) => { e.stopPropagation(); onDelete(file); }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Type Badge */}
              {isVideo && (
                <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-sm text-[10px] font-bold text-white/80 uppercase tracking-wider">
                  Video
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // ─── Grid View ────────────────────────────────────────────────────────────
  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 animate-fade-in">
      {files.map((file) => (
        <div
          key={file.id}
          className="group flex flex-col rounded-xl border border-border/60 bg-card p-4 transition-smooth hover:shadow-xl hover:border-primary/30 hover:-translate-y-1"
        >
          {/* Thumbnail / Icon */}
          <div
            className="flex h-36 items-center justify-center rounded-lg bg-muted/10 relative overflow-hidden cursor-pointer"
            onClick={() => onPreview(file)}
          >
            {file.fileType === "image" ? (
              <img
                src={file.url}
                className="w-full h-full object-cover rounded-lg"
                alt={file.filename}
                loading="lazy"
              />
            ) : file.fileType === "video" ? (
              <div className="relative w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-900/10 to-black/10 rounded-lg">
                <div className="p-3.5 rounded-full bg-primary/10 border border-primary/20 group-hover:scale-110 transition-transform">
                  <Play className="h-7 w-7 text-primary fill-primary/30" />
                </div>
                <div className="absolute bottom-2 right-2 px-1.5 py-0.5 rounded bg-black/40 text-[10px] font-bold text-white/80 uppercase">
                  Video
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-primary/5 group-hover:bg-primary/10 transition-colors">
                {getFileIcon(file.fileType)}
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="mt-4 flex-1">
            <h3
              className="truncate font-bold text-foreground cursor-pointer hover:text-primary transition-colors"
              title={file.filename}
              onClick={() => onPreview(file)}
            >
              {file.filename}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-subtle">
              <span>{formatFileSize(file.size)}</span>
              <span>•</span>
              <span>{formatDate(file.uploadedAt)}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-1 opacity-100 sm:opacity-0 transition-all duration-300 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPreview(file)}
              className="flex-1 hover:bg-primary/10 hover:text-primary"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <CopyLinkButton url={file.url} />
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(file.id)}
              className="flex-1 hover:bg-primary/10 hover:text-primary"
              title="Download"
              disabled={downloadingId === file.id}
            >
              {downloadingId === file.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDelete(file)}
              className="flex-1 text-destructive hover:text-destructive hover:bg-destructive/10"
              title="Delete"
              disabled={downloadingId === file.id}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
