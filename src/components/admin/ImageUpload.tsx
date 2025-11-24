// src/components/admin/ImageUpload.tsx

'use client';

import { useState, useCallback } from 'react';
import { CloudUpload, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

interface ImageUploadProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
  folder?: string; // 'dish' or 'general'
}

export function ImageUpload({ value, onChange, maxFiles = 1, folder = 'general' }: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Filter out any empty strings from current value
    const currentValidUrls = value.filter(v => v && v.trim() !== '');

    if (currentValidUrls.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [...currentValidUrls];

    // এনভায়রনমেন্ট ভেরিয়েবল থেকে কনফিগ নেওয়া
    let cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME; 
    let uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (folder === 'dish') {
        cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME_DISHES;
        uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET_DISHES;
    }

    // কনফিগ চেক
    if (!cloudName || !uploadPreset) {
        console.error("Missing Config:", { type: folder, cloudName, uploadPreset });
        toast.error(`Cloudinary config missing for ${folder}. Check .env.local`);
        setIsUploading(false);
        return;
    }

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.message || `Upload failed with status ${res.status}`);
            }

            const data = await res.json();
            if (data.secure_url) {
                uploadedUrls.push(data.secure_url);
            } else {
                throw new Error('Upload successful but no URL returned.');
            }
        }
        onChange(uploadedUrls);
        toast.success('Image uploaded successfully!');
    } catch (error: any) {
        console.error("Upload Logic Error:", error);
        toast.error(`Upload failed: ${error.message}`);
    } finally {
        setIsUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    handleUpload(e.dataTransfer.files);
  }, []);

  const removeImage = (urlToRemove: string) => {
    onChange(value.filter((url) => url !== urlToRemove));
  };

  // ★★★ ফিক্স: শুধুমাত্র ভ্যালিড (ফাঁকা নয়) URL গুলো ফিল্টার করে নেওয়া হচ্ছে ★★★
  const validImages = value.filter(url => url && url.trim() !== '');

  return (
    <div className="space-y-4">
      <div 
        className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => document.getElementById(`file-input-${folder}`)?.click()}
      >
        <input 
            type="file" 
            id={`file-input-${folder}`} 
            className="hidden" 
            accept="image/*" 
            multiple={maxFiles > 1}
            onChange={(e) => handleUpload(e.target.files)}
        />
        {isUploading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p>Uploading...</p>
            </div>
        ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                    <CloudUpload className="h-6 w-6" />
                </div>
                <p className="text-sm font-medium text-foreground">Click to upload or drag and drop</p>
                <p className="text-xs">JPG, PNG, WebP (max {maxFiles} files)</p>
            </div>
        )}
      </div>

      {validImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {validImages.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden border group">
              <Image fill src={url} alt="Uploaded" className="object-cover" unoptimized={true} />
              <button 
                onClick={() => removeImage(url)}
                className="absolute top-1 right-1 h-6 w-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                type="button"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}