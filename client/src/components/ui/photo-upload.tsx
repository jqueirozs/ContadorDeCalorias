import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadProps {
  onPhotoAnalyzed: (analysis: any) => void;
  onAnalyzing?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function PhotoUpload({ onPhotoAnalyzed, onAnalyzing, disabled, className }: PhotoUploadProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (!file || !file.type.startsWith('image/')) {
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setUploadedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Analyze photo
    setIsAnalyzing(true);
    onAnalyzing?.();
    try {
      // Resize image before sending to API
      const resizedBase64 = await resizeAndConvertToBase64(file);
      const response = await fetch('/api/meals/analyze-photo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ image: resizedBase64 }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to analyze photo: ${response.status} ${errorText}`);
      }

      const analysis = await response.json();
      onPhotoAnalyzed(analysis);
    } catch (error) {
      console.error('Error analyzing photo:', error);
      onPhotoAnalyzed({ error: error.message });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resizeAndConvertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions (max 800px on longest side)
        const maxSize = 800;
        let { width, height } = img;
        
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Draw and compress
        ctx!.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
        resolve(base64);
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const clearImage = () => {
    setUploadedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {uploadedImage ? (
        <div className="relative">
          <img
            src={uploadedImage}
            alt="Uploaded meal"
            className="w-full h-48 object-cover rounded-lg border"
          />
          {!isAnalyzing && (
            <Button
              size="sm"
              variant="destructive"
              className="absolute top-2 right-2"
              onClick={clearImage}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
          {isAnalyzing && (
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
              <div className="text-white text-center">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-2" />
                <p className="text-sm font-medium">Analisando foto com IA...</p>
                <p className="text-xs opacity-80">Identificando alimentos e nutrientes</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div
          className="border-2 border-dashed border-neutral-300 rounded-lg p-8 text-center hover:border-neutral-400 transition-colors"
          onDrop={handleDrop}
          onDragOver={handleDragOver}
        >
          <div className="space-y-4">
            <div className="flex justify-center">
              <Camera className="w-12 h-12 text-neutral-400" />
            </div>
            <div>
              <h3 className="font-medium text-neutral-800 mb-2">
                Adicionar Foto da Refeição
              </h3>
              <p className="text-sm text-neutral-600 mb-4">
                A IA analisará automaticamente os alimentos e nutrientes
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={disabled || isAnalyzing}
                  className="flex items-center space-x-2"
                >
                  <Upload className="w-4 h-4" />
                  <span>Escolher Arquivo</span>
                </Button>
              </div>
              <p className="text-xs text-neutral-500 mt-2">
                Arraste uma imagem aqui ou clique para selecionar
              </p>
            </div>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
      />
    </div>
  );
}