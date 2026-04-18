export type PaymentMethod = 'Nequi' | 'Efectivo';

export type Client = {
  id: string;
  name: string;
  phone: string;
  startDate: string; // ISO Date String
  durationMonths: number;
  pricePaid: number; // Total paid in COP
  paymentMethod: PaymentMethod;
  platformRef?: string;
};

export type Profile = {
  id: string;
  name: string;
  status: 'FREE' | 'OCCUPIED';
  clientId?: string;
};

export type Account = {
  id: string;
  platform: string;
  email: string;
  cost: number;
  referencePrice?: number; // ADDED
  billingCycle: 'MONTHLY' | 'ANNUAL';
  profiles: Profile[];
};

export type PlatformCharge = {
  id: string;
  platform: string;
  date: string; // ISO Date String
  amount: number;
  status: 'PENDING' | 'PAID';
};

export type TransactionType = 'INCOME_SALE' | 'DEBT_ADDED' | 'DEBT_PAID';

export type Transaction = {
  id: string;
  type: TransactionType;
  description: string;
  amount: number;
  date: string; // ISO Date String
};
