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
  FilePlus,
  ArrowUpDown,
  FileQuestion,
} from "lucide-react";
import { toast } from "sonner";
import FileUploadZone from "@/components/FileUploadZone";
import FileGrid from "@/components/FileGrid";
import FilePreviewModal from "@/components/FilePreviewModal";
import FileDeleteDialog from "@/components/FileDeleteDialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

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
      toast.error(\Upload failed: \\);
    },
  });

  const deleteMutation = trpc.files.delete.useMutation({
    onSuccess: () => {
      toast.success("File deleted successfully");
      setDeleteFile(null);
      refetch();
    },
    onError: (error) => {
      toast.error(\Delete failed: \\);
    },
  });

  const handleFileSelect = async (selectedFiles: FileList | null) => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const fileList = Array.from(selectedFiles);
    
    for (const file of fileList) {
      // Validate file size (100MB max)
      if (file.size > 100 * 1024 * 1024) {
        toast.error(\File "\" exceeds 100MB limit\);
        continue;
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
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteFile) return;
    await deleteMutation.mutateAsync({ fileId: deleteFile.id });
  };

  if (authLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-subtle animate-pulse">Initializing cloud storage...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full border-dashed">
          <CardContent className="pt-10 pb-10 text-center">
            <div className="mx-auto w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mb-6">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-subtle mb-8">Please log in to access your secure file manager and cloud storage.</p>
            <Button className="w-full" size="lg">Log In to Continue</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20 fade-in">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur-md sticky top-0 z-40">
        <div className="container py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Cloud className="h-6 w-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight">Manus Storage</h1>
              </div>
              <p className="mt-1 text-sm text-subtle">Secure, fast, and accessible file management</p>
            </div>
            <div className="flex items-center gap-2">
               <Button variant="outline" size="sm" className="hidden sm:flex" onClick={() => refetch()}>
                 <ArrowUpDown className="h-4 w-4 mr-2" />
                 Refresh
               </Button>
               <Button size="sm" onClick={() => fileInputRef.current?.click()} className="gap-2 shadow-sm">
                 <FilePlus className="h-4 w-4" />
                 Upload File
               </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container py-10 max-w-7xl">
        {/* Upload Zone */}
        <section className="mb-12">
           <FileUploadZone
            onFilesSelected={handleFileSelect}
            isUploading={uploadMutation.isPending}
          />
        </section>

        {/* Dashboard Section */}
        <section>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
            <h2 className="text-xl font-bold flex items-center gap-2">
              Recent Files
              <span className="text-xs font-normal px-2 py-0.5 bg-muted rounded-full text-subtle">
                {files.length}
              </span>
            </h2>
            
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative group sm:w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />       
                <Input
                  placeholder="Search filename..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 bg-card border-border/60"
                />
              </div>

              {/* Filter */}
              <Select value={filterType} onValueChange={(val: any) => setFilterType(val)}>
                <SelectTrigger className="w-full sm:w-[160px] bg-card">
                  <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-muted-foreground" />
                    <SelectValue placeholder="All Files" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Files</SelectItem>
                  <SelectItem value="image">Images</SelectItem>
                  <SelectItem value="video">Videos</SelectItem>
                  <SelectItem value="text">Documents</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* File Grid */}
          {isLoading ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                <div key={i} className="skeleton h-48 rounded-xl" />
              ))}
            </div>
          ) : files.length === 0 ? (
            <Card className="border-dashed bg-card/30">
              <CardContent className="py-20 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <FileQuestion className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-semibold">No files found</h3>
                <p className="text-subtle max-w-xs mx-auto mt-2">
                  {searchQuery || filterType !== "all" 
                    ? "Try adjusting your search or filters to find what you're looking for." 
                    : "Your storage is empty. Start by uploading your first file."}
                </p>
                {(searchQuery || filterType !== "all") && (
                  <Button variant="ghost" className="mt-4" onClick={() => {setSearchQuery(""); setFilterType("all");}}>
                    Clear Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <FileGrid
              files={files}
              onPreview={setPreviewFile}
              onDelete={setDeleteFile}
            />
          )}
        </section>

        {/* Stats Summary */}
        {files.length > 0 && (
          <div className="mt-16 pt-8 border-t border-border/60">
            <h3 className="text-sm font-medium text-subtle uppercase tracking-wider mb-6">Storage Summary</h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-lg group-hover:bg-primary/20 transition-colors">
                    <File className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-subtle">Total Files</p>
                    <p className="text-xl font-bold">{files.length}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-blue-500/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-blue-500/10 rounded-lg group-hover:bg-blue-500/20 transition-colors">
                    <ImageIcon className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-subtle">Images</p>
                    <p className="text-xl font-bold">{files.filter((f) => f.fileType === "image").length}</p>    
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-purple-500/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-colors">
                    <Video className="h-5 w-5 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-subtle">Videos</p>
                    <p className="text-xl font-bold">{files.filter((f) => f.fileType === "video").length}</p>    
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5 hover:border-green-500/30 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="p-2.5 bg-green-500/10 rounded-lg group-hover:bg-green-500/20 transition-colors">
                    <FileText className="h-5 w-5 text-green-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-subtle">Documents</p>
                    <p className="text-xl font-bold">{files.filter((f) => f.fileType === "text").length}</p>     
                  </div>
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
        multiple
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
