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
import { MoreVertical, Plus, MapPin, Loader2, Trash2 } from "lucide-react";
import { toast } from 'sonner';

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
    const [formData, setFormData] = useState({ name: '', address: '', isDefault: false });
    const [isSaving, setIsSaving] = useState(false);

    // ১. অ্যাড্রেস লোড করা
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

    // ২. নতুন অ্যাড্রেস সেভ করা
    const handleSave = async () => {
        if (!formData.name || !formData.address) {
            toast.error("Name and Address are required");
            return;
        }

        setIsSaving(true);
        const token = localStorage.getItem('token');

        try {
            const res = await fetch('/api/user/addresses', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });
            
            if (res.ok) {
                toast.success("Address added successfully!");
                setFormData({ name: '', address: '', isDefault: false });
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

    // ৩. অ্যাড্রেস ডিলিট করা
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

    if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MapPin className="h-5 w-5" /> My Addresses
                    </CardTitle>
                    <CardDescription>Manage your saved addresses for faster checkout.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    {addresses.length === 0 ? (
                        <p className="text-center py-8 text-muted-foreground">No addresses saved yet.</p>
                    ) : (
                        addresses.map(addr => (
                            <div key={addr.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex justify-between items-start hover:bg-muted/20 transition-colors">
                                <div>
                                    <p className="font-semibold flex items-center gap-2">
                                        {addr.name} 
                                        {addr.isDefault && <span className="text-[10px] bg-primary/10 text-primary border border-primary/20 rounded-full px-2 py-0.5 font-bold">Default</span>}
                                    </p>
                                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{addr.address}</p>
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleDelete(addr.id)} className="text-red-600 focus:text-red-600">
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        ))
                    )}
                </CardContent>
                <CardFooter className="border-t pt-6">
                    <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                        <Plus className="h-4 w-4 mr-2" /> Add New Address
                    </Button>
                </CardFooter>
            </Card>

            {/* Add Address Modal */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Address</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <Label>Label (e.g. Home, Work)</Label>
                            <Input 
                                value={formData.name} 
                                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                                placeholder="Home" 
                            />
                        </div>
                        <div className="space-y-2">
                            <Label>Full Address</Label>
                            <Textarea 
                                value={formData.address} 
                                onChange={(e) => setFormData({...formData, address: e.target.value})} 
                                placeholder="Street, City, Pincode..." 
                            />
                        </div>
                        <div className="flex items-center justify-between border p-3 rounded-lg">
                            <Label>Set as default address</Label>
                            <Switch 
                                checked={formData.isDefault} 
                                onCheckedChange={(c) => setFormData({...formData, isDefault: c})} 
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                            Save Address
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}