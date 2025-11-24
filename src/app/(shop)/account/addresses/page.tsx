// src/app/(shop)/account/addresses/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { MoreVertical, Plus, MapPin, Loader2, Trash2, Pencil, Home, Briefcase } from "lucide-react";
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';

type Address = {
    id: string;
    name: string;
    address: string;
    isDefault: boolean;
};

export default function AccountAddressesPage() {
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({ name: '', address: '', isDefault: false });
    const [isSaving, setIsSaving] = useState(false);

    const fetchAddresses = async () => {
        const token = localStorage.getItem('token');
        if(!token) return;

        try {
            const res = await fetch('/api/user/addresses', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            if (data.success) {
                setAddresses(data.addresses);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAddresses();
    }, []);

    const handleOpenDialog = (address?: Address) => {
        if (address) {
            setEditingId(address.id);
            setFormData({
                name: address.name,
                address: address.address,
                isDefault: address.isDefault
            });
        } else {
            setEditingId(null);
            setFormData({ name: '', address: '', isDefault: false });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.address) {
            toast.error("Name and Address are required");
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const method = editingId ? 'PUT' : 'POST';
            const body = editingId ? { ...formData, id: editingId } : formData;

            const res = await fetch('/api/user/addresses', {
                method: method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(body)
            });
            
            if (res.ok) {
                toast.success(editingId ? "Address updated successfully!" : "Address added successfully!");
                setIsDialogOpen(false);
                fetchAddresses();
            } else {
                toast.error("Failed to save address");
            }
        } catch (error) {
            toast.error("Error saving address");
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this address?")) return;
        const token = localStorage.getItem('token');

        try {
            const res = await fetch(`/api/user/addresses?id=${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                toast.success("Address deleted");
                fetchAddresses();
            }
        } catch (error) {
            toast.error("Failed to delete");
        }
    };

    const getIcon = (name: string) => {
        const n = name.toLowerCase();
        if (n.includes('home')) return <Home className="h-5 w-5" />;
        if (n.includes('work') || n.includes('office')) return <Briefcase className="h-5 w-5" />;
        return <MapPin className="h-5 w-5" />;
    };

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <Card className="border-none shadow-none sm:border sm:shadow-sm">
                <CardHeader className="px-0 sm:px-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <MapPin className="h-5 w-5 text-primary" /> My Addresses
                            </CardTitle>
                            <CardDescription className="mt-1">Manage your delivery locations.</CardDescription>
                        </div>
                        <Button onClick={() => handleOpenDialog()} size="sm" className="hidden sm:flex">
                            <Plus className="h-4 w-4 mr-2" /> Add New
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="px-0 sm:px-6 space-y-4">
                    {addresses.length === 0 ? (
                        <div className="text-center py-12 bg-muted/20 rounded-xl border border-dashed">
                            <MapPin className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                            <p className="text-muted-foreground">No saved addresses found.</p>
                            <Button onClick={() => handleOpenDialog()} variant="link" className="mt-2">
                                Add your first address
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {addresses.map(addr => (
                                <div 
                                    key={addr.id} 
                                    // ★★★ FIX: 'rounded-md' ব্যবহার করা হয়েছে স্কয়ার লুকের জন্য ★★★
                                    className="group relative bg-card border rounded-md p-4 shadow-sm hover:shadow-md transition-all hover:border-primary/30"
                                >
                                    <div className="flex justify-between items-start gap-4">
                                        {/* min-w-0 ফ্লেক্স কন্টেইনারে টেক্সট র‍্যাপ করার জন্য জরুরি */}
                                        <div className="flex gap-4 flex-1 min-w-0">
                                            <div className="h-10 w-10 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                                                {getIcon(addr.name)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                                    <h3 className="font-semibold text-foreground truncate">{addr.name}</h3>
                                                    {addr.isDefault && (
                                                        <Badge variant="secondary" className="text-[10px] bg-green-100 text-green-700 hover:bg-green-100 border-green-200 h-5 px-1.5 shrink-0">
                                                            Default
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                {/* ★★★ FIX: 'break-words' এবং 'whitespace-pre-line' ব্যবহার করা হয়েছে যাতে লেখা ব্রেস করে নিচে নামে কিন্তু বক্সের বাইরে না যায় ★★★ */}
                                                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line break-words">
                                                    {addr.address}
                                                </p>
                                            </div>
                                        </div>
                                        
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 hover:bg-muted rounded-md">
                                                    <MoreVertical className="h-4 w-4 text-muted-foreground" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleOpenDialog(addr)}>
                                                    <Pencil className="mr-2 h-4 w-4" /> Edit
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleDelete(addr.id)} className="text-red-600 focus:text-red-600 focus:bg-red-50">
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
                
                {/* Mobile Only Add Button */}
                <div className="fixed bottom-6 right-6 sm:hidden z-40">
                    <Button 
                        onClick={() => handleOpenDialog()} 
                        size="icon" 
                        className="h-14 w-14 rounded-full shadow-xl shadow-primary/30 bg-primary hover:bg-primary/90"
                    >
                        <Plus className="h-6 w-6" />
                    </Button>
                </div>
            </Card>

            {/* Add/Edit Address Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden">
                    <DialogHeader className="p-6 border-b bg-muted/10">
                        <DialogTitle>{editingId ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                    </DialogHeader>
                    <div className="p-6 space-y-5">
                        <div className="space-y-2">
                            <Label>Label</Label>
                            <Input 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="e.g. Home, Office, Mom's Place" 
                                className="h-11"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Address Details</Label>
                            <Textarea 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                placeholder="House No, Street, Area, City, Pincode..." 
                                className="min-h-[100px] resize-none"
                            />
                        </div>
                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-lg border">
                            <div className="space-y-0.5">
                                <Label className="text-base">Set as Default</Label>
                                <p className="text-xs text-muted-foreground">Use this address automatically for checkout.</p>
                            </div>
                            <Switch 
                                checked={formData.isDefault} 
                                onCheckedChange={(c) => setFormData({...formData, isDefault: c})} 
                            />
                        </div>
                    </div>
                    <DialogFooter className="p-6 border-t bg-muted/10">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                            {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
                            {editingId ? 'Update Address' : 'Save Address'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}