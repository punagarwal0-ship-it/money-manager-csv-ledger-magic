import { useState } from 'react';
import { Transaction } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, X } from 'lucide-react';

interface SearchFilterProps {
  transactions: Transaction[];
  onFilterChange: (filtered: Transaction[]) => void;
}

export const SearchFilter = ({ transactions, onFilterChange }: SearchFilterProps) => {
  const [searchMode, setSearchMode] = useState<'all' | 'date' | 'category' | 'amount'>('all');
  const [dateFilter, setDateFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');

  const categories = Array.from(new Set(transactions.map(t => t.category))).sort();

  const handleSearch = () => {
    let filtered = [...transactions];

    if (searchMode === 'date' && dateFilter) {
      filtered = filtered.filter(t => t.date === dateFilter);
    } else if (searchMode === 'category' && categoryFilter) {
      filtered = filtered.filter(t => t.category === categoryFilter);
    } else if (searchMode === 'amount' && (minAmount || maxAmount)) {
      const min = minAmount ? parseFloat(minAmount) : 0;
      const max = maxAmount ? parseFloat(maxAmount) : Infinity;
      filtered = filtered.filter(t => t.amount >= min && t.amount <= max);
    }

    onFilterChange(filtered);
  };

  const handleReset = () => {
    setSearchMode('all');
    setDateFilter('');
    setCategoryFilter('');
    setMinAmount('');
    setMaxAmount('');
    onFilterChange(transactions);
  };

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Search className="w-5 h-5" />
          Search & Filter
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Search Mode</Label>
          <Select value={searchMode} onValueChange={(value: any) => setSearchMode(value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Transactions</SelectItem>
              <SelectItem value="date">By Date</SelectItem>
              <SelectItem value="category">By Category</SelectItem>
              <SelectItem value="amount">By Amount Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {searchMode === 'date' && (
          <div className="space-y-2">
            <Label>Date</Label>
            <Input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            />
          </div>
        )}

        {searchMode === 'category' && (
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {searchMode === 'amount' && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Min Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={minAmount}
                onChange={(e) => setMinAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>
            <div className="space-y-2">
              <Label>Max Amount</Label>
              <Input
                type="number"
                step="0.01"
                value={maxAmount}
                onChange={(e) => setMaxAmount(e.target.value)}
                placeholder="1000.00"
              />
            </div>
          </div>
        )}

        <div className="flex gap-3 pt-2">
          <Button onClick={handleSearch} className="flex-1">
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <X className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
