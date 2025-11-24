// src/app/admin/products/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Search, Package, Filter } from 'lucide-react';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';
import Image from 'next/image';
import { PLACEHOLDER_IMAGE_URL } from '@/lib/constants';
import { ImageUpload } from '@/components/admin/ImageUpload';

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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    description: '',
    images: [] as { id: string; url: string }[],
    inStock: true,
    featured: false,
  });

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/products');
      const data = await res.json();
      if (data.success) {
        setProducts(data.products);
        setFilteredProducts(data.products);
      }
    } catch (error) {
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    if (!searchQuery) {
      setFilteredProducts(products);
    } else {
      const lowerQ = searchQuery.toLowerCase();
      setFilteredProducts(products.filter(p => 
        p.name.toLowerCase().includes(lowerQ) || 
        p.category.name.toLowerCase().includes(lowerQ)
      ));
    }
  }, [searchQuery, products]);

  const handleOpenDialog = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        category: product.category.name,
        price: product.price.toString(),
        description: product.description || '',
        images: product.images.map((img, i) => ({ id: `img-${i}`, url: img.url })),
        inStock: product.stock > 0,
        featured: product.featured || false,
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', category: '', price: '', description: '', images: [], inStock: true, featured: false });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    const method = editingProduct ? 'PUT' : 'POST';
    const url = editingProduct ? `/api/admin/products/${editingProduct.id}` : '/api/admin/products';

    const payload = {
        name: formData.name,
        description: formData.description,
        price: formData.price,
        category: formData.category,
        imageUrls: formData.images.map(img => img.url),
        featured: formData.featured,
        inStock: formData.inStock
    };

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payload),
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

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" /> Products
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your food menu catalog.</p>
        </div>
        <div className="flex flex-col sm:flex-row w-full lg:w-auto gap-3">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search products..." 
                    className="pl-9 bg-background" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-lg shadow-primary/20 w-full sm:w-auto">
                <Plus className="h-4 w-4" /> Add Product
            </Button>
        </div>
      </div>

      {/* Products List */}
      <div className="space-y-4">
        {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
                <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No products found matching your search.</p>
            </div>
        ) : (
            <>
              {/* Mobile View: Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
                  {filteredProducts.map(product => (
                      <Card key={product.id} className="overflow-hidden border shadow-sm">
                          <div className="flex p-3 gap-4">
                              <div className="relative h-24 w-24 rounded-lg overflow-hidden border bg-muted shrink-0">
                                  <Image src={product.images[0]?.url || PLACEHOLDER_IMAGE_URL} alt={product.name} fill className="object-cover" unoptimized={true} />
                              </div>
                              <div className="flex flex-col justify-between flex-1 min-w-0">
                                  <div>
                                      <div className="flex justify-between items-start">
                                          <h3 className="font-semibold text-base truncate pr-2">{product.name}</h3>
                                          <Badge variant={product.stock > 0 ? "outline" : "destructive"} className="text-[10px] px-1.5 h-5">
                                              {product.stock > 0 ? "In Stock" : "Out"}
                                          </Badge>
                                      </div>
                                      <p className="text-sm text-muted-foreground">{product.category.name}</p>
                                  </div>
                                  <div className="flex justify-between items-end mt-2">
                                      <span className="font-bold text-primary">{formatPrice(product.price)}</span>
                                      <div className="flex gap-2">
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 bg-blue-50 hover:bg-blue-100" onClick={() => handleOpenDialog(product)}>
                                              <Pencil className="h-4 w-4"/>
                                          </Button>
                                          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600 bg-red-50 hover:bg-red-100" onClick={() => handleDelete(product.id)}>
                                              <Trash2 className="h-4 w-4"/>
                                          </Button>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </Card>
                  ))}
              </div>

              {/* Desktop View: Table */}
              <div className="hidden lg:block bg-card rounded-xl border shadow-sm overflow-hidden">
                  <Table>
                    <TableHeader className="bg-muted/50">
                      <TableRow>
                        <TableHead className="w-[100px] pl-6">Image</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Price</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right pr-6">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredProducts.map((product) => (
                        <TableRow key={product.id} className="group hover:bg-muted/20">
                          <TableCell className="pl-6 py-3">
                              <div className="relative h-12 w-12 rounded-lg overflow-hidden border bg-muted">
                                  <Image src={product.images[0]?.url || PLACEHOLDER_IMAGE_URL} alt={product.name} fill className="object-cover" unoptimized={true} />
                              </div>
                          </TableCell>
                          <TableCell className="font-medium">
                              {product.name}
                              {product.featured && <Badge variant="secondary" className="ml-2 text-[10px] bg-amber-100 text-amber-800">Bestseller</Badge>}
                          </TableCell>
                          <TableCell>{product.category.name}</TableCell>
                          <TableCell className="font-bold text-foreground/80">{formatPrice(product.price)}</TableCell>
                          <TableCell>
                              <Badge variant={product.stock > 0 ? "outline" : "destructive"} className={product.stock > 0 ? "text-green-600 border-green-200 bg-green-50" : ""}>
                                  {product.stock > 0 ? "In Stock" : "Out of Stock"}
                              </Badge>
                          </TableCell>
                          <TableCell className="text-right pr-6">
                              <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenDialog(product)}><Pencil className="h-4 w-4 text-blue-500"/></Button>
                                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(product.id)}><Trash2 className="h-4 w-4 text-red-500"/></Button>
                              </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
              </div>
            </>
        )}
      </div>

      {/* Dialog (Same as before) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
                <div className="space-y-2">
                    <Label>Product Images (Max 4)</Label>
                    <ImageUpload 
                        value={formData.images.map(img => img.url)}
                        onChange={(urls) => setFormData({ ...formData, images: urls.map((u, i) => ({ id: `new-${i}`, url: u })) })}
                        maxFiles={4}
                        folder="dish"
                    />
                </div>
                {/* ... বাকি ফর্ম ফিল্ডগুলো একই থাকবে ... */}
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
                <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} />
                </div>
                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg">
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