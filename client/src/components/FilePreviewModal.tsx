import { File as FileType } from "@/types";
import {
  X,
  Download,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Calendar,
  HardDrive,
  Copy,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatFileSize, formatDate } from "@/lib/fileUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState, useEffect } from "react";

interface FilePreviewModalProps {
  file: FileType;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
}

export default function FilePreviewModal({
  file,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
}: FilePreviewModalProps) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight" && hasNext && onNext) onNext();
      if (e.key === "ArrowLeft" && hasPrev && onPrev) onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev, hasNext, hasPrev]);

  const downloadMutation = trpc.files.getDownloadUrl.useMutation({
    onSuccess: (data) => {
      const link = document.createElement("a");
      link.href = data.url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    },
    onError: () => {
      toast.error("Download failed");
      setIsDownloading(false);
    },
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadMutation.mutateAsync({ fileId: file.id });
  };

  const handleCopyLink = () => {
    const fullUrl = file.url ? `${window.location.origin}${file.url}` : "";
    if (!fullUrl) return;
    navigator.clipboard.writeText(fullUrl).then(() => {
      setCopied(true);
      toast.success("Link copied to clipboard");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-0 md:p-8 animate-fade-in">
      <div 
        className="absolute inset-0 bg-black/95 backdrop-blur-sm" 
        onClick={onClose} 
      />
      
      {/* Lightbox Container */}
      <div className="relative w-full h-full max-w-7xl flex flex-col md:flex-row glass border-none shadow-2xl overflow-hidden rounded-none md:rounded-3xl animate-scale-in">
        
        {/* Main Preview Area */}
        <div className="flex-1 relative flex items-center justify-center bg-black/40 group">
          {/* Close Button (Mobile) */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 rounded-full bg-black/20 text-white hover:bg-black/40 md:hidden"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* Navigation Arrows */}
          {hasPrev && (
            <button
              onClick={onPrev}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>
          )}
          {hasNext && (
            <button
              onClick={onNext}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 p-4 rounded-full bg-white/5 text-white/50 hover:text-white hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100 hidden md:block"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          )}

          {/* Content */}
          <div className="w-full h-full flex items-center justify-center p-4">
            {file.fileType === "image" ? (
              <img
                key={file.id}
                src={file.url}
                alt={file.filename}
                className="max-w-full max-h-full object-contain shadow-2xl animate-fade-in"
              />
            ) : file.fileType === "video" ? (
              <video
                key={file.id}
                src={file.url}
                controls
                autoPlay
                className="max-w-full max-h-full shadow-2xl animate-fade-in"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-white/80 gap-6">
                <div className="p-10 rounded-3xl bg-white/5 border border-white/10 shadow-2xl">
                  <Maximize2 className="h-20 w-20 text-primary opacity-50" />
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold mb-2">Preview Unavailable</p>
                  <p className="text-white/40 max-w-xs">
                    This file type ({file.mimeType}) cannot be viewed directly in the gallery.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="w-full md:w-[380px] bg-card/80 backdrop-blur-xl border-l border-white/5 flex flex-col shrink-0">
          <div className="p-8 flex-1 overflow-y-auto">
            <div className="flex justify-between items-start mb-8">
              <h2 className="text-2xl font-extrabold tracking-tight break-all leading-tight">
                {file.filename}
              </h2>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full hover:bg-muted hidden md:flex"
                onClick={onClose}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                <div className="p-3 bg-primary/10 rounded-xl">
                  <HardDrive className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-xs font-bold text-subtle uppercase tracking-wider">File Size</p>
                  <p className="font-bold">{formatFileSize(file.size)}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30">
                <div className="p-3 bg-blue-500/10 rounded-xl">
                  <Calendar className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-xs font-bold text-subtle uppercase tracking-wider">Uploaded On</p>
                  <p className="font-bold">{formatDate(file.uploadedAt)}</p>
                </div>
              </div>

              <div className="pt-4">
                <p className="text-xs font-bold text-subtle uppercase tracking-wider mb-3 px-1">Storage Path</p>
                <div className="px-3 py-2 bg-muted/20 rounded-lg border border-border/50 text-xs font-mono break-all text-subtle leading-relaxed">
                  {file.storageKey}
                </div>
              </div>
            </div>
          </div>

          {/* Action Footer */}
          <div className="p-6 border-t border-white/5 bg-black/5 flex flex-col gap-3">
            {/* Copy Link */}
            <Button
              variant="outline"
              onClick={handleCopyLink}
              className="w-full h-11 font-semibold gap-2"
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>

            <Button
              onClick={handleDownload}
              disabled={isDownloading}
              className="w-full h-14 text-lg font-bold gap-3 shadow-xl"
            >
              {isDownloading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
              Download Original
            </Button>
            <Button variant="ghost" onClick={onClose} className="w-full h-10 font-semibold text-muted-foreground hover:text-foreground">
              Close Preview
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
