
import React from 'react';
import { Team, Transfer, View } from '../types';

interface HomeProps {
  teams: Team[];
  userTeamId: string;
  transfers: Transfer[];
  onNavigateTeam: (team: Team) => void;
  onNavigateToView: (view: View) => void;
  onEditTeam: (team: Team) => void;
}

const Home: React.FC<HomeProps> = ({ teams, userTeamId, transfers, onNavigateTeam, onNavigateToView, onEditTeam }) => {
  const userTeam = teams.find(t => t.id === userTeamId) || teams[0];

  const formatPoints = (n: number) => n.toLocaleString('es-ES');
  const formatMv = (n: number) => (n / 1000000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';

  return (
    <div className="flex flex-col gap-8 px-4 md:px-8 py-6">
      {/* Header Desktop / Mobile */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center rounded-full size-12 bg-primary/20 text-primary">
            <span className="material-symbols-outlined text-2xl">person</span>
          </div>
          <div className="flex flex-col">
            <p className="text-xs uppercase tracking-widest text-slate-400 font-bold">Manager</p>
            <h2 className="text-white text-xl font-black leading-none mt-1">{userTeam?.manager || 'Pep Guardiola'}</h2>
          </div>
        </div>
        <div className="hidden md:flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Estado de Servidores</span>
            <div className="flex items-center gap-2">
              <div className="size-2 rounded-full bg-primary animate-pulse"></div>
              <span className="text-xs font-bold text-white">Óptimo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Lado Izquierdo: Mi Equipo (Destacado) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {userTeam && (
            <div 
              onClick={() => onNavigateTeam(userTeam)}
              className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-surface-dark to-[#0f1f14] shadow-2xl border border-white/10 cursor-pointer group active:scale-[0.99] transition-all"
            >
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="p-8 relative z-10 flex flex-col gap-10">
                <div className="flex justify-between items-start">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 w-fit">
                      <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                      <span className="text-primary text-xs font-black uppercase tracking-widest">Mi Escuadra</span>
                    </div>
                    <h3 className="text-white text-4xl font-black mt-2 leading-tight tracking-tight">{userTeam.name}</h3>
                  </div>
                  <div className={`size-16 rounded-3xl flex items-center justify-center border font-black text-2xl ${
                    userTeam.rank === 1 ? 'bg-yellow-400 border-yellow-500 text-black' : 
                    'bg-white/5 border-white/10 text-white'
                  }`}>
                    {userTeam.rank}º
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 border-t border-white/5 pt-8">
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Puntos</p>
                    <p className="text-3xl font-black text-white">{formatPoints(userTeam.points)}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Presupuesto</p>
                    <p className={`text-3xl font-black ${userTeam.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                      {formatMv(userTeam.balance)}
                    </p>
                  </div>
                  <div className="hidden md:flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Últ. Jornada</p>
                    <p className="text-3xl font-black text-white">+{userTeam.lastPoints}</p>
                  </div>
                  <div className="hidden md:flex flex-col gap-1">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tendencia</p>
                    <div className="flex items-center gap-1 text-primary">
                      <span className="material-symbols-outlined font-black">trending_up</span>
                      <span className="text-xl font-black">Alta</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Estadísticas rápidas Desktop */}
          <div className="hidden md:grid grid-cols-3 gap-4">
            <div className="p-6 rounded-3xl bg-surface-dark border border-white/5 flex flex-col gap-2">
              <span className="material-symbols-outlined text-primary">shopping_cart</span>
              <p className="text-white font-bold text-lg">Pujas Activas</p>
              <p className="text-slate-400 text-xs">Tienes 3 jugadores en seguimiento.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface-dark border border-white/5 flex flex-col gap-2">
              <span className="material-symbols-outlined text-primary">analytics</span>
              <p className="text-white font-bold text-lg">Ratio Victoria</p>
              <p className="text-slate-400 text-xs">Estás en el top 5% de tu liga.</p>
            </div>
            <div className="p-6 rounded-3xl bg-surface-dark border border-white/5 flex flex-col gap-2">
              <span className="material-symbols-outlined text-primary">notifications</span>
              <p className="text-white font-bold text-lg">Alertas</p>
              <p className="text-slate-400 text-xs">Mercado actualizado hace 10m.</p>
            </div>
          </div>
        </div>

        {/* Lado Derecho: Resumen Clasificación */}
        <div className="lg:col-span-5 flex flex-col gap-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-white text-xl font-black">Top 5 Liga</h2>
            <button 
              onClick={() => onNavigateToView('ranking')}
              className="text-primary text-sm font-black uppercase tracking-widest hover:bg-primary/10 px-4 py-2 rounded-xl transition-colors"
            >
              Ver Tabla
            </button>
          </div>
          <div className="flex flex-col gap-3 bg-surface-dark/50 p-4 rounded-[2rem] border border-white/5">
            {teams.slice(0, 5).map((team) => (
              <div 
                key={team.id}
                onClick={() => onNavigateTeam(team)}
                className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer group ${
                  team.id === userTeamId 
                    ? 'bg-primary text-black border-transparent' 
                    : 'bg-surface-dark border-white/5 hover:border-white/10'
                }`}
              >
                <div className={`flex items-center justify-center size-8 rounded-xl font-black text-sm ${
                  team.id === userTeamId ? 'bg-black text-primary' : 
                  team.rank === 1 ? 'bg-yellow-400 text-black' : 'bg-white/5 text-slate-400'
                }`}>
                  {team.rank}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-base truncate ${team.id === userTeamId ? 'text-black' : 'text-white'}`}>
                    {team.name}
                  </p>
                  <p className={`text-xs font-medium ${team.id === userTeamId ? 'text-black/60' : 'text-slate-500'}`}>
                    {team.manager}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end">
                  <p className={`font-black text-base ${team.id === userTeamId ? 'text-black' : 'text-white'}`}>
                    {formatPoints(team.points)}
                  </p>
                  <p className={`text-xs font-bold ${team.id === userTeamId ? 'text-black/60' : 'text-slate-500'}`}>
                    {formatMv(team.balance)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
