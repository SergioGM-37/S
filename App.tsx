
import React, { useState, useEffect } from 'react';
import { View, Team, Transfer, RankUpdate, SimulatedOperation } from './types';
import Layout from './components/Layout';
import Home from './views/Home';
import Rankings from './views/Rankings';
import TeamDetails from './views/TeamDetails';
import Analysis from './views/Analysis';
import Fichajes from './views/Fichajes';
import EditTeam from './views/EditTeam';
import AddTransfer from './views/AddTransfer';
import AddTeam from './views/AddTeam';
import { MOCK_TEAMS, MOCK_TRANSFERS } from './constants';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('home');
  const [teams, setTeams] = useState<Team[]>(() => {
    const saved = localStorage.getItem('biwenger_teams');
    return saved ? JSON.parse(saved) : MOCK_TEAMS;
  });
  const [transfers, setTransfers] = useState<Transfer[]>(MOCK_TRANSFERS);
  const [simulatedOperations, setSimulatedOperations] = useState<SimulatedOperation[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<Team | null>(null);
  const [userTeamId, setUserTeamId] = useState<string>(() => {
    return localStorage.getItem('biwenger_user_team_id') || '2';
  });

  useEffect(() => {
    localStorage.setItem('biwenger_teams', JSON.stringify(teams));
    localStorage.setItem('biwenger_user_team_id', userTeamId);
  }, [teams, userTeamId]);

  useEffect(() => {
    const sorted = [...teams].sort((a, b) => b.points - a.points);
    const ranked = sorted.map((t, index) => ({ ...t, rank: index + 1 }));
    if (JSON.stringify(ranked) !== JSON.stringify(teams)) {
      setTeams(ranked);
    }
  }, [teams]);

  const navigateToView = (view: View) => {
    setActiveView(view);
    if (view !== 'team-details' && view !== 'edit-team') {
      setSelectedTeam(null);
    }
    window.scrollTo(0, 0);
  };

  const navigateToTeam = (team: Team) => {
    setSelectedTeam(team);
    setActiveView('team-details');
    window.scrollTo(0, 0);
  };

  const handleUpdateTeam = (updatedTeam: Team, isUserTeam?: boolean) => {
    setTeams(teams.map(t => t.id === updatedTeam.id ? updatedTeam : t));
    if (isUserTeam) {
      setUserTeamId(updatedTeam.id);
    }
    navigateToView('ranking');
  };

  const handleUpdateTeamBalance = (teamId: string, newBalance: number) => {
    setTeams(prev => prev.map(t => t.id === teamId ? { ...t, balance: newBalance } : t));
  };

  const handleAddTeam = (newTeam: Team) => {
    setTeams([...teams, newTeam]);
    navigateToView('ranking');
  };

  const handleBulkUpdateTeams = (updates: RankUpdate[]) => {
    const newTeams: Team[] = updates.map((update, index) => {
      const existingTeam = teams.find(t => 
        t.name.toLowerCase().trim() === update.name.toLowerCase().trim()
      );

      return {
        id: existingTeam?.id || Math.random().toString(36).substr(2, 9),
        name: update.name,
        manager: existingTeam?.manager || "Manager",
        points: update.points,
        lastPoints: existingTeam ? update.points - existingTeam.points : 0,
        balance: existingTeam?.balance || 0, // Saldo inicial a 0 para nuevos equipos
        logo: '', 
        rank: index + 1
      };
    });

    setTeams(newTeams);
    navigateToView('ranking');
  };

  const handleAddTransfer = (newTransfer: Transfer) => {
    setTransfers([newTransfer, ...transfers]);
    
    setTeams(teams.map(t => {
      if (t.name === newTransfer.to && newTransfer.type === 'buy') {
        return { ...t, balance: t.balance - newTransfer.amount };
      }
      if (t.name === newTransfer.from && newTransfer.type === 'sell') {
        return { ...t, balance: t.balance + newTransfer.amount };
      }
      return t;
    }));
    
    navigateToView('home');
  };

  const renderContent = () => {
    switch (activeView) {
      case 'home':
        return <Home 
          teams={teams} 
          userTeamId={userTeamId}
          transfers={transfers} 
          onNavigateTeam={navigateToTeam} 
          onNavigateToView={navigateToView}
          onEditTeam={(team) => {
            setSelectedTeam(team);
            setActiveView('edit-team');
          }}
        />;
      case 'ranking':
        return <Rankings 
          teams={teams} 
          onBack={() => navigateToView('home')} 
          onNavigateTeam={navigateToTeam}
          onEditTeam={(team) => {
            setSelectedTeam(team);
            setActiveView('edit-team');
          }}
          onAddTeam={() => navigateToView('add-team')}
        />;
      case 'add-team':
        return <AddTeam 
          onSave={handleAddTeam} 
          onCancel={() => navigateToView('ranking')} 
        />;
      case 'team-details':
        return selectedTeam ? <TeamDetails 
          team={selectedTeam} 
          transfers={transfers.filter(t => t.to === selectedTeam.name || t.from === selectedTeam.name)}
          onBack={() => navigateToView('ranking')} 
          onEdit={() => setActiveView('edit-team')}
        /> : null;
      case 'edit-team':
        return selectedTeam ? <EditTeam 
          team={selectedTeam} 
          isUserTeam={selectedTeam.id === userTeamId}
          onSave={handleUpdateTeam} 
          onCancel={() => navigateToView('home')} 
        /> : null;
      case 'add-transfer':
        return <AddTransfer 
          teams={teams}
          onSave={handleAddTransfer}
          onCancel={() => navigateToView('home')}
        />;
      case 'fichajes':
        return <Fichajes 
          teams={teams} 
          operations={simulatedOperations} 
          setOperations={setSimulatedOperations} 
          onUpdateTeamBalance={handleUpdateTeamBalance}
        />;
      case 'analysis':
        return <Analysis onBulkUpdateTeams={handleBulkUpdateTeams} />;
      case 'settings':
        return <PlaceholderView name="Configuración" icon="settings" />;
      default:
        return <Home 
          teams={teams} 
          userTeamId={userTeamId}
          transfers={transfers} 
          onNavigateTeam={navigateToTeam} 
          onNavigateToView={navigateToView}
          onEditTeam={(team) => {
            setSelectedTeam(team);
            setActiveView('edit-team');
          }} 
        />;
    }
  };

  return (
    <Layout 
      activeView={activeView} 
      onNavigate={navigateToView}
      onFabClick={(activeView === 'home') ? () => navigateToView('add-transfer') : undefined}
    >
      {renderContent()}
    </Layout>
  );
};

const PlaceholderView: React.FC<{ name: string; icon: string }> = ({ name, icon }) => (
  <div className="flex flex-col items-center justify-center h-[70vh] gap-4 px-10 text-center">
    <div className="size-20 rounded-3xl bg-surface-dark border border-white/5 flex items-center justify-center text-primary">
      <span className="material-symbols-outlined text-5xl">{icon}</span>
    </div>
    <h2 className="text-2xl font-bold text-white">{name}</h2>
    <p className="text-slate-400">Esta sección está actualmente en desarrollo.</p>
  </div>
);

export default App;
