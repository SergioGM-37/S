
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- INTERFACES ---
type View = 'home' | 'ranking' | 'fichajes' | 'analysis' | 'settings';

interface Team {
  id: string;
  name: string;
  manager: string;
  points: number;
  balance: number;
  rank: number;
}

interface SimulatedOp {
  id: string;
  teamId: string;
  player: string;
  amount: number;
  type: 'buy' | 'sell';
}

// --- DATA INICIAL ---
const MOCK_TEAMS: Team[] = [
  { id: '1', name: 'Los Galácticos FC', manager: 'Pep Guardiola', points: 1450, balance: 12000000, rank: 1 },
  { id: '2', name: 'Rayo Vallecano', manager: 'User123', points: 1380, balance: -2500000, rank: 2 },
  { id: '3', name: 'Real Betis', manager: 'Manuel P.', points: 1325, balance: 5800000, rank: 3 }
];

// --- APP ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('biwenger_pro_v2_teams');
    return saved ? JSON.parse(saved) : MOCK_TEAMS;
  });
  const [ops, setOps] = useState<SimulatedOp[]>(() => {
    const saved = localStorage.getItem('biwenger_pro_v2_ops');
    return saved ? JSON.parse(saved) : [];
  });
  const [userTeamId, setUserTeamId] = useState(() => localStorage.getItem('biwenger_pro_v2_user_id') || '1');

  useEffect(() => {
    localStorage.setItem('biwenger_pro_v2_teams', JSON.stringify(teams));
    localStorage.setItem('biwenger_pro_v2_ops', JSON.stringify(ops));
    localStorage.setItem('biwenger_pro_v2_user_id', userTeamId);
  }, [teams, ops, userTeamId]);

  const addOp = (op: Omit<SimulatedOp, 'id'>) => {
    setOps(prev => [{ ...op, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
  };

  const removeOp = (id: string) => setOps(prev => prev.filter(o => o.id !== id));
  const clearOps = () => setOps([]);

  const updateTeamBalance = (id: string, balance: number) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, balance } : t));
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background-dark overflow-x-hidden">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-surface-dark border-r border-white/5 h-screen sticky top-0 p-8 shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined font-black">sports_soccer</span>
          </div>
          <div>
            <h1 className="font-black text-xl tracking-tighter leading-none">BIWENGER</h1>
            <span className="text-primary text-[10px] font-black tracking-[0.3em] uppercase">PRO ANALYTICS</span>
          </div>
        </div>
        <nav className="flex flex-col gap-2">
          <SidebarItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => setActiveView('home')} />
          <SidebarItem icon="leaderboard" label="Clasificación" active={activeView === 'ranking'} onClick={() => setActiveView('ranking')} />
          <SidebarItem icon="document_scanner" label="IA Táctica" active={activeView === 'analysis'} onClick={() => setActiveView('analysis')} />
          <SidebarItem icon="payments" label="Simulador" active={activeView === 'fichajes'} onClick={() => setActiveView('fichajes')} />
          <SidebarItem icon="settings" label="Ajustes" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full pb-28 md:pb-8">
        <div className="max-w-5xl mx-auto p-4 md:p-8">
          {activeView === 'home' && <HomeView teams={teams} userTeamId={userTeamId} onNav={setActiveView} />}
          {activeView === 'ranking' && <RankingView teams={teams} onSetTeams={setTeams} />}
          {activeView === 'fichajes' && <SimuladorView teams={teams} ops={ops} onAdd={addOp} onRemove={removeOp} onClear={clearOps} onUpdateBalance={updateTeamBalance} />}
          {activeView === 'analysis' && <AnalysisView />}
          {activeView === 'settings' && <SettingsView userTeamId={userTeamId} teams={teams} onSetUser={setUserTeamId} />}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full glass-nav md:hidden z-50">
        <div className="flex justify-around items-center h-[84px] pb-4">
          <MobileNavItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => setActiveView('home')} />
          <MobileNavItem icon="leaderboard" label="Tabla" active={activeView === 'ranking'} onClick={() => setActiveView('ranking')} />
          <MobileNavItem icon="document_scanner" label="IA" active={activeView === 'analysis'} onClick={() => setActiveView('analysis')} />
          <MobileNavItem icon="payments" label="Simula" active={activeView === 'fichajes'} onClick={() => setActiveView('fichajes')} />
        </div>
      </nav>
    </div>
  );
};

// --- SUB-COMPONENTS ---

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-5 py-4 w-full rounded-2xl transition-all ${active ? 'bg-primary text-black shadow-xl shadow-primary/10' : 'text-slate-500 hover:bg-white/5 hover:text-white'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const MobileNavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 w-16 transition-all ${active ? 'text-primary active-dot' : 'text-slate-500'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className="font-black text-[9px] uppercase tracking-widest">{label}</span>
  </button>
);

// --- VIEWS ---

const HomeView = ({ teams, userTeamId, onNav }: any) => {
  const userTeam = teams.find((t: any) => t.id === userTeamId) || teams[0];
  const formatMv = (n: number) => (n / 1000000).toFixed(1) + 'M';

  return (
    <div className="animate-slide space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase font-black text-primary tracking-widest mb-1">PRO MANAGER DASHBOARD</p>
          <h2 className="text-3xl font-black">Hola, {userTeam.manager} 👋</h2>
        </div>
        <div className="hidden sm:flex bg-surface-dark border border-white/5 px-4 py-2 rounded-2xl items-center gap-3">
          <div className="size-2 rounded-full bg-primary animate-pulse"></div>
          <span className="text-xs font-bold text-slate-400">Liga Sincronizada</span>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div onClick={() => onNav('ranking')} className="group relative p-8 rounded-[2.5rem] bg-gradient-to-br from-surface-dark to-[#0f1f14] border border-white/10 shadow-2xl cursor-pointer hover:scale-[1.01] transition-all overflow-hidden">
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-primary/10 rounded-full blur-[80px]"></div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">Mi Escuadra</span>
                <h3 className="text-4xl font-black mt-3">{userTeam.name}</h3>
              </div>
              <div className="size-16 rounded-[1.5rem] bg-white/5 border border-white/10 flex items-center justify-center text-3xl font-black">{userTeam.rank}º</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntos Totales</p><p className="text-3xl font-black">{userTeam.points}</p></div>
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo Actual</p><p className={`text-3xl font-black ${userTeam.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{formatMv(userTeam.balance)}</p></div>
              <div className="hidden md:block"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</p><p className="text-3xl font-black">Liderando</p></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <h3 className="text-xl font-black px-2">Top 5 de la Liga</h3>
          <div className="bg-surface-dark/50 p-3 rounded-[2rem] border border-white/5 flex flex-col gap-2">
            {teams.slice(0, 5).sort((a: any, b: any) => b.points - a.points).map((t: any, idx: number) => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5 hover:border-white/20 transition-all">
                <span className="text-xs font-black text-slate-500 w-4">{idx + 1}</span>
                <div className="flex-1 truncate"><p className="font-bold text-sm truncate">{t.name}</p></div>
                <p className="font-black text-primary text-sm">{t.points}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const RankingView = ({ teams, onSetTeams }: any) => {
  const sorted = [...teams].sort((a, b) => b.points - a.points);
  return (
    <div className="animate-slide space-y-6">
      <h1 className="text-4xl font-black tracking-tighter">Clasificación</h1>
      <div className="bg-surface-dark rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-[3rem_1fr_4rem_5rem] px-8 py-5 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase text-primary tracking-widest">
          <div className="text-center">#</div>
          <div>Equipo</div>
          <div className="text-right">Pts</div>
          <div className="text-right">Saldo</div>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {sorted.map((t, idx) => (
            <div key={t.id} className="grid grid-cols-[3rem_1fr_4rem_5rem] items-center px-8 py-6 hover:bg-white/5 transition-colors group">
              <div className="flex justify-center"><span className="size-8 rounded-xl bg-white/5 flex items-center justify-center text-xs font-black group-hover:bg-primary group-hover:text-black transition-all">{idx + 1}</span></div>
              <div className="min-w-0 pr-4"><p className="font-black truncate text-base">{t.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase">{t.manager}</p></div>
              <div className="text-right font-black text-white">{t.points}</div>
              <div className={`text-right font-black text-xs ${t.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(t.balance / 1000000).toFixed(1)}M</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimuladorView = ({ teams, ops, onAdd, onRemove, onClear, onUpdateBalance }: any) => {
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [player, setPlayer] = useState('');
  const [amount, setAmount] = useState(5000000);
  const [type, setType] = useState<'buy' | 'sell'>('buy');

  const projections = useMemo(() => {
    return teams.map((t: any) => {
      const impact = ops.filter((o: any) => o.teamId === t.id).reduce((acc: number, o: any) => acc + (o.type === 'buy' ? -o.amount : o.amount), 0);
      return { ...t, projected: t.balance + impact, impact };
    }).sort((a: any, b: any) => b.projected - a.projected);
  }, [teams, ops]);

  const handleAdd = () => {
    if (!player || !teamId) return;
    onAdd({ teamId, player, amount, type });
    setPlayer('');
  };

  return (
    <div className="animate-slide grid grid-cols-1 xl:grid-cols-12 gap-8">
      <div className="xl:col-span-8 space-y-8">
        <h1 className="text-4xl font-black tracking-tighter">Simulador Pro</h1>
        <div className="p-8 rounded-[3rem] bg-card-dark border border-white/10 shadow-2xl space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Propietario</label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 ring-primary/20">
                {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jugador</label>
              <input type="text" placeholder="Nombre..." value={player} onChange={e => setPlayer(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Importe (€)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white font-black outline-none focus:ring-2 ring-primary/20" />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operación</label>
              <div className="flex bg-background-dark p-1 rounded-2xl border border-white/10">
                <button onClick={() => setType('buy')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'buy' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>COMPRA</button>
                <button onClick={() => setType('sell')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'sell' ? 'bg-primary text-black' : 'text-slate-500'}`}>VENTA</button>
              </div>
            </div>
          </div>
          <button onClick={handleAdd} className="w-full py-5 bg-primary text-black font-black rounded-[2rem] shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">REGISTRAR MOVIMIENTO</button>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black">Historial Simulado</h3>
            {ops.length > 0 && <button onClick={onClear} className="text-rose-500 text-xs font-black uppercase">Limpiar Todo</button>}
          </div>
          {ops.map((o: any) => (
            <div key={o.id} className="p-6 rounded-[2rem] bg-surface-dark border border-white/5 flex justify-between items-center group animate-slide">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${o.type === 'buy' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined font-black">{o.type === 'buy' ? 'remove' : 'add'}</span>
                </div>
                <div><p className="font-black text-lg">{o.player}</p><p className="text-[10px] font-bold text-slate-500 uppercase">{teams.find((t: any) => t.id === o.teamId)?.name}</p></div>
              </div>
              <div className="flex items-center gap-6">
                <p className={`font-black text-xl ${o.type === 'buy' ? 'text-rose-500' : 'text-primary'}`}>{o.type === 'buy' ? '-' : '+'}{(o.amount / 1000000).toFixed(1)}M</p>
                <button onClick={() => onRemove(o.id)} className="p-2 text-slate-700 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined">delete</span></button>
              </div>
            </div>
          ))}
          {ops.length === 0 && <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-slate-600 font-bold italic">No hay operaciones simuladas.</div>}
        </div>
      </div>

      <div className="xl:col-span-4 space-y-6">
        <h3 className="text-xl font-black px-2">Proyección de Saldos</h3>
        <div className="flex flex-col gap-3">
          {projections.map((p: any) => (
            <div key={p.id} className="p-6 rounded-[2.5rem] bg-card-dark border border-white/5 space-y-4 shadow-xl">
              <div className="flex justify-between items-start">
                <div><p className="font-black text-lg truncate w-40 leading-none">{p.name}</p><p className="text-[10px] font-bold text-slate-500 mt-1">Ranking: {p.rank}º</p></div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${p.impact >= 0 ? 'bg-primary/10 text-primary' : 'bg-rose-500/10 text-rose-500'}`}>{p.impact >= 0 ? '+' : ''}{(p.impact / 1000000).toFixed(1)}M</span>
              </div>
              <div className="pt-4 border-t border-white/5 space-y-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Base (€)</p>
                  <input type="number" value={p.balance} onChange={e => onUpdateBalance(p.id, Number(e.target.value))} className="w-full bg-background-dark/50 border border-white/5 rounded-xl px-4 py-2 text-sm font-black text-white outline-none focus:border-primary/30" />
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Saldo Final:</p>
                  <p className={`text-3xl font-black ${p.projected >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(p.projected / 1000000).toFixed(1)}M</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const AnalysisView = () => {
  const [img, setImg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [res, setRes] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!img) return;
    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: "Analiza esta imagen de fútbol (jugadores, tácticas o stats). Responde en español." }, { inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }] }]
      });
      setRes(response.text || "Análisis completado.");
    } catch (e) {
      setRes("Error de conexión. Asegúrate de que la App tenga acceso a internet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-slide max-w-2xl mx-auto space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-black tracking-tighter">IA Táctica</h1>
        <p className="text-slate-400 font-medium italic">Sube una captura de tu equipo para recibir consejos de Gemini 3.</p>
      </div>
      <div onClick={() => fileRef.current?.click()} className="aspect-video w-full rounded-[3rem] border-4 border-dashed border-white/5 bg-surface-dark flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-primary/20 transition-all">
        {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="text-center"><span className="material-symbols-outlined text-6xl text-primary mb-4">add_a_photo</span><p className="font-black text-slate-500">Subir Captura de Pantalla</p></div>}
        <input type="file" ref={fileRef} className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (f) { const r = new FileReader(); r.onload = () => setImg(r.result as string); r.readAsDataURL(f); }
        }} />
      </div>
      {img && !loading && !res && <button onClick={handleScan} className="w-full py-6 bg-primary text-black font-black rounded-3xl shadow-2xl hover:scale-[1.01] transition-all">ANÁLISIS INTELIGENTE</button>}
      {loading && <div className="text-center py-10 space-y-4"><div className="animate-spin size-12 border-t-2 border-primary rounded-full mx-auto"></div><p className="font-black text-primary animate-pulse tracking-widest uppercase text-xs">Procesando Estrategia...</p></div>}
      {res && (
        <div className="p-8 rounded-[3rem] bg-card-dark border border-primary/30 shadow-2xl animate-slide">
          <div className="flex items-center gap-3 mb-6 text-primary"><span className="material-symbols-outlined font-black">auto_awesome</span><h3 className="font-black text-xl">Informe del Scouting IA</h3></div>
          <p className="text-slate-200 leading-relaxed font-medium whitespace-pre-wrap text-sm">{res}</p>
          <button onClick={() => { setImg(null); setRes(null); }} className="mt-8 w-full py-4 border border-white/10 rounded-2xl text-slate-500 text-sm font-black hover:bg-white/5">NUEVO ESCANEO</button>
        </div>
      )}
    </div>
  );
};

const SettingsView = ({ userTeamId, teams, onSetUser }: any) => (
  <div className="animate-slide max-w-xl mx-auto space-y-8">
    <h1 className="text-4xl font-black tracking-tighter">Ajustes</h1>
    <div className="bg-surface-dark p-8 rounded-[2.5rem] border border-white/5 space-y-6">
      <div className="space-y-3">
        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Seleccionar Mi Equipo</label>
        <select value={userTeamId} onChange={e => onSetUser(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none focus:ring-2 ring-primary/20">
          {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <p className="text-xs text-slate-500 italic">Este equipo se usará como referencia principal en el inicio.</p>
      </div>
    </div>
    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/20 space-y-2">
      <h3 className="text-primary font-black text-lg">Acerca de Biwenger Pro</h3>
      <p className="text-xs text-slate-400 leading-relaxed">Versión 2.0.1. Todos los datos se almacenan de forma local en el navegador (Local Storage). La IA utiliza el modelo Gemini 3 Pro para análisis avanzado de capturas.</p>
    </div>
  </div>
);

// --- MOUNT ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
