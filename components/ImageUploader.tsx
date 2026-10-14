import React, { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';
import { AttachedImage } from '../types';

interface ImageUploaderProps {
  images: AttachedImage[];
  setImages: React.Dispatch<React.SetStateAction<AttachedImage[]>>;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ images, setImages }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      processFiles(files);
    }
  };

  const processFiles = (fileList: FileList) => {
    Array.from(fileList).forEach(file => {
      if (!file.type.startsWith('image/')) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          const newImage: AttachedImage = {
            id: crypto.randomUUID(),
            data: e.target.result as string,
            mimeType: file.type
          };
          setImages(prev => [...prev, newImage]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-3 mb-3">
        {images.map(img => (
          <div key={img.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-dark-border">
            <img src={img.data} alt="Upload" className="w-full h-full object-cover" />
            <button
              onClick={() => removeImage(img.id)}
              className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <X size={12} />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept="image/*"
          multiple
          onChange={handleFileChange}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-2 text-sm text-brand-400 hover:text-brand-300 transition-colors"
        >
          <ImagePlus size={16} />
          <span>Add Reference Image (or paste)</span>
        </button>
      </div>
    </div>
  );
};

export default ImageUploader;