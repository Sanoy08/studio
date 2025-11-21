// src/app/(shop)/account/wallet/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Coins, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

type Transaction = {
    _id: string;
    type: 'earn' | 'redeem';
    amount: number;
    description: string;
    createdAt: string;
};

export default function WalletPage() {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const fetchWallet = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await fetch('/api/wallet', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setBalance(data.balance);
        setTransactions(data.transactions);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchWallet(); }, []);

  const handleRedeem = async () => {
    const amount = parseInt(redeemAmount);
    if (!amount || amount < 10) {
        toast.error("Minimum 10 coins required to redeem.");
        return;
    }
    if (amount > balance) {
        toast.error("Insufficient balance.");
        return;
    }

    setIsRedeeming(true);
    const token = localStorage.getItem('token');

    try {
        const res = await fetch('/api/wallet/redeem', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ coinsToRedeem: amount })
        });
        
        const data = await res.json();
        if (res.ok) {
            toast.success("Coins redeemed! Check your email or coupons for the code.");
            setRedeemAmount('');
            fetchWallet(); // ব্যালেন্স আপডেট করা
        } else {
            toast.error(data.error || "Redemption failed.");
        }
    } catch (e) {
        toast.error("Something went wrong.");
    } finally {
        setIsRedeeming(false);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        {/* Balance Card */}
        <Card className="bg-primary/10 border-primary/20">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium flex items-center gap-2">
                    <Coins className="h-5 w-5 text-primary" />
                    My Bumba Coins
                </CardTitle>
                <CardDescription>Earn coins with every order and redeem for discounts.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="text-4xl font-bold text-primary">{balance}</div>
                <p className="text-sm text-muted-foreground mt-1">Current Balance</p>
            </CardContent>
        </Card>

        {/* Redeem Card */}
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">Redeem Coins</CardTitle>
                <CardDescription>Convert your coins into coupon codes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label>Coins to redeem (Min 10)</Label>
                    <div className="flex gap-2">
                        <Input 
                            type="number" 
                            placeholder="Amount" 
                            value={redeemAmount} 
                            onChange={(e) => setRedeemAmount(e.target.value)}
                        />
                        <Button onClick={handleRedeem} disabled={isRedeeming}>
                            {isRedeeming ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Redeem'}
                        </Button>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground">Rate: 1 Coin = ₹1 Discount</p>
            </CardContent>
        </Card>
      </div>

      {/* Transactions History */}
      <Card>
          <CardHeader>
              <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
                <p className="text-center py-4 text-muted-foreground">No transactions yet.</p>
            ) : (
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {transactions.map((tx) => (
                            <TableRow key={tx._id}>
                                <TableCell className="text-xs text-muted-foreground">
                                    {new Date(tx.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {tx.type === 'earn' ? (
                                            <ArrowDownLeft className="h-4 w-4 text-green-500" />
                                        ) : (
                                            <ArrowUpRight className="h-4 w-4 text-red-500" />
                                        )}
                                        {tx.description}
                                    </div>
                                </TableCell>
                                <TableCell className={`text-right font-bold ${tx.type === 'earn' ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.type === 'earn' ? '+' : '-'}{tx.amount}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            )}
          </CardContent>
      </Card>
    </div>
  );
}