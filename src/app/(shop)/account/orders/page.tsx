// src/app/(shop)/account/orders/page.tsx

'use client';

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// অর্ডারের টাইপ ডেফিনিশন
type Order = {
  _id: string;
  OrderNumber: string;
  Timestamp: string;
  Status: string;
  FinalPrice: number;
  Items: any[];
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const res = await fetch('/api/orders/user', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
          setOrders(data.orders);
        } else {
          // টোকেন এক্সপায়ার হলে বা অন্য এরর হলে
          console.error("Failed to load orders:", data.error);
        }
      } catch (error) {
        console.error(error);
        toast.error("Could not load order history.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Check the status of recent orders.</CardDescription>
      </CardHeader>
      <CardContent>
        {orders.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Order No</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Items</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order._id}>
                    <TableCell className="font-medium">{order.OrderNumber}</TableCell>
                    <TableCell>{new Date(order.Timestamp).toLocaleDateString()}</TableCell>
                    <TableCell>{order.Items?.length || 0} items</TableCell>
                    <TableCell>
                      <Badge variant={order.Status === 'Received' ? 'default' : 'secondary'}>
                        {order.Status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.FinalPrice)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}