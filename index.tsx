
import React, { useState, useEffect, useRef, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- DATOS INICIALES ---
const MOCK_TEAMS = [
  { id: '1', name: 'Los Galácticos FC', manager: 'Pep Guardiola', points: 1450, balance: 12000000, rank: 1 },
  { id: '2', name: 'Rayo Vallecano', manager: 'User123', points: 1380, balance: -2500000, rank: 2 },
  { id: '3', name: 'Real Betis', manager: 'Manuel P.', points: 1325, balance: 5800000, rank: 3 }
];

// --- COMPONENTE PRINCIPAL ---
const App = () => {
  const [view, setView] = useState('home');
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('biwenger_v3_teams');
    return saved ? JSON.parse(saved) : MOCK_TEAMS;
  });
  const [userId, setUserId] = useState(() => localStorage.getItem('biwenger_v3_uid') || '1');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [simOps, setSimOps] = useState([]);

  useEffect(() => {
    localStorage.setItem('biwenger_v3_teams', JSON.stringify(teams));
    localStorage.setItem('biwenger_v3_uid', userId);
  }, [teams, userId]);

  // Ranking dinámico
  const sortedTeams = useMemo(() => {
    return [...teams].sort((a, b) => b.points - a.points).map((t, i) => ({ ...t, rank: i + 1 }));
  }, [teams]);

  const userTeam = sortedTeams.find(t => t.id === userId) || sortedTeams[0];

  const renderContent = () => {
    switch (view) {
      case 'home':
        return <HomeView team={userTeam} onNavigate={setView} />;
      case 'ranking':
        return <RankingView teams={sortedTeams} onEdit={(t) => { setSelectedTeam(t); setView('edit'); }} onAdd={() => setView('add')} />;
      case 'analysis':
        return <AnalysisView />;
      case 'fichajes':
        return <SimuladorView teams={sortedTeams} ops={simOps} setOps={setSimOps} />;
      case 'edit':
        return <EditView team={selectedTeam} isUser={selectedTeam.id === userId} onSave={(t, isU) => { setTeams(teams.map(x => x.id === t.id ? t : x)); if(isU) setUserId(t.id); setView('ranking'); }} onCancel={() => setView('ranking')} />;
      case 'add':
        return <AddView onSave={(t) => { setTeams([...teams, t]); setView('ranking'); }} onCancel={() => setView('ranking')} />;
      default:
        return <HomeView team={userTeam} onNavigate={setView} />;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark text-white flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-surface-dark border-r border-white/5 sticky top-0 h-screen p-8 shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-black">
            <span className="material-symbols-outlined font-black text-2xl">sports_soccer</span>
          </div>
          <h1 className="font-black text-xl tracking-tight leading-none">BIWENGER<br/><span className="text-primary text-[10px] tracking-widest uppercase">PRO MANAGER</span></h1>
        </div>
        <nav className="flex flex-col gap-2">
          <NavItem icon="home" label="Inicio" active={view === 'home'} onClick={() => setView('home')} />
          <NavItem icon="leaderboard" label="Clasificación" active={view === 'ranking'} onClick={() => setView('ranking')} />
          <NavItem icon="psychology" label="IA Táctica" active={view === 'analysis'} onClick={() => setView('analysis')} />
          <NavItem icon="payments" label="Simulador" active={view === 'fichajes'} onClick={() => setView('fichajes')} />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 pb-24 md:pb-0">{renderContent()}</main>

      {/* Mobile Nav */}
      <nav className="fixed bottom-0 left-0 w-full glass-nav pb-safe md:hidden z-50">
        <div className="flex justify-around items-center h-20">
          <MobileBtn icon="home" active={view === 'home'} onClick={() => setView('home')} />
          <MobileBtn icon="leaderboard" active={view === 'ranking'} onClick={() => setView('ranking')} />
          <MobileBtn icon="psychology" active={view === 'analysis'} onClick={() => setView('analysis')} />
          <MobileBtn icon="payments" active={view === 'fichajes'} onClick={() => setView('fichajes')} />
        </div>
      </nav>
    </div>
  );
};

// --- COMPONENTES DE APOYO ---

const NavItem = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-primary text-black shadow-xl shadow-primary/20' : 'text-slate-400 hover:bg-white/5'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className="text-sm">{label}</span>
  </button>
);

const MobileBtn = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center w-16 transition-all ${active ? 'text-primary scale-110' : 'text-slate-500'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
  </button>
);

const HomeView = ({ team, onNavigate }) => (
  <div className="p-6 md:p-10 animate-slide">
    <h2 className="text-3xl font-black mb-8">Hola, {team.manager} 👋</h2>
    <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-surface-dark to-[#0f1f14] border border-white/10 shadow-2xl">
      <div className="flex justify-between items-start mb-10">
        <div>
          <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Mi Equipo</span>
          <h3 className="text-4xl font-black mt-3 leading-tight">{team.name}</h3>
        </div>
        <div className="size-14 rounded-2xl bg-white/5 flex items-center justify-center text-2xl font-black">{team.rank}º</div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
        <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Puntos</p><p className="text-2xl font-black">{team.points}</p></div>
        <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Saldo</p><p className={`text-2xl font-black ${team.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(team.balance/1000000).toFixed(1)}M</p></div>
      </div>
    </div>
  </div>
);

const RankingView = ({ teams, onEdit, onAdd }) => (
  <div className="p-6 md:p-10 animate-slide">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-3xl font-black">Liga</h1>
      <button onClick={onAdd} className="size-12 rounded-xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20"><span className="material-symbols-outlined font-black">add</span></button>
    </div>
    <div className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden">
      {teams.map((t) => (
        <div key={t.id} className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors group">
          <div className="flex items-center gap-4">
            <span className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black">{t.rank}º</span>
            <div><p className="font-black">{t.name}</p><p className="text-[10px] text-slate-500 uppercase font-bold">{t.manager}</p></div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="font-black text-lg leading-none">{t.points}</p>
              <p className="text-[10px] text-primary font-bold">{(t.balance/1000000).toFixed(1)}M</p>
            </div>
            <button onClick={() => onEdit(t)} className="text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-[18px]">edit</span></button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const SimuladorView = ({ teams, ops, setOps }) => {
  const [tId, setTId] = useState(teams[0]?.id || '');
  const [player, setPlayer] = useState('');
  const [amt, setAmt] = useState(5000000);
  const [mode, setMode] = useState('buy');

  const projections = teams.map(t => {
    const impact = ops.filter(o => o.teamId === t.id).reduce((acc, o) => acc + (o.type === 'buy' ? -o.amt : o.amt), 0);
    return { ...t, projected: t.balance + impact };
  });

  return (
    <div className="p-6 md:p-10 animate-slide">
      <h1 className="text-3xl font-black mb-8">Simulador</h1>
      <div className="p-6 bg-card-dark rounded-3xl border border-white/10 mb-8 space-y-4 shadow-xl">
        <select value={tId} onChange={e => setTId(e.target.value)} className="w-full bg-background-dark p-4 rounded-xl border border-white/10 text-white font-bold appearance-none">{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
        <input placeholder="Nombre del jugador..." value={player} onChange={e => setPlayer(e.target.value)} className="w-full bg-background-dark p-4 rounded-xl border border-white/10 text-white" />
        <input type="number" value={amt} onChange={e => setAmt(Number(e.target.value))} className="w-full bg-background-dark p-4 rounded-xl border border-white/10 text-white font-black" />
        <div className="flex gap-2">
          <button onClick={() => setMode('buy')} className={`flex-1 p-4 rounded-xl font-black ${mode === 'buy' ? 'bg-rose-500 text-white' : 'bg-surface-dark text-slate-500'}`}>COMPRA</button>
          <button onClick={() => setMode('sell')} className={`flex-1 p-4 rounded-xl font-black ${mode === 'sell' ? 'bg-primary text-black' : 'bg-surface-dark text-slate-500'}`}>VENTA</button>
        </div>
        <button onClick={() => { if(!player) return; setOps([{id: Date.now(), teamId: tId, player, amt, type: mode}, ...ops]); setPlayer(''); }} className="w-full py-5 bg-primary text-black font-black rounded-xl shadow-lg shadow-primary/20">AÑADIR A SIMULACIÓN</button>
      </div>
      <div className="space-y-3">
        {projections.map(p => (
          <div key={p.id} className="p-5 bg-surface-dark border border-white/5 rounded-2xl flex justify-between items-center">
            <div><p className="font-bold">{p.name}</p><p className="text-[10px] text-slate-500 uppercase tracking-widest font-black">Saldo Proyectado</p></div>
            <p className={`text-xl font-black ${p.projected >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(p.projected/1000000).toFixed(1)}M</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalysisView = () => {
  const [img, setImg] = useState(null);
  const [res, setRes] = useState(null);
  const [load, setLoad] = useState(false);
  const fileRef = useRef(null);

  const scan = async () => {
    if(!img) return; setLoad(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
      const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: "Analiza esta alineación de Biwenger y dame consejos tácticos. ¿A quién debería vender? ¿Qué posiciones reforzar?" }, { inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }] }]
      });
      setRes(r.text);
    } catch(e) { setRes("Error: Conecta una API Key válida o revisa tu conexión."); } finally { setLoad(false); }
  };

  return (
    <div className="p-6 md:p-10 max-w-xl mx-auto text-center animate-slide">
      <h1 className="text-3xl font-black mb-8">IA Táctica</h1>
      <div onClick={() => fileRef.current.click()} className="aspect-video bg-surface-dark rounded-[2.5rem] border-4 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-6 group hover:border-primary/40 transition-all">
        {img ? <img src={img} className="w-full h-full object-cover" /> : <div className="flex flex-col items-center gap-2"><span className="material-symbols-outlined text-6xl text-primary">add_a_photo</span><p className="text-slate-500 font-bold">Subir captura de tu equipo</p></div>}
        <input type="file" ref={fileRef} className="hidden" onChange={e => { const f = e.target.files[0]; if(f){ const r = new FileReader(); r.onload=()=>setImg(r.result); r.readAsDataURL(f); }}} />
      </div>
      {img && !load && !res && <button onClick={scan} className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl">INICIAR ANÁLISIS IA</button>}
      {load && <div className="flex flex-col items-center gap-4 py-4"><div className="size-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div><p className="text-primary font-black uppercase tracking-widest text-xs">Gemini está pensando...</p></div>}
      {res && <div className="p-6 bg-card-dark rounded-3xl text-left text-sm border border-white/10 leading-relaxed whitespace-pre-wrap shadow-2xl">{res}</div>}
    </div>
  );
};

const EditView = ({ team, isUser, onSave, onCancel }) => {
  const [val, setVal] = useState({...team});
  const [isU, setIsU] = useState(isUser);
  return (
    <div className="p-6 md:p-10 max-w-md mx-auto flex flex-col gap-4 animate-slide">
      <h2 className="text-3xl font-black mb-4 text-center">Editar Equipo</h2>
      <div className="space-y-4">
        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500 ml-2">Nombre</label><input value={val.name} onChange={e => setVal({...val, name: e.target.value})} className="w-full bg-surface-dark p-4 rounded-xl border border-white/10 text-white font-bold" /></div>
        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500 ml-2">Puntos</label><input type="number" value={val.points} onChange={e => setVal({...val, points: Number(e.target.value)})} className="w-full bg-surface-dark p-4 rounded-xl border border-white/10 text-white font-black" /></div>
        <div className="space-y-1"><label className="text-[10px] font-black uppercase text-slate-500 ml-2">Saldo (€)</label><input type="number" value={val.balance} onChange={e => setVal({...val, balance: Number(e.target.value)})} className="w-full bg-surface-dark p-4 rounded-xl border border-white/10 text-white font-black" /></div>
        <button onClick={() => setIsU(!isU)} className={`w-full p-4 rounded-xl border flex justify-between items-center transition-all ${isU ? 'bg-primary/10 border-primary text-primary' : 'bg-surface-dark border-white/5 text-slate-500'}`}><span className="font-bold">Es mi equipo principal</span><span className="material-symbols-outlined">{isU ? 'check_circle' : 'circle'}</span></button>
      </div>
      <div className="flex gap-4 mt-6">
        <button onClick={onCancel} className="flex-1 py-4 border border-white/10 rounded-xl font-bold text-slate-400">Cancelar</button>
        <button onClick={() => onSave(val, isU)} className="flex-1 py-4 bg-primary text-black font-black rounded-xl">Guardar</button>
      </div>
    </div>
  );
};

const AddView = ({ onSave, onCancel }) => {
  const [val, setVal] = useState({ name: '', manager: '', points: 0, balance: 0 });
  return (
    <div className="p-6 md:p-10 max-w-md mx-auto flex flex-col gap-4 animate-slide">
      <h2 className="text-3xl font-black mb-4 text-center">Nuevo Equipo</h2>
      <input value={val.name} onChange={e => setVal({...val, name: e.target.value})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Nombre Equipo" />
      <input value={val.manager} onChange={e => setVal({...val, manager: e.target.value})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Nombre Manager" />
      <div className="flex gap-4 mt-6">
        <button onClick={onCancel} className="flex-1 py-4 border border-white/10 rounded-xl font-bold">Cancelar</button>
        <button onClick={() => onSave({...val, id: Date.now().toString()})} className="flex-1 py-4 bg-primary text-black font-black rounded-xl shadow-lg shadow-primary/20">Crear</button>
      </div>
    </div>
  );
};

// --- RENDERIZADO FINAL ---
const rootElement = document.getElementById('root');
if (rootElement) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
