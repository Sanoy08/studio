// src/app/(shop)/account/wallet/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
// ★ নতুন আইকন TimerOff যোগ করা হয়েছে
import { Loader2, TrendingUp, History, Gift, Coins, ArrowDownLeft, ArrowUpRight, RotateCcw, TimerOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import { formatPrice } from '@/lib/utils';

type Transaction = {
    id: string;
    // ★ 'expire' টাইপ যোগ করা হয়েছে
    type: 'earn' | 'redeem' | 'refund' | 'expire'; 
    amount: number;
    description: string;
    date: string;
};

export default function WalletPage() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState(0);
  const [tier, setTier] = useState('Bronze');
  const [totalSpent, setTotalSpent] = useState(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  
  const [isRedeemOpen, setIsRedeemOpen] = useState(false);
  const [redeemAmount, setRedeemAmount] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);

  const fetchWalletData = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
          const res = await fetch('/api/wallet', {
              headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          
          if (data.success) {
              setBalance(data.balance);
              setTier(data.tier);
              setTotalSpent(data.totalSpent);
              setTransactions(data.transactions);
          }
      } catch (e) {
          console.error(e);
      } finally {
          setIsLoading(false);
      }
  };

  useEffect(() => {
      fetchWalletData();
  }, []);

  const handleRedeem = async () => {
      if (!redeemAmount || parseInt(redeemAmount) < 10) {
          toast.error("Minimum redeem amount is 10 coins.");
          return;
      }
      if (parseInt(redeemAmount) > balance) {
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
              body: JSON.stringify({ coinsToRedeem: parseInt(redeemAmount) })
          });
          
          const data = await res.json();
          
          if (res.ok) {
              toast.success("Coupon Generated Successfully! Check your email.");
              setIsRedeemOpen(false);
              setRedeemAmount('');
              fetchWalletData(); 
          } else {
              toast.error(data.error || "Redeem failed");
          }
      } catch (e) {
          toast.error("Error redeeming coins");
      } finally {
          setIsRedeeming(false);
      }
  };

  const getNextTierInfo = () => {
      if (totalSpent < 5000) return { next: 'Silver', target: 5000, current: totalSpent };
      if (totalSpent < 15000) return { next: 'Gold', target: 15000, current: totalSpent };
      return { next: 'Max', target: totalSpent, current: totalSpent }; 
  };
  const tierInfo = getNextTierInfo();
  const progress = Math.min((tierInfo.current / tierInfo.target) * 100, 100);

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20">
        
        {/* Wallet Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 text-white shadow-2xl p-8">
            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-40 h-40 bg-primary/20 rounded-full blur-2xl"></div>
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <p className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-1">Total Balance</p>
                    <h1 className="text-5xl font-bold flex items-center gap-2">
                        {balance} <span className="text-2xl text-yellow-400">Coins</span>
                    </h1>
                    <div className="mt-4 flex items-center gap-3">
                        <Badge className={`px-3 py-1 text-xs font-bold uppercase tracking-wide border-none ${
                            tier === 'Gold' ? 'bg-yellow-400 text-yellow-950' : 
                            tier === 'Silver' ? 'bg-gray-300 text-gray-900' : 
                            'bg-orange-700 text-orange-100'
                        }`}>
                            {tier} Member
                        </Badge>
                        <span className="text-xs text-gray-400">1 Coin = ₹1</span>
                    </div>
                </div>
                
                <Button 
                    onClick={() => setIsRedeemOpen(true)} 
                    className="bg-white text-gray-900 hover:bg-gray-100 border-none font-bold shadow-lg px-6 h-12 rounded-full transition-transform hover:scale-105 active:scale-95"
                >
                    <Gift className="mr-2 h-5 w-5 text-primary" /> Redeem Coins
                </Button>
            </div>
        </div>

        {/* Tier Progress */}
        {tier !== 'Gold' && (
            <Card className="border-0 shadow-md bg-gradient-to-r from-primary/5 to-transparent">
                <CardContent className="p-6">
                    <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-primary" />
                            <span className="font-bold text-foreground">Unlock {tierInfo.next} Tier</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                            Spend <strong>{formatPrice(tierInfo.target - tierInfo.current)}</strong> more
                        </span>
                    </div>
                    <Progress value={progress} className="h-3 bg-gray-200" />
                    <div className="flex justify-between text-xs text-muted-foreground mt-2 font-medium">
                        <span>{tier}</span>
                        <span>{tierInfo.next}</span>
                    </div>
                </CardContent>
            </Card>
        )}

        {/* Transaction History */}
        <div className="space-y-4">
            <h2 className="text-xl font-bold font-headline flex items-center gap-2">
                <History className="h-5 w-5 text-gray-500" /> Recent Activity
            </h2>

            {transactions.length === 0 ? (
                <div className="text-center py-12 bg-muted/20 rounded-2xl border border-dashed">
                    <Coins className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
                    <p className="text-muted-foreground">No transactions yet.</p>
                    <Button variant="link" asChild className="mt-1">
                        <a href="/menus">Order now to earn!</a>
                    </Button>
                </div>
            ) : (
                <div className="grid gap-3">
                    {transactions.map((txn) => {
                        // ★ লজিক আপডেট: শুধুমাত্র earn এবং refund পজিটিভ
                        const isPositive = txn.type === 'earn' || txn.type === 'refund';
                        
                        return (
                            <div key={txn.id} className="flex items-center justify-between p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-4">
                                    <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                        isPositive ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                    }`}>
                                        {/* আইকন সিলেকশন */}
                                        {txn.type === 'earn' && <ArrowDownLeft className="h-5 w-5" />}
                                        {txn.type === 'redeem' && <ArrowUpRight className="h-5 w-5" />}
                                        {txn.type === 'refund' && <RotateCcw className="h-5 w-5" />}
                                        {txn.type === 'expire' && <TimerOff className="h-5 w-5" />} {/* এক্সপায়ার আইকন */}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <p className="font-semibold text-sm text-foreground capitalize">{txn.type}</p>
                                            
                                            {/* ব্যাজ */}
                                            {txn.type === 'refund' && <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">Returned</Badge>}
                                            {txn.type === 'expire' && <Badge variant="destructive" className="text-[10px] px-1 py-0 h-4">Expired</Badge>}
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {txn.description} • {new Date(txn.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                        </p>
                                    </div>
                                </div>
                                <span className={`font-bold text-sm ${
                                    isPositive ? 'text-green-600' : 'text-red-500'
                                }`}>
                                    {isPositive ? '+' : '-'}{txn.amount}
                                </span>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>

        {/* Redeem Modal */}
        <Dialog open={isRedeemOpen} onOpenChange={setIsRedeemOpen}>
            <DialogContent className="max-w-sm rounded-2xl p-6">
                <DialogHeader>
                    <DialogTitle className="text-center text-2xl">Redeem Coins</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="text-center bg-muted/30 p-4 rounded-xl">
                        <p className="text-sm text-muted-foreground">Available Balance</p>
                        <p className="text-3xl font-bold text-primary mt-1">{balance}</p>
                    </div>
                    
                    <div className="space-y-2">
                        <Label>Coins to Redeem</Label>
                        <div className="relative">
                            <Input 
                                type="number" 
                                placeholder="Enter amount (min 10)" 
                                value={redeemAmount}
                                onChange={(e) => setRedeemAmount(e.target.value)}
                                className="pl-10 h-12 text-lg font-bold"
                            />
                            <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground text-right">
                            Value: ₹{parseInt(redeemAmount || '0') * 1}
                        </p>
                    </div>
                </div>
                <DialogFooter>
                    <Button 
                        onClick={handleRedeem} 
                        className="w-full h-12 text-lg font-bold shadow-lg shadow-primary/20" 
                        disabled={isRedeeming || !redeemAmount}
                    >
                        {isRedeeming ? <Loader2 className="h-5 w-5 animate-spin" /> : "Confirm Redeem"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}