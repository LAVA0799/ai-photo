import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { UploadZone } from './components/UploadZone';
import { Controls } from './components/Controls';
import { Gallery } from './components/Gallery';
import { GeneratedImage, GenerationSettings, AppState, Scenario } from './types';
import { blobToBase64, analyzeAndPlanSession, generateSingleImage } from './services/geminiService';
import { Sparkles, Brain, Image as IconImage } from 'lucide-react';

const App: React.FC = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  
  const [settings, setSettings] = useState<GenerationSettings>({
    count: 10,
    gender: 'auto'
  });

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [progress, setProgress] = useState<{ current: number; total: number; message: string }>({
    current: 0,
    total: 0,
    message: ''
  });

  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);

  // Initialize API Key check
  useEffect(() => {
    const initApiKey = async () => {
      if (process.env.API_KEY) {
        setApiKey(process.env.API_KEY);
      } else if (window.aistudio) {
         try {
           const hasKey = await window.aistudio.hasSelectedApiKey();
           if (hasKey) {
             setApiKey('provided_via_injection');
           }
         } catch (e) {
           console.error("Error checking API key", e);
         }
      }
    };
    initApiKey();
  }, []);

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    try {
      const b64 = await blobToBase64(file);
      setImageBase64(b64);
      // Reset state on new file
      setGeneratedImages([]);
      setAppState(AppState.IDLE);
    } catch (err) {
      console.error("Error processing file", err);
    }
  };

  const handleAPIKeySelection = async () => {
    if (window.aistudio) {
      try {
        await window.aistudio.openSelectKey();
        setApiKey('provided_via_injection');
        return true;
      } catch (e) {
        console.error("Failed to select key", e);
        return false;
      }
    }
    // If not in that environment, fallback (though the prompt implies we should assume it exists for this feature)
    return !!process.env.API_KEY;
  };

  const startGeneration = async () => {
    if (!imageBase64 || !apiKey) {
      const selected = await handleAPIKeySelection();
      if (!selected) {
        alert("يرجى اختيار مفتاح API للمتابعة");
        return;
      }
    }
    
    // We get the key fresh from environment if possible, or use the indicator
    // process.env.API_KEY is handled in the service

    setAppState(AppState.ANALYZING);
    setProgress({ current: 0, total: settings.count + 1, message: 'جاري تحليل ملامح الوجه وتخطيط السيناريوهات...' });

    try {
      // Step 1: Analyze and Plan
      const plan = await analyzeAndPlanSession(imageBase64!, settings.count, settings.gender);
      
      console.log("Plan generated:", plan);
      setAppState(AppState.GENERATING);
      
      const newImages: GeneratedImage[] = [];

      // Step 2: Generate loop
      // We process in small batches to avoid overwhelming the browser/API simultaneously, 
      // but Gemini has high throughput. Let's do sequential for better progress tracking and error handling.
      
      for (let i = 0; i < plan.scenarios.length; i++) {
        const scenario = plan.scenarios[i];
        setProgress({ 
          current: i + 1, 
          total: plan.scenarios.length, 
          message: `توليد الصورة ${i + 1} من ${plan.scenarios.length}: ${scenario.styleName}` 
        });

        try {
          const imageUrl = await generateSingleImage(imageBase64!, scenario, plan.physicalDescription);
          
          const imgData: GeneratedImage = {
            id: crypto.randomUUID(),
            url: imageUrl,
            prompt: `Outfit: ${scenario.outfit}, Location: ${scenario.location}`,
            style: scenario.styleName,
            timestamp: Date.now()
          };

          newImages.push(imgData);
          // Update state incrementally to show results as they come in
          setGeneratedImages(prev => [imgData, ...prev]);

          // Small delay to be polite to the API rate limit if not enterprise
          await new Promise(r => setTimeout(r, 1000)); 

        } catch (err) {
          console.error(`Failed to generate scenario ${i}`, err);
          // Continue to next even if one fails
        }
      }

      setAppState(AppState.COMPLETE);
      
    } catch (error) {
      console.error("Fatal error during generation workflow", error);
      setAppState(AppState.ERROR);
      alert("حدث خطأ أثناء العملية. يرجى التأكد من مفتاح API والمحاولة مرة أخرى.");
    }
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 pt-8">
        
        {/* API Key Banner if needed */}
        {!apiKey && (
          <div className="bg-amber-500/10 border border-amber-500/20 text-amber-200 p-4 rounded-xl mb-8 flex items-center justify-between">
            <p>يتطلب هذا التطبيق مفتاح Gemini API مدفوع لتوليد الصور عالية الدقة.</p>
            <button 
              onClick={handleAPIKeySelection}
              className="bg-amber-500 hover:bg-amber-600 text-black font-bold py-2 px-4 rounded-lg text-sm"
            >
              ربط مفتاح API
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Settings */}
          <div className="lg:col-span-4 space-y-6">
            <UploadZone 
              onFileSelect={handleFileSelect} 
              selectedImage={previewUrl}
              disabled={appState === AppState.ANALYZING || appState === AppState.GENERATING}
            />
            
            <Controls 
              settings={settings}
              setSettings={setSettings}
              onGenerate={startGeneration}
              isGenerating={appState === AppState.ANALYZING || appState === AppState.GENERATING}
              hasImage={!!imageBase64}
            />
          </div>

          {/* Right Column: Status & Gallery */}
          <div className="lg:col-span-8">
            
            {/* Status Display */}
            {(appState === AppState.ANALYZING || appState === AppState.GENERATING) && (
              <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 mb-8 animate-pulse">
                <div className="flex items-center gap-4 mb-4">
                  {appState === AppState.ANALYZING ? (
                    <Brain className="w-8 h-8 text-purple-400 animate-bounce" />
                  ) : (
                    <IconImage className="w-8 h-8 text-indigo-400 animate-spin-slow" />
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      {appState === AppState.ANALYZING ? 'تحليل الصورة وبناء الخطة...' : 'جاري توليد الصور...'}
                    </h3>
                    <p className="text-slate-400">{progress.message}</p>
                  </div>
                </div>
                
                {/* Progress Bar */}
                <div className="h-4 bg-slate-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500 ease-out"
                    style={{ width: `${(progress.current / progress.total) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>البدء</span>
                  <span>{Math.round((progress.current / progress.total) * 100)}%</span>
                </div>
              </div>
            )}

            {/* Introduction Placeholder */}
            {appState === AppState.IDLE && generatedImages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-12 bg-slate-800/30 rounded-3xl border border-dashed border-slate-700">
                <Sparkles className="w-16 h-16 text-slate-600 mb-6" />
                <h2 className="text-2xl font-bold text-slate-300 mb-2">مساحة العمل فارغة</h2>
                <p className="text-slate-500 max-w-md">
                  قم برفع صورة شخصية، اختر عدد النسخ المطلوبة، ودع الذكاء الاصطناعي يبني لك محفظة صور احترافية متنوعة.
                </p>
              </div>
            )}

            <Gallery images={generatedImages} />

          </div>
        </div>
      </main>
    </div>
  );
};

export default App;