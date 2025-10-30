import { Transaction } from '@/types/transaction';

const STORAGE_KEY = 'finance_tracker_transactions';

export const loadTransactions = (): Transaction[] => {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
};

export const addTransaction = (transaction: Omit<Transaction, 'id'>): Transaction => {
  const transactions = loadTransactions();
  const newTransaction: Transaction = {
    ...transaction,
    id: Date.now().toString(),
  };
  transactions.push(newTransaction);
  saveTransactions(transactions);
  return newTransaction;
};

export const updateTransaction = (id: string, updates: Partial<Transaction>): void => {
  const transactions = loadTransactions();
  const index = transactions.findIndex(t => t.id === id);
  if (index !== -1) {
    transactions[index] = { ...transactions[index], ...updates };
    saveTransactions(transactions);
  }
};

export const deleteTransaction = (id: string): void => {
  const transactions = loadTransactions();
  const filtered = transactions.filter(t => t.id !== id);
  saveTransactions(filtered);
};
