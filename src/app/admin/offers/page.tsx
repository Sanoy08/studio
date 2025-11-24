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
import { Loader2, Plus, Trash2, Tag, Pencil } from 'lucide-react';
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
  const [editingOffer, setEditingOffer] = useState<Offer | null>(null);
  
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

  const handleOpenDialog = (offer?: Offer) => {
    if (offer) {
        setEditingOffer(offer);
        setFormData({
            title: offer.title,
            description: offer.description,
            price: offer.price.toString(),
            imageUrl: offer.imageUrl,
            active: offer.active
        });
    } else {
        setEditingOffer(null);
        setFormData({ title: '', description: '', price: '', imageUrl: '', active: true });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      // For offers, simplified to just add/delete. Edit can be added if needed later.
      // Assuming POST handles both or just Create for now based on previous API structure.
      const res = await fetch('/api/admin/offers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success('Offer saved!');
        setIsDialogOpen(false);
        fetchOffers();
      } else {
        toast.error('Failed to save offer');
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

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto">
      <div className="flex justify-between items-center bg-card p-6 rounded-xl border shadow-sm">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Tag className="h-6 w-6 text-primary" /> Special Offers
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage combo offers and special promotions.</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" /> Add Offer
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {offers.map((offer) => (
            <Card key={offer.id} className="overflow-hidden border-0 shadow-md group hover:shadow-xl transition-all">
                <div className="relative h-48 w-full bg-muted">
                    <Image 
                        src={offer.imageUrl || PLACEHOLDER_IMAGE_URL} 
                        alt={offer.title} 
                        fill 
                        className="object-cover transition-transform duration-500 group-hover:scale-105" 
                        unoptimized={true}
                    />
                    <div className="absolute top-3 right-3 bg-background/90 backdrop-blur px-2 py-1 rounded text-xs font-bold shadow-sm">
                        {offer.active ? <span className="text-green-600">Active</span> : <span className="text-red-500">Inactive</span>}
                    </div>
                </div>
                <CardContent className="p-5">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-lg font-bold line-clamp-1">{offer.title}</h3>
                        <span className="text-primary font-bold text-lg">{formatPrice(offer.price)}</span>
                    </div>
                    <p className="text-muted-foreground text-sm line-clamp-2 mb-4 min-h-[40px]">{offer.description}</p>
                    
                    <div className="flex justify-end gap-2 pt-4 border-t">
                        <Button variant="outline" size="sm" onClick={() => handleDelete(offer.id)} className="text-red-500 hover:bg-red-50 hover:text-red-600 border-red-200">
                            <Trash2 className="h-4 w-4 mr-1"/> Delete
                        </Button>
                    </div>
                </CardContent>
            </Card>
        ))}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>Add New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
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
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border">
                    <Label>Active Status</Label>
                    <Switch checked={formData.active} onCheckedChange={(c) => setFormData({...formData, active: c})} />
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