
import React, { useState } from 'react';

const Calculator: React.FC = () => {
  const [goals, setGoals] = useState(0);
  const [assists, setAssists] = useState(0);
  const [yellow, setYellow] = useState(false);
  const [red, setRed] = useState(false);
  const [position, setPosition] = useState<'POR' | 'DF' | 'MC' | 'DL'>('MC');

  const calculatePoints = () => {
    let pts = 2; // Puntos base por jugar
    
    // Goles segun posicion
    const goalPts = position === 'DL' ? 3 : position === 'MC' ? 4 : position === 'DF' ? 5 : 6;
    pts += goals * goalPts;
    
    pts += assists * 1;
    if (yellow) pts -= 1;
    if (red) pts -= 3;
    
    return pts;
  };

  const formatPoints = (n: number) => n.toLocaleString('es-ES');

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white">Calculadora</h1>
        <p className="text-slate-400 text-sm">Predice la puntuación de tu jugador.</p>
      </div>

      <div className="p-6 rounded-2xl bg-card-dark border border-white/5 flex flex-col items-center justify-center gap-2">
        <p className="text-slate-400 text-xs uppercase font-bold tracking-widest">Puntuación Estimada</p>
        <p className="text-6xl font-black text-primary">{formatPoints(calculatePoints())}</p>
        <p className="text-slate-200 text-sm font-medium">puntos</p>
      </div>

      <div className="space-y-6 mb-24">
        <div className="space-y-3">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Posición</label>
          <div className="flex gap-2">
            {(['POR', 'DF', 'MC', 'DL'] as const).map(pos => (
              <button 
                key={pos}
                onClick={() => setPosition(pos)}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${position === pos ? 'bg-primary text-black' : 'bg-surface-dark text-slate-400 border border-white/5'}`}
              >
                {pos}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Counter label="Goles" value={goals} onChange={setGoals} />
          <Counter label="Asistencias" value={assists} onChange={setAssists} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => setYellow(!yellow)}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border ${yellow ? 'bg-yellow-400/20 border-yellow-400 text-yellow-400' : 'bg-surface-dark border-white/5 text-slate-400'}`}
          >
            <span className="material-symbols-outlined">style</span>
            Amarilla
          </button>
          <button 
            onClick={() => setRed(!red)}
            className={`flex items-center justify-center gap-2 py-4 rounded-2xl font-bold transition-all border ${red ? 'bg-rose-500/20 border-rose-500 text-rose-500' : 'bg-surface-dark border-white/5 text-slate-400'}`}
          >
            <span className="material-symbols-outlined">style</span>
            Roja
          </button>
        </div>
      </div>
    </div>
  );
};

const Counter: React.FC<{ label: string; value: number; onChange: (v: number) => void }> = ({ label, value, onChange }) => (
  <div className="flex flex-col gap-3 p-4 rounded-2xl bg-surface-dark border border-white/5">
    <p className="text-xs font-bold text-slate-400 uppercase text-center">{label}</p>
    <div className="flex items-center justify-between">
      <button onClick={() => onChange(Math.max(0, value - 1))} className="size-10 rounded-full bg-card-dark flex items-center justify-center text-white active:scale-90">-</button>
      <span className="text-2xl font-black text-white">{value}</span>
      <button onClick={() => onChange(value + 1)} className="size-10 rounded-full bg-primary flex items-center justify-center text-black active:scale-90">+</button>
    </div>
  </div>
);

export default Calculator;
