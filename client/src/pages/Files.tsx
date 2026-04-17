import { useState, useRef } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Cloud,
  Upload,
  Search,
  Filter,
  Trash2,
  Eye,
  Download,
  Image as ImageIcon,
  Video,
  FileText,
  File,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import FileUploadZone from "@/components/FileUploadZone";
import FileGrid from "@/components/FileGrid";
import FilePreviewModal from "@/components/FilePreviewModal";
import FileDeleteDialog from "@/components/FileDeleteDialog";

export default function Files() {
  const { user, loading: authLoading } = useAuth();
  const [filterType, setFilterType] = useState<"all" | "image" | "video" | "text" | "other">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [previewFile, setPreviewFile] = useState<any>(null);
  const [deleteFile, setDeleteFile] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Queries
  const { data: files = [], isLoading, refetch } = trpc.files.list.useQuery({
    fileType: filterType,
    search: searchQuery,
  });

  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: () => {
      toast.success("File uploaded successfully");
      refetch();
    },
    onError: (error) => {
      toast.error(`Upload failed: ${error.message}`);
    },
  });

  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully");
      setDeleteFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Delete failed: ${error.message}`);
    },
  });

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const file = selectedFiles[0];

    // Validate file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("File size exceeds 100MB limit");
      return;
    }

    // Read file and upload
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64Data = e.target?.result as string;
      const base64Content = base64Data.split(",")[1];

      await uploadMutation.mutateAsync({
        filename: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        data: base64Content,
      });
    };
    reader.readAsDataURL(file);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFile) return;
    await deleteMutation.mutateAsync({ fileId: deleteFile.id });
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
          <h2 className="mt-4 text-xl font-semibold">Authentication Required</h2>
          <p className="mt-2 text-subtle">Please log in to access your files.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card">
        <div className="container py-6">
          <div className="flex items-center gap-3">
            <Cloud className="h-8 w-8 text-accent" />
            <h1 className="text-3xl font-bold">File Manager</h1>
          </div>
          <p className="mt-2 text-subtle">Manage and organize your files securely</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-8">
        {/* Upload Zone */}
        <FileUploadZone
          onFilesSelected={handleFileSelect}
          isUploading={uploadMutation.isPending}
        />

        {/* Controls */}
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter */}
          <div className="flex gap-2">
            <Filter className="h-5 w-5 text-muted-foreground" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as any)}
              className="rounded-lg border border-border bg-input px-3 py-2 text-sm"
            >
              <option value="all">All Files</option>
              <option value="image">Images</option>
              <option value="video">Videos</option>
              <option value="text">Documents</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>

        {/* File Grid */}
        {isLoading ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="skeleton h-48 rounded-lg" />
            ))}
          </div>
        ) : files.length === 0 ? (
          <div className="mt-12 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 py-12">
            <File className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-lg font-medium text-foreground">No files yet</p>
            <p className="mt-1 text-subtle">Upload your first file to get started</p>
          </div>
        ) : (
          <FileGrid
            files={files}
            onPreview={setPreviewFile}
            onDelete={setDeleteFile}
          />
        )}

        {/* Stats */}
        {files.length > 0 && (
          <div className="mt-8 grid gap-4 md:grid-cols-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <File className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-subtle">Total Files</p>
                  <p className="text-2xl font-bold">{files.length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <ImageIcon className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-subtle">Images</p>
                  <p className="text-2xl font-bold">{files.filter((f) => f.fileType === "image").length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <Video className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-subtle">Videos</p>
                  <p className="text-2xl font-bold">{files.filter((f) => f.fileType === "video").length}</p>
                </div>
              </div>
            </div>
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-center gap-3">
                <FileText className="h-5 w-5 text-accent" />
                <div>
                  <p className="text-sm text-subtle">Documents</p>
                  <p className="text-2xl font-bold">{files.filter((f) => f.fileType === "text").length}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        onChange={(e) => handleFileSelect(e.target.files)}
      />

      {/* Modals */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}

      {deleteFile && (
        <FileDeleteDialog
          file={deleteFile}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeleteFile(null)}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
