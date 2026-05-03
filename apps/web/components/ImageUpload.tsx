"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, X, Upload, Image as ImageIcon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@stayclose/convex";

// ──────────────────────────────────────────────
// Types
// ──────────────────────────────────────────────

export interface ImageUploadProps {
  onUploadComplete: (storageId: string) => void;
  onUploadError?: (error: string) => void;
  maxSizeMB?: number;
  acceptedTypes?: string[];
  defaultPreview?: string;
}

interface UploadState {
  status: "idle" | "preview" | "uploading" | "success" | "error";
  error?: string;
  previewUrl?: string;
}

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const DEFAULT_MAX_SIZE_MB = 5;
const DEFAULT_ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];

const ACCEPT_STRING = DEFAULT_ACCEPTED_TYPES.join(",");

// ──────────────────────────────────────────────
// Component
// ──────────────────────────────────────────────

export function ImageUpload({
  onUploadComplete,
  onUploadError,
  maxSizeMB = DEFAULT_MAX_SIZE_MB,
  acceptedTypes = DEFAULT_ACCEPTED_TYPES,
  defaultPreview,
}: ImageUploadProps) {
  const [state, setState] = useState<UploadState>({
    status: defaultPreview ? "success" : "idle",
    previewUrl: defaultPreview,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const generateUploadUrl = useMutation(api.friends.generateUploadUrl);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  // ──────────────────────────────────────────────
  // File Handling
  // ──────────────────────────────────────────────

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!acceptedTypes.includes(file.type)) {
        return `Invalid file type. Please upload: ${acceptedTypes
          .map((t) => t.split("/")[1].toUpperCase())
          .join(", ")}`;
      }

      if (file.size > maxSizeBytes) {
        return `File too large. Maximum size is ${maxSizeMB}MB.`;
      }

      return null;
    },
    [acceptedTypes, maxSizeBytes, maxSizeMB]
  );

  const handleFileSelect = useCallback(
    (file: File) => {
      const error = validateFile(file);

      if (error) {
        setState({ status: "error", error });
        onUploadError?.(error);
        return;
      }

      // Create preview
      const previewUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setState({ status: "preview", previewUrl });
    },
    [validateFile, onUploadError]
  );

  const handleInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
      // Reset input so the same file can be selected again
      event.target.value = "";
    },
    [handleFileSelect]
  );

  const handleDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      event.stopPropagation();

      const file = event.dataTransfer.files?.[0];
      if (file) {
        handleFileSelect(file);
      }
    },
    [handleFileSelect]
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.stopPropagation();
  }, []);

  // ──────────────────────────────────────────────
  // Upload Handling
  // ──────────────────────────────────────────────

  const handleUpload = useCallback(async () => {
    if (!selectedFile) return;

    setState((prev) => ({ ...prev, status: "uploading" }));

    try {
      // Get upload URL from Convex
      const uploadUrl = await generateUploadUrl({});

      // Upload file to Convex storage
      const response = await fetch(uploadUrl, {
        method: "POST",
        headers: {
          "Content-Type": selectedFile.type,
        },
        body: selectedFile,
      });

      if (!response.ok) {
        throw new Error("Failed to upload file");
      }

      const { storageId } = await response.json();

      setState({
        status: "success",
        previewUrl: state.previewUrl,
      });

      onUploadComplete(storageId);
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "Upload failed";
      setState({
        status: "error",
        error: errorMsg,
        previewUrl: state.previewUrl,
      });
      onUploadError?.(errorMsg);
    }
  }, [selectedFile, generateUploadUrl, state.previewUrl, onUploadComplete, onUploadError]);

  const handleCancel = useCallback(() => {
    if (state.previewUrl && state.status === "preview") {
      URL.revokeObjectURL(state.previewUrl);
    }
    setSelectedFile(null);
    setState({
      status: defaultPreview ? "success" : "idle",
      previewUrl: defaultPreview,
    });
  }, [state.previewUrl, state.status, defaultPreview]);

  const handleRemove = useCallback(() => {
    if (state.previewUrl) {
      URL.revokeObjectURL(state.previewUrl);
    }
    setSelectedFile(null);
    setState({ status: "idle" });
  }, [state.previewUrl]);

  const triggerFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // ──────────────────────────────────────────────
  // Render
  // ──────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Error Display */}
      <AnimatePresence>
        {state.status === "error" && state.error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700"
          >
            {state.error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPT_STRING}
        onChange={handleInputChange}
        className="hidden"
        aria-label="Upload image"
      />

      {/* Upload Zone / Preview */}
      <AnimatePresence mode="wait">
        {state.status === "idle" && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={triggerFileSelect}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            className="group cursor-pointer"
          >
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="flex h-32 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[var(--border)] bg-[var(--muted)] transition-colors hover:border-[var(--accent)] hover:bg-[var(--accent)]/5"
            >
              <motion.div
                className="mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-[var(--background)]"
                whileHover={{ rotate: 10 }}
              >
                <Camera className="h-5 w-5 text-[var(--muted-foreground)]" />
              </motion.div>
              <p className="text-sm font-medium text-[var(--foreground)]">
                Add photo
              </p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Click or drop image here
              </p>
              <p className="mt-1 text-xs text-[var(--muted-foreground)]">
                Max {maxSizeMB}MB
              </p>
            </motion.div>
          </motion.div>
        )}

        {(state.status === "preview" ||
          state.status === "uploading" ||
          state.status === "success") &&
          state.previewUrl && (
            <motion.div
              key="preview"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative"
            >
              <div className="relative h-40 w-full overflow-hidden rounded-2xl">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={state.previewUrl}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />

                {/* Overlay for uploading state */}
                {state.status === "uploading" && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-black/50"
                  >
                    <motion.div
                      className="h-8 w-8 rounded-full border-2 border-white border-t-transparent"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    />
                    <p className="mt-2 text-sm font-medium text-white">
                      Uploading...
                    </p>
                  </motion.div>
                )}

                {/* Remove button */}
                {state.status === "success" && (
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleRemove}
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/50 text-white transition-colors hover:bg-black/70"
                    aria-label="Remove photo"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                )}
              </div>

              {/* Preview Actions */}
              {state.status === "preview" && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-3 flex gap-3"
                >
                  <button
                    onClick={handleUpload}
                    disabled={state.status === "uploading"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50"
                  >
                    <Upload className="h-4 w-4" />
                    Upload
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={state.status === "uploading"}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 py-2 text-sm font-medium text-[var(--muted-foreground)] transition-colors hover:bg-[var(--muted)] disabled:opacity-50"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}

// ──────────────────────────────────────────────
// Hook for consuming the uploader
// ──────────────────────────────────────────────

export function useImageUpload() {
  const [uploads, setUploads] = useState<
    {
      id: string;
      storageId: string;
      previewUrl?: string;
    }[]
  >([]);

  const addUpload = useCallback(
    (storageId: string, previewUrl?: string) => {
      const id = `upload-${Date.now()}`;
      setUploads((prev) => [...prev, { id, storageId, previewUrl }]);
      return id;
    },
    []
  );

  const removeUpload = useCallback((id: string) => {
    setUploads((prev) => {
      const upload = prev.find((u) => u.id === id);
      if (upload?.previewUrl) {
        URL.revokeObjectURL(upload.previewUrl);
      }
      return prev.filter((u) => u.id !== id);
    });
  }, []);

  const getLatestUpload = useCallback(() => {
    return uploads[uploads.length - 1] ?? null;
  }, [uploads]);

  return {
    uploads,
    addUpload,
    removeUpload,
    getLatestUpload,
  };
}

// ──────────────────────────────────────────────
// Friend Photo Component (for display in cards)
// ──────────────────────────────────────────────

export interface FriendPhotoProps {
  name: string;
  storageId?: string;
  size?: "sm" | "md" | "lg";
}

export function FriendPhoto({ name, storageId, size = "md" }: FriendPhotoProps) {
  const [hasError, setHasError] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const generateUploadUrl = useMutation(api.friends.generateUploadUrl);

  // Get signed URL for the stored image
  // Note: In production, you'd have a separate query to get the signed URL
  // For now, we'll use the storageId directly with Convex's built-in URL pattern
  // or fall back to initials

  const sizeClasses = {
    sm: "h-10 w-10 text-sm",
    md: "h-16 w-16 text-xl",
    lg: "h-20 w-20 text-2xl",
  };

  // If we have a storage ID, try to get the photo
  // In a real implementation, you'd have a query that returns a signed URL
  // For now we'll use a placeholder implementation

  if (!storageId || hasError) {
    return (
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{ scale: 1.05 }}
        className={`flex ${sizeClasses[size]} items-center justify-center rounded-full bg-[var(--muted)] font-semibold text-[var(--foreground)]`}
      >
        {name.charAt(0).toUpperCase()}
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      whileHover={{ scale: 1.05 }}
      className={`${sizeClasses[size]} overflow-hidden rounded-full bg-[var(--muted)]`}
    >
      {/*
        In production, you'd use a signed URL from Convex
        For example: src={getConvexFileUrl(storageId)}
        For now, we show initials as fallback
      */}
      <div
        className={`flex ${sizeClasses[size]} items-center justify-center rounded-full font-semibold`}
      >
        {name.charAt(0).toUpperCase()}
      </div>
    </motion.div>
  );
}

// Helper to generate Convex file URL (in production, this would use a signed URL)
// export function getConvexFileUrl(storageId: string): string {
//   // This would typically come from a Convex query
//   return `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/storage/${storageId}`;
// }
