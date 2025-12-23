
import React, { useState } from 'react';
import { Team } from '../types';

interface EditTeamProps {
  team: Team;
  isUserTeam: boolean;
  onSave: (team: Team, isUserTeam?: boolean) => void;
  onCancel: () => void;
}

const EditTeam: React.FC<EditTeamProps> = ({ team, isUserTeam: initialIsUserTeam, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Team>({ ...team });
  const [isUserTeam, setIsUserTeam] = useState(initialIsUserTeam);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' || name === 'balance' ? Number(value) : value
    }));
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6 pb-20">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Editar Equipo</h1>
        <button onClick={onCancel} className="text-slate-400 font-bold">Cancelar</button>
      </div>

      <div className="flex flex-col gap-6">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre del Equipo</label>
            <input 
              type="text" 
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Entrenador</label>
            <input 
              type="text" 
              name="manager"
              value={formData.manager}
              onChange={handleChange}
              className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Puntos Totales</label>
              <input 
                type="number" 
                name="points"
                value={formData.points}
                onChange={handleChange}
                className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Saldo (€)</label>
              <input 
                type="number" 
                name="balance"
                value={formData.balance}
                onChange={handleChange}
                className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
              />
            </div>
          </div>
        </div>

        {/* Opción para marcar como Mi Equipo */}
        <div 
          onClick={() => setIsUserTeam(!isUserTeam)}
          className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition-all ${
            isUserTeam ? 'bg-primary/10 border-primary/40' : 'bg-card-dark border-white/5'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className={`size-10 rounded-xl flex items-center justify-center ${isUserTeam ? 'bg-primary text-black' : 'bg-white/5 text-slate-500'}`}>
              <span className="material-symbols-outlined">person</span>
            </div>
            <div className="flex flex-col">
              <p className="text-sm font-bold text-white">Este es mi equipo</p>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Aparecerá en el inicio</p>
            </div>
          </div>
          <div className={`size-6 rounded-full border-2 flex items-center justify-center transition-all ${
            isUserTeam ? 'border-primary bg-primary' : 'border-white/20'
          }`}>
            {isUserTeam && <span className="material-symbols-outlined text-black text-xs font-black">check</span>}
          </div>
        </div>

        <button 
          onClick={() => onSave(formData, isUserTeam)}
          className="mt-4 w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-all"
        >
          Guardar Cambios
        </button>
      </div>
    </div>
  );
};

export default EditTeam;
