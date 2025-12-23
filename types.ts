
export type View = 'home' | 'ranking' | 'fichajes' | 'settings' | 'team-details' | 'add-transfer' | 'analysis' | 'edit-team' | 'add-team';

export interface Team {
  id: string;
  name: string;
  manager: string;
  points: number;
  lastPoints: number;
  balance: number;
  logo: string;
  rank: number;
  lastConnection?: string;
}

export interface Transfer {
  id: string;
  player: string;
  from: string;
  to: string;
  amount: number;
  type: 'buy' | 'sell' | 'swap';
  date: string;
}

export interface Player {
  id: string;
  name: string;
  value: number;
  team: string;
  image: string;
  position: 'POR' | 'DF' | 'MC' | 'DL';
}

export interface RankUpdate {
  name: string;
  points: number;
}

export interface SimulatedOperation {
  id: string;
  teamId: string;
  playerName: string;
  amount: number;
  type: 'buy' | 'sell';
}
