import { useState, useEffect } from 'react';
import { Transaction } from '@/types/transaction';
import { loadTransactions, addTransaction, updateTransaction, deleteTransaction } from '@/lib/storage';
import { TransactionForm } from '@/components/TransactionForm';
import { TransactionList } from '@/components/TransactionList';
import { Summary } from '@/components/Summary';
import { SearchFilter } from '@/components/SearchFilter';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Wallet, BarChart3, Search } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | undefined>();
  const { toast } = useToast();

  useEffect(() => {
    const loaded = loadTransactions();
    setTransactions(loaded);
    setFilteredTransactions(loaded);
  }, []);

  const handleAddTransaction = (data: Omit<Transaction, 'id'>) => {
    const newTransaction = addTransaction(data);
    const updated = loadTransactions();
    setTransactions(updated);
    setFilteredTransactions(updated);
    setShowForm(false);
    toast({
      title: 'Transaction added',
      description: 'Your transaction has been recorded successfully.',
    });
  };

  const handleUpdateTransaction = (data: Omit<Transaction, 'id'>) => {
    if (editingTransaction) {
      updateTransaction(editingTransaction.id, data);
      const updated = loadTransactions();
      setTransactions(updated);
      setFilteredTransactions(updated);
      setEditingTransaction(undefined);
      setShowForm(false);
      toast({
        title: 'Transaction updated',
        description: 'Your transaction has been updated successfully.',
      });
    }
  };

  const handleDeleteTransaction = (id: string) => {
    deleteTransaction(id);
    const updated = loadTransactions();
    setTransactions(updated);
    setFilteredTransactions(updated);
    toast({
      title: 'Transaction deleted',
      description: 'Your transaction has been removed.',
      variant: 'destructive',
    });
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTransaction(undefined);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card shadow-soft">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-accent">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Finance Tracker</h1>
                <p className="text-sm text-muted-foreground">Manage your personal finances</p>
              </div>
            </div>
            {!showForm && (
              <Button onClick={() => setShowForm(true)} size="lg" className="shadow-soft">
                <Plus className="w-4 h-4 mr-2" />
                Add Transaction
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {showForm ? (
          <div className="max-w-2xl mx-auto">
            <TransactionForm
              transaction={editingTransaction}
              onSubmit={editingTransaction ? handleUpdateTransaction : handleAddTransaction}
              onCancel={handleCancel}
            />
          </div>
        ) : (
          <Tabs defaultValue="transactions" className="space-y-6">
            <TabsList className="grid w-full max-w-md mx-auto grid-cols-3">
              <TabsTrigger value="transactions" className="flex items-center gap-2">
                <Wallet className="w-4 h-4" />
                Transactions
              </TabsTrigger>
              <TabsTrigger value="summary" className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4" />
                Summary
              </TabsTrigger>
              <TabsTrigger value="search" className="flex items-center gap-2">
                <Search className="w-4 h-4" />
                Search
              </TabsTrigger>
            </TabsList>

            <TabsContent value="transactions" className="space-y-6">
              <TransactionList
                transactions={transactions}
                onEdit={handleEdit}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>

            <TabsContent value="summary" className="space-y-6">
              <Summary transactions={transactions} />
            </TabsContent>

            <TabsContent value="search" className="space-y-6">
              <SearchFilter
                transactions={transactions}
                onFilterChange={setFilteredTransactions}
              />
              <TransactionList
                transactions={filteredTransactions}
                onEdit={handleEdit}
                onDelete={handleDeleteTransaction}
              />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
};

export default Index;
