export interface File {
  id: number;
  userId: number;
  filename: string;
  storageKey: string;
  mimeType: string;
  size: number;
  fileType: "image" | "video" | "text" | "other";
  uploadedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}
