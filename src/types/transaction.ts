export interface Transaction {
  id: string;
  date: string;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  paymentMethod: string;
  description: string;
}

export interface CategoryTotal {
  category: string;
  total: number;
}
