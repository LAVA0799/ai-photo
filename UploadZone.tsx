import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
  selectedImage: string | null;
  disabled: boolean;
}

export const UploadZone: React.FC<UploadZoneProps> = ({ onFileSelect, selectedImage, disabled }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const handleDivClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        className="hidden"
      />
      
      {!selectedImage ? (
        <div 
          onClick={handleDivClick}
          className={`
            relative group border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300
            ${disabled ? 'opacity-50 cursor-not-allowed border-slate-600 bg-slate-800' : 'border-slate-600 hover:border-indigo-500 hover:bg-slate-800/50 bg-slate-900'}
          `}
        >
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <Upload className="w-10 h-10 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-2">ارفع صورتك الشخصية</h3>
              <p className="text-slate-400 max-w-sm mx-auto">
                يرجى رفع صورة واضحة للوجه، بجودة عالية، للحصول على أفضل النتائج.
              </p>
            </div>
            <div className="text-xs text-slate-500 mt-4 flex items-center gap-2 bg-slate-800/80 py-1 px-3 rounded-full">
              <AlertCircle className="w-3 h-3" />
              JPG, PNG حتى 10 ميجابايت
            </div>
          </div>
        </div>
      ) : (
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-slate-700 bg-slate-900">
          <div className="absolute top-4 right-4 z-10">
            <button 
              onClick={handleDivClick}
              disabled={disabled}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-md text-white px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 border border-white/10"
            >
              <ImageIcon className="w-4 h-4" />
              تغيير الصورة
            </button>
          </div>
          <div className="flex flex-col md:flex-row h-full">
             <div className="w-full h-96 md:h-[500px] bg-black/40 flex items-center justify-center">
                <img 
                  src={selectedImage} 
                  alt="Original" 
                  className="max-w-full max-h-full object-contain"
                />
             </div>
          </div>
        </div>
      )}
    </div>
  );
};
