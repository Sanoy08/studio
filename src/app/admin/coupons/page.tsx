// src/app/admin/coupons/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, TicketPercent } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

type Coupon = {
  id: string;
  code: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  expiryDate: string;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    value: '',
    minOrder: '',
    expiryDate: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) setCoupons(data.coupons);
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleOpenDialog = () => {
    setFormData({ code: '', discountType: 'percentage', value: '', minOrder: '', expiryDate: '', isActive: true });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Coupon created!');
        setIsDialogOpen(false);
        fetchCoupons();
      } else {
        toast.error(data.error || 'Failed to create coupon');
      }
    } catch (e) {
      toast.error('Error saving coupon');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this coupon?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success('Coupon deleted');
            fetchCoupons();
        }
    } catch (e) { toast.error('Delete failed'); }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">Coupons</h1>
            <p className="text-muted-foreground">Manage discount codes.</p>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2"><Plus className="h-4 w-4"/> Add Coupon</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Min. Order</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No coupons found.</TableCell>
                </TableRow>
              ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell className="font-mono font-bold">{coupon.code}</TableCell>
                      <TableCell>
                          {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                      </TableCell>
                      <TableCell>{formatPrice(coupon.minOrder)}</TableCell>
                      <TableCell>{new Date(coupon.expiryDate).toLocaleDateString()}</TableCell>
                      <TableCell>{coupon.isActive ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span>}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(coupon.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Coupon Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Create New Coupon</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Coupon Code</Label>
                    <Input value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="Ex: SAVE20" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Discount Type</Label>
                        <Select 
                            value={formData.discountType} 
                            onValueChange={(val) => setFormData({...formData, discountType: val})}
                        >
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label>Value</Label>
                        <Input type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} placeholder={formData.discountType === 'percentage' ? "20" : "100"} />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Min. Order (₹)</Label>
                        <Input type="number" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: e.target.value})} placeholder="299" />
                    </div>
                    <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                    </div>
                </div>
                
                <div className="flex items-center gap-2 mt-2">
                    <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} />
                    <Label>Active</Label>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Create Coupon</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}