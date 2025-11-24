// src/app/admin/users/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { RefreshCcw, Loader2, Mail, Phone, Users, Search, ShoppingBag, IndianRupee } from "lucide-react";
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  lastOrder: string | null;
  totalSpent: number;
  orderCount: number;
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.users);
        setFilteredUsers(data.users);
      }
    } catch (error) {
      toast.error("Error fetching users");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchUsers(); }, []);

  useEffect(() => {
    if (!searchQuery) {
        setFilteredUsers(users);
    } else {
        const lowerQ = searchQuery.toLowerCase();
        setFilteredUsers(users.filter(u => 
            u.name.toLowerCase().includes(lowerQ) || 
            u.email.toLowerCase().includes(lowerQ) ||
            u.phone.includes(lowerQ)
        ));
    }
  }, [searchQuery, users]);

  const getInitials = (name: string) => name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : 'U';

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" /> Customers
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Registered Users: {users.length}</p>
        </div>
        <div className="flex w-full sm:w-auto gap-3">
            <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                    placeholder="Search customers..." 
                    className="pl-9 bg-background" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>
            <Button size="icon" variant="outline" onClick={fetchUsers} title="Refresh">
                <RefreshCcw className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* Mobile View: Cards */}
      <div className="grid grid-cols-1 md:hidden gap-4">
          {filteredUsers.map(user => (
              <Card key={user.id} className="border shadow-sm">
                  <div className="p-4 space-y-4">
                      <div className="flex items-center gap-3">
                          <Avatar className="h-12 w-12 border shadow-sm">
                              <AvatarImage src="" />
                              <AvatarFallback className="bg-primary/10 text-primary font-bold">{getInitials(user.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                              <p className="font-bold text-foreground">{user.name}</p>
                              <Badge variant={user.role === 'admin' ? 'default' : 'secondary'} className="text-[10px] px-1.5 h-5 mt-1">
                                  {user.role}
                              </Badge>
                          </div>
                      </div>
                      
                      <div className="space-y-1.5 text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                          <div className="flex items-center gap-2">
                              <Mail className="h-3.5 w-3.5 text-primary/60" /> {user.email}
                          </div>
                          {user.phone && user.phone !== 'N/A' && (
                              <div className="flex items-center gap-2">
                                  <Phone className="h-3.5 w-3.5 text-primary/60" /> {user.phone}
                              </div>
                          )}
                      </div>

                      <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                          <div className="text-center">
                              <p className="text-xs text-muted-foreground flex justify-center items-center gap-1"><ShoppingBag className="h-3 w-3"/> Orders</p>
                              <p className="font-bold text-lg">{user.orderCount}</p>
                          </div>
                          <div className="text-center border-l">
                              <p className="text-xs text-muted-foreground flex justify-center items-center gap-1"><IndianRupee className="h-3 w-3"/> Spent</p>
                              <p className="font-bold text-lg text-green-600">{formatPrice(user.totalSpent)}</p>
                          </div>
                      </div>
                  </div>
              </Card>
          ))}
      </div>

      {/* Desktop View: Table */}
      <Card className="hidden md:block overflow-hidden border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
                <TableHeader className="bg-muted/50">
                <TableRow>
                    <TableHead className="pl-6">Customer</TableHead>
                    <TableHead>Contact Info</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Last Active</TableHead>
                    <TableHead className="text-center">Orders</TableHead>
                    <TableHead className="text-right pr-6">Total Spent</TableHead>
                </TableRow>
                </TableHeader>
                <TableBody>
                {filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-muted/20">
                        <TableCell className="pl-6 py-3">
                            <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border shadow-sm">
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-primary/10 text-primary font-bold text-xs">{getInitials(user.name)}</AvatarFallback>
                            </Avatar>
                            <div className="font-medium text-sm">{user.name}</div>
                            </div>
                        </TableCell>
                        <TableCell>
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3 text-primary/60" /> {user.email}
                                </div>
                                {user.phone && user.phone !== 'N/A' && (
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <Phone className="h-3 w-3 text-primary/60" /> {user.phone}
                                    </div>
                                )}
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge variant={user.role === 'admin' ? 'default' : 'outline'} className="text-xs font-normal">
                                {user.role}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                            {user.lastOrder ? new Date(user.lastOrder).toLocaleDateString() : 'Never'}
                        </TableCell>
                        <TableCell className="text-center text-sm font-medium">{user.orderCount}</TableCell>
                        <TableCell className="text-right pr-6 font-bold text-sm text-green-600">{formatPrice(user.totalSpent)}</TableCell>
                    </TableRow>
                ))}
                </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}