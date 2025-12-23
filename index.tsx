
import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleGenAI } from "@google/genai";

// --- CONFIGURACIÓN Y MOCKS ---
const MOCK_TEAMS = [
  { id: '1', name: 'Los Galácticos FC', manager: 'Pep Guardiola', points: 1450, balance: 12000000, rank: 1 },
  { id: '2', name: 'Rayo Vallecano', manager: 'User123', points: 1380, balance: -2500000, rank: 2 },
  { id: '3', name: 'Real Betis', manager: 'Manuel P.', points: 1325, balance: 5800000, rank: 3 }
];

const App = () => {
  const [view, setView] = useState('home');
  const [teams, setTeams] = useState(() => {
    const saved = localStorage.getItem('biwenger_pro_teams');
    return saved ? JSON.parse(saved) : MOCK_TEAMS;
  });
  const [userId, setUserId] = useState(() => localStorage.getItem('biwenger_pro_uid') || '1');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [simOps, setSimOps] = useState([]);

  useEffect(() => {
    localStorage.setItem('biwenger_pro_teams', JSON.stringify(teams));
    localStorage.setItem('biwenger_pro_uid', userId);
  }, [teams, userId]);

  // Vistas
  const renderView = () => {
    const userTeam = teams.find(t => t.id === userId) || teams[0];

    switch(view) {
      case 'home':
        return (
          <div className="p-6 md:p-10 animate-slide">
            <h2 className="text-3xl font-black mb-8">Hola, {userTeam.manager} 👋</h2>
            <div className="p-8 rounded-[2.5rem] bg-gradient-to-br from-surface-dark to-[#0f1f14] border border-white/10 shadow-2xl">
              <span className="text-primary text-[10px] font-black uppercase tracking-widest bg-primary/10 px-3 py-1 rounded-full">Mi Equipo</span>
              <h3 className="text-4xl font-black mt-3 mb-8">{userTeam.name}</h3>
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-white/5">
                <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Puntos</p><p className="text-2xl font-black">{userTeam.points}</p></div>
                <div><p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Saldo</p><p className={`text-2xl font-black ${userTeam.balance >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(userTeam.balance/1000000).toFixed(1)}M</p></div>
              </div>
            </div>
          </div>
        );
      case 'ranking':
        return (
          <div className="p-6 md:p-10 animate-slide">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-black">Liga</h1>
              <button onClick={() => setView('add')} className="size-12 rounded-xl bg-primary text-black flex items-center justify-center shadow-lg shadow-primary/20">
                <span className="material-symbols-outlined font-black">add</span>
              </button>
            </div>
            <div className="bg-surface-dark rounded-[2rem] border border-white/5 overflow-hidden">
              {teams.sort((a,b) => b.points - a.points).map((t, i) => (
                <div key={t.id} className="flex items-center justify-between p-5 border-b border-white/5 hover:bg-white/5 transition-colors">
                  <div className="flex items-center gap-4">
                    <span className="size-8 rounded-lg bg-white/5 flex items-center justify-center text-xs font-black">{i+1}º</span>
                    <div><p className="font-black">{t.name}</p><p className="text-[10px] text-slate-500 uppercase font-bold">{t.manager}</p></div>
                  </div>
                  <div className="flex items-center gap-6">
                    <p className="font-black text-lg">{t.points}</p>
                    <button onClick={() => { setSelectedTeam(t); setView('edit'); }} className="text-slate-600 hover:text-white">
                      <span className="material-symbols-outlined text-[18px]">edit</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      case 'analysis':
        return <AnalysisView />;
      case 'fichajes':
        return <SimuladorView teams={teams} ops={simOps} setOps={setSimOps} />;
      case 'edit':
        return <EditView team={selectedTeam} onSave={(updated) => { setTeams(teams.map(t => t.id === updated.id ? updated : t)); setView('ranking'); }} onCancel={() => setView('ranking')} />;
      case 'add':
        return <AddView onSave={(newT) => { setTeams([...teams, {...newT, id: Date.now().toString()}]); setView('ranking'); }} onCancel={() => setView('ranking')} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background-dark flex flex-col md:flex-row">
      {/* Sidebar Desktop */}
      <aside className="hidden md:flex flex-col w-72 bg-surface-dark border-r border-white/5 sticky top-0 h-screen p-8 shrink-0">
        <div className="flex items-center gap-4 mb-12">
          <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-black">
            <span className="material-symbols-outlined font-black">sports_soccer</span>
          </div>
          <h1 className="font-black text-xl">BIWENGER</h1>
        </div>
        <nav className="flex flex-col gap-2">
          {['home', 'ranking', 'analysis', 'fichajes'].map((v) => (
            <button key={v} onClick={() => setView(v)} className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${view === v ? 'bg-primary text-black' : 'text-slate-400 hover:bg-white/5'}`}>
              <span className="material-symbols-outlined capitalize">{v === 'home' ? 'home' : v === 'ranking' ? 'leaderboard' : v === 'analysis' ? 'psychology' : 'payments'}</span>
              <span className="capitalize">{v === 'home' ? 'Inicio' : v === 'ranking' ? 'Clasificación' : v === 'analysis' ? 'IA Táctica' : 'Simulador'}</span>
            </button>
          ))}
        </nav>
      </aside>

      {/* Contenido */}
      <main className="flex-1 pb-24 md:pb-0">{renderView()}</main>

      {/* Nav Móvil */}
      <nav className="fixed bottom-0 left-0 w-full glass-nav pb-safe md:hidden z-50">
        <div className="flex justify-around items-center h-20 px-2">
          <MobileBtn icon="home" active={view === 'home'} onClick={() => setView('home')} />
          <MobileBtn icon="leaderboard" active={view === 'ranking'} onClick={() => setView('ranking')} />
          <MobileBtn icon="psychology" active={view === 'analysis'} onClick={() => setView('analysis')} />
          <MobileBtn icon="payments" active={view === 'fichajes'} onClick={() => setView('fichajes')} />
        </div>
      </nav>
    </div>
  );
};

const MobileBtn = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-primary scale-110' : 'text-slate-500'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
  </button>
);

const SimuladorView = ({ teams, ops, setOps }) => {
  const [tId, setTId] = useState(teams[0]?.id || '');
  const [player, setPlayer] = useState('');
  const [amt, setAmt] = useState(5000000);
  const [mode, setMode] = useState('buy');

  const getProj = (team) => {
    const impact = ops.filter(o => o.teamId === team.id).reduce((acc, o) => acc + (o.type === 'buy' ? -o.amt : o.amt), 0);
    return team.balance + impact;
  };

  return (
    <div className="p-6 md:p-10 animate-slide">
      <h1 className="text-3xl font-black mb-8">Simulador</h1>
      <div className="p-6 bg-card-dark rounded-3xl border border-white/10 mb-8 flex flex-col gap-4">
        <select value={tId} onChange={e => setTId(e.target.value)} className="bg-background-dark p-4 rounded-xl border border-white/10 text-white font-bold">
          {teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
        </select>
        <input placeholder="Jugador..." value={player} onChange={e => setPlayer(e.target.value)} className="bg-background-dark p-4 rounded-xl border border-white/10 text-white" />
        <input type="number" value={amt} onChange={e => setAmt(Number(e.target.value))} className="bg-background-dark p-4 rounded-xl border border-white/10 text-white font-black" />
        <div className="flex gap-2">
          <button onClick={() => setMode('buy')} className={`flex-1 p-4 rounded-xl font-black ${mode === 'buy' ? 'bg-rose-500 text-white' : 'bg-surface-dark text-slate-500'}`}>COMPRA</button>
          <button onClick={() => setMode('sell')} className={`flex-1 p-4 rounded-xl font-black ${mode === 'sell' ? 'bg-primary text-black' : 'bg-surface-dark text-slate-500'}`}>VENTA</button>
        </div>
        <button onClick={() => { if(!player) return; setOps([{id: Date.now(), teamId: tId, player, amt, type: mode}, ...ops]); setPlayer(''); }} className="py-4 bg-primary text-black font-black rounded-xl">SIMULAR</button>
      </div>
      <div className="flex flex-col gap-3">
        {teams.map(t => (
          <div key={t.id} className="p-5 bg-surface-dark border border-white/5 rounded-2xl flex justify-between items-center">
            <div><p className="font-bold">{t.name}</p><p className="text-[10px] text-slate-500 uppercase">Saldo Proyectado</p></div>
            <p className={`text-xl font-black ${getProj(t) >= 0 ? 'text-primary' : 'text-rose-500'}`}>{(getProj(t)/1000000).toFixed(1)}M</p>
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
      // Fix: Access process.env.API_KEY directly as per @google/genai guidelines
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const r = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: [{ parts: [{ text: "Analiza esta alineación de Biwenger y dame consejos tácticos." }, { inlineData: { mimeType: 'image/jpeg', data: img.split(',')[1] } }] }]
      });
      setRes(r.text);
    } catch(e) { setRes("Conecta una API Key válida para usar la IA."); } finally { setLoad(false); }
  };

  return (
    <div className="p-10 max-w-xl mx-auto text-center animate-slide">
      <h1 className="text-3xl font-black mb-8">IA Táctica</h1>
      <div onClick={() => fileRef.current.click()} className="aspect-video bg-surface-dark rounded-[2rem] border-4 border-dashed border-white/5 flex flex-col items-center justify-center cursor-pointer overflow-hidden mb-6">
        {img ? <img src={img} className="w-full h-full object-cover" /> : <span className="material-symbols-outlined text-6xl text-primary">add_a_photo</span>}
        <input type="file" ref={fileRef} className="hidden" onChange={e => { const f = e.target.files[0]; if(f){ const r = new FileReader(); r.onload=()=>setImg(r.result); r.readAsDataURL(f); }}} />
      </div>
      {img && !load && !res && <button onClick={scan} className="w-full py-5 bg-primary text-black font-black rounded-2xl shadow-xl">ESCANEAR EQUIPO</button>}
      {load && <p className="animate-pulse text-primary font-black">Analizando estrategia...</p>}
      {res && <div className="p-6 bg-card-dark rounded-2xl text-left text-sm border border-white/10 leading-relaxed whitespace-pre-wrap">{res}</div>}
    </div>
  );
};

const EditView = ({ team, onSave, onCancel }) => {
  const [val, setVal] = useState({...team});
  return (
    <div className="p-10 max-w-md mx-auto flex flex-col gap-4 animate-slide">
      <h2 className="text-2xl font-black mb-4">Editar {team.name}</h2>
      <input value={val.name} onChange={e => setVal({...val, name: e.target.value})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Nombre" />
      <input type="number" value={val.points} onChange={e => setVal({...val, points: Number(e.target.value)})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Puntos" />
      <input type="number" value={val.balance} onChange={e => setVal({...val, balance: Number(e.target.value)})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Saldo" />
      <div className="flex gap-4 mt-4">
        <button onClick={onCancel} className="flex-1 py-4 border border-white/10 rounded-xl">Cancelar</button>
        <button onClick={() => onSave(val)} className="flex-1 py-4 bg-primary text-black font-black rounded-xl">Guardar</button>
      </div>
    </div>
  );
};

const AddView = ({ onSave, onCancel }) => {
  const [val, setVal] = useState({ name: '', manager: '', points: 0, balance: 0 });
  return (
    <div className="p-10 max-w-md mx-auto flex flex-col gap-4 animate-slide">
      <h2 className="text-2xl font-black mb-4">Nuevo Equipo</h2>
      <input value={val.name} onChange={e => setVal({...val, name: e.target.value})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Nombre Equipo" />
      <input value={val.manager} onChange={e => setVal({...val, manager: e.target.value})} className="bg-surface-dark p-4 rounded-xl border border-white/10 text-white" placeholder="Nombre Manager" />
      <div className="flex gap-4 mt-4">
        <button onClick={onCancel} className="flex-1 py-4 border border-white/10 rounded-xl">Cancelar</button>
        <button onClick={() => onSave(val)} className="flex-1 py-4 bg-primary text-black font-black rounded-xl">Crear</button>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
