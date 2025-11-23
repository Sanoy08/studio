// src/app/admin/offers/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Trash2, Tag } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { ImageUpload } from '@/components/admin/ImageUpload';

type Offer = {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string;
  active: boolean;
};

export default function AdminOffersPage() {
  const [offers, setOffers] = useState<Offer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    imageUrl: '',
    active: true,
  });

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/offers');
      const data = await res.json();
      if (data.success) setOffers(data.offers);
    } catch (error) {
      toast.error('Failed to fetch offers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchOffers(); }, []);

  const handleOpenDialog = () => {
    setFormData({ title: '', description: '', price: '', imageUrl: '', active: true });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success('Offer created!');
        setIsDialogOpen(false);
        fetchOffers();
      } else {
        toast.error('Failed to create offer');
      }
    } catch (e) {
      toast.error('Error saving offer');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this offer?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/admin/offers/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success('Offer deleted');
            fetchOffers();
        }
    } catch (e) { toast.error('Delete failed'); }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">Offers</h1>
            <p className="text-muted-foreground">Manage special offers and promotions.</p>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2"><Plus className="h-4 w-4"/> Add Offer</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No offers found.</TableCell>
                </TableRow>
              ) : (
                  offers.map((offer) => (
                    <TableRow key={offer.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded overflow-hidden">
                             <Image src={offer.imageUrl || PLACEHOLDER_IMAGE_URL} alt={offer.title} fill className="object-cover" />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{offer.title}</TableCell>
                      <TableCell className="max-w-xs truncate">{offer.description}</TableCell>
                      <TableCell>{formatPrice(offer.price)}</TableCell>
                      <TableCell>{offer.active ? <span className="text-green-600">Active</span> : <span className="text-muted-foreground">Inactive</span>}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(offer.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                
                {/* DRAG & DROP UPLOAD */}
                <div className="space-y-2">
                    <Label>Offer Image</Label>
                    <ImageUpload 
                        value={formData.imageUrl ? [formData.imageUrl] : []}
                        onChange={(urls) => setFormData({...formData, imageUrl: urls[0] || ''})}
                        maxFiles={1}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Title</Label>
                    <Input value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} placeholder="e.g. Weekend Special" />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Offer details..." />
                </div>
                <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                    <Switch checked={formData.active} onCheckedChange={(c) => setFormData({...formData, active: c})} />
                    <Label>Active</Label>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Create Offer</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}