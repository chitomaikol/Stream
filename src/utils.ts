import { addDays, differenceInDays, differenceInMonths, parseISO } from 'date-fns';
import type { Account, Client } from './types';

export const calculateExpirationDate = (startDate: string) => {
  return addDays(parseISO(startDate), 30);
};

export const daysUntilExpiration = (startDate: string) => {
  const expirationDate = calculateExpirationDate(startDate);
  return differenceInDays(expirationDate, new Date());
};

export const isExpiringSoon = (startDate: string) => {
  const days = daysUntilExpiration(startDate);
  return days <= 3 && days >= 0;
};

export const isExpired = (startDate: string) => {
  const days = daysUntilExpiration(startDate);
  return days < 0;
};

export const calculateSeniority = (startDate: string) => {
  const start = parseISO(startDate);
  const now = new Date();
  const months = differenceInMonths(now, start);
  const days = differenceInDays(now, start);
  
  if (months > 0) {
    return `${months} mes${months > 1 ? 'es' : ''}`;
  }
  return `${days} día${days !== 1 ? 's' : ''}`;
};

export const calculateFinancials = (accounts: Account[], clients: Record<string, Client>) => {
  const totalExpenses = accounts.reduce((acc, account) => {
    // Assuming cost is per month. If annual, we divide by 12 for monthly stats
    const monthlyCost = account.billingCycle === 'ANNUAL' ? account.cost / 12 : account.cost;
    return acc + monthlyCost;
  }, 0);

  let totalIncome = 0;
  accounts.forEach(account => {
    account.profiles.forEach(profile => {
      if (profile.status === 'OCCUPIED' && profile.clientId) {
        const client = clients[profile.clientId];
        if (client) {
          totalIncome += client.pricePaid;
        }
      }
    });
  });

  const netProfit = totalIncome - totalExpenses;

  return { totalIncome, totalExpenses, netProfit };
};
