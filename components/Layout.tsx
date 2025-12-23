
import React from 'react';
import { View } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  activeView: View;
  onNavigate: (view: View) => void;
  onFabClick?: () => void;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, activeView, onNavigate, onFabClick, hideNav = false }) => {
  return (
    <div className="relative min-h-screen w-full bg-background-dark text-white flex flex-col md:flex-row">
      
      {/* Sidebar Desktop */}
      {!hideNav && (
        <aside className="hidden md:flex flex-col w-72 bg-surface-dark border-r border-white/5 sticky top-0 h-screen p-8 shrink-0">
          <div className="flex items-center gap-4 mb-12 px-2">
            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
              <span className="material-symbols-outlined font-black text-2xl">sports_soccer</span>
            </div>
            <div>
              <h1 className="font-black text-xl tracking-tight leading-none text-white">BIWENGER</h1>
              <span className="text-primary text-[10px] font-black tracking-[0.4em] uppercase">PRO MANAGER</span>
            </div>
          </div>

          <nav className="flex flex-col gap-3">
            <SidebarItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => onNavigate('home')} />
            <SidebarItem icon="leaderboard" label="Clasificación" active={activeView === 'ranking'} onClick={() => onNavigate('ranking')} />
            <SidebarItem icon="document_scanner" label="Analizar IA" active={activeView === 'analysis'} onClick={() => onNavigate('analysis')} />
            <SidebarItem icon="payments" label="Simulador de Mercado" active={activeView === 'fichajes'} onClick={() => onNavigate('fichajes')} />
            <SidebarItem icon="settings" label="Ajustes" active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
          </nav>

          <div className="mt-auto p-5 rounded-[2rem] bg-gradient-to-br from-primary/10 to-transparent border border-primary/10">
            <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-2">Modo Escritorio Activo</p>
            <p className="text-xs text-slate-400 font-medium leading-relaxed">Gestiona tu liga con herramientas de análisis avanzadas y vista multitarea.</p>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className={`flex-1 flex flex-col min-w-0 ${!hideNav ? 'pb-28 md:pb-0' : ''}`}>
        <div className="max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>

      {/* Floating Action Button (FAB) */}
      {!hideNav && onFabClick && (
        <button 
          onClick={onFabClick}
          className="fixed right-6 bottom-28 md:bottom-10 md:right-10 z-30 flex items-center justify-center size-16 rounded-full bg-primary text-background-dark shadow-[0_12px_30px_rgba(19,236,91,0.4)] hover:scale-110 active:scale-95 transition-all"
        >
          <span className="material-symbols-outlined text-3xl font-black">add</span>
        </button>
      )}

      {/* Mobile Bottom Navigation */}
      {!hideNav && (
        <div className="fixed bottom-0 left-0 z-40 w-full glass-nav pb-safe md:hidden">
          <div className="flex items-center justify-around h-[84px] px-2 pb-4">
            <NavItem icon="home" label="Inicio" active={activeView === 'home'} onClick={() => onNavigate('home')} />
            <NavItem icon="leaderboard" label="Tabla" active={activeView === 'ranking'} onClick={() => onNavigate('ranking')} />
            <NavItem icon="document_scanner" label="Scan" active={activeView === 'analysis'} onClick={() => onNavigate('analysis')} />
            <NavItem icon="payments" label="Fichajes" active={activeView === 'fichajes'} onClick={() => onNavigate('fichajes')} />
            <NavItem icon="settings" label="Ajustes" active={activeView === 'settings'} onClick={() => onNavigate('settings')} />
          </div>
        </div>
      )}
    </div>
  );
};

const SidebarItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${active ? 'bg-primary text-black shadow-xl shadow-primary/10' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    <span className="material-symbols-outlined" style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className="text-sm tracking-tight">{label}</span>
  </button>
);

const NavItem = ({ icon, label, active, onClick }: any) => (
  <button onClick={onClick} className="flex flex-col items-center justify-center gap-1 w-16 transition-all">
    <span className={`material-symbols-outlined transition-all ${active ? 'text-primary scale-110' : 'text-slate-500'}`} style={{ fontVariationSettings: `'FILL' ${active ? 1 : 0}` }}>{icon}</span>
    <span className={`text-[9px] font-black uppercase tracking-widest ${active ? 'text-primary' : 'text-slate-500'}`}>{label}</span>
  </button>
);

export default Layout;
