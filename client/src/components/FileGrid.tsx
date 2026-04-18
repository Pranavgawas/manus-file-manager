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
} from "lucide-react";
import { formatFileSize, formatDate } from "@/lib/fileUtils";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface FileGridProps {
  files: FileType[];
  onPreview: (file: FileType) => void;
  onDelete: (file: FileType) => void;
}

function getFileIcon(fileType: string) {
  switch (fileType) {
    case "image":
      return <ImageIcon className="h-8 w-8 text-blue-500" />;
    case "video":
      return <Video className="h-8 w-8 text-purple-500" />;
    case "text":
      return <FileText className="h-8 w-8 text-green-500" />;
    default:
      return <File className="h-8 w-8 text-gray-500" />;
  }
}

export default function FileGrid({ files, onPreview, onDelete }: FileGridProps) {
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
    onError: (error) => {
      toast.error("Download failed");
      setDownloadingId(null);
    },
  });

  const handleDownload = async (fileId: number) => {
    setDownloadingId(fileId);
    await downloadMutation.mutateAsync({ fileId });
  };

  return (
    <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {files.map((file) => (
        <div
          key={file.id}
          className="group flex flex-col rounded-lg border border-border bg-card p-4 transition-smooth hover:shadow-md hover:border-accent/50"
        >
          {/* File Icon */}
          <div className="flex h-24 items-center justify-center rounded-lg bg-muted/10">
            {getFileIcon(file.fileType)}
          </div>

          {/* File Info */}
          <div className="mt-4 flex-1">
            <h3 className="truncate font-medium text-foreground" title={file.filename}>
              {file.filename}
            </h3>
            <p className="mt-1 text-xs text-subtle">
              {formatFileSize(file.size)}
            </p>
            <p className="text-xs text-subtle">
              {formatDate(file.uploadedAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="mt-4 flex gap-1 opacity-100 sm:opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onPreview(file)}
              className="flex-1"
              title="Preview"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => handleDownload(file.id)}
              className="flex-1"
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
