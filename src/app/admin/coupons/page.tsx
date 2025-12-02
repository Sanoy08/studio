// src/app/admin/coupons/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Trash2, Pencil, TicketPercent, Search, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import { FloatingInput } from '@/components/ui/floating-input';

type Coupon = {
  id: string;
  code: string;
  description?: string;
  discountType: 'percentage' | 'flat';
  value: number;
  minOrder: number;
  usageLimit?: number;
  startDate?: string;
  expiryDate: string;
  isActive: boolean;
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discountType: 'percentage',
    value: '',
    minOrder: '',
    usageLimit: '',
    startDate: '',
    expiryDate: '',
    isActive: true,
  });

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/coupons');
      const data = await res.json();
      if (data.success) {
        setCoupons(data.coupons);
        setFilteredCoupons(data.coupons);
      }
    } catch (error) {
      toast.error('Failed to fetch coupons');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredCoupons(coupons);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredCoupons(coupons.filter(c => c.code.toLowerCase().includes(lowerQ)));
    }
  }, [searchQuery, coupons]);

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({
        code: coupon.code,
        description: coupon.description || '',
        discountType: coupon.discountType,
        value: coupon.value.toString(),
        minOrder: coupon.minOrder.toString(),
        usageLimit: coupon.usageLimit?.toString() || '',
        startDate: coupon.startDate ? new Date(coupon.startDate).toISOString().split('T')[0] : '',
        expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
        isActive: coupon.isActive,
      });
    } else {
      setEditingCoupon(null);
      const today = new Date().toISOString().split('T')[0];
      setFormData({ code: '', description: '', discountType: 'percentage', value: '', minOrder: '0', usageLimit: '0', startDate: today, expiryDate: '', isActive: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const method = editingCoupon ? 'PUT' : 'POST';
    const url = editingCoupon ? `/api/admin/coupons/${editingCoupon.id}` : '/api/admin/coupons';
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(editingCoupon ? 'Coupon updated!' : 'Coupon created!');
        setIsDialogOpen(false);
        fetchCoupons();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Operation failed');
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

  const isExpired = (expiryDate: string) => {
      return new Date(expiryDate) < new Date();
  }

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <TicketPercent className="h-6 w-6 text-primary" /> Coupons
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage discount codes and promotions.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search codes..." 
                    className="pl-9 bg-background" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Coupon
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:hidden gap-4">
        {filteredCoupons.map((coupon) => {
            const expired = isExpired(coupon.expiryDate);
            return (
                <Card key={coupon.id} className="border shadow-sm relative overflow-hidden">
                    <div className={`absolute top-0 left-0 w-1 h-full ${coupon.isActive && !expired ? 'bg-green-500' : 'bg-muted'}`} />
                    <div className="p-4 pl-5 space-y-3">
                        <div className="flex justify-between items-start">
                            <div className="flex flex-col">
                                <span className="font-mono font-bold text-lg text-primary tracking-wide">{coupon.code}</span>
                                <span className="text-xs text-muted-foreground">{coupon.description || 'No description'}</span>
                            </div>
                            <Badge variant={coupon.isActive && !expired ? "default" : "secondary"} className={coupon.isActive && !expired ? "bg-green-100 text-green-700 border-green-200" : "bg-gray-100 text-gray-600"}>
                                {expired ? 'Expired' : (coupon.isActive ? 'Active' : 'Inactive')}
                            </Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-2 py-2 border-t border-b border-dashed">
                             <div>
                                 <p className="text-xs text-muted-foreground">Discount</p>
                                 <p className="font-bold text-foreground">
                                     {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                 </p>
                             </div>
                             <div className="text-right">
                                 <p className="text-xs text-muted-foreground">Min Order</p>
                                 <p className="font-medium">{formatPrice(coupon.minOrder)}</p>
                             </div>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">
                                <Calendar className="h-3 w-3" />
                                {/* ★★★ FIX: DD/MM/YYYY ফরম্যাট ★★★ */}
                                Expires: {new Date(coupon.expiryDate).toLocaleDateString('en-GB')}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleOpenDialog(coupon)}><Pencil className="h-4 w-4"/></Button>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(coupon.id)}><Trash2 className="h-4 w-4"/></Button>
                            </div>
                        </div>
                    </div>
                </Card>
            )
        })}
      </div>

      <Card className="hidden md:block overflow-hidden border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="pl-6">Code</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead className="hidden sm:table-cell">Min. Order</TableHead>
                    <TableHead className="hidden md:table-cell">Expiry</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right pr-6">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCoupons.length === 0 ? (
                    <TableRow>
                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No coupons found.</TableCell>
                    </TableRow>
                  ) : (
                      filteredCoupons.map((coupon) => {
                        const expired = isExpired(coupon.expiryDate);
                        return (
                            <TableRow key={coupon.id} className="hover:bg-muted/20 transition-colors">
                            <TableCell className="pl-6">
                                <div className="font-mono font-bold text-primary bg-primary/10 px-2 py-1 rounded inline-block border border-primary/20">
                                    {coupon.code}
                                </div>
                            </TableCell>
                            <TableCell className="font-medium">
                                {coupon.discountType === 'percentage' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                            </TableCell>
                            <TableCell className="hidden sm:table-cell">{formatPrice(coupon.minOrder)}</TableCell>
                            <TableCell className="hidden md:table-cell text-muted-foreground">
                                {/* ★★★ FIX: DD/MM/YYYY ফরম্যাট ★★★ */}
                                {new Date(coupon.expiryDate).toLocaleDateString('en-GB')}
                            </TableCell>
                            <TableCell>
                                <Badge variant={coupon.isActive && !expired ? "default" : "secondary"} className={coupon.isActive && !expired ? "bg-green-100 text-green-700 hover:bg-green-100 border-green-200" : ""}>
                                    {expired ? 'Expired' : (coupon.isActive ? 'Active' : 'Inactive')}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                                <div className="flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-blue-600" onClick={() => handleOpenDialog(coupon)}><Pencil className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-red-600" onClick={() => handleDelete(coupon.id)}><Trash2 className="h-4 w-4"/></Button>
                                </div>
                            </TableCell>
                            </TableRow>
                        )
                      })
                  )}
                </TableBody>
              </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-5 py-4">
                <FloatingInput label="Coupon Code" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} />
                <FloatingInput label="Description (Optional)" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />

                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-1">
                        <Label className="text-xs text-muted-foreground ml-1">Discount Type</Label>
                        <Select value={formData.discountType} onValueChange={(val: any) => setFormData({...formData, discountType: val})}>
                            <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="percentage">Percentage (%)</SelectItem>
                                <SelectItem value="flat">Flat Amount (₹)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <FloatingInput label="Value" type="number" value={formData.value} onChange={(e) => setFormData({...formData, value: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FloatingInput label="Min. Order (₹)" type="number" value={formData.minOrder} onChange={(e) => setFormData({...formData, minOrder: e.target.value})} />
                    <FloatingInput label="Usage Limit" type="number" value={formData.usageLimit} onChange={(e) => setFormData({...formData, usageLimit: e.target.value})} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <FloatingInput label="Start Date" type="date" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} />
                    <FloatingInput label="Expiry Date" type="date" value={formData.expiryDate} onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} />
                </div>
                
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                    <Label>Status (Active/Inactive)</Label>
                    <Switch checked={formData.isActive} onCheckedChange={(c) => setFormData({...formData, isActive: c})} />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>{editingCoupon ? 'Update Coupon' : 'Create Coupon'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}