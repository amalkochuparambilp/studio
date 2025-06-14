
"use client";

import Image from "next/image";
import React, { useRef, useState, useEffect } from "react";
import { UploadCloudIcon, RefreshCcwIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ImageInputProps {
  id: string;
  onImageSelect: (id: string, dataUrl: string | null) => void;
  currentImage: string | null;
  disabled?: boolean;
  inputHint?: string; // e.g. "portrait scene"
}

export function ImageInput({ id, onImageSelect, currentImage, disabled, inputHint = "image" }: ImageInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [internalPreview, setInternalPreview] = useState<string | null>(null);

  useEffect(() => {
    setInternalPreview(currentImage);
  }, [currentImage]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setInternalPreview(result);
        onImageSelect(id, result);
      };
      reader.readAsDataURL(file);
    } else {
       // If no file is selected (e.g., user cancels file dialog), clear the selection
      if (internalPreview) { // only call if there was a preview before to avoid infinite loop
        setInternalPreview(null);
        onImageSelect(id, null);
      }
    }
     // Reset file input to allow re-uploading the same file
    if (inputRef.current) {
        inputRef.current.value = "";
    }
  };

  const triggerFileSelect = () => {
    if (!disabled) {
      inputRef.current?.click();
    }
  };
  
  const handleClearImage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation(); // Prevent triggering file select if button is inside clickable area
    setInternalPreview(null);
    onImageSelect(id, null);
    if (inputRef.current) {
      inputRef.current.value = ""; // Clear the file input
    }
  };

  return (
    <div className="flex flex-col items-center">
      <div
        onClick={triggerFileSelect}
        className={cn(
          "w-full h-48 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center relative group overflow-hidden",
          "transition-all duration-300 ease-in-out",
          disabled ? "cursor-not-allowed bg-muted/50" : "cursor-pointer hover:border-primary hover:bg-primary/5",
          internalPreview ? "border-solid" : ""
        )}
        role="button"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') triggerFileSelect(); }}
        aria-label={`Upload ${id.replace(/([A-Z])/g, ' $1').toLowerCase()}`}
      >
        {internalPreview ? (
          <>
            <Image
              src={internalPreview}
              alt={`${id} preview`}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-contain p-2"
              data-ai-hint={inputHint}
            />
             {!disabled && (
              <Button
                variant="destructive"
                size="icon"
                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                onClick={handleClearImage}
                aria-label="Clear image"
              >
                <RefreshCcwIcon className="h-4 w-4" />
              </Button>
            )}
          </>
        ) : (
          <div className="text-center text-muted-foreground p-4">
            <UploadCloudIcon className="h-10 w-10 mx-auto mb-2 opacity-70 group-hover:text-primary transition-colors" />
            <p className="text-xs font-body group-hover:text-primary transition-colors">Click or drag to upload</p>
            <p className="text-xs font-body text-muted-foreground/70 mt-1">PNG, JPG, GIF up to 10MB</p>
          </div>
        )}
      </div>
      <input
        id={id}
        ref={inputRef}
        type="file"
        accept="image/png, image/jpeg, image/gif"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled}
        aria-hidden="true"
      />
    </div>
  );
}
