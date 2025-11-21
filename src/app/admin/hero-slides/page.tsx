// src/app/admin/hero-slides/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Trash2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import Image from 'next/image';

type Slide = {
  id: string;
  imageUrl: string;
  clickUrl: string;
  order: number;
};

export default function AdminHeroSlidesPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    imageUrl: '',
    clickUrl: '#',
    order: '0'
  });

  const fetchSlides = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/hero-slides');
      const data = await res.json();
      if (data.success) setSlides(data.slides);
    } catch (error) {
      toast.error('Failed to fetch slides');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchSlides(); }, []);

  const handleOpenDialog = () => {
    setFormData({ imageUrl: '', clickUrl: '#', order: '0' });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch('/api/admin/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      const data = await res.json();
      
      if (res.ok) {
        toast.success('Slide added successfully!');
        setIsDialogOpen(false);
        fetchSlides();
      } else {
        toast.error(data.error || 'Failed to add slide');
      }
    } catch (e) {
      toast.error('Error saving slide');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide? It will be removed from Cloudinary too.')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/admin/hero-slides/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success('Slide deleted');
            fetchSlides();
        } else {
            toast.error('Delete failed');
        }
    } catch (e) { toast.error('Delete failed'); }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-3xl font-bold font-headline">Hero Slides</h1>
            <p className="text-muted-foreground">Manage homepage banner slides.</p>
        </div>
        <Button onClick={handleOpenDialog} className="gap-2"><Plus className="h-4 w-4"/> Add Slide</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Click URL</TableHead>
                <TableHead>Order</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {slides.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No slides found.</TableCell>
                </TableRow>
              ) : (
                  slides.map((slide) => (
                    <TableRow key={slide.id}>
                      <TableCell>
                        <div className="relative h-16 w-32 rounded overflow-hidden border bg-muted">
                             {slide.imageUrl ? (
                                <Image src={slide.imageUrl} alt="Slide" fill className="object-cover" />
                             ) : (
                                <div className="flex items-center justify-center h-full w-full"><ImageIcon className="h-6 w-6 text-muted-foreground"/></div>
                             )}
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm text-blue-600 truncate max-w-[200px]">{slide.clickUrl}</TableCell>
                      <TableCell>{slide.order}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(slide.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add Slide Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add New Hero Slide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Image URL</Label>
                    <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://res.cloudinary.com/..." />
                    <p className="text-xs text-muted-foreground">Enter the direct URL of the image.</p>
                </div>
                
                <div className="space-y-2">
                    <Label>Click URL (Where it links to)</Label>
                    <Input value={formData.clickUrl} onChange={(e) => setFormData({...formData, clickUrl: e.target.value})} placeholder="/menus or https://..." />
                </div>

                <div className="space-y-2">
                    <Label>Order Priority (Lower comes first)</Label>
                    <Input type="number" value={formData.order} onChange={(e) => setFormData({...formData, order: e.target.value})} placeholder="0" />
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>Add Slide</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}