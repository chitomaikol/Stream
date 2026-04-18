import type { Account, Client } from './types';

export const initialClients: Record<string, Client> = {};

export const initialAccounts: Account[] = [
  {
    id: 'netflix',
    platform: 'Netflix',
    email: 'contacto@dominio.com',
    cost: 0,
    billingCycle: 'MONTHLY',
    profiles: [
      { id: 'netflix-1', name: 'Perfil 1', status: 'FREE' },
      { id: 'netflix-2', name: 'Perfil 2', status: 'FREE' },
      { id: 'netflix-3', name: 'Perfil 3', status: 'FREE' },
      { id: 'netflix-4', name: 'Perfil 4', status: 'FREE' },
    ]
  },
  {
    id: 'spotify',
    platform: 'Spotify',
    email: 'spotify@dominio.com',
    cost: 0,
    billingCycle: 'MONTHLY',
    profiles: [
      { id: 'spotify-1', name: 'Perfil 1', status: 'FREE' },
      { id: 'spotify-2', name: 'Perfil 2', status: 'FREE' },
      { id: 'spotify-3', name: 'Perfil 3', status: 'FREE' },
      { id: 'spotify-4', name: 'Perfil 4', status: 'FREE' },
    ]
  },
  {
    id: 'amazon',
    platform: 'Amazon Prime',
    email: 'amazon@dominio.com',
    cost: 0,
    billingCycle: 'MONTHLY',
    profiles: [
      { id: 'amazon-1', name: 'Perfil 1', status: 'FREE' },
      { id: 'amazon-2', name: 'Perfil 2', status: 'FREE' },
      { id: 'amazon-3', name: 'Perfil 3', status: 'FREE' },
      { id: 'amazon-4', name: 'Perfil 4', status: 'FREE' },
    ]
  },
  {
    id: 'crunchyroll',
    platform: 'Crunchyroll',
    email: 'crunchyroll@dominio.com',
    cost: 0,
    billingCycle: 'MONTHLY',
    profiles: [
      { id: 'crunchyroll-1', name: 'Perfil 1', status: 'FREE' },
      { id: 'crunchyroll-2', name: 'Perfil 2', status: 'FREE' },
      { id: 'crunchyroll-3', name: 'Perfil 3', status: 'FREE' },
      { id: 'crunchyroll-4', name: 'Perfil 4', status: 'FREE' },
    ]
  }
];
