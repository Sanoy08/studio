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

    if (value.length + files.length > maxFiles) {
      toast.error(`Maximum ${maxFiles} images allowed.`);
      return;
    }

    setIsUploading(true);
    const uploadedUrls: string[] = [...value];

    // এনভায়রনমেন্ট ভেরিয়েবল থেকে কনফিগ নেওয়া
    let cloudName = process.env.CLOUDINARY_CLOUD_NAME; 
    let uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

    if (folder === 'dish') {
        cloudName = process.env.CLOUDINARY_CLOUD_NAME_DISHES;
        uploadPreset = process.env.CLOUDINARY_UPLOAD_PRESET_DISHES;
    }

    // কনফিগ চেক
    if (!cloudName || !uploadPreset) {
        toast.error("Cloudinary configuration missing in .env.local");
        console.error("Missing Cloudinary Config:", { cloudName, uploadPreset, folder });
        setIsUploading(false);
        return;
    }

    try {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', uploadPreset);

            // ডিবাগিংয়ের জন্য লগ
            console.log(`Uploading to: https://api.cloudinary.com/v1_1/${cloudName}/image/upload`);

            const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorText = await res.text();
                console.error("Cloudinary Upload Failed:", res.status, errorText);
                throw new Error(`Cloudinary Error (${res.status}): ${errorText}`);
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
        console.error("Upload Error Details:", error);
        toast.error(`Upload failed. Check console for details.`);
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

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {value.map((url, index) => (
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