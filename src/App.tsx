import { useState, useEffect } from 'react';
import { initialAccounts, initialClients } from './data';
import type { Account, Client, PaymentMethod, PlatformCharge, Transaction } from './types';
import { calculateExpirationDate, daysUntilExpiration, formatCurrency } from './utils';
import { Users as UsersIcon, Tv, AlertTriangle, Clock, X, Settings, CreditCard, ListTodo, History, CheckCircle2, ArrowDownRight, ArrowUpRight, Receipt, Wallet, LayoutDashboard, MonitorPlay, WalletCards, AlertCircle, MessageCircle, ChevronDown, ChevronUp } from 'lucide-react';
import React from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function SidebarItem({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium group",
        active 
          ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
          : "text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent"
      )}
    >
      <div className={cn("transition-colors", active ? "text-blue-500" : "text-slate-500 group-hover:text-blue-400")}>
        {icon}
      </div>
      <span className="hidden md:block tracking-wide">{label}</span>
    </button>
  );
}

function DashboardView({ clients, platformCharges, accounts }: { clients: Record<string, Client>, platformCharges: PlatformCharge[], accounts: Account[] }) {
  const totalSales = Object.values(clients).reduce((acc, c) => acc + c.pricePaid, 0);
  const settledDebts = platformCharges.filter(c => c.status === 'PAID').reduce((acc, c) => acc + c.amount, 0);
  const pendingDebts = platformCharges.filter(c => c.status === 'PENDING').reduce((acc, c) => acc + c.amount, 0);
  
  const dineroEnCaja = totalSales - settledDebts;
  const capitalNeto = dineroEnCaja - pendingDebts;

  let actives = 0;
  let expiring = 0;
  let expired = 0;

  Object.values(clients).forEach(c => {
    const days = daysUntilExpiration(c.startDate, c.durationMonths || 1);
    if (days < 0) {
      expired++;
    } else if (days <= 3) {
      expiring++;
    } else {
      actives++;
    }
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <DashboardAlerts clients={clients} accounts={accounts} />
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        
        {/* Ingresos Totales (Caja) */}
        <div className="bg-[#0b101a] border border-blue-900/30 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/50 hover:shadow-[0_0_30px_rgba(37,99,235,0.1)] transition-all">
          <div className="absolute -top-4 -right-4 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
            <Wallet className="w-32 h-32 text-blue-500" />
          </div>
          <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">Ingresos Totales (Caja)</h3>
          <div className={cn("text-4xl font-black tracking-tight", dineroEnCaja >= 0 ? "text-white" : "text-red-400")}>
            {formatCurrency(dineroEnCaja)}
          </div>
          <div className="mt-4 flex items-center text-[10px] text-blue-400 font-bold uppercase bg-blue-500/10 w-fit px-2 py-1 rounded-sm border border-blue-500/20">Dinero Real Disponible</div>
        </div>

        {/* Deuda Pendiente (Nubank) */}
        <div className="bg-[#0b101a] border border-red-900/30 p-6 rounded-2xl relative overflow-hidden group hover:border-red-500/50 hover:shadow-[0_0_30px_rgba(239,68,68,0.05)] transition-all">
          <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">Deuda Pendiente (Nubank)</h3>
          <div className="text-4xl font-black text-red-500 tracking-tight">{formatCurrency(pendingDebts)}</div>
          <div className="mt-4 flex items-center text-[10px] text-red-400 font-bold uppercase bg-red-500/10 w-fit px-2 py-1 rounded-sm border border-red-500/20">Por liquidar</div>
        </div>

        {/* Utilidad Real */}
        <div className="bg-[#0b101a] border border-emerald-900/30 p-6 rounded-2xl relative overflow-hidden group hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.05)] transition-all">
          <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-2">Utilidad Real (Mio)</h3>
          <div className={cn("text-4xl font-black tracking-tight", capitalNeto >= 0 ? "text-emerald-400" : "text-red-400")}>
            {formatCurrency(capitalNeto)}
          </div>
          <div className="mt-4 flex items-center text-[10px] text-emerald-400 font-bold uppercase bg-emerald-500/10 w-fit px-2 py-1 rounded-sm border border-emerald-500/20">Caja - Deuda Nubank</div>
        </div>

        {/* Estado de Usuarios */}
        <div className="bg-[#0b101a] border border-slate-800 p-5 rounded-2xl flex flex-col justify-between shadow-[inset_0_0_20px_rgba(255,255,255,0.02)]">
          <h3 className="text-slate-400 font-bold text-xs tracking-widest uppercase mb-4">Estado Usuarios</h3>
          <div className="space-y-3">
             <div className="flex justify-between items-center bg-slate-900/50 px-3 py-2 rounded-lg border border-slate-800/50">
                <span className="flex items-center gap-2 text-sm text-slate-300 font-medium"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Activos</span>
                <span className="font-bold text-white">{actives}</span>
             </div>
             <div className="flex justify-between items-center bg-amber-950/20 px-3 py-2 rounded-lg border border-amber-900/30">
                <span className="flex items-center gap-2 text-sm text-amber-500 font-medium"><AlertTriangle className="w-4 h-4" /> Próximos (≤3d)</span>
                <span className="font-bold text-amber-400">{expiring}</span>
             </div>
             <div className="flex justify-between items-center bg-red-950/20 px-3 py-2 rounded-lg border border-red-900/30">
                <span className="flex items-center gap-2 text-sm text-red-500 font-medium"><AlertCircle className="w-4 h-4" /> Vencidos</span>
                <span className="font-bold text-red-400">{expired}</span>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

function DashboardAlerts({ clients }: { clients: Record<string, Client>, accounts: Account[] }) {
  const expiringClients = Object.values(clients).filter(c => {
    const d = daysUntilExpiration(c.startDate, c.durationMonths || 1);
    return d <= 3 && d >= 0;
  });

  if (expiringClients.length === 0) return null;

  return (
    <div className="bg-[#0b101a] border border-amber-900/30 p-6 rounded-2xl mb-8">
      <h3 className="text-amber-500 font-bold text-lg mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5" /> Próximos a Vencer</h3>
      <div className="space-y-3">
        {expiringClients.map(c => {
          const days = daysUntilExpiration(c.startDate, c.durationMonths || 1);
          const platform = c.platformRef || 'Desasignado';
          const msg = encodeURIComponent(`Hola ${c.name}, tu cuenta de ${platform} vence en ${days} días. ¿Deseas renovarla?`);
          return (
            <div key={c.id} className="flex justify-between items-center bg-[#06090f] p-4 rounded-xl border border-amber-900/20">
              <div>
                <div className="font-bold text-white">{c.name} <span className="text-amber-400 ml-2 text-sm">Vence en {days} días</span></div>
                <div className="text-xs text-slate-500 mt-1">{platform} - {c.phone}</div>
              </div>
              <a href={`https://wa.me/${c.phone}?text=${msg}`} target="_blank" rel="noreferrer" className="p-2.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-lg transition-colors border border-green-500/20 shadow-[0_0_15px_rgba(34,197,94,0.1)]">
                <MessageCircle className="w-5 h-5" />
              </a>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ClientsView({ clients, accounts }: { clients: Record<string, Client>, accounts: Account[] }) {
  const clientsList = Object.values(clients).sort((a,b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  const getClientProfileInfo = (clientId: string) => {
    for (const acc of accounts) {
      for (const prof of acc.profiles) {
        if (prof.clientId === clientId) return { platform: acc.platform, profile: prof.name };
      }
    }
    return { platform: 'Desasignado', profile: '-' };
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="bg-[#0b101a] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-[#06090f] text-slate-500 uppercase text-xs tracking-widest border-b border-slate-800 font-bold">
              <tr>
                <th className="px-6 py-5">Cliente</th>
                <th className="px-6 py-5">Plataforma Asociada</th>
                <th className="px-6 py-5">Método</th>
                <th className="px-6 py-5">Monto Venta</th>
                <th className="px-6 py-5">Próximo Pago</th>
                <th className="px-6 py-5">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {clientsList.map(c => {
                const info = getClientProfileInfo(c.id);
                const expDate = calculateExpirationDate(c.startDate, c.durationMonths || 1);
                const days = daysUntilExpiration(c.startDate, c.durationMonths || 1);
                
                const clientHistory = clientsList.filter(other => (other.phone && other.phone === c.phone) || other.name === c.name);
                const ltv = clientHistory.reduce((sum, h) => sum + h.pricePaid, 0);
                
                let statusNode;
                if (days < 0) {
                  statusNode = <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded font-bold text-[10px] uppercase tracking-wider">Vencido</span>;
                } else if (days <= 3) {
                  statusNode = <span className="px-2.5 py-1 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded font-bold text-[10px] uppercase tracking-wider">Aviso ({days}d)</span>;
                } else {
                  statusNode = <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-bold text-[10px] uppercase tracking-wider">En Regla</span>;
                }

                const isExpanded = expandedId === c.id;
                const platformDisplay = c.platformRef || info.platform;
                const msg = encodeURIComponent(`Hola ${c.name}, te escribo por tu cuenta de ${platformDisplay}.`);

                return (
                  <React.Fragment key={c.id}>
                  <tr className="hover:bg-blue-900/5 transition-colors group cursor-pointer" onClick={() => setExpandedId(isExpanded ? null : c.id)}>
                    <td className="px-6 py-4">
                      <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{c.name}</div>
                      <div className="text-xs text-slate-500 font-medium mt-0.5">{c.phone || 'Sin teléfono'}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-200">{platformDisplay}</div>
                      <div className="text-xs text-slate-500">{info.profile}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-slate-400 bg-slate-800/50 px-2.5 py-1 rounded-md">{c.paymentMethod}</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-400">
                      {formatCurrency(c.pricePaid)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-slate-300">{format(expDate, 'dd MMM yyyy', {locale: es})}</div>
                      <div className="text-[10px] text-slate-500">Activado: {format(parseISO(c.startDate), 'dd MMM yyyy')}</div>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      {statusNode}
                      <a href={`https://wa.me/${c.phone}?text=${msg}`} target="_blank" rel="noreferrer" className="p-1.5 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded transition-colors" onClick={(e) => e.stopPropagation()}>
                        <MessageCircle className="w-4 h-4" />
                      </a>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                    </td>
                  </tr>
                  
                  {isExpanded && (
                    <tr className="bg-[#0b101a] animate-in fade-in zoom-in-95 duration-200">
                      <td colSpan={6} className="px-6 py-4 border-l-2 border-blue-500">
                        <div className="flex justify-between items-center mb-4">
                           <h4 className="text-white font-bold tracking-widest uppercase text-xs">Historial de Compras ({clientHistory.length})</h4>
                           <div className="text-blue-400 font-bold bg-blue-500/10 px-3 py-1 rounded text-xs uppercase border border-blue-500/20">LTV: {formatCurrency(ltv)}</div>
                        </div>
                        <div className="space-y-2">
                           {clientHistory.map(h => (
                             <div key={h.id} className="flex justify-between items-center bg-[#06090f] p-3 rounded-lg border border-slate-800/50 text-xs">
                               <span className="text-slate-300 font-bold">{h.platformRef || 'Desconocido'} <span className="text-emerald-500 ml-2 font-normal bg-emerald-500/10 px-1.5 py-0.5 rounded">{h.durationMonths || 1} Mes(es)</span></span>
                               <span className="text-slate-400">{format(parseISO(h.startDate), 'dd MMM yyyy')}</span>
                               <span className="text-white font-bold">{formatCurrency(h.pricePaid)}</span>
                             </div>
                           ))}
                        </div>
                      </td>
                    </tr>
                  )}
                  </React.Fragment>
                )
              })}
              {clientsList.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-slate-500">Tu directorio está vacío. Comienza a registrar ventas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AccountsView({ accounts, clients }: { accounts: Account[], clients: Record<string, Client> }) {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {accounts.map(account => (
          <div key={account.id} className="bg-[#0b101a] border border-slate-800 rounded-2xl flex flex-col hover:border-blue-900/50 hover:shadow-[0_0_20px_rgba(37,99,235,0.05)] transition-all overflow-hidden relative">
            <div className="p-6 border-b border-slate-800/80 flex justify-between items-start bg-[#06090f]/50">
              <div>
                <h3 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                  <Tv className="w-6 h-6 text-blue-500" />
                  {account.platform}
                </h3>
                <div className="text-sm text-slate-500 mt-1.5 font-medium">{account.email}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-300">{formatCurrency(account.cost)}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Costo Mensual</div>
              </div>
            </div>

            <div className="p-6 space-y-3 flex-1 bg-[#0b101a]">
              {account.profiles.map(profile => {
                const client = profile.clientId ? clients[profile.clientId] : null;
                const isOcc = profile.status === 'OCCUPIED';
                
                return (
                  <div key={profile.id} className={cn(
                    "flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-300",
                    isOcc ? "bg-[#0f1623] border-blue-900/30" : "bg-transparent border-slate-800 border-dashed"
                  )}>
                    <div className="flex items-center gap-4 mb-3 sm:mb-0">
                      <div className={cn("p-2 rounded-lg", isOcc ? "bg-blue-500/10 text-blue-500" : "bg-slate-800 text-slate-600")}>
                        <UsersIcon className="w-5 h-5" />
                      </div>
                      <span className={cn("font-bold tracking-wide", isOcc ? "text-slate-200" : "text-slate-600")}>{profile.name}</span>
                    </div>
                    {isOcc && client ? (
                      <div className="flex flex-col sm:items-end w-full sm:w-auto">
                        <div className="text-sm font-bold text-blue-400">{client.name}</div>
                        <div className="flex gap-3 mt-1.5 text-[10px] text-slate-400 font-medium uppercase tracking-wider flex-wrap">
                          <span className="flex items-center gap-1.5"><Clock className="w-3 h-3 text-slate-500" /> Vence: {format(calculateExpirationDate(client.startDate), 'dd MMM yyyy')}</span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-[10px] px-3 py-1.5 bg-slate-800/50 text-slate-400 rounded border border-slate-700 uppercase tracking-widest font-bold">
                        Libre
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

function TreasuryView({ 
  accounts, 
  platformCharges, 
  transactions, 
  onAddCharge, 
  onSettleDebt 
}: { 
  accounts: Account[], 
  platformCharges: PlatformCharge[],
  transactions: Transaction[],
  onAddCharge: (data: { platform: string, date: string, amount: number }) => void,
  onSettleDebt: (id: string) => void
}) {
  const [newCharge, setNewCharge] = useState({
    platformId: '',
    date: new Date().toISOString().substring(0, 10),
    amount: ''
  });

  const handleChargeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const targetAccount = accounts.find(a => a.id === newCharge.platformId);
    if (!targetAccount || !newCharge.amount) return;
    
    onAddCharge({
      platform: targetAccount.platform,
      date: new Date(newCharge.date).toISOString(),
      amount: parseFloat(newCharge.amount)
    });
    setNewCharge({ ...newCharge, platformId: '', amount: '' });
  };

  const pendingCharges = platformCharges.filter(c => c.status === 'PENDING');

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-500">
      <div className="space-y-8">
        {/* Registrar Deuda */}
        <div className="bg-[#0b101a] border border-blue-900/30 p-6 rounded-2xl relative overflow-hidden group hover:border-blue-500/30 transition-all">
          <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><CreditCard className="w-5 h-5" /></div>
            Radicar Cobro de Plataforma (Nubank)
          </h2>
          <form onSubmit={handleChargeSubmit} className="space-y-5">
            <div>
              <label className="block text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">Plataforma</label>
              <select 
                required
                value={newCharge.platformId}
                onChange={e => setNewCharge({...newCharge, platformId: e.target.value})}
                className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
              >
                <option value="" disabled>Seleccione una plataforma</option>
                {accounts.map(acc => (
                  <option key={acc.id} value={acc.id}>{acc.platform}</option>
                ))}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-5">
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">Fecha</label>
                <input 
                  required
                  type="date" 
                  value={newCharge.date}
                  onChange={e => setNewCharge({...newCharge, date: e.target.value})}
                  className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-2">Monto (COP)</label>
                <input 
                  required
                  type="number" 
                  min="1"
                  value={newCharge.amount}
                  onChange={e => setNewCharge({...newCharge, amount: e.target.value})}
                  className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Ej: 15900"
                />
              </div>
            </div>
            <button 
              type="submit" 
              className="w-full py-3.5 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold uppercase tracking-widest text-xs transition-all border border-slate-700"
            >
              Radicar Cobro
            </button>
          </form>
        </div>

        {/* Deudas Pendientes */}
        <div className="bg-[#0b101a] border border-slate-800 p-6 rounded-2xl relative overflow-hidden">
          <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
            <div className="p-2 bg-red-500/10 rounded-lg text-red-500"><ListTodo className="w-5 h-5" /></div>
            Para Liquidar (Pendientes)
          </h2>
          {pendingCharges.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm font-medium border border-slate-800 border-dashed rounded-xl">
              Cero colas financieras. Todo limpio.
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCharges.map(charge => (
                <div key={charge.id} className="flex flex-col sm:flex-row justify-between items-center bg-[#06090f] border border-red-900/30 p-5 rounded-xl">
                  <div className="mb-4 sm:mb-0">
                    <div className="font-bold text-white text-lg">{charge.platform}</div>
                    <div className="text-[10px] uppercase font-bold tracking-widest text-slate-500 mt-1">Cobrado: {format(parseISO(charge.date), 'dd MMM yyyy', { locale: es })}</div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="text-xl font-black text-red-400">{formatCurrency(charge.amount)}</div>
                    <button 
                      onClick={() => onSettleDebt(charge.id)}
                      className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-500 hover:text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all border border-emerald-500/20"
                    >
                      Liquidar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="bg-[#0b101a] border border-slate-800 p-6 rounded-2xl h-full min-h-[600px]">
          <h2 className="text-lg font-bold text-white flex items-center gap-3 mb-6">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400"><History className="w-5 h-5" /></div>
            Historial de Movimientos
          </h2>
          {transactions.length === 0 ? (
            <div className="text-center py-10 text-slate-500">
              No hay movimientos registrados.
            </div>
          ) : (
            <div className="space-y-2 pr-2">
              {transactions.map(tx => {
                const isIncome = tx.type === 'INCOME_SALE';
                const isDebtAdded = tx.type === 'DEBT_ADDED';
                const isDebtPaid = tx.type === 'DEBT_PAID';

                return (
                  <div key={tx.id} className="flex items-center justify-between p-4 rounded-xl hover:bg-slate-800/30 border border-transparent hover:border-slate-800 transition-colors group">
                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "p-2.5 rounded-lg transition-colors border",
                        isIncome ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        isDebtAdded ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {isIncome && <ArrowDownRight className="w-4 h-4" />}
                        {isDebtAdded && <Receipt className="w-4 h-4" />}
                        {isDebtPaid && <ArrowUpRight className="w-4 h-4" />}
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm group-hover:text-blue-400 transition-colors">{tx.description}</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1">{format(parseISO(tx.date), "dd MMM, HH:mm", { locale: es })}</div>
                      </div>
                    </div>
                    <div className={cn(
                      "font-black tracking-tight",
                      isIncome ? "text-emerald-400" : 
                      isDebtAdded ? "text-amber-500" : 
                      "text-red-400"
                    )}>
                      {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'HOME' | 'ACCOUNTS' | 'CLIENTS' | 'TREASURY'>('HOME');

  const [accounts, setAccounts] = useState<Account[]>(initialAccounts);
  const [clients, setClients] = useState<Record<string, Client>>(initialClients);
  const [platformCharges, setPlatformCharges] = useState<PlatformCharge[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Auto-Check de Vencimiento
  useEffect(() => {
    const sweepExpired = () => {
      setAccounts(prevAccounts => {
        let hasChanges = false;
        const newAccounts = prevAccounts.map(acc => {
          let updated = false;
          const nextProfiles = acc.profiles.map(prof => {
            if (prof.status === 'OCCUPIED' && prof.clientId) {
              const client = clients[prof.clientId];
              if (client) {
                const days = daysUntilExpiration(client.startDate, client.durationMonths || 1);
                if (days < 0) {
                  hasChanges = true;
                  updated = true;
                  return { ...prof, status: 'FREE' as const, clientId: undefined };
                }
              }
            }
            return prof;
          });
          return updated ? { ...acc, profiles: nextProfiles } : acc;
        });
        return hasChanges ? newAccounts : prevAccounts;
      });
    };

    sweepExpired();
    const interval = setInterval(sweepExpired, 60000); // Check every minute
    return () => clearInterval(interval);
  }, [clients]);
  
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isCostsModalOpen, setIsCostsModalOpen] = useState(false);

  const [newClient, setNewClient] = useState({
    name: '',
    phone: '',
    platformId: '',
    durationMonths: '1',
    paymentMethod: 'Nequi' as PaymentMethod,
    pricePaid: ''
  });

  const [costs, setCosts] = useState<Record<string, { cost: string, ref: string }>>({});

  const openCostsModal = () => {
    const initialCosts: Record<string, { cost: string, ref: string }> = {};
    accounts.forEach(acc => {
      initialCosts[acc.id] = { cost: acc.cost.toString(), ref: (acc.referencePrice || 0).toString() };
    });
    setCosts(initialCosts);
    setIsCostsModalOpen(true);
  };

  const handleSaveCosts = (e: React.FormEvent) => {
    e.preventDefault();
    setAccounts(accounts.map(acc => ({
      ...acc,
      cost: parseFloat(costs[acc.id]?.cost || '0') || 0,
      referencePrice: parseFloat(costs[acc.id]?.ref || '0') || 0
    })));
    setIsCostsModalOpen(false);
  };

  const handleSaveClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClient.name || !newClient.platformId || !newClient.pricePaid) return;

    const targetAccount = accounts.find(acc => acc.id === newClient.platformId);
    if (!targetAccount) return;

    const freeProfile = targetAccount.profiles.find(p => p.status === 'FREE');
    if (!freeProfile) {
      alert('Esta plataforma se encuentra al tope. No hay perfiles libres.');
      return;
    }

    const newClientId = `client-${Date.now()}`;
    const pricePaid = parseFloat(newClient.pricePaid) || 0;
    
    const newClientData: Client = {
      id: newClientId,
      name: newClient.name,
      phone: newClient.phone,
      startDate: new Date().toISOString(),
      durationMonths: parseInt(newClient.durationMonths) || 1,
      pricePaid: pricePaid,
      paymentMethod: newClient.paymentMethod,
      platformRef: targetAccount.platform
    };

    setClients(prev => ({ ...prev, [newClientId]: newClientData }));

    setAccounts(prevAccounts => prevAccounts.map(acc => {
      if (acc.id === targetAccount.id) {
        return {
          ...acc,
          profiles: acc.profiles.map(prof => 
            prof.id === freeProfile.id 
              ? { ...prof, status: 'OCCUPIED', clientId: newClientId }
              : prof
          )
        };
      }
      return acc;
    }));

    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      type: 'INCOME_SALE',
      description: `Ingreso: ${targetAccount.platform} > ${newClient.name}`,
      amount: pricePaid,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);

    setNewClient({ name: '', phone: '', platformId: '', durationMonths: '1', paymentMethod: 'Nequi', pricePaid: '' });
    setIsClientModalOpen(false);
  };

  const handleAddCharge = (chargeData: { platform: string, date: string, amount: number }) => {
    const chargeId = `charge-${Date.now()}`;
    const newCharge: PlatformCharge = {
      id: chargeId,
      platform: chargeData.platform,
      date: chargeData.date,
      amount: chargeData.amount,
      status: 'PENDING'
    };
    
    const chargeTx: Transaction = {
      id: `tx-charge-${Date.now()}`,
      type: 'DEBT_ADDED',
      description: `Radicado deuda: ${chargeData.platform}`,
      amount: chargeData.amount,
      date: new Date().toISOString()
    };

    setPlatformCharges(prev => [newCharge, ...prev]);
    setTransactions(prev => [chargeTx, ...prev]);
  };

  const handleSettleDebt = (chargeId: string) => {
    const charge = platformCharges.find(c => c.id === chargeId);
    if (!charge) return;

    setPlatformCharges(prev => prev.map(c => c.id === chargeId ? { ...c, status: 'PAID' } : c));
    
    const settleTx: Transaction = {
      id: `tx-settle-${Date.now()}`,
      type: 'DEBT_PAID',
      description: `Factura liquidada: ${charge.platform}`,
      amount: charge.amount,
      date: new Date().toISOString()
    };

    setTransactions(prev => [settleTx, ...prev]);
  };

  return (
    <div className="flex h-screen bg-[#05080f] text-slate-300 font-sans overflow-hidden">
      
      {/* Sidebar - Gamer/Tech aesthetic */}
      <aside className="w-20 md:w-72 bg-[#090d14] border-r border-slate-800 flex flex-col transition-all duration-300 relative z-20">
        <div className="p-5 md:p-8 border-b border-slate-800 flex items-center justify-center md:justify-start">
          <MonitorPlay className="w-8 h-8 text-blue-500 md:mr-3 drop-shadow-[0_0_15px_rgba(37,99,235,0.8)]" />
          <h1 className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-600 hidden md:block tracking-widest uppercase">
            STREAM<span className="text-white">VAULT</span>
          </h1>
        </div>
        
        <nav className="flex-1 py-8 space-y-3 px-3 md:px-5">
           <SidebarItem icon={<LayoutDashboard className="w-5 h-5" />} label="Dashboard Central" active={activeTab === 'HOME'} onClick={() => setActiveTab('HOME')} />
           <SidebarItem icon={<Tv className="w-5 h-5" />} label="Cuentas Madre" active={activeTab === 'ACCOUNTS'} onClick={() => setActiveTab('ACCOUNTS')} />
           <SidebarItem icon={<UsersIcon className="w-5 h-5" />} label="Directorio CRM" active={activeTab === 'CLIENTS'} onClick={() => setActiveTab('CLIENTS')} />
           <SidebarItem icon={<WalletCards className="w-5 h-5" />} label="Tesorería" active={activeTab === 'TREASURY'} onClick={() => setActiveTab('TREASURY')} />
        </nav>

        <div className="p-5 text-center border-t border-slate-800 hidden md:block">
          <div className="text-[10px] uppercase tracking-widest text-slate-600 font-bold">V 2.0.0 Alpha</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden">
        {/* Deep ambient glow */}
        <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[20%] w-[40%] h-[40%] bg-indigo-600/5 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Dynamic Header */}
        <header className="px-6 md:px-10 py-6 border-b border-white/5 flex justify-between items-center bg-[#05080f]/80 backdrop-blur-md z-10">
           <div>
             <h2 className="text-xl md:text-3xl font-black text-white tracking-tight">
               {activeTab === 'HOME' && 'Centro de Comando'}
               {activeTab === 'ACCOUNTS' && 'Gestión de Perfiles'}
               {activeTab === 'CLIENTS' && 'Base de Usuarios Módulo CRM'}
               {activeTab === 'TREASURY' && 'Hub de Control Financiero'}
             </h2>
           </div>
           <div className="flex items-center gap-3 md:gap-4">
             <button onClick={openCostsModal} className="p-2.5 bg-[#0b101a] hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors" title="Costos Fijos">
               <Settings className="w-5 h-5" />
             </button>
             <button 
               onClick={() => setIsClientModalOpen(true)} 
               className="hidden md:flex px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold tracking-wide hover:bg-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-all uppercase items-center gap-2"
             >
               + Venta Exitosa
             </button>
             <button 
               onClick={() => setIsClientModalOpen(true)} 
               className="md:hidden p-2.5 bg-blue-600 text-white rounded-xl font-bold shadow-[0_0_20px_rgba(37,99,235,0.3)]"
             >
               + 
             </button>
           </div>
        </header>

        {/* Dynamic View Scroll Area */}
        <div className="flex-1 overflow-y-auto w-full p-6 md:p-10 relative z-10 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
           <div className="max-w-7xl mx-auto">
             {activeTab === 'HOME' && <DashboardView clients={clients} platformCharges={platformCharges} accounts={accounts} />}
             {activeTab === 'ACCOUNTS' && <AccountsView accounts={accounts} clients={clients} />}
             {activeTab === 'CLIENTS' && <ClientsView clients={clients} accounts={accounts} />}
             {activeTab === 'TREASURY' && (
                <TreasuryView 
                  accounts={accounts} 
                  platformCharges={platformCharges} 
                  transactions={transactions}
                  onAddCharge={handleAddCharge}
                  onSettleDebt={handleSettleDebt}
                />
             )}
           </div>
        </div>
      </main>

      {/* New Client Modal */}
      {isClientModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b101a] border border-blue-900/50 rounded-2xl w-full max-w-md overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#06090f]">
              <h2 className="text-xl font-black text-white tracking-widest uppercase">Registrar Venta</h2>
              <button onClick={() => setIsClientModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveClient} className="p-6 space-y-5">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Nombre del cliente *</label>
                <input 
                  required
                  type="text" 
                  value={newClient.name}
                  onChange={e => setNewClient({...newClient, name: e.target.value})}
                  className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="ID Cliente o Nombre"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Teléfono de contacto</label>
                <input 
                  type="text" 
                  value={newClient.phone}
                  onChange={e => setNewClient({...newClient, phone: e.target.value})}
                  className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                  placeholder="Opcional"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Plataforma *</label>
                <select 
                  required
                  value={newClient.platformId}
                  onChange={e => setNewClient({...newClient, platformId: e.target.value})}
                  className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                >
                  <option value="" disabled>Elegir plataforma del pool</option>
                  {accounts.map(acc => {
                    const freeProfiles = acc.profiles.filter(p => p.status === 'FREE').length;
                    return (
                      <option key={acc.id} value={acc.id} disabled={freeProfiles === 0}>
                        {acc.platform} ({freeProfiles} slots libres)
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Meses a Contratar *</label>
                  <select 
                    required
                    value={newClient.durationMonths}
                    onChange={e => setNewClient({...newClient, durationMonths: e.target.value})}
                    className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="1">1 Mes (Treinta días)</option>
                    <option value="3">3 Meses (Trimestre)</option>
                    <option value="6">6 Meses (Semestre)</option>
                    <option value="12">12 Meses (Un Año)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Vía de pago *</label>
                  <select 
                    required
                    value={newClient.paymentMethod}
                    onChange={e => setNewClient({...newClient, paymentMethod: e.target.value as PaymentMethod})}
                    className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                  >
                    <option value="Nequi">Nequi</option>
                    <option value="Efectivo">Efectivo / Cash</option>
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold uppercase tracking-widest text-slate-500 mb-2">Precio Total Cobrado (COP) *</label>
                  <input 
                    required
                    type="number" 
                    min="0"
                    value={newClient.pricePaid}
                    onChange={e => setNewClient({...newClient, pricePaid: e.target.value})}
                    className="w-full bg-[#06090f] border border-slate-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                    placeholder="Ej: 15000"
                  />
                  {newClient.platformId && newClient.pricePaid && accounts.find(a => a.id === newClient.platformId)?.referencePrice && (
                    parseInt(newClient.pricePaid) < (accounts.find(a => a.id === newClient.platformId)!.referencePrice! * parseInt(newClient.durationMonths)) && (
                      <div className="mt-2 text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-1.5 rounded flex items-center gap-1.5 border border-amber-500/20">
                        <AlertTriangle className="w-3 h-3" />
                        Aviso: Inferior al tarifario base sugerido ({formatCurrency(accounts.find(a => a.id === newClient.platformId)!.referencePrice! * parseInt(newClient.durationMonths))})
                      </div>
                    )
                  )}
                </div>
              </div>
              <div className="pt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsClientModalOpen(false)}
                  className="px-5 py-3 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[11px]"
                >
                  Abortar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold uppercase tracking-widest text-[11px] shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-all"
                >
                  Registrar Operación
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Costs Modal */}
      {isCostsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-[#0b101a] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-[#06090f]">
              <h2 className="text-xl font-black text-white tracking-widest uppercase">Costos Base Fijos</h2>
              <button onClick={() => setIsCostsModalOpen(false)} className="text-slate-500 hover:text-white transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleSaveCosts} className="p-6 space-y-4">
              <div className="text-[11px] uppercase tracking-widest font-bold text-slate-500 mb-6 border-l-2 border-slate-700 pl-3">
                Sirve como referencia base. Para liquidar usa la pestaña Tesorería.
              </div>
              {accounts.map(acc => (
                <div key={acc.id} className="flex justify-between items-center bg-[#06090f] p-4 rounded-xl border border-slate-800">
                  <span className="font-bold text-white tracking-wide">{acc.platform}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 text-[10px] uppercase font-bold text-right pr-2">Costo<br/>Mes</span>
                    <input 
                      type="number" 
                      min="0"
                      value={costs[acc.id]?.cost || ''}
                      onChange={e => setCosts({...costs, [acc.id]: { ...costs[acc.id], cost: e.target.value }})}
                      className="w-24 bg-[#0b101a] border border-slate-700 rounded-lg px-2 py-2 text-right text-white font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="0"
                    />
                    <span className="text-slate-500 text-[10px] uppercase font-bold text-right pl-2 pr-2">Venta<br/>Base</span>
                    <input 
                      type="number" 
                      min="0"
                      value={costs[acc.id]?.ref || ''}
                      onChange={e => setCosts({...costs, [acc.id]: { ...costs[acc.id], ref: e.target.value }})}
                      className="w-24 bg-[#0b101a] border border-blue-900/50 rounded-lg px-2 py-2 text-right text-blue-400 font-bold focus:outline-none focus:border-blue-500 transition-colors"
                      placeholder="Ej: 15000"
                    />
                  </div>
                </div>
              ))}
              <div className="pt-6 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsCostsModalOpen(false)}
                  className="px-5 py-3 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-[11px]"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white border border-slate-700 rounded-xl font-bold uppercase tracking-widest text-[11px] transition-all"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
