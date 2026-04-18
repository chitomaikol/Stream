import type { Account, Client } from './types';
import { subDays } from 'date-fns';

const today = new Date();

export const initialClients: Record<string, Client> = {
  'client-1': {
    id: 'client-1',
    name: 'Juan Pérez',
    phone: '+1 234 567 8900',
    startDate: subDays(today, 28).toISOString(), // Expiring in 2 days
    pricePaid: 5.0,
  },
  'client-2': {
    id: 'client-2',
    name: 'María García',
    phone: '+1 987 654 3210',
    startDate: subDays(today, 10).toISOString(),
    pricePaid: 5.0,
  },
  'client-3': {
    id: 'client-3',
    name: 'Carlos López',
    phone: '+1 555 123 4567',
    startDate: subDays(today, 45).toISOString(), // A month and a half ago
    pricePaid: 4.5,
  }
};

export const initialAccounts: Account[] = [
  {
    id: 'acc-1',
    platform: 'Netflix',
    email: 'contacto@dominio.com',
    cost: 15.99,
    billingCycle: 'MONTHLY',
    profiles: [
      { id: 'prof-1-1', name: 'Perfil 1', status: 'OCCUPIED', clientId: 'client-1' },
      { id: 'prof-1-2', name: 'Perfil 2', status: 'OCCUPIED', clientId: 'client-2' },
      { id: 'prof-1-3', name: 'Perfil 3', status: 'FREE' },
      { id: 'prof-1-4', name: 'Perfil 4', status: 'FREE' },
    ]
  },
  {
    id: 'acc-2',
    platform: 'Disney+',
    email: 'disney@dominio.com',
    cost: 10.99,
    billingCycle: 'MONTHLY',
    profiles: [
      { id: 'prof-2-1', name: 'Perfil 1', status: 'OCCUPIED', clientId: 'client-3' },
      { id: 'prof-2-2', name: 'Perfil 2', status: 'FREE' },
      { id: 'prof-2-3', name: 'Perfil 3', status: 'FREE' },
      { id: 'prof-2-4', name: 'Perfil 4', status: 'FREE' },
      { id: 'prof-2-5', name: 'Perfil 5', status: 'FREE' },
      { id: 'prof-2-6', name: 'Perfil 6', status: 'FREE' },
      { id: 'prof-2-7', name: 'Perfil 7', status: 'FREE' },
    ]
  }
];
