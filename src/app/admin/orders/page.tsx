// src/app/admin/orders/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/use-auth';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPrice } from '@/lib/utils';

type Order = {
  _id: string;
  OrderNumber: string;
  Name: string;
  Phone: string;
  Timestamp: string;
  Status: string;
  FinalPrice: number;
  Items: any[];
  OrderType: string;
  Address: string;
};

const STATUS_OPTIONS = ['Received', 'Cooking', 'Ready', 'Out for Delivery', 'Delivered', 'Cancelled'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const fetchOrders = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/admin/orders', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      if (data.success) {
        setOrders(data.orders);
      } else {
        toast.error(data.error || "Failed to load orders.");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error loading orders.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/admin/orders', {
            method: 'PATCH',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ orderId, status: newStatus })
        });

        if (res.ok) {
            toast.success(`Order status updated to ${newStatus}`);
            // UI তে স্ট্যাটাস আপডেট করা (রিফ্রেশ না করে)
            setOrders(prev => prev.map(o => o._id === orderId ? { ...o, Status: newStatus } : o));
        } else {
            toast.error("Failed to update status");
        }
    } catch (error) {
        console.error(error);
        toast.error("Error updating status");
    }
  }

  if (isLoading) {
    return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Orders Management</h1>
            <p className="text-muted-foreground">
              Manage and track all customer orders.
            </p>
          </div>
          <Button size="sm" onClick={fetchOrders} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order No</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                  <TableRow key={order._id}>
                      <TableCell className="font-medium">{order.OrderNumber}</TableCell>
                      <TableCell>
                          <div className="font-medium">{order.Name}</div>
                          <div className="text-xs text-muted-foreground">{order.Phone}</div>
                      </TableCell>
                      <TableCell>{new Date(order.Timestamp).toLocaleDateString()}</TableCell>
                       <TableCell>
                        <Badge variant="outline">{order.OrderType}</Badge>
                      </TableCell>
                      <TableCell>{formatPrice(order.FinalPrice)}</TableCell>
                      <TableCell>
                        <Select 
                            defaultValue={order.Status} 
                            onValueChange={(val) => handleStatusChange(order._id, val)}
                        >
                            <SelectTrigger className="w-[140px] h-8">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {STATUS_OPTIONS.map(status => (
                                    <SelectItem key={status} value={status}>{status}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                      </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}