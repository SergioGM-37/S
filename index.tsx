
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TYPES & INTERFACES ---
type View = 'home' | 'ranking' | 'fichajes' | 'analysis' | 'settings';

interface Team {
  id: string;
  name: string;
  manager: string;
  points: number;
  lastPoints: number;
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

// --- INITIAL DATA ---
const INITIAL_TEAMS: Team[] = [
  { id: '1', name: 'Los Galácticos FC', manager: 'Pep Guardiola', points: 1450, lastPoints: 54, balance: 12000000, rank: 1 },
  { id: '2', name: 'Rayo Vallecano', manager: 'User123', points: 1380, lastPoints: 48, balance: -2500000, rank: 2 },
  { id: '3', name: 'Real Betis', manager: 'Manuel P.', points: 1325, lastPoints: 32, balance: 5800000, rank: 3 }
];

// --- CORE APP ---
const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('biwenger_pro_data');
    return saved ? JSON.parse(saved) : INITIAL_TEAMS;
  });
  const [ops, setOps] = useState<SimulatedOp[]>([]);
  const [userTeamId, setUserTeamId] = useState('1');

  useEffect(() => {
    localStorage.setItem('biwenger_pro_data', JSON.stringify(teams));
  }, [teams]);

  const updateBalance = (id: string, newBalance: number) => {
    setTeams(prev => prev.map(t => t.id === id ? { ...t, balance: newBalance } : t));
  };

  const addSimOp = (op: Omit<SimulatedOp, 'id'>) => {
    setOps(prev => [{ ...op, id: Math.random().toString(36).substr(2, 9) }, ...prev]);
  };

  const removeSimOp = (id: string) => {
    setOps(prev => prev.filter(o => o.id !== id));
  };

  return (
    <Layout activeView={activeView} onNavigate={setActiveView}>
      {activeView === 'home' && <Home teams={teams} userTeamId={userTeamId} onNavigate={setActiveView} />}
      {activeView === 'ranking' && <Ranking teams={teams} onUpdateTeam={setTeams} />}
      {activeView === 'fichajes' && <Fichajes teams={teams} ops={ops} onAddOp={addSimOp} onRemoveOp={removeSimOp} onUpdateBalance={updateBalance} />}
      {activeView === 'analysis' && <Analysis />}
      {activeView === 'settings' && <Settings userTeamId={userTeamId} teams={teams} onSetUser={setUserTeamId} />}
    </Layout>
  );
};

// --- COMPONENTS ---

const Layout: React.FC<{ children: React.ReactNode; activeView: View; onNavigate: (v: View) => void }> = ({ children, activeView, onNavigate }) => (
  <div className="min-h-screen flex flex-col md:flex-row bg-background-dark">
    {/* Sidebar Desktop */}
    <aside className="hidden md:flex flex-col w-72 bg-surface-dark border-r border-white/5 h-screen sticky top-0 p-8 shrink-0">
      <div className="flex items-center gap-4 mb-12">
        <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
          <span className="material-symbols-outlined font-black">sports_soccer</span>
        </div>
        <div>
          <h1 className="font-black text-xl tracking-tight leading-none">BIWENGER</h1>
          <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">PRO MANAGER</span>
        </div>
      </div>
      <nav className="flex flex-col gap-2">
        <NavItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => onNavigate('home')} isSidebar />
        <NavItem icon="leaderboard" label="Clasificación" active={activeView === 'ranking'} onClick={() => onNavigate('ranking')} isSidebar />
        <NavItem icon="document_scanner" label="Analizar IA" active={activeView === 'analysis'} onClick={() => onNavigate('analysis')} isSidebar />
        <NavItem icon="payments" label="Simulador" active={activeView === 'fichajes'} onClick={() => onNavigate('fichajes')} isSidebar />
        <NavItem icon="settings" label="Ajustes" active={activeView === 'settings'} onClick={() => onNavigate('settings')} isSidebar />
      </nav>
    </aside>

    {/* Content */}
    <main className="flex-1 overflow-x-hidden pb-24 md:pb-0">
      <div className="max-w-6xl mx-auto w-full p-4 md:p-8">{children}</div>
    </main>

    {/* Mobile Nav */}
    <nav className="fixed bottom-0 left-0 w-full glass-nav md:hidden z-50">
      <div className="flex justify-around items-center h-[84px] pb-4">
        <NavItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => onNavigate('home')} />
        <NavItem icon="leaderboard" label="Tabla" active={activeView === 'ranking'} onClick={() => onNavigate('ranking')} />
        <NavItem icon="document_scanner" label="IA" active={activeView === 'analysis'} onClick={() => onNavigate('analysis')} />
        <NavItem icon="payments" label="Simula" active={activeView === 'fichajes'} onClick={() => onNavigate('fichajes')} />
      </div>
    </nav>
  </div>
);

const NavItem = ({ icon, label, active, onClick, isSidebar }: any) => (
  <button onClick={onClick} className={`flex ${isSidebar ? 'flex-row items-center gap-4 px-5 py-4 w-full rounded-2xl' : 'flex-col items-center gap-1 w-16'} transition-all ${active ? (isSidebar ? 'bg-primary text-black' : 'text-primary') : 'text-slate-500'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className={`font-black ${isSidebar ? 'text-sm' : 'text-[9px] uppercase tracking-widest'}`}>{label}</span>
  </button>
);

// --- VIEWS ---

const Home = ({ teams, userTeamId, onNavigate }: any) => {
  const userTeam = teams.find((t: any) => t.id === userTeamId) || teams[0];
  const formatMv = (n: number) => (n / 1000000).toFixed(1) + 'M';

  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <p className="text-[10px] uppercase font-black text-primary tracking-widest">Dashboard Pro</p>
          <h1 className="text-3xl font-black">Bienvenido, {userTeam.manager}</h1>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <div onClick={() => onNavigate('ranking')} className="p-8 rounded-[2.5rem] bg-gradient-to-br from-surface-dark to-[#0f1f14] border border-white/10 shadow-2xl cursor-pointer group hover:scale-[1.01] transition-all relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
            <div className="flex justify-between items-start mb-12">
              <div>
                <span className="px-3 py-1 rounded-lg bg-primary/20 text-primary text-[10px] font-black uppercase">Mi Escuadra</span>
                <h3 className="text-4xl font-black mt-3 tracking-tight">{userTeam.name}</h3>
              </div>
              <div className="size-16 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-center text-2xl font-black">{userTeam.rank}º</div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8 pt-8 border-t border-white/5">
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Puntos</p><p className="text-3xl font-black">{userTeam.points}</p></div>
              <div><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Saldo</p><p className={`text-3xl font-black ${userTeam.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{formatMv(userTeam.balance)}</p></div>
              <div className="hidden md:block"><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</p><p className="text-3xl font-black text-white">Saneado</p></div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-xl font-black">Top 5 Liga</h3>
            <button onClick={() => onNavigate('ranking')} className="text-primary text-xs font-black uppercase">Ver Todos</button>
          </div>
          <div className="bg-surface-dark/50 p-4 rounded-[2rem] border border-white/5 flex flex-col gap-2">
            {teams.slice(0, 5).map((t: any) => (
              <div key={t.id} className="flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border border-white/5 transition-all hover:border-white/20">
                <span className="text-xs font-black text-slate-500 w-4">{t.rank}</span>
                <div className="flex-1 min-w-0">
                  <p className="font-bold truncate text-sm">{t.name}</p>
                </div>
                <p className="font-black text-primary text-sm">{t.points}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const Ranking = ({ teams, onUpdateTeam }: any) => {
  const sorted = [...teams].sort((a, b) => b.points - a.points);
  
  return (
    <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4">
      <div className="flex justify-between items-end">
        <h1 className="text-3xl font-black">Clasificación General</h1>
        <p className="text-xs font-bold text-slate-500">{teams.length} equipos activos</p>
      </div>
      <div className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden shadow-2xl">
        <div className="grid grid-cols-[3rem_1fr_4rem_5rem] px-8 py-4 bg-white/5 border-b border-white/10 text-[10px] font-black uppercase text-primary/60 tracking-widest">
          <div className="text-center">#</div>
          <div>Equipo</div>
          <div className="text-right">Pts</div>
          <div className="text-right">Saldo</div>
        </div>
        <div className="flex flex-col divide-y divide-white/5">
          {sorted.map((t, idx) => (
            <div key={t.id} className="grid grid-cols-[3rem_1fr_4rem_5rem] items-center px-8 py-5 hover:bg-white/5 transition-colors group">
              <div className="flex justify-center"><span className="size-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black group-hover:bg-primary group-hover:text-black transition-colors">{idx + 1}</span></div>
              <div className="min-w-0"><p className="font-black truncate text-base">{t.name}</p><p className="text-[10px] font-bold text-slate-500 uppercase">{t.manager}</p></div>
              <div className="text-right font-black text-white">{t.points}</div>
              <div className={`text-right font-black text-xs ${t.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(t.balance / 1000000).toFixed(1)}M</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Fichajes = ({ teams, ops, onAddOp, onRemoveOp, onUpdateBalance }: any) => {
  const [teamId, setTeamId] = useState(teams[0].id);
  const [player, setPlayer] = useState('');
  const [amount, setAmount] = useState(5000000);
  const [type, setType] = useState<'buy' | 'sell'>('buy');

  const projections = useMemo(() => {
    return teams.map((t: any) => {
      const impact = ops.filter((o: any) => o.teamId === t.id).reduce((acc: number, o: any) => acc + (o.type === 'buy' ? -o.amount : o.amount), 0);
      return { ...t, projected: t.balance + impact, impact };
    }).sort((a: any, b: any) => b.projected - a.projected);
  }, [teams, ops]);

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in">
      <div className="xl:col-span-8 flex flex-col gap-8">
        <h1 className="text-3xl font-black">Simulador Financiero</h1>
        <div className="p-8 rounded-[2.5rem] bg-card-dark border border-white/10 shadow-2xl flex flex-col gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Propietario</label>
              <select value={teamId} onChange={e => setTeamId(e.target.value)} className="bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 ring-primary outline-none">
                {teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Jugador</label>
              <input type="text" placeholder="Ej: Lewandowski" value={player} onChange={e => setPlayer(e.target.value)} className="bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white focus:ring-1 ring-primary outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Importe (€)</label>
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white font-black outline-none" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Operación</label>
              <div className="flex bg-background-dark p-1 rounded-2xl border border-white/10 h-full">
                <button onClick={() => setType('buy')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'buy' ? 'bg-rose-500 text-white' : 'text-slate-500'}`}>COMPRA</button>
                <button onClick={() => setType('sell')} className={`flex-1 py-3 rounded-xl text-xs font-black transition-all ${type === 'sell' ? 'bg-primary text-black' : 'text-slate-500'}`}>VENTA</button>
              </div>
            </div>
          </div>
          <button onClick={() => { onAddOp({ teamId, player, amount, type }); setPlayer(''); }} className="w-full py-5 bg-primary text-black font-black rounded-3xl shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all">REGISTRAR EN SIMULADOR</button>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-xl font-black px-2 flex items-center gap-2"><span className="material-symbols-outlined text-primary">history</span> Historial</h3>
          {ops.map((o: any) => (
            <div key={o.id} className="p-6 rounded-[2rem] bg-surface-dark border border-white/5 flex justify-between items-center group">
              <div className="flex items-center gap-4">
                <div className={`size-12 rounded-2xl flex items-center justify-center ${o.type === 'buy' ? 'bg-rose-500/10 text-rose-500' : 'bg-primary/10 text-primary'}`}>
                  <span className="material-symbols-outlined font-black">{o.type === 'buy' ? 'shopping_basket' : 'payments'}</span>
                </div>
                <div><p className="font-black text-lg">{o.player}</p><p className="text-[10px] font-black text-slate-500 uppercase">{teams.find((t: any) => t.id === o.teamId)?.name}</p></div>
              </div>
              <div className="flex items-center gap-6">
                <p className={`font-black text-xl ${o.type === 'buy' ? 'text-rose-500' : 'text-primary'}`}>{o.type === 'buy' ? '-' : '+'}{(o.amount / 1000000).toFixed(1)}M</p>
                <button onClick={() => onRemoveOp(o.id)} className="p-2 text-slate-700 hover:text-rose-500 opacity-0 group-hover:opacity-100 transition-all"><span className="material-symbols-outlined">delete</span></button>
              </div>
            </div>
          ))}
          {ops.length === 0 && <div className="p-20 text-center border-2 border-dashed border-white/5 rounded-[3rem] text-slate-600 font-bold italic">Simulador vacío. Añade una operación para empezar.</div>}
        </div>
      </div>

      <div className="xl:col-span-4 sticky top-8 flex flex-col gap-4">
        <h3 className="text-xl font-black px-2">Proyecciones Finales</h3>
        <div className="flex flex-col gap-3 max-h-[80vh] overflow-y-auto pr-2 no-scrollbar">
          {projections.map((p: any) => (
            <div key={p.id} className="p-6 rounded-[2.5rem] bg-card-dark border border-white/5 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div><p className="font-black text-lg truncate w-40">{p.name}</p><p className="text-[10px] font-bold text-slate-500">Ranking: {p.rank}º</p></div>
                <span className={`text-[10px] font-black px-3 py-1 rounded-full ${p.impact >= 0 ? 'bg-primary/20 text-primary' : 'bg-rose-500/20 text-rose-500'}`}>{p.impact >= 0 ? '+' : ''}{(p.impact / 1000000).toFixed(1)}M</span>
              </div>
              <div className="pt-4 border-t border-white/5">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Saldo Estimado:</p>
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

const Analysis = () => {
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
        contents: [{ parts: [{ text: "Analiza esta imagen de fútbol. Identifica jugadores o estadísticas." }, { inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }] }]
      });
      setRes(response.text || "Análisis completado.");
    } catch (e) {
      setRes("Error: No se pudo conectar con la IA. Asegúrate de tener una API Key configurada.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto flex flex-col gap-8">
      <div className="text-center">
        <h1 className="text-4xl font-black mb-2 tracking-tighter">Escáner IA</h1>
        <p className="text-slate-400 font-medium italic">Gemini 3 Pro analizará tus capturas de pantalla.</p>
      </div>
      <div onClick={() => fileRef.current?.click()} className="aspect-video w-full rounded-[3rem] border-4 border-dashed border-white/5 bg-surface-dark flex flex-col items-center justify-center cursor-pointer overflow-hidden relative group hover:border-primary/20 transition-all">
        {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="text-center"><span className="material-symbols-outlined text-6xl text-primary mb-4">add_a_photo</span><p className="font-black text-slate-500">Subir Captura de Pantalla</p></div>}
        <input type="file" ref={fileRef} className="hidden" onChange={e => {
          const f = e.target.files?.[0];
          if (f) { const r = new FileReader(); r.onload = () => setImg(r.result as string); r.readAsDataURL(f); }
        }} />
      </div>
      {img && !loading && !res && <button onClick={handleScan} className="w-full py-6 bg-primary text-black font-black rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all">INICIAR PROCESAMIENTO IA</button>}
      {loading && <div className="p-10 text-center flex flex-col items-center gap-6"><div className="animate-spin size-16 border-t-4 border-primary rounded-full"></div><p className="font-black text-primary text-xl animate-pulse">ANALIZANDO DATOS...</p></div>}
      {res && (
        <div className="p-8 rounded-[3rem] bg-card-dark border border-primary/30 shadow-2xl animate-in zoom-in-95 duration-300">
          <div className="flex items-center gap-3 mb-6 text-primary"><span className="material-symbols-outlined font-black">auto_awesome</span><h3 className="font-black text-xl">Informe Generado</h3></div>
          <p className="text-slate-200 leading-relaxed font-medium whitespace-pre-wrap text-sm">{res}</p>
          <button onClick={() => { setImg(null); setRes(null); }} className="mt-8 w-full py-4 border border-white/10 rounded-2xl text-slate-500 text-sm font-black hover:bg-white/5">NUEVO ESCANEO</button>
        </div>
      )}
    </div>
  );
};

const Settings = ({ userTeamId, teams, onSetUser }: any) => (
  <div className="p-6 max-w-xl mx-auto flex flex-col gap-8 animate-in fade-in">
    <h1 className="text-3xl font-black">Configuración</h1>
    <div className="flex flex-col gap-6">
      <div className="bg-surface-dark p-8 rounded-[2.5rem] border border-white/5">
        <h3 className="font-black text-xl mb-6">Tu Equipo Principal</h3>
        <select value={userTeamId} onChange={e => onSetUser(e.target.value)} className="w-full bg-background-dark border border-white/10 rounded-2xl px-5 py-4 text-white font-bold outline-none