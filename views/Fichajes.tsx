
import React, { useState, useMemo } from 'react';
import { Team, SimulatedOperation } from '../types';

interface FichajesProps {
  teams: Team[];
  operations: SimulatedOperation[];
  setOperations: React.Dispatch<React.SetStateAction<SimulatedOperation[]>>;
  onUpdateTeamBalance: (teamId: string, newBalance: number) => void;
}

const Fichajes: React.FC<FichajesProps> = ({ teams, operations, setOperations, onUpdateTeamBalance }) => {
  const [selectedTeamId, setSelectedTeamId] = useState<string>(teams[0]?.id || '');
  const [playerName, setPlayerName] = useState('');
  const [amount, setAmount] = useState<number>(10000000); 
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  const [editingId, setEditingId] = useState<string | null>(null);

  const formatPoints = (n: number) => n.toLocaleString('es-ES');
  const formatMv = (n: number, decimals: number = 1) => (n / 1000000).toLocaleString('es-ES', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + 'M';

  const teamProjections = useMemo(() => {
    return teams.map(team => {
      const teamOps = operations.filter(op => op.teamId === team.id);
      const impact = teamOps.reduce((acc, op) => {
        return acc + (op.type === 'buy' ? -op.amount : op.amount);
      }, 0);
      return {
        ...team,
        impact,
        projected: team.balance + impact
      };
    }).sort((a, b) => b.projected - a.projected);
  }, [teams, operations]);

  const addOrUpdateOperation = () => {
    if (!selectedTeamId || amount <= 0) return;
    if (editingId) {
      setOperations(prev => prev.map(op => 
        op.id === editingId 
          ? { ...op, teamId: selectedTeamId, playerName: playerName || "Jugador Desconocido", amount, type } 
          : op
      ));
      setEditingId(null);
    } else {
      const newOp: SimulatedOperation = {
        id: Math.random().toString(36).substr(2, 9),
        teamId: selectedTeamId,
        playerName: playerName || "Jugador Desconocido",
        amount,
        type
      };
      setOperations(prev => [newOp, ...prev]);
    }
    setPlayerName('');
    setAmount(10000000);
    setType('buy');
  };

  const startEdit = (op: SimulatedOperation) => {
    setEditingId(op.id);
    setSelectedTeamId(op.teamId);
    setPlayerName(op.playerName);
    setAmount(op.amount);
    setType(op.type);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const removeOperation = (id: string) => {
    setOperations(prev => prev.filter(op => op.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const getTeamName = (id: string) => teams.find(t => t.id === id)?.name || 'Equipo';

  return (
    <div className="flex flex-col gap-8 px-4 md:px-8 py-8">
      <div className="flex flex-col gap-1">
        <h1 className="text-4xl font-black text-white tracking-tight">Simulador Financiero</h1>
        <p className="text-slate-400 font-medium">Planifica tus pujas y ventas antes de confirmarlas en el juego oficial.</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        
        {/* Panel de Control: Izquierda (8 cols) */}
        <div className="xl:col-span-8 flex flex-col gap-8">
          
          {/* Formulario */}
          <div className={`p-8 rounded-[2.5rem] bg-card-dark border transition-all duration-300 shadow-2xl ${editingId ? 'border-primary ring-1 ring-primary/20 bg-primary/[0.02]' : 'border-white/10'}`}>
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`size-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${editingId ? 'bg-primary text-black' : 'bg-white/5 text-primary'}`}>
                  <span className="material-symbols-outlined text-3xl">{editingId ? 'edit_square' : 'add_task'}</span>
                </div>
                <div>
                  <h3 className="text-white text-xl font-black leading-none">{editingId ? 'Editar Movimiento' : 'Nueva Operación'}</h3>
                  <p className="text-slate-400 text-xs mt-1">Completa los datos para simular el impacto.</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Equipo Propietario</label>
                <select 
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                  className="bg-background-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-colors text-white text-base appearance-none cursor-pointer"
                >
                  {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Jugador Objetivo</label>
                <input 
                  type="text" 
                  placeholder="Ej: Kylian Mbappé"
                  value={playerName}
                  onChange={(e) => setPlayerName(e.target.value)}
                  className="bg-background-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-colors text-white text-base"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Movimiento</label>
                <div className="flex p-1.5 bg-background-dark rounded-2xl border border-white/10 h-full">
                  <button 
                    onClick={() => setType('buy')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${type === 'buy' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">shopping_basket</span>
                    Compra (-)
                  </button>
                  <button 
                    onClick={() => setType('sell')}
                    className={`flex-1 flex items-center justify-center gap-2 rounded-xl text-sm font-black transition-all ${type === 'sell' ? 'bg-primary text-black shadow-lg' : 'text-slate-500 hover:text-white'}`}
                  >
                    <span className="material-symbols-outlined text-[20px]">payments</span>
                    Venta (+)
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Precio Final (€)</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="bg-background-dark border border-white/10 rounded-2xl px-5 py-4 focus:outline-none focus:border-primary transition-colors text-white text-xl font-black"
                />
              </div>
            </div>

            <button 
              onClick={addOrUpdateOperation}
              className={`mt-10 w-full py-5 font-black rounded-3xl shadow-2xl transition-all flex items-center justify-center gap-3 active:scale-[0.98] ${
                editingId ? 'bg-primary text-black' : 'bg-primary text-black'
              }`}
            >
              <span className="material-symbols-outlined font-black">{editingId ? 'save' : 'add'}</span>
              {editingId ? 'GUARDAR CAMBIOS' : 'REGISTRAR OPERACIÓN SIMULADA'}
            </button>
          </div>

          {/* Listado de Movimientos Simu */}
          <div className="flex flex-col gap-4">
            <h3 className="text-white font-black text-xl px-2 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">history</span>
              Historial de Simulación
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {operations.map((op) => (
                <div key={op.id} className="p-5 rounded-[2rem] bg-surface-dark border border-white/5 flex items-center justify-between group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`size-12 rounded-2xl flex items-center justify-center font-bold shrink-0 ${op.type === 'buy' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                      <span className="material-symbols-outlined text-2xl">{op.type === 'buy' ? 'arrow_downward' : 'arrow_upward'}</span>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <p className="text-white font-black text-base truncate">{op.playerName}</p>
                      <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest truncate">{getTeamName(op.teamId)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className={`font-black text-lg ${op.type === 'buy' ? 'text-rose-500' : 'text-primary'}`}>
                      {op.type === 'buy' ? '-' : '+'}{formatMv(op.amount)}
                    </p>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => startEdit(op)} className="p-2 text-slate-500 hover:text-primary"><span className="material-symbols-outlined text-[20px]">edit</span></button>
                      <button onClick={() => removeOperation(op.id)} className="p-2 text-slate-500 hover:text-rose-500"><span className="material-symbols-outlined text-[20px]">delete</span></button>
                    </div>
                  </div>
                </div>
              ))}
              {operations.length === 0 && (
                <div className="col-span-full py-20 text-center bg-surface-dark/30 rounded-[3rem] border-2 border-dashed border-white/5">
                  <p className="text-slate-500 font-bold">Sin movimientos activos.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Proyecciones: Derecha (4 cols) - Sticky en escritorio */}
        <div className="xl:col-span-4 flex flex-col gap-6 xl:sticky xl:top-8">
          <div className="flex items-center gap-2 px-2">
            <span className="material-symbols-outlined text-primary font-black">calculate</span>
            <h3 className="text-white font-black text-xl">Saldos Proyectados</h3>
          </div>
          <div className="flex flex-col gap-3 max-h-[70vh] overflow-y-auto no-scrollbar pr-1">
            {teamProjections.map((proj) => (
              <div key={proj.id} className="p-6 rounded-[2rem] bg-card-dark border border-white/5 flex flex-col gap-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-white font-black text-lg truncate leading-tight">{proj.name}</h4>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Ranking: {proj.rank}º</p>
                  </div>
                  <div className={`px-2 py-1 rounded-lg text-[10px] font-black ${proj.impact >= 0 ? 'bg-primary text-black' : 'bg-rose-500 text-white'}`}>
                    {proj.impact >= 0 ? '+' : ''}{formatMv(proj.impact)}
                  </div>
                </div>
                
                <div className="flex flex-col gap-1.5 pt-4 border-t border-white/5">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Base (€)</label>
                  <input 
                    type="number" 
                    value={proj.balance}
                    onChange={(e) => onUpdateTeamBalance(proj.id, Number(e.target.value))}
                    className="w-full bg-background-dark border border-white/10 rounded-xl px-4 py-2 text-sm font-black text-white focus:outline-none focus:border-primary/50"
                  />
                </div>

                <div className="flex justify-between items-end mt-2">
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Final Estimado</span>
                  <span className={`text-2xl font-black ${proj.projected >= 0 ? 'text-primary' : 'text-rose-500'}`}>
                    {formatMv(proj.projected, 2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Fichajes;
