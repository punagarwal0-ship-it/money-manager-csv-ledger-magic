import { Transaction, CategoryTotal } from '@/types/transaction';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Wallet, TrendingUp, TrendingDown, PiggyBank } from 'lucide-react';

interface SummaryProps {
  transactions: Transaction[];
}

export const Summary = ({ transactions }: SummaryProps) => {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpense;

  const categoryTotals: CategoryTotal[] = transactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const existing = acc.find(item => item.category === t.category);
      if (existing) {
        existing.total += t.amount;
      } else {
        acc.push({ category: t.category, total: t.amount });
      }
      return acc;
    }, [] as CategoryTotal[])
    .sort((a, b) => b.total - a.total);

  const COLORS = [
    'hsl(215 85% 50%)',
    'hsl(173 60% 45%)',
    'hsl(0 75% 55%)',
    'hsl(38 92% 55%)',
    'hsl(145 65% 45%)',
    'hsl(280 65% 55%)',
    'hsl(330 75% 55%)',
    'hsl(50 90% 55%)',
  ];

  const pieData = categoryTotals.map((item, index) => ({
    name: item.category,
    value: item.total,
    fill: COLORS[index % COLORS.length]
  }));

  const barData = [
    { name: 'Income', value: totalIncome, fill: 'hsl(145 65% 45%)' },
    { name: 'Expense', value: totalExpense, fill: 'hsl(0 75% 55%)' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="shadow-soft hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <TrendingUp className="w-4 h-4 text-income" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-income">${totalIncome.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <TrendingDown className="w-4 h-4 text-expense" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-expense">${totalExpense.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card className="shadow-soft hover:shadow-medium transition-all">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Balance</CardTitle>
            <PiggyBank className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-income' : 'text-expense'}`}>
              ${Math.abs(balance).toFixed(2)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Income vs Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => `$${value.toFixed(2)}`}
                  contentStyle={{ borderRadius: '8px' }}
                />
                <Bar dataKey="value" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="shadow-medium">
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
          </CardHeader>
          <CardContent>
            {categoryTotals.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No expense data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
