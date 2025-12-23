
import React, { useState } from 'react';
import { Team } from '../types';

interface AddTeamProps {
  onSave: (team: Team) => void;
  onCancel: () => void;
}

const AddTeam: React.FC<AddTeamProps> = ({ onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Team>>({
    name: '',
    manager: '',
    points: 0,
    balance: 0, // Saldo inicial a 0 por defecto
    logo: '',
    lastPoints: 0,
    rank: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'points' || name === 'balance' ? Number(value) : value
    }));
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.manager) {
      alert("Por favor completa el nombre y el entrenador");
      return;
    }
    const newTeam: Team = {
      id: Math.random().toString(36).substr(2, 9),
      name: formData.name || '',
      manager: formData.manager || '',
      points: formData.points || 0,
      balance: formData.balance || 0,
      logo: '',
      lastPoints: 0,
      rank: 0,
    } as Team;
    onSave(newTeam);
  };

  return (
    <div className="flex flex-col min-h-screen px-4 pt-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold">Nuevo Equipo</h1>
        <button onClick={onCancel} className="text-slate-400 font-bold">Cancelar</button>
      </div>

      <div className="flex flex-col gap-5">
        <div className="space-y-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Nombre del Equipo</label>
            <input 
              type="text" 
              name="name"
              placeholder="Ej: Dream Team FC"
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
              placeholder="Ej: Carlos Ancelotti"
              value={formData.manager}
              onChange={handleChange}
              className="bg-card-dark border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-colors text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Puntos Iniciales</label>
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

        <button 
          onClick={handleSubmit}
          className="mt-6 w-full py-4 bg-primary text-black font-bold rounded-2xl shadow-lg shadow-primary/20 active:scale-95 transition-all"
        >
          Crear Equipo
        </button>
      </div>
    </div>
  );
};

export default AddTeam;
