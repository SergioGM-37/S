
import React, { useState } from 'react';
import { Team, Transfer } from '../types';

interface AddTransferProps {
  teams: Team[];
  onSave: (transfer: Transfer) => void;
  onCancel: () => void;
}

const AddTransfer: React.FC<AddTransferProps> = ({ teams, onSave, onCancel }) => {
  const [player, setPlayer] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [type, setType] = useState<'buy' | 'sell' | 'swap'>('buy');
  const [from, setFrom] = useState('Mercado');
  const [to, setTo] = useState(teams[0].name);

  const handleSubmit = () => {
    if (!player || amount <= 0) return;
    
    onSave({
      id: Math.random().toString(),
      player,
      amount,
      type,
      from,
      to,
      date: 'Hoy'
    });
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Registrar Fichaje</h1>
        <button onClick={onCancel} className="text-slate-400 font-bold">Cerrar</button>
      </div>

      <div className="space-y-6">
        <div className="flex p-1 bg-card-dark rounded-xl">
          <button 
            onClick={() => setType('buy')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'buy' ? 'bg-primary text-black' : 'text-slate-400'}`}
          >
            Compra
          </button>
          <button 
            onClick={() => setType('sell')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'sell' ? 'bg-primary text-black' : 'text-slate-400'}`}
          >
            Venta
          </button>
          <button 
            onClick={() => setType('swap')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'swap' ? 'bg-primary text-black' : 'text-slate-400'}`}
          >
            Trueque
          </button>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Jugador</label>
            <input 
              type="text" 
              placeholder="Ej: Robert Lewandowski"
              value={player}
              onChange={(e) => setPlayer(e.target.value)}
              className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Origen</label>
              <select 
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
              >
                <option value="Mercado">Mercado</option>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Destino</label>
              <select 
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
              >
                <option value="Mercado">Mercado</option>
                {teams.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
              </select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Importe del Fichaje (€)</label>
            <input 
              type="number" 
              placeholder="15000000"
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          className="mt-6 w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Confirmar Operación
        </button>
      </div>
    </div>
  );
};

export default AddTransfer;
