# Sandbox File Manager - Project TODO

## Architecture & Setup
- [x] Initialize web-db-user project scaffold
- [ ] Design database schema for files table
- [ ] Set up S3 storage helpers and configuration
- [ ] Create tRPC procedures for file operations

## Backend Implementation
- [x] Create files table in Drizzle schema with metadata fields
- [x] Implement file upload procedure (storagePut integration)
- [x] Implement file list procedure with filtering and search
- [x] Implement file deletion procedure (database + storage cleanup)
- [x] Implement file preview/download procedure
- [x] Add owner-only access control to all procedures
- [x] Write vitest tests for backend procedures

## Frontend - Core Components
- [ ] Design and implement elegant color palette and typography
- [ ] Create DashboardLayout wrapper for authenticated users
- [ ] Build FileUpload component with drag-and-drop support
- [ ] Build FileGrid/FileList display component
- [ ] Build FilePreview modal (images, videos, text)
- [ ] Build FileDeleteDialog confirmation modal
- [ ] Build FileFilter and FileSearch components

## Frontend - Pages & Features
- [ ] Create Files page with dashboard layout
- [ ] Implement file upload with progress indicator
- [ ] Implement file preview functionality
- [ ] Implement file deletion with confirmation
- [ ] Implement file filtering by type (image, video, text)
- [ ] Implement file search by filename
- [ ] Add loading and empty states

## Mobile & Responsive Design
- [ ] Test and optimize layout for mobile screens
- [ ] Implement mobile-friendly file upload (touch targets)
- [ ] Optimize file preview for small screens
- [ ] Add mobile-specific styling and spacing
- [ ] Test on actual mobile devices (iOS/Android)
- [ ] (Optional) Add mobile browser chrome wrapper

## Testing & QA
- [ ] Write vitest tests for all tRPC procedures
- [ ] Test file upload with various file types and sizes
- [ ] Test file deletion and confirmation flow
- [ ] Test filtering and search functionality
- [ ] Test authentication and owner-only access
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Mobile responsiveness validation

## Deployment & Delivery
- [ ] Final code review and cleanup
- [ ] Create checkpoint before publishing
- [ ] Publish to production
- [ ] Validate published site functionality
