import React, { useState } from 'react';
import { Download, X, ZoomIn } from 'lucide-react';
import { GeneratedImage } from '../types';

interface GalleryProps {
  images: GeneratedImage[];
}

export const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  if (images.length === 0) return null;

  const downloadImage = (url: string, id: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `photo-studio-ai-${id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="mt-12 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="bg-indigo-600 w-2 h-8 rounded-full"></span>
          المعرض ({images.length})
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {images.map((img) => (
          <div 
            key={img.id} 
            className="group relative aspect-[3/4] bg-slate-800 rounded-xl overflow-hidden border border-slate-700 hover:border-indigo-500 transition-all cursor-pointer"
            onClick={() => setSelectedImage(img)}
          >
            <img 
              src={img.url} 
              alt={img.style} 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
              <p className="text-white font-medium text-sm truncate">{img.style}</p>
              <div className="mt-2 flex gap-2">
                 <button 
                  onClick={(e) => { e.stopPropagation(); downloadImage(img.url, img.id); }}
                  className="bg-white/20 hover:bg-white/30 backdrop-blur p-2 rounded-lg text-white transition"
                 >
                   <Download className="w-4 h-4" />
                 </button>
                 <button className="bg-white/20 hover:bg-white/30 backdrop-blur p-2 rounded-lg text-white transition">
                   <ZoomIn className="w-4 h-4" />
                 </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative max-w-5xl w-full max-h-[90vh] bg-slate-900 rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl border border-slate-700">
            
            <button 
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 z-10 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full transition"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex-1 bg-black flex items-center justify-center relative">
               <img 
                src={selectedImage.url} 
                alt={selectedImage.style} 
                className="max-w-full max-h-[85vh] object-contain" 
               />
            </div>
            
            <div className="w-full md:w-80 p-6 flex flex-col border-l border-slate-800 bg-slate-900 overflow-y-auto">
              <h3 className="text-xl font-bold text-white mb-4">{selectedImage.style}</h3>
              
              <div className="space-y-4">
                <div className="bg-slate-800 p-4 rounded-lg">
                  <span className="text-xs text-slate-400 block mb-1">الوصف (Prompt)</span>
                  <p className="text-sm text-slate-300 leading-relaxed font-mono">
                    {selectedImage.prompt}
                  </p>
                </div>
              </div>

              <div className="mt-auto pt-6">
                <button 
                  onClick={() => downloadImage(selectedImage.url, selectedImage.id)}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition"
                >
                  <Download className="w-5 h-5" />
                  تحميل الصورة بدقة عالية
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
