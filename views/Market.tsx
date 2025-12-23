
import React from 'react';
import { Player, Team } from '../types';

interface MarketProps {
  userTeam: Team;
  onBuy: (player: Player, amount: number) => void;
}

const MARKET_PLAYERS: Player[] = [
  { id: 'p1', name: 'Lamine Yamal', value: 12500000, team: 'FC Barcelona', image: 'https://picsum.photos/100/100?random=10', position: 'DL' },
  { id: 'p2', name: 'Nico Williams', value: 9800000, team: 'Athletic Club', image: 'https://picsum.photos/100/100?random=11', position: 'DL' },
  { id: 'p3', name: 'Pedri', value: 11200000, team: 'FC Barcelona', image: 'https://picsum.photos/100/100?random=12', position: 'MC' },
  { id: 'p4', name: 'Fede Valverde', value: 10500000, team: 'Real Madrid', image: 'https://picsum.photos/100/100?random=13', position: 'MC' },
  { id: 'p5', name: 'Robin Le Normand', value: 6500000, team: 'Atlético de Madrid', image: 'https://picsum.photos/100/100?random=14', position: 'DF' },
];

const Market: React.FC<MarketProps> = ({ userTeam, onBuy }) => {
  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-extrabold text-white">Mercado</h1>
        <div className="flex items-center gap-2">
          <p className="text-slate-400 text-sm font-medium">Presupuesto:</p>
          <span className="text-primary font-bold">{(userTeam.balance / 1000000).toFixed(1)}M €</span>
        </div>
      </div>

      <div className="flex flex-col gap-4 mb-20">
        <h3 className="text-white font-bold text-lg">Jugadores en venta</h3>
        {MARKET_PLAYERS.map(player => (
          <div key={player.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5 shadow-sm">
            <div className="relative">
              <div 
                className="size-14 rounded-full bg-white/10 bg-cover bg-center border border-white/10"
                style={{ backgroundImage: `url("${player.image}")` }}
              />
              <span className="absolute -bottom-1 -left-1 px-1.5 py-0.5 rounded bg-card-dark text-[10px] font-black text-primary border border-white/10">
                {player.position}
              </span>
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-base truncate">{player.name}</p>
              <p className="text-slate-400 text-xs font-medium">{player.team}</p>
              <p className="text-primary font-bold text-sm mt-1">{(player.value / 1000000).toFixed(1)}M €</p>
            </div>

            <button 
              onClick={() => onBuy(player, player.value + 500000)}
              className="px-5 py-2.5 rounded-xl bg-primary text-black font-bold text-xs hover:scale-105 active:scale-95 transition-all shadow-lg shadow-primary/10"
            >
              PUJAR
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Market;
