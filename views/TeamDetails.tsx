
import React from 'react';
import { Team, Transfer } from '../types';

interface TeamDetailsProps {
  team: Team;
  transfers: Transfer[];
  onBack: () => void;
  onEdit: () => void;
}

const TeamDetails: React.FC<TeamDetailsProps> = ({ team, transfers, onBack, onEdit }) => {
  const formatPoints = (n: number) => n.toLocaleString('es-ES');
  const formatMv = (n: number) => (n / 1000000).toLocaleString('es-ES', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + 'M';

  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 bg-background-dark/95 backdrop-blur-md border-b border-white/5 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <button 
            onClick={onBack}
            className="flex items-center justify-center size-10 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-white">arrow_back_ios_new</span>
          </button>
          <div className="flex flex-col items-center">
            <h1 className="text-lg font-bold leading-tight">{team.name}</h1>
            <span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">{team.manager}</span>
          </div>
          <button 
            onClick={onEdit}
            className="text-sm font-bold text-primary hover:text-primary/80"
          >
            Editar
          </button>
        </div>
      </header>

      <main className="flex flex-col gap-6 p-4">
        <div className="grid grid-cols-2 gap-4">
          <StatCard 
            label="Saldo" 
            value={`${formatMv(team.balance)} €`} 
            trend={team.balance >= 0 ? "Saneado" : "Negativo"} 
            icon="account_balance_wallet"
            trendUp={team.balance >= 0}
          />
          <StatCard 
            label="Puntos" 
            value={formatPoints(team.points)} 
            trend={`Rank: ${team.rank}`} 
            icon="sports_soccer"
            trendUp={true}
          />
        </div>

        <div className="flex flex-col gap-3 mb-20">
          <h3 className="text-white font-bold text-lg px-1">Movimientos Reales</h3>
          {transfers.length === 0 ? (
            <div className="py-10 text-center bg-card-dark rounded-2xl border border-white/5">
              <p className="text-slate-500 text-sm">No hay movimientos registrados</p>
            </div>
          ) : (
            transfers.map((t) => (
              <TransactionItem 
                key={t.id}
                player={t.player} 
                date={t.date} 
                type={t.type === 'buy' ? 'Compra' : t.type === 'sell' ? 'Venta' : 'Trueque'} 
                amount={`${formatMv(t.amount)} €`} 
                negative={t.to === team.name} 
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
};

const StatCard: React.FC<{ label: string; value: string; trend: string; icon: string; trendUp: boolean }> = ({ label, value, trend, icon, trendUp }) => (
  <div className="relative overflow-hidden flex flex-col gap-3 rounded-2xl p-5 bg-card-dark shadow-sm border border-white/5">
    <div className="absolute top-0 right-0 p-3 opacity-5">
      <span className="material-symbols-outlined text-4xl text-white">{icon}</span>
    </div>
    <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">{label}</p>
    <div>
      <p className="text-white text-2xl font-black">{value}</p>
      <div className="flex items-center gap-1 mt-1">
        <p className={`text-[11px] font-bold ${trendUp ? 'text-primary' : 'text-rose-500'}`}>{trend}</p>
      </div>
    </div>
  </div>
);

const TransactionItem: React.FC<{ player: string; date: string; type: string; amount: string; negative?: boolean }> = ({ player, date, type, amount, negative }) => (
  <div className="group flex items-center gap-4 p-4 rounded-2xl bg-card-dark border border-white/5">
    <div className={`size-10 rounded-full flex items-center justify-center shrink-0 bg-white/5 ${negative ? 'text-rose-500' : 'text-primary'}`}>
       <span className="material-symbols-outlined">{negative ? 'arrow_downward' : 'arrow_upward'}</span>
    </div>
    <div className="flex flex-col flex-1 min-w-0">
      <p className="text-white text-sm font-bold truncate">{player}</p>
      <p className="text-slate-400 text-[11px] font-medium">{date} • {type}</p>
    </div>
    <div className="shrink-0 text-right">
      <p className={`${negative ? 'text-rose-500' : 'text-primary'} font-black text-sm`}>{negative ? '-' : '+'}{amount}</p>
    </div>
  </div>
);

export default TeamDetails;
