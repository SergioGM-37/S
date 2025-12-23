
import { Team, Transfer } from './types';

export const MOCK_TEAMS: Team[] = [
  {
    id: '1',
    name: 'Los Galácticos FC',
    manager: 'Pep Guardiola',
    points: 1450,
    lastPoints: 54,
    balance: 0,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDRZyusmdoUbOBGW-alLK3FKbCEv-SO3Omh0IN8rdOUhJzJEcS-qUM64n_omdmsXj9fQoxsEP9tFauoqIX3OdTJY8f5RHU3zoMThngSCSuXY5736iihaXf2bqdUqB1X0wYoEU8Rnutyb3ddn66sUNNkbuI6_YQbr2eRByW3dHGqtk4J636n-OSwz1oNXcYCL8Em-ZLhN2p8EJn9U9-Adiq34SrjNvbHPk1AAKaVIviOgr0dWe9ptpxdiDpNxZ5RYKOK45KadKfvBFs',
    rank: 1,
    lastConnection: 'hace 2h'
  },
  {
    id: '2',
    name: 'Rayo Vallecano',
    manager: 'User123',
    points: 1380,
    lastPoints: 48,
    balance: 0,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAKxNmtfEpnfJ-oBkI3CMP45nZCbYgi1tOqZNEADqioM7ePx3oV7PQhEFtnnaNj2ZoXLg-5U3qZXq3Qwt-zK1ih_2_-SYNfmTZ8OF2RKt4r4r1qpDFwTwfp92ndz1Tu4GbZzG7I3oLNnDl1X8kjCzXrlzDgYDr69ctRsuA7G4lAunt1ENx0GA8RSOCPElGBKCcpNAVW-94EfBwbnvceSiYU06uhPg5Ezbiy2KoQ4E3OO-llUMPfx8r2V54I5qAS17_MGEbTzjHviek',
    rank: 2,
    lastConnection: 'hace 5h'
  },
  {
    id: '3',
    name: 'Real Betis',
    manager: 'Manuel P.',
    points: 1325,
    lastPoints: 32,
    balance: 0,
    logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBj_hx9cq-l7kZT6er36-nf1YW6QuYHL-yUTRz0Z8KYAm8XybKHeipiXNt0syEcrmLYGqNZnbHHgtF1JxeZwi1zzYkJqO2qoNacSrXu2pELe4WN4g1Lnb09C_psC0YaXBBG6bEOnEQAFtBXoiySCl4B1FZpyjRCWqOWIkGqgrpwjdOfAJN3hMvTqAgmviB19NliPNjvjSJneU89X_L4iH-DafYRaV_6DOOPI9EDjA17ALxTQYuNoKevRnJzYAIeOOLqkRVFB0J0LIg',
    rank: 3,
    lastConnection: 'ayer'
  }
];

export const MOCK_TRANSFERS: Transfer[] = [
  {
    id: 't1',
    player: 'Lewandowski',
    from: 'Mercado',
    to: 'Equipo Pepito',
    amount: 12500000,
    type: 'buy',
    date: '14 Ago'
  },
  {
    id: 't2',
    player: 'Jude Bellingham',
    from: 'Equipo A',
    to: 'Los Galácticos',
    amount: 15200000,
    type: 'swap',
    date: '12 Ago'
  },
  {
    id: 't3',
    player: 'Dani Parejo',
    from: 'Rayo Vallecano',
    to: 'Mercado',
    amount: 5800000,
    type: 'sell',
    date: '10 Ago'
  }
];
