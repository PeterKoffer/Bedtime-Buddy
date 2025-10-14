import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, X, Camera, Sparkles } from 'lucide-react';

interface PhotoUploadProps {
  photos: string[];
  onPhotosChange: (photos: string[]) => void;
  maxPhotos?: number;
}

export default function PhotoUpload({ photos, onPhotosChange, maxPhotos = 4 }: PhotoUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = (files: FileList) => {
    const newPhotos = [...photos];
    
    Array.from(files).forEach((file) => {
      if (newPhotos.length >= maxPhotos) return;
      
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const result = e.target?.result as string;
          if (result && newPhotos.length < maxPhotos) {
            newPhotos.push(result);
            onPhotosChange([...newPhotos]);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removePhoto = (index: number) => {
    const newPhotos = photos.filter((_, i) => i !== index);
    onPhotosChange(newPhotos);
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="premium-card">
      <CardHeader className="text-center">
        <div className="relative mb-4">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full blur-xl opacity-30 animate-pulse"></div>
          <Camera className="h-12 w-12 text-purple-300 mx-auto relative z-10" />
        </div>
        <CardTitle className="text-2xl font-bold text-white">
          📸 Upload Your Child's Photos
        </CardTitle>
        <CardDescription className="text-purple-200 text-lg">
          Upload 3-4 clear photos to create a personalized character avatar
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Photo Grid */}
        {photos.length > 0 && (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo}
                  alt={`Character photo ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border-2 border-purple-500/30"
                />
                <Button
                  onClick={() => removePhoto(index)}
                  size="sm"
                  variant="destructive"
                  className="absolute -top-2 -right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Area */}
        {photos.length < maxPhotos && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              dragActive
                ? 'border-purple-400 bg-purple-900/20'
                : 'border-purple-500/30 hover:border-purple-400 hover:bg-purple-900/10'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={openFileDialog}
          >
            <Upload className="h-12 w-12 text-purple-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">
              {photos.length === 0 ? 'Upload Your First Photo' : `Add More Photos (${photos.length}/${maxPhotos})`}
            </h3>
            <p className="text-purple-200 mb-4">
              Drag and drop photos here, or click to browse
            </p>
            <p className="text-sm text-purple-300">
              Supports JPG, PNG, WebP • Max {maxPhotos} photos
            </p>
            
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileInput}
              className="hidden"
            />
          </div>
        )}

        {/* Tips */}
        <div className="bg-purple-900/30 rounded-lg p-4 border border-purple-500/30">
          <div className="flex items-start space-x-3">
            <Sparkles className="h-5 w-5 text-yellow-300 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="font-semibold text-white mb-2">✨ Photo Tips for Best Results:</h4>
              <ul className="text-sm text-purple-200 space-y-1">
                <li>• Use clear, well-lit photos of your child's face</li>
                <li>• Include different angles (front, side, smiling)</li>
                <li>• Avoid blurry or dark photos</li>
                <li>• Close-up face shots work best for avatar generation</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Progress indicator */}
        <div className="flex items-center justify-between text-sm">
          <span className="text-purple-200">
            Photos uploaded: {photos.length}/{maxPhotos}
          </span>
          <div className="flex space-x-1">
            {Array.from({ length: maxPhotos }).map((_, i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  i < photos.length ? 'bg-purple-400' : 'bg-purple-800'
                }`}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}