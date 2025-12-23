
import React, { useState, useRef } from 'react';
import { analyzePlayerImage, extractRankingsFromImage } from '../services/geminiService';
import { RankUpdate } from '../types';

interface AnalysisProps {
  onBulkUpdateTeams?: (updates: RankUpdate[]) => void;
}

const Analysis: React.FC<AnalysisProps> = ({ onBulkUpdateTeams }) => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [rankUpdates, setRankUpdates] = useState<RankUpdate[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'general' | 'ranking'>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
        setResult(null);
        setRankUpdates(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const runAnalysis = async () => {
    if (!image) return;
    setLoading(true);
    setError(null);
    setResult(null);
    setRankUpdates(null);
    
    try {
      if (mode === 'general') {
        const analysis = await analyzePlayerImage(image);
        setResult(analysis);
      } else {
        const updates = await extractRankingsFromImage(image);
        setRankUpdates(updates);
      }
    } catch (err: any) {
      setError("No se pudo procesar la imagen. Verifica tu conexión o API Key.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-32">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-white tracking-tight">Escaneo AI</h1>
        <p className="text-slate-400 text-sm">Escanea capturas de tu liga para actualizar puntos o recibir análisis táctico.</p>
      </div>

      <div className="flex p-1 bg-card-dark rounded-xl border border-white/5">
        <button 
          onClick={() => setMode('general')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'general' ? 'bg-primary text-black shadow-lg shadow-primary/10' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined text-[18px]">psychology</span>
          Análisis Táctico
        </button>
        <button 
          onClick={() => setMode('ranking')}
          className={`flex-1 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${mode === 'ranking' ? 'bg-primary text-black shadow-lg shadow-primary/10' : 'text-slate-400'}`}
        >
          <span className="material-symbols-outlined text-[18px]">table_rows</span>
          Clasificación
        </button>
      </div>

      <div 
        onClick={() => fileInputRef.current?.click()}
        className="w-full aspect-video rounded-3xl border-2 border-dashed border-white/10 bg-surface-dark flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/50 transition-all overflow-hidden relative shadow-inner"
      >
        {image ? (
          <img src={image} alt="Upload preview" className="w-full h-full object-cover" />
        ) : (
          <>
            <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-4xl">add_a_photo</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">Sube o toma una foto</p>
          </>
        )}
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange} 
        />
      </div>

      {image && !loading && !result && !rankUpdates && (
        <button 
          onClick={runAnalysis}
          className="w-full h-14 rounded-2xl bg-primary text-black font-bold flex items-center justify-center gap-3 shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined">auto_awesome</span>
          {mode === 'general' ? 'Iniciar Análisis IA' : 'Extraer Clasificación'}
        </button>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center gap-4 p-10 bg-surface-dark rounded-3xl border border-white/5 shadow-xl">
          <div className="relative">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-primary border-r-2 border-transparent"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="material-symbols-outlined text-primary animate-pulse">cloud_upload</span>
            </div>
          </div>
          <div className="text-center">
            <p className="text-primary font-bold">Procesando con Gemini...</p>
            <p className="text-slate-500 text-xs mt-1">Esto puede tardar unos segundos</p>
          </div>
        </div>
      )}

      {error && (
        <div className="p-4 bg-expense/10 border border-expense/20 rounded-2xl text-expense text-sm font-medium flex items-center gap-3">
          <span className="material-symbols-outlined">error</span>
          {error}
        </div>
      )}

      {result && (
        <div className="p-6 bg-surface-dark rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center gap-2 mb-4 text-primary font-bold">
            <span className="material-symbols-outlined">auto_awesome</span>
            Resultados del Análisis
          </div>
          <div className="text-slate-200 text-sm leading-relaxed whitespace-pre-wrap">
            {result}
          </div>
          <button 
            onClick={() => {setImage(null); setResult(null);}}
            className="mt-6 w-full py-4 rounded-xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5 transition-colors"
          >
            Limpiar y Nueva Foto
          </button>
        </div>
      )}

      {rankUpdates && (
        <div className="p-6 bg-surface-dark rounded-3xl border border-white/10 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-bold">
              <span className="material-symbols-outlined">table_chart</span>
              Equipos Detectados
            </div>
            <span className="text-xs text-slate-500">{rankUpdates.length} encontrados</span>
          </div>
          
          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto no-scrollbar pr-1 mb-6">
            {rankUpdates.map((update, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-white text-sm font-bold truncate pr-4">{update.name}</span>
                <span className="text-primary font-black text-sm">{update.points} pts</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3">
            <button 
              onClick={() => onBulkUpdateTeams?.(rankUpdates)}
              className="w-full py-4 rounded-2xl bg-primary text-black font-bold shadow-lg shadow-primary/20 active:scale-95 transition-all"
            >
              Confirmar y Actualizar Clasificación
            </button>
            <button 
              onClick={() => {setImage(null); setRankUpdates(null);}}
              className="w-full py-4 rounded-2xl border border-white/10 text-slate-400 text-sm font-bold hover:bg-white/5"
            >
              Descartar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analysis;
