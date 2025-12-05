import React from 'react';
import { Layers, Zap, User, UserCheck } from 'lucide-react';
import { GenerationSettings } from '../types';

interface ControlsProps {
  settings: GenerationSettings;
  setSettings: (s: GenerationSettings) => void;
  onGenerate: () => void;
  isGenerating: boolean;
  hasImage: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ 
  settings, 
  setSettings, 
  onGenerate, 
  isGenerating,
  hasImage 
}) => {
  
  const options = [10, 20, 30];

  return (
    <div className="bg-slate-800/60 backdrop-blur border border-slate-700 rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          عدد الصور المطلوبة
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {options.map((count) => (
            <button
              key={count}
              onClick={() => setSettings({ ...settings, count })}
              disabled={isGenerating}
              className={`
                py-3 px-4 rounded-lg font-bold text-lg transition-all
                ${settings.count === count 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {count}
            </button>
          ))}
        </div>
      </div>

      <div className="h-px bg-slate-700/50 my-4" />

      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-indigo-400" />
            تحديد الجنس (للأزياء)
        </h3>
        <div className="flex gap-2">
             <button
              onClick={() => setSettings({ ...settings, gender: 'auto' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${settings.gender === 'auto' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
             >
                تلقائي
             </button>
             <button
              onClick={() => setSettings({ ...settings, gender: 'male' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${settings.gender === 'male' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
             >
                ذكر
             </button>
             <button
              onClick={() => setSettings({ ...settings, gender: 'female' })}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${settings.gender === 'female' ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-300'}`}
             >
                أنثى
             </button>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onGenerate}
          disabled={!hasImage || isGenerating}
          className={`
            w-full py-4 rounded-xl font-bold text-xl flex items-center justify-center gap-3 transition-all
            ${!hasImage || isGenerating
              ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
              : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-xl shadow-indigo-600/20 hover:scale-[1.02]'
            }
          `}
        >
          {isGenerating ? (
            <>
              <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
              جارٍ المعالجة...
            </>
          ) : (
            <>
              <Zap className="w-6 h-6 fill-current" />
              ابدأ التوليد الآن
            </>
          )}
        </button>
        <p className="text-center text-xs text-slate-500 mt-3">
          يجب استخدام مفتاح API مدفوع لدعم Gemini 3 Pro عالي الدقة.
        </p>
      </div>
    </div>
  );
};
