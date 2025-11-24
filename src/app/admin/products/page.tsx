// src/app/admin/products/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Loader2, Plus, Pencil, Trash2, Search, Package, MoreVertical } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // কার্ড ক্লিক ইভেন্ট যাতে ফায়ার না হয়
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
      
      {/* হেডার সেকশন */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-6 rounded-xl border shadow-sm sticky top-0 z-20">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <Package className="h-6 w-6 text-primary" /> Menu Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Manage your food items.</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
            <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search dishes..." 
                    className="pl-9 bg-background" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Dish
            </Button>
        </div>
      </div>

      {/* প্রোডাক্ট গ্রিড (কার্ড ভিউ - মেনু পেজের মতো) */}
      {filteredProducts.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
              <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No products found.</p>
          </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredProducts.map((product) => (
            <Card 
                key={product.id} 
                className="group overflow-hidden border shadow-sm hover:shadow-lg transition-all cursor-pointer relative"
                onClick={() => handleOpenDialog(product)} // পুরো কার্ডে ক্লিক করলে এডিট খুলবে
            >
              {/* প্রোডাক্ট ইমেজ */}
              <div className="aspect-square relative overflow-hidden bg-muted">
                 {/* স্ট্যাটাস ব্যাজ (ইমেজের ওপর) */}
                 <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
                    {product.stock <= 0 && (
                        <Badge variant="destructive" className="text-[10px] font-bold shadow-sm">
                            OUT OF STOCK
                        </Badge>
                    )}
                    {product.featured && (
                        <Badge variant="secondary" className="text-[10px] font-bold bg-yellow-400 text-yellow-900 shadow-sm">
                            BESTSELLER
                        </Badge>
                    )}
                 </div>

                 {/* অ্যাকশন মেনু (ইমেজের ওপর ডানদিকে) */}
                 <div className="absolute top-2 right-2 z-10" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="secondary" size="icon" className="h-8 w-8 rounded-full opacity-80 hover:opacity-100 shadow-sm">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleOpenDialog(product)}>
                                <Pencil className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={(e) => handleDelete(product.id, e)}>
                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                 </div>

                 <Image 
                    src={product.images[0]?.url || PLACEHOLDER_IMAGE_URL} 
                    alt={product.name} 
                    fill 
                    className="object-cover transition-transform duration-500 group-hover:scale-110" 
                    unoptimized={true}
                 />
              </div>

              {/* প্রোডাক্ট ইনফো */}
              <CardContent className="p-3 space-y-1.5">
                 <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-sm line-clamp-2 leading-tight text-foreground group-hover:text-primary transition-colors">
                        {product.name}
                    </h3>
                 </div>
                 <p className="text-xs text-muted-foreground font-medium">{product.category.name}</p>
                 <div className="flex items-center justify-between pt-1">
                    <p className="font-bold text-primary">{formatPrice(product.price)}</p>
                    <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-muted-foreground/30">
                        Click to Edit
                    </Badge>
                 </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* এডিট/অ্যাড ডায়ালগ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0 gap-0">
            <DialogHeader className="p-6 border-b bg-muted/20">
                <DialogTitle className="text-xl">{editingProduct ? 'Edit Product' : 'Add New Dish'}</DialogTitle>
            </DialogHeader>
            <div className="p-6 space-y-6">
                
                <div className="space-y-3">
                    <Label className="text-base font-medium">Dish Images</Label>
                    <ImageUpload 
                        value={formData.images.map(img => img.url)}
                        onChange={(urls) => setFormData({ ...formData, images: urls.map((u, i) => ({ id: `new-${i}`, url: u })) })}
                        maxFiles={4}
                        folder="dish"
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label>Dish Name</Label>
                        <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Chicken Biryani" />
                    </div>
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} placeholder="e.g. Main Course" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                        <Input type="number" className="pl-7" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} placeholder="0.00" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        placeholder="Describe the dish..." 
                        className="min-h-[100px]"
                    />
                </div>

                <div className="flex flex-col sm:flex-row gap-6 p-4 bg-muted/30 rounded-lg border">
                    <div className="flex items-center justify-between flex-1">
                        <div className="space-y-0.5">
                            <Label>Available in Stock</Label>
                            <p className="text-xs text-muted-foreground">Turn off if sold out</p>
                        </div>
                        <Switch checked={formData.inStock} onCheckedChange={(c) => setFormData({...formData, inStock: c})} />
                    </div>
                    <div className="h-px sm:h-auto sm:w-px bg-border"></div>
                    <div className="flex items-center justify-between flex-1">
                        <div className="space-y-0.5">
                            <Label>Mark as Bestseller</Label>
                            <p className="text-xs text-muted-foreground">Show on homepage</p>
                        </div>
                        <Switch checked={formData.featured} onCheckedChange={(c) => setFormData({...formData, featured: c})} />
                    </div>
                </div>
            </div>
            <DialogFooter className="p-6 border-t bg-muted/20">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="gap-2">{editingProduct ? 'Update Dish' : 'Save Dish'}</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}