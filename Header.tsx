import React from 'react';
import { Camera, Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-900/50 backdrop-blur-md border-b border-slate-700 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-xl shadow-lg shadow-indigo-500/20">
            <Camera className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              استوديو برو
            </h1>
            <p className="text-xs text-slate-400">لإنتاج الصور الاحترافية بالذكاء الاصطناعي</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-indigo-900/30 border border-indigo-500/30 rounded-full">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-sm font-medium text-indigo-200">مدعوم بواسطة Gemini 2.5 Flash</span>
        </div>
      </div>
    </header>
  );
};