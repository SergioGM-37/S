
import React from 'react';
import { Team } from '../types';

interface RankingsProps {
  teams: Team[];
  onBack: () => void;
  onNavigateTeam: (team: Team) => void;
  onEditTeam: (team: Team) => void;
  onAddTeam: () => void;
}

const Rankings: React.FC<RankingsProps> = ({ teams, onBack, onNavigateTeam, onEditTeam, onAddTeam }) => {
  const displayedTeams = teams;

  const formatPoints = (n: number) => n.toLocaleString('es-ES');
  const formatMv = (n: number) => (n / 1000000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <header className="sticky top-0 z-50 bg-background-dark border-b border-white/10 px-4 py-2 shrink-0">
        <div className="flex items-center justify-between gap-4">
          <button 
            onClick={onBack}
            className="flex size-9 items-center justify-center rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white" style={{ fontSize: '22px' }}>arrow_back</span>
          </button>
          <h1 className="text-base font-bold leading-tight tracking-tight flex-1 text-center">Clasificación</h1>
          <button 
            onClick={onAddTeam}
            className="flex size-9 items-center justify-center rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>group_add</span>
          </button>
        </div>
      </header>

      <div className="flex flex-col flex-1 overflow-hidden px-2 mt-4 pb-4">
        {/* Cabecera de Tabla Ultra Compacta */}
        <div className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem_4rem] px-3 py-2 border border-white/10 bg-white/5 rounded-t-xl shrink-0">
          <div className="text-[8px] font-bold uppercase tracking-wider text-primary/80 text-center">#</div>
          <div className="text-[8px] font-bold uppercase tracking-wider text-primary/80 pl-2">Equipo</div>
          <div className="text-[8px] font-bold uppercase tracking-wider text-primary/80 text-right">Pts</div>
          <div className="text-[8px] font-bold uppercase tracking-wider text-primary/80 text-center">Gap</div>
          <div className="text-[8px] font-bold uppercase tracking-wider text-primary/80 text-right">Saldo</div>
        </div>

        {/* Lista compacta para ver +10 equipos de un vistazo */}
        <div className="flex-1 overflow-y-auto bg-surface-dark border-x border-b border-white/10 rounded-b-xl custom-scrollbar">
          <div className="flex flex-col divide-y divide-white/5">
            {displayedTeams.map((team, index) => {
              const prevTeam = index > 0 ? displayedTeams[index - 1] : null;
              const gap = prevTeam ? prevTeam.points - team.points : 0;

              return (
                <div 
                  key={team.id} 
                  className="grid grid-cols-[2rem_1fr_3.5rem_3.5rem_4rem] items-center py-2.5 pr-2 hover:bg-white/5 transition-colors group cursor-pointer"
                  onClick={() => onNavigateTeam(team)}
                >
                  {/* Posición Compacta */}
                  <div className="flex justify-center">
                    <div className={`flex items-center justify-center size-5 rounded font-black text-[10px] ${
                      team.rank === 1 ? 'bg-yellow-400 text-black' : 
                      team.rank === 2 ? 'bg-slate-300 text-black' :
                      team.rank === 3 ? 'bg-orange-400 text-black' : 'text-slate-500 bg-white/5'
                    }`}>
                      {team.rank}
                    </div>
                  </div>

                  {/* Nombre Equipo */}
                  <div className="flex items-center min-w-0 pl-2">
                    <p className="text-[13px] font-bold truncate text-white leading-tight">{team.name}</p>
                  </div>

                  {/* Puntos */}
                  <div className="text-right">
                    <p className="text-[13px] font-black text-white">{formatPoints(team.points)}</p>
                  </div>

                  {/* Gap Visual a la derecha de puntos */}
                  <div className="flex justify-center">
                    {prevTeam ? (
                      <div className="flex items-center justify-center min-w-[28px] px-1 py-0.5 rounded bg-black/40 border border-white/5">
                        <span className="text-[9px] font-black text-primary/80">+{formatPoints(gap)}</span>
                      </div>
                    ) : (
                      <span className="material-symbols-outlined text-yellow-400 text-[14px]">star</span>
                    )}
                  </div>

                  {/* Saldo y Ajustes */}
                  <div className="flex items-center justify-end gap-1.5">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                      team.balance >= 0 ? 'text-primary bg-primary/10' : 'text-rose-500 bg-rose-500/10'
                    }`}>
                      {formatMv(team.balance)}
                    </span>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditTeam(team);
                      }}
                      className="text-slate-600 hover:text-primary transition-colors p-1"
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>settings</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          {displayedTeams.length === 0 && (
            <div className="flex flex-col items-center justify-center py-10 opacity-20">
              <span className="material-symbols-outlined text-4xl">leaderboard</span>
              <p className="text-xs font-bold mt-1">Vacío</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(19, 236, 91, 0.3);
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
};

export default Rankings;
