// src/app/admin/products/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Loader2, Plus, Pencil, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';

type Product = {
  id: string;
  name: string;
  category: { name: string };
  price: number;
  stock: number;
  images: { url: string }[];
  description?: string;
  featured?: boolean;
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form States
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    imageUrl: '',
    inStock: true,
    featured: false,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) setProducts(data.products);
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category.name,
        price: product.price.toString(),
        description: product.description || '',
        imageUrl: product.images[0]?.url || '',
        inStock: product.stock > 0,
        featured: product.featured || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: '', description: '', imageUrl: '', inStock: true, featured: false });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      
      if (res.ok) {
        toast.success(editingProduct ? 'Product updated!' : 'Product created!');
        setIsDialogOpen(false);
        fetchProducts();
      } else {
        toast.error('Operation failed');
      }
    } catch (e) {
      toast.error('Error saving product');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    const token = localStorage.getItem('token');
    try {
        const res = await fetch(`/api/admin/products/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            toast.success('Product deleted');
            fetchProducts();
        }
    } catch (e) { toast.error('Delete failed'); }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-headline">Products</h1>
        <Button onClick={() => handleOpenDialog()} className="gap-2"><Plus className="h-4 w-4"/> Add Product</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <div className="relative h-12 w-12 rounded overflow-hidden">
                         <Image src={product.images[0]?.url || PLACEHOLDER_IMAGE_URL} alt={product.name} fill className="object-cover" />
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>{product.category.name}</TableCell>
                  <TableCell>{formatPrice(product.price)}</TableCell>
                  <TableCell>{product.stock > 0 ? <span className="text-green-600 font-bold">In Stock</span> : <span className="text-red-500">Out of Stock</span>}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(product)}><Pencil className="h-4 w-4 text-blue-500"/></Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
            <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Chicken" />
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <Label>Price (₹)</Label>
                        <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                    </div>
                     <div className="space-y-2">
                        <Label>Image URL</Label>
                        <Input value={formData.imageUrl} onChange={(e) => setFormData({...formData, imageUrl: e.target.value})} placeholder="https://..." />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Switch checked={formData.inStock} onCheckedChange={(c) => setFormData({...formData, inStock: c})} />
                        <Label>In Stock</Label>
                    </div>
                     <div className="flex items-center gap-2">
                        <Switch checked={formData.featured} onCheckedChange={(c) => setFormData({...formData, featured: c})} />
                        <Label>Bestseller</Label>
                    </div>
                </div>
            </div>
            <DialogFooter>
                <Button onClick={handleSubmit}>{editingProduct ? 'Update' : 'Create'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}