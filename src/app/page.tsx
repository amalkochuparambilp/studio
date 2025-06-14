
"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageInput } from "@/components/image-input";
import { useToast } from "@/hooks/use-toast";
import { fuseFaceImage, type FuseFaceImageInput } from "@/ai/flows/fuse-face-image";
import { DownloadIcon, ImageIcon, SmileIcon, SparklesIcon, Wand2Icon, Loader2, GalleryVerticalEnd } from "lucide-react";

export default function FaceWeavePage() {
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [faceImage, setFaceImage] = useState<string | null>(null);
  const [fusedImage, setFusedImage] = useState<string | null>(null);
  const [isFusing, setIsFusing] = useState(false);
  const { toast } = useToast();

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleImageSelect = (id: string, dataUrl: string | null) => {
    if (id === "referenceImage") {
      setReferenceImage(dataUrl);
    } else if (id === "faceImage") {
      setFaceImage(dataUrl);
    }
    // If an image is cleared, clear the fused image as well
    if (!dataUrl) {
        setFusedImage(null);
    }
  };

  const handleFuse = async () => {
    if (!referenceImage || !faceImage) {
      toast({
        title: "Missing Images",
        description: "Please upload both a reference image and a face image.",
        variant: "destructive",
      });
      return;
    }

    setIsFusing(true);
    setFusedImage(null); // Clear previous fused image

    try {
      const input: FuseFaceImageInput = {
        referenceImage: referenceImage,
        faceImage: faceImage,
      };
      const result = await fuseFaceImage(input);
      setFusedImage(result.fusedImage);
      // Removed success toast to align with guidelines (toasts for errors only)
    } catch (error) {
      console.error("Error fusing images:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred during image fusion.";
      toast({
        title: "Fusion Failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsFusing(false);
    }
  };

  const handleDownload = () => {
    if (fusedImage) {
      const link = document.createElement('a');
      link.href = fusedImage;
      link.download = 'faceweave_fused_image.png';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };
  
  if (!isClient) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 flex flex-col items-center selection:bg-primary/30 selection:text-primary-foreground">
      <header className="my-8 md:my-12 text-center">
        <h1 className="text-5xl md:text-6xl font-headline text-primary mb-3 tracking-wide">FaceWeave</h1>
        <p className="text-lg md:text-xl font-body text-muted-foreground max-w-2xl">
          Elegantly fuse faces into images with the power of AI. Upload a reference scene, a face, and let the magic happen.
        </p>
      </header>

      <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="shadow-xl rounded-xl overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
          <CardHeader className="bg-card/50 p-5">
            <CardTitle className="font-headline text-xl flex items-center text-accent-foreground">
              <ImageIcon className="mr-3 h-6 w-6 text-accent" /> Reference Image
            </CardTitle>
            <CardDescription className="font-body text-sm">The main scene or background.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <ImageInput 
              id="referenceImage" 
              onImageSelect={handleImageSelect} 
              currentImage={referenceImage} 
              disabled={isFusing}
              inputHint="portrait scene"
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl rounded-xl overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
          <CardHeader className="bg-card/50 p-5">
            <CardTitle className="font-headline text-xl flex items-center text-accent-foreground">
              <SmileIcon className="mr-3 h-6 w-6 text-accent" /> Face Image
            </CardTitle>
            <CardDescription className="font-body text-sm">The image containing the face to use.</CardDescription>
          </CardHeader>
          <CardContent className="p-5">
            <ImageInput 
              id="faceImage" 
              onImageSelect={handleImageSelect} 
              currentImage={faceImage} 
              disabled={isFusing}
              inputHint="closeup face"
            />
          </CardContent>
        </Card>

        <Card className="shadow-xl rounded-xl overflow-hidden transform transition-all hover:scale-[1.02] duration-300">
          <CardHeader className="bg-card/50 p-5">
            <CardTitle className="font-headline text-xl flex items-center text-accent-foreground">
              <SparklesIcon className="mr-3 h-6 w-6 text-accent" /> Fused Creation
            </CardTitle>
            <CardDescription className="font-body text-sm">Your masterpiece will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="p-5 flex flex-col items-center justify-center min-h-[232px]"> {/* Match ImageInput height */}
            {isFusing && <Loader2 className="h-16 w-16 animate-spin text-primary" />}
            {!isFusing && fusedImage && (
              <div className="relative w-full h-48 rounded-lg overflow-hidden border border-muted-foreground/30">
                 <Image 
                    src={fusedImage} 
                    alt="Fused image" 
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-contain p-1"
                    data-ai-hint="artistic fusion"
                  />
              </div>
            )}
            {!isFusing && !fusedImage && (
              <div className="text-center text-muted-foreground p-4">
                <GalleryVerticalEnd className="h-16 w-16 mx-auto mb-2 opacity-50" />
                <p className="font-body">Awaiting images to weave...</p>
              </div>
            )}
          </CardContent>
          {fusedImage && !isFusing && (
            <CardFooter className="p-5 border-t">
              <Button onClick={handleDownload} className="w-full font-body bg-accent text-accent-foreground hover:bg-accent/90">
                <DownloadIcon className="mr-2 h-5 w-5" /> Download Image
              </Button>
            </CardFooter>
          )}
        </Card>
      </div>

      <Button
        onClick={handleFuse}
        disabled={!referenceImage || !faceImage || isFusing}
        className="px-10 py-7 text-xl font-headline rounded-lg shadow-lg transform transition-all hover:scale-105 active:scale-95 duration-200"
        size="lg"
      >
        {isFusing ? (
          <>
            <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Weaving Magic...
          </>
        ) : (
          <>
            <Wand2Icon className="mr-3 h-6 w-6" /> Fuse Images
          </>
        )}
      </Button>

      <footer className="mt-12 mb-6 text-center">
        <p className="text-sm font-body text-muted-foreground">
          Powered by GenAI & Next.js &bull; FaceWeave &copy; {isClient ? new Date().getFullYear() : ''}
        </p>
      </footer>
    </div>
  );
}
