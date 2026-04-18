export type Client = {
  id: string;
  name: string;
  phone: string;
  startDate: string; // ISO Date String
  pricePaid: number; // How much they pay for their profile
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
  billingCycle: 'MONTHLY' | 'ANNUAL';
  profiles: Profile[];
};
