import { File as FileType } from "@/types";
import { Button } from "@/components/ui/button";
import { X, Download, Loader2 } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/fileUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface FilePreviewModalProps {
  file: FileType;
  onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const isImage = file.fileType === "image";
  const isVideo = file.fileType === "video";
  const isText = file.fileType === "text";
  const [isDownloading, setIsDownloading] = useState(false);

  const downloadMutation = trpc.files.getDownloadUrl.useMutation({
    onSuccess: (data) => {
      // Create a temporary link and click it to trigger download
      const link = document.createElement("a");
      link.href = data.url;
      link.download = file.filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setIsDownloading(false);
    },
    onError: (error) => {
      toast.error("Download failed");
      setIsDownloading(false);
    },
  });

  const handleDownload = async () => {
    setIsDownloading(true);
    await downloadMutation.mutateAsync({ fileId: file.id });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-hidden flex flex-col rounded-lg bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-4">
          <div className="min-w-0 flex-1">
            <h2 className="truncate font-semibold text-foreground" title={file.filename}>
              {file.filename}
            </h2>
            <p className="mt-1 text-sm text-subtle">
              {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
            </p>
          </div>
          <button
            onClick={onClose}
            className="ml-4 rounded-lg p-2 hover:bg-muted/20"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-6">
          {isImage && (
            <div className="flex justify-center">
              <img
                src={file.url}
                alt={file.filename}
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
              />
            </div>
          )}

          {isVideo && (
            <div className="flex justify-center">
              <video
                src={file.url}
                controls
                className="max-h-[60vh] max-w-full rounded-lg"
              />
            </div>
          )}

          {isText && (
            <div className="rounded-lg bg-muted/10 p-4">
              <p className="whitespace-pre-wrap font-mono text-sm text-foreground">
                [Text preview for: {file.filename}]
                \n\nStorage Path: {file.storageKey}
                \n\nClick Download to view full content.
              </p>
            </div>
          )}

          {!isImage && !isVideo && !isText && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-lg font-medium text-foreground">
                Preview not available
              </p>
              <p className="mt-2 text-subtle">
                This file type cannot be previewed in the browser
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-border p-4 flex justify-end gap-2 bg-muted/5">
          <Button variant="outline" onClick={onClose} disabled={isDownloading}>
            Close
          </Button>
          <Button onClick={handleDownload} disabled={isDownloading} className="gap-2">
            {isDownloading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
