import { File as FileType } from "@/types";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface FileDeleteDialogProps {
  file: FileType;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function FileDeleteDialog({
  file,
  onConfirm,
  onCancel,
  isDeleting,
}: FileDeleteDialogProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-lg bg-card shadow-xl">
        <div className="flex items-center gap-3 border-b border-border p-6">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <h2 className="text-lg font-semibold text-foreground">Delete File</h2>
        </div>

        <div className="p-6">
          <p className="text-foreground">
            Are you sure you want to delete <span className="font-semibold">{file.filename}</span>?
          </p>
          <p className="mt-2 text-sm text-subtle">
            This action cannot be undone. The file will be permanently removed.
          </p>
        </div>

        <div className="flex gap-3 border-t border-border p-6">
          <Button
            variant="outline"
            onClick={onCancel}
            disabled={isDeleting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>
    </div>
  );
}
