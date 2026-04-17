import { useState, useRef } from "react";
import { Cloud, Upload } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadZoneProps {
  onFilesSelected: (files: FileList | null) => void;
  isUploading?: boolean;
}

export default function FileUploadZone({ onFilesSelected, isUploading }: FileUploadZoneProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    onFilesSelected(e.dataTransfer.files);
  };

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      className={cn(
        "relative rounded-lg border-2 border-dashed transition-smooth",
        isDragActive
          ? "border-accent bg-accent/5"
          : "border-border bg-card/30 hover:border-accent/50"
      )}
    >
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
        disabled={isUploading}
      />

      <div className="flex flex-col items-center justify-center px-6 py-12 sm:py-16">
        <div className="rounded-full bg-accent/10 p-3">
          <Cloud className="h-8 w-8 text-accent" />
        </div>

        <h3 className="mt-4 text-lg font-semibold text-foreground">
          {isUploading ? "Uploading..." : "Drop files here or click to upload"}
        </h3>

        <p className="mt-2 text-center text-sm text-subtle">
          Supported: Images, videos, and documents up to 100MB
        </p>

        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-smooth hover:bg-accent/90 disabled:opacity-50"
        >
          <Upload className="h-4 w-4" />
          {isUploading ? "Uploading..." : "Select File"}
        </button>
      </div>

      {isUploading && (
        <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-background/50 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent border-t-transparent" />
            <p className="text-sm font-medium text-foreground">Uploading...</p>
          </div>
        </div>
      )}
    </div>
  );
}
