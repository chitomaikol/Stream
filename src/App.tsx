import { useState } from 'react';
import { initialAccounts, initialClients } from './data';
import type { Account, Client } from './types';
import { calculateFinancials, calculateExpirationDate, daysUntilExpiration, isExpiringSoon, calculateSeniority } from './utils';
import { DollarSign, Users, Tv, AlertTriangle, TrendingUp, TrendingDown, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function DashboardStats({ accounts, clients }: { accounts: Account[], clients: Record<string, Client> }) {
  const { totalIncome, totalExpenses, netProfit } = calculateFinancials(accounts, clients);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-textMuted font-medium text-sm">Ingresos Totales</h3>
          <div className="p-2 bg-primary/20 rounded-lg">
            <DollarSign className="w-5 h-5 text-primary" />
          </div>
        </div>
        <div className="text-3xl font-bold text-text">${totalIncome.toFixed(2)}</div>
        <div className="text-xs text-textMuted mt-2">Ingresos por perfiles alquilados</div>
      </div>

      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-textMuted font-medium text-sm">Gastos (Costos)</h3>
          <div className="p-2 bg-danger/20 rounded-lg">
            <TrendingDown className="w-5 h-5 text-danger" />
          </div>
        </div>
        <div className="text-3xl font-bold text-text">${totalExpenses.toFixed(2)}</div>
        <div className="text-xs text-textMuted mt-2">Costo mensual de cuentas</div>
      </div>

      <div className="card relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-br from-success/5 to-transparent pointer-events-none" />
        <div className="flex items-center justify-between mb-4 relative">
          <h3 className="text-textMuted font-medium text-sm">Utilidad Neta</h3>
          <div className="p-2 bg-success/20 rounded-lg">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
        </div>
        <div className={cn("text-3xl font-bold relative", netProfit >= 0 ? "text-success" : "text-danger")}>
          ${netProfit.toFixed(2)}
        </div>
        <div className="text-xs text-textMuted mt-2 relative">Ganancia total del mes</div>
      </div>
    </div>
  );
}

function AlertsPanel({ accounts, clients }: { accounts: Account[], clients: Record<string, Client> }) {
  const expiringProfiles: Array<{ account: string, profile: string, clientName: string, daysRightNow: number }> = [];

  accounts.forEach(acc => {
    acc.profiles.forEach(prof => {
      if (prof.status === 'OCCUPIED' && prof.clientId) {
        const client = clients[prof.clientId];
        if (client && isExpiringSoon(client.startDate)) {
          expiringProfiles.push({
            account: acc.platform,
            profile: prof.name,
            clientName: client.name,
            daysRightNow: daysUntilExpiration(client.startDate)
          });
        }
      }
    });
  });

  if (expiringProfiles.length === 0) return null;

  return (
    <div className="card border-danger/30 mb-8 bg-danger/5">
      <div className="flex items-center gap-3 mb-4 text-danger">
        <AlertTriangle className="w-6 h-6" />
        <h2 className="text-lg font-semibold">Alertas de Vencimiento</h2>
      </div>
      <div className="space-y-3">
        {expiringProfiles.map((alert, idx) => (
          <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-surface/50 border border-danger/10">
            <div>
              <span className="font-semibold text-text">{alert.clientName}</span>
              <span className="text-textMuted text-sm ml-2">({alert.account} - {alert.profile})</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-danger" />
              <span className={cn("text-sm font-medium", alert.daysRightNow < 0 ? "text-danger" : "text-warning")}>
                {alert.daysRightNow < 0 
                  ? `Vencido hace ${Math.abs(alert.daysRightNow)} días` 
                  : `Vence en ${alert.daysRightNow} días`}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AccountsList({ accounts, clients }: { accounts: Account[], clients: Record<string, Client> }) {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold flex items-center gap-2 text-text mb-6">
        <Tv className="w-6 h-6 text-primary" />
        Cuentas Madre
      </h2>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {accounts.map(account => (
          <div key={account.id} className="card flex flex-col hover:border-primary/30 transition-colors duration-300">
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-white/5">
              <div>
                <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-400">
                  {account.platform}
                </h3>
                <div className="text-sm text-textMuted mt-1">{account.email}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-text">${account.cost}</div>
                <div className="text-xs text-textMuted uppercase tracking-wider">{account.billingCycle === 'MONTHLY' ? 'Mensual' : 'Anual'}</div>
              </div>
            </div>

            <div className="space-y-3 flex-1">
              {account.profiles.map(profile => {
                const client = profile.clientId ? clients[profile.clientId] : null;
                const isOcc = profile.status === 'OCCUPIED';
                
                return (
                  <div key={profile.id} className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200",
                    isOcc ? "bg-surface border-primary/20" : "bg-background border-slate-700/30 border-dashed"
                  )}>
                    <div className="flex items-center gap-3 mb-3 sm:mb-0">
                      {isOcc ? <Users className="w-5 h-5 text-primary" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-600 border-dashed" />}
                      <span className={cn("font-medium", isOcc ? "text-text" : "text-textMuted")}>{profile.name}</span>
                    </div>
                    {isOcc && client ? (
                      <div className="flex flex-col sm:items-end w-full sm:w-auto">
                        <div className="text-sm font-semibold text-text">{client.name}</div>
                        <div className="flex gap-3 mt-1 text-xs text-textMuted flex-wrap">
                          <span title="Antigüedad">⭐ {calculateSeniority(client.startDate)}</span>
                          <span title="Vencimiento" className={isExpiringSoon(client.startDate) ? "text-danger font-medium" : ""}>
                            📅 {format(calculateExpirationDate(client.startDate), 'dd MMM yyyy')}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs px-3 py-1 bg-success/10 text-success rounded-full font-medium border border-success/20 w-fit">
                        Disponible
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  const [accounts] = useState<Account[]>(initialAccounts);
  const [clients] = useState<Record<string, Client>>(initialClients);

  return (
    <div className="min-h-screen bg-background">
      {/* Background Decor */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[40%] rounded-full bg-blue-600/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2">
              StreamVault Sys
            </h1>
            <p className="text-textMuted">Centro de comando para gestión de cuentas streaming</p>
          </div>
          <div className="flex items-center gap-4">
             {/* Dummy buttons to simulate actions like adding accounts or clients */}
            <button className="px-5 py-2.5 bg-surface border border-slate-700/50 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
              + Nuevo Cliente
            </button>
            <button className="px-5 py-2.5 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-600 shadow-[0_0_20px_rgba(0,112,243,0.3)] transition-all">
              + Cuenta Madre
            </button>
          </div>
        </header>

        <DashboardStats accounts={accounts} clients={clients} />
        <AlertsPanel accounts={accounts} clients={clients} />
        <AccountsList accounts={accounts} clients={clients} />
        
      </div>
    </div>
  );
}
