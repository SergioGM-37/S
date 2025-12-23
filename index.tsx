
import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI, Type } from "@google/genai";

// --- TIPOS ---
type View = 'home' | 'ranking' | 'fichajes' | 'analysis' | 'settings' | 'team-details' | 'edit-team' | 'add-team';

interface Team {
  id: string;
  name: string;
  manager: string;
  points: number;
  lastPoints: number;
  balance: number;
  logo: string;
  rank: number;
}

interface SimulatedOperation {
  id: string;
  teamId: string;
  playerName: string;
  amount: number;
  type: 'buy' | 'sell';
}

// --- DATOS INICIALES ---
const MOCK_TEAMS: Team[] = [
  { id: '1', name: 'Los Galácticos FC', manager: 'Pep Guardiola', points: 1450, lastPoints: 54, balance: 12000000, logo: '', rank: 1 },
  { id: '2', name: 'Rayo Vallecano', manager: 'User123', points: 1380, lastPoints: 48, balance: -2500000, logo: '', rank: 2 },
  { id: '3', name: 'Real Betis', manager: 'Manuel P.', points: 1325, lastPoints: 32, balance: 5800000, logo: '', rank: 3 }
];

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('biwenger_v3_teams');
    return saved ? JSON.parse(saved) : MOCK_TEAMS;
  });
  const [simOps, setSimOps] = useState<SimulatedOperation[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [userTeamId, setUserTeamId] = useState(() => localStorage.getItem('biwenger_v3_user_id') || '1');

  useEffect(() => {
    localStorage.setItem('biwenger_v3_teams', JSON.stringify(teams));
    localStorage.setItem('biwenger_v3_user_id', userTeamId);
  }, [teams, userTeamId]);

  // Ranking automático
  useEffect(() => {
    const sorted = [...teams].sort((a, b) => b.points - a.points);
    const ranked = sorted.map((t, idx) => ({ ...t, rank: idx + 1 }));
    if (JSON.stringify(ranked) !== JSON.stringify(teams)) setTeams(ranked);
  }, [teams]);

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <HomeView teams={teams} userTeamId={userTeamId} onNav={setActiveView} onNavTeam={(t) => { setSelectedTeam(t); setActiveView('team-details'); }} />;
      case 'ranking':
        return <RankingView teams={teams} onAdd={() => setActiveView('add-team')} onEdit={(t) => { setSelectedTeam(t); setActiveView('edit-team'); }} onNavTeam={(t) => { setSelectedTeam(t); setActiveView('team-details'); }} />;
      case 'fichajes':
        return <FichajesView teams={teams} ops={simOps} setOps={setSimOps} onUpdateBalance={(id, val) => setTeams(teams.map(t => t.id === id ? {...t, balance: val} : t))} />;
      case 'analysis':
        return <AnalysisView />;
      case 'team-details':
        return selectedTeam ? <TeamDetailsView team={selectedTeam} onBack={() => setActiveView('ranking')} /> : null;
      case 'edit-team':
        return selectedTeam ? <EditTeamView team={selectedTeam} isUser={selectedTeam.id === userTeamId} onSave={(t, isU) => { setTeams(teams.map(x => x.id === t.id ? t : x)); if (isU) setUserTeamId(t.id); setActiveView('home'); }} onCancel={() => setActiveView('home')} /> : null;
      case 'add-team':
        return <AddTeamView onSave={(t) => { setTeams([...teams, t]); setActiveView('ranking'); }} onCancel={() => setActiveView('ranking')} />;
      case 'settings':
        return <SettingsView userTeamId={userTeamId} teams={teams} onSetUser={setUserTeamId} />;
      default:
        return <HomeView teams={teams} userTeamId={userTeamId} onNav={setActiveView} onNavTeam={(t) => { setSelectedTeam(t); setActiveView('team-details'); }} />;
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-background-dark text-white flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-surface-dark border-r border-white/5 sticky top-0 h-screen p-8 shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
            <span className="material-symbols-outlined font-black text-2xl">sports_soccer</span>
          </div>
          <div>
            <h1 className="font-black text-xl leading-none">BIWENGER</h1>
            <span className="text-primary text-[10px] font-black tracking-widest uppercase">PRO MANAGER</span>
          </div>
        </div>
        <nav className="flex flex-col gap-3">
          <SidebarItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => setActiveView('home')} />
          <SidebarItem icon="leaderboard" label="Clasificación" active={activeView === 'ranking'} onClick={() => setActiveView('ranking')} />
          <SidebarItem icon="document_scanner" label="Analizar IA" active={activeView === 'analysis'} onClick={() => setActiveView('analysis')} />
          <SidebarItem icon="payments" label="Simulador" active={activeView === 'fichajes'} onClick={() => setActiveView('fichajes')} />
          <SidebarItem icon="settings" label="Ajustes" active={activeView === 'settings'} onClick={() => setActiveView('settings')} />
        </nav>
      </aside>

      <main className="flex-1 pb-28 md:pb-0 overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">{renderContent()}</div>
      </main>

      {/* Nav Móvil */}
      <nav className="fixed bottom-0 left-0 z-40 w-full glass-nav pb-safe md:hidden">
        <div className="flex items-center justify-around h-[84px] px-2 pb-4">
          <NavItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => setActiveView('home')} />
          <NavItem icon="leaderboard" label="Tabla" active={activeView === 'ranking'} onClick={() => setActiveView('ranking')} />
          <NavItem icon="document_scanner" label="IA" active={activeView === 'analysis'} onClick={() => setActiveView('analysis')} />
          <NavItem icon="payments" label="Simula" active={activeView === 'fichajes'} onClick={() => setActiveView('fichajes')} />
        </div>
      </nav>
    </div>
  );
};

// --- SUBCOMPONENTE HELPERS ---
const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-primary text-black' : 'text-slate-400 hover:bg-white/5'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 w-16">
    <span className={`material-symbols-outlined transition-all ${active ? 'text-primary scale-110' : 'text-slate-500'}`} style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
  </button>
);

// --- VISTAS ---
const HomeView = ({ teams, userTeamId, onNav, onNavTeam }: any) => {
  const userTeam = teams.find((t: any) => t.id === userTeamId) || teams[0];
  return (
    <div className="p-6 md:p-10 flex flex-col gap-8 animate-slide">
      <h2 className="text-3xl font-black">Hola, {userTeam.manager} 👋</h2>
      <div onClick={() => onNavTeam(userTeam)} className="relative overflow-hidden p-8 rounded-[2.5rem] bg-gradient-to-br from-surface-dark to-[#0f1f14] border border-white/10 shadow-2xl cursor-pointer hover:scale-[1.01] transition-all">
        <div className="flex justify-between items-start mb-8">
          <div><span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Mi Equipo</span><h3 className="text-4xl font-black mt-3">{userTeam.name}</h3></div>
          <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-black">{userTeam.rank}º</div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
          <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Puntos</p><p className="text-2xl font-black">{userTeam.points}</p></div>
          <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Saldo</p><p className={`text-2xl font-black ${userTeam.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(userTeam.balance/1000000).toFixed(1)}M</p></div>
        </div>
      </div>
    </div>
  );
};

const RankingView = ({ teams, onAdd, onEdit, onNavTeam }: any) => (
  <div className="p-6 md:p-10 flex flex-col gap-6 animate-slide">
    <div className="flex justify-between items-center"><h1 className="text-3xl font-black">Clasificación</h1><button onClick={onAdd} className="size-12 rounded-xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20"><span className="material-symbols-outlined font-black">add</span></button></div>
    <div className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden">
      {teams.map((t: any) => (
        <div key={t.id} onClick={() => onNavTeam(t)} className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors">
          <div className="flex items-center gap-4">
            <span className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black">{t.rank}º</span>
            <div><p className="font-black">{t.name}</p><p className="text-[10px] text-slate-500 uppercase font-bold">{t.manager}</p></div>
          </div>
          <div className="flex items-center gap-6">
            <p className="font-black">{t.points}</p>
            <button onClick={(e) => { e.stopPropagation(); onEdit(t); }} className="text-slate-600 hover:text-white"><span className="material-symbols-outlined text-[18px]">edit</span></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const FichajesView = ({ teams, ops, setOps, onUpdateBalance }: any) => {
  const [teamId, setTeamId] = useState(teams[0]?.id || '');
  const [player, setPlayer] = useState('');
  const [amount, setAmount] = useState(10000000);
  const [type, setType] = useState<'buy' | 'sell'>('buy');
  
  const projections = teams.map(t => {
    const impact = ops.filter((o: any) => o.teamId === t.id).reduce((acc: number, o: any) => acc + (o.type === 'buy' ? -o.amount : o.amount), 0);
    return { ...t, projected: t.balance + impact };
  });

  return (
    <div className="p-6 md:p-10 flex flex-col gap-8 animate-slide">
      <h1 className="text-3xl font-black">Simulador</h1>
      <div className="p-8 bg-card-dark rounded-[2.5rem] border border-white/10 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select value={teamId} onChange={e => setTeamId(e.target.value)} className="bg-background-dark border border-white/10 rounded-xl p-4 text-white font-bold">{teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          <input type="text" placeholder="Jugador..." value={player} onChange={e => setPlayer(e.target.value)} className="bg-background-dark border border-white/10 rounded-xl p-4 text-white" />
          <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="bg-background-dark border border-white/10 rounded-xl p-4 text-white font-black" />
          <div className="flex gap-2"><button onClick={() => setType('buy')} className={`flex-1 p-4 rounded-xl font-black ${type === 'buy' ? 'bg-rose-500' : 'bg-surface-dark text-slate-500'}`}>COMPRA</button><button onClick={() => setType('sell')} className={`flex-1 p-4 rounded-xl font-black ${type === 'sell' ? 'bg-primary text-black' : 'bg-surface-dark text-slate-500'}`}>VENTA</button></div>
        </div>
        <button onClick={() => { if(!player) return; setOps([...ops, {id: Date.now().toString(), teamId, playerName: player, amount, type}]); setPlayer(''); }} className="w-full py-4 bg-primary text-black font-black rounded-2xl shadow-xl shadow-primary/20">AÑADIR A SIMULACIÓN</button>
      </div>
      <div className="space-y-4">
        {projections.map((p: any) => (
          <div key={p.id} className="p-6 bg-surface-dark rounded-3xl border border-white/5 flex justify-between items-center">
            <div><p className="font-black text-lg">{p.name}</p><p className="text-[10px] text-slate-500 uppercase font-black">Saldo proyectado</p></div>
            <p className={`text-2xl font-black ${p.projected >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(p.projected/1000000).toFixed(1)}M</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisView = () => {
  const [img, setImg] = useState<string | null>(null);
  const [res, setRes] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleScan = async () => {
    if (!img) return; setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: "Analiza esta alineación de Biwenger. Sugiere cambios y jugadores a vender." }, { inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }] }]
      });
      setRes(response.text);
    } catch (e) { setRes("Error de conexión con la IA."); } finally { setLoading(false); }
  };

  return (
    <div className="p-10 max-w-xl mx-auto flex flex-col gap-8 animate-slide text-center">
      <h1 className="text-3xl font-black">IA Táctica</h1>
      <div onClick={() => fileRef.current?.click()} className="aspect-video w-full rounded-[2.5rem] border-4 border-dashed border-white/5 bg-surface-dark flex flex-col items-center justify-center cursor-pointer overflow-hidden group">
        {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-6xl text-primary">add_a_photo</span>}
        <input type="file" ref={fileRef} className="hidden" onChange={e => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = () => setImg(r.result as string); r.readAsDataURL(f); } }} />
      </div>
      {img && !loading && !res && <button onClick={handleScan} className="py-5 bg-primary text-black font-black rounded-2xl shadow-2xl">INICIAR ESCANEO IA</button>}
      {loading && <div className="animate-pulse text-primary font-black uppercase tracking-widest text-xs">Analizando tu estrategia...</div>}
      {res && <div className="p-8 bg-card-dark border border-primary/20 rounded-[2rem] text-left text-sm leading-relaxed whitespace-pre-wrap">{res}</div>}
    </div>
  );
};

const TeamDetailsView = ({ team, onBack }: any) => (
  <div className="p-8 flex flex-col gap-8 animate-slide">
    <button onClick={onBack} className="w-fit text-primary font-black uppercase tracking-widest text-xs flex items-center gap-2"><span className="material-symbols-outlined">arrow_back</span> Volver</button>
    <div className="p-10 bg-card-dark rounded-[3rem] border border-white/10">
      <h2 className="text-4xl font-black mb-2">{team.name}</h2>
      <p className="text-primary font-black uppercase tracking-widest text-xs">{team.manager}</p>
      <div className="grid grid-cols-2 gap-8 mt-10">
        <div><p className="text-slate-500 font-black uppercase text-[10px]">Puntos Totales</p><p className="text-3xl font-black">{team.points}</p></div>
        <div><p className="text-slate-500 font-black uppercase text-[10px]">Posición Liga</p><p className="text-3xl font-black">{team.rank}º</p></div>
      </div>
    </div>
  </div>
);

const EditTeamView = ({ team, isUser, onSave, onCancel }: any) => {
  const [data, setData] = useState({...team});
  const [isU, setIsU] = useState(isUser);
  return (
    <div className="p-10 max-w-lg mx-auto flex flex-col gap-6 animate-slide">
      <h2 className="text-2xl font-black">Editar Equipo</h2>
      <input value={data.name} onChange={e => setData({...data, name: e.target.value})} className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white font-bold" />
      <input value={data.manager} onChange={e => setData({...data, manager: e.target.value})} className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white font-bold" />
      <input type="number" value={data.points} onChange={e => setData({...data, points: Number(e.target.value)})} className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white font-black" />
      <div onClick={() => setIsU(!isU)} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center ${isU ? 'bg-primary/10 border-primary' : 'bg-surface-dark border-white/5'}`}>
        <p className="font-bold">Es mi equipo principal</p>
        <span className="material-symbols-outlined text-primary">{isU ? 'check_circle' : 'circle'}</span>
      </div>
      <div className="flex gap-4"><button onClick={onCancel} className="flex-1 py-4 border border-white/10 rounded-xl text-slate-500 font-bold">CANCELAR</button><button onClick={() => onSave(data, isU)} className="flex-1 py-4 bg-primary text-black rounded-xl font-black">GUARDAR</button></div>
    </div>
  );
};

const AddTeamView = ({ onSave, onCancel }: any) => {
  const [data, setData] = useState({ name: '', manager: '', points: 0, balance: 0, lastPoints: 0, logo: '', rank: 0 });
  return (
    <div className="p-10 max-w-lg mx-auto flex flex-col gap-6 animate-slide">
      <h2 className="text-2xl font-black">Nuevo Equipo</h2>
      <input placeholder="Nombre Equipo" value={data.name} onChange={e => setData({...data, name: e.target.value})} className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white" />
      <input placeholder="Manager" value={data.manager} onChange={e => setData({...data, manager: e.target.value})} className="bg-surface-dark border border-white/10 rounded-xl p-4 text-white" />
      <button onClick={() => onSave({...data, id: Date.now().toString()})} className="py-4 bg-primary text-black font-black rounded-xl shadow-xl">CREAR EQUIPO</button>
      <button onClick={onCancel} className="py-4 text-slate-500 font-bold">CANCELAR</button>
    </div>
  );
};

const SettingsView = ({ userTeamId, teams, onSetUser }: any) => (
  <div className="p-10 max-w-lg mx-auto flex flex-col gap-8 animate-slide">
    <h1 className="text-3xl font-black">Ajustes</h1>
    <div className="space-y-4">
      <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Mi Perfil Principal</label>
      <select value={userTeamId} onChange={e => onSetUser(e.target.value)} className="w-full bg-surface-dark border border-white/10 rounded-xl p-4 text-white font-bold">{teams.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
    </div>
  </div>
);

// --- RENDER ---
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);
