'use client';

import React, { useState, useCallback, useRef } from 'react';
import { Upload, X, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { getBackendUrl, buildStoreHeaders } from '@/lib/medusa-client';

interface ImageUploadProps {
  value?: string[];
  onChange: (urls: string[]) => void;
}

export function ImageUpload({ value = [], onChange }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [urls, setUrls] = useState<string[]>(value);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    setIsUploading(true);
    try {
      const token = localStorage.getItem('access_token');
      const headers = await buildStoreHeaders(token || undefined);
      // Remove Content-Type — FormData sets its own multipart boundary
      const { 'Content-Type': _ct, ...fetchHeaders } = headers as Record<string, string>;

      const formData = new FormData();
      fileArray.forEach((f) => formData.append('files', f));

      const response = await fetch(`${getBackendUrl()}/store/uploads`, {
        method: 'POST',
        headers: fetchHeaders,
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      const newUrls = [...urls, ...data.uploads.map((u: { url: string }) => u.url)];
      setUrls(newUrls);
      onChange(newUrls);
    } catch {
      toast.error('Image upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [urls, onChange]);

  const onFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) uploadFiles(e.target.files);
    e.target.value = '';
  }, [uploadFiles]);

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    // Only clear when the cursor truly leaves the drop zone (not just a child element)
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragging(false);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) uploadFiles(e.dataTransfer.files);
  }, [uploadFiles]);

  const removeImage = (url: string) => {
    const newUrls = urls.filter((u) => u !== url);
    setUrls(newUrls);
    onChange(newUrls);
  };

  return (
    <div className="space-y-4">
      {/* Existing images grid */}
      {urls.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          {urls.map((url) => (
            <div key={url} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-100 border border-slate-200">
              <img src={url} alt="Product" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute top-2 right-2 p-1.5 bg-white/90 text-slate-900 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity shadow-sm hover:text-rose-500"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload images — click or drag and drop"
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        className={[
          'relative rounded-2xl border-2 border-dashed transition-all cursor-pointer',
          'flex flex-col items-center justify-center py-12 px-6 text-center',
          isDragging
            ? 'border-primary bg-primary/5 scale-[1.01]'
            : 'border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-slate-100',
        ].join(' ')}
      >
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*"
          className="hidden"
          onChange={onFileChange}
          disabled={isUploading}
        />
        {isUploading ? (
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-2" />
        ) : (
          <Upload className={['w-8 h-8 mb-3 transition-colors', isDragging ? 'text-primary' : 'text-slate-300'].join(' ')} />
        )}
        <p className="text-sm font-bold text-slate-500">
          {isUploading ? 'Uploading…' : isDragging ? 'Drop to upload' : 'Click or drag images here'}
        </p>
        <p className="text-xs text-slate-400 mt-1">JPG, PNG, WebP — up to 5 images, 1000×1000px recommended</p>

        {urls.length === 0 && !isUploading && (
          <div className="flex items-center gap-2 mt-4 px-4 py-2.5 bg-white rounded-xl border border-slate-100 shadow-sm">
            <ImageIcon className="w-4 h-4 text-slate-300 flex-shrink-0" />
            <p className="text-xs font-medium text-slate-400">No images added yet</p>
          </div>
        )}
      </div>
    </div>
  );
}

