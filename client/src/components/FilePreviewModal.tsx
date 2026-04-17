import { File as FileType } from "@/types";
import { Button } from "@/components/ui/button";
import { X, Download } from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/fileUtils";

interface FilePreviewModalProps {
  file: FileType;
  onClose: () => void;
}

export default function FilePreviewModal({ file, onClose }: FilePreviewModalProps) {
  const isImage = file.fileType === "image";
  const isVideo = file.fileType === "video";
  const isText = file.fileType === "text";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-card shadow-xl">
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
        <div className="p-6">
          {isImage && (
            <div className="flex justify-center">
              <img
                src={file.storageKey}
                alt={file.filename}
                className="max-h-[60vh] max-w-full rounded-lg object-contain"
              />
            </div>
          )}

          {isVideo && (
            <div className="flex justify-center">
              <video
                src={file.storageKey}
                controls
                className="max-h-[60vh] max-w-full rounded-lg"
              />
            </div>
          )}

          {isText && (
            <div className="rounded-lg bg-muted/10 p-4">
              <p className="whitespace-pre-wrap font-mono text-sm text-foreground">
                [Text preview would display file content here]
              </p>
              <p className="mt-4 text-xs text-subtle">
                Storage Key: {file.storageKey}
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
        <div className="border-t border-border p-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button className="gap-2">
            <Download className="h-4 w-4" />
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}
