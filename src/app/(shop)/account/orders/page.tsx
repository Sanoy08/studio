// src/app/(shop)/account/orders/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { formatPrice } from '@/lib/utils';
import { Loader2, Package, Calendar, MapPin, ChevronRight, Clock, Utensils, ShoppingBag, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { Separator } from '@/components/ui/separator';

type Order = {
    _id: string;
    OrderNumber: string;
    Timestamp: string;
    Status: string;
    FinalPrice: number;
    Subtotal: number;
    Discount: number;
    Items: any[];
    OrderType: string;
    Address: string;
    DeliveryAddress?: string;
    MealTime: string;
    PreferredDate: string;
};

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // অর্ডার ফেচিং (আপনার পুরনো লজিক অনুযায়ী)
  useEffect(() => {
    const fetchOrders = async () => {
        const token = localStorage.getItem('token');
        // টোকেন না থাকলে লোডিং বন্ধ করে দিন (অথবা লগইনে রিডাইরেক্ট করতে পারেন)
        if (!token) {
            setIsLoading(false);
            return;
        }

        try {
            // ★ নিশ্চিত করুন API পাথ ঠিক আছে
            const res = await fetch('/api/user/orders', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (data.success) {
                setOrders(data.orders);
            } else {
                console.error("Failed:", data.error);
                // toast.error("Failed to load orders"); 
            }
        } catch (e) {
            console.error(e);
            toast.error("Could not load order history.");
        } finally {
            setIsLoading(false);
        }
    };

    fetchOrders();
  }, []);

  // স্ট্যাটাস কালার হেল্পার
  const getStatusColor = (status: string) => {
      const s = status?.toLowerCase() || '';
      if (s === 'delivered') return 'bg-green-100 text-green-700 border-green-200';
      if (s === 'cancelled') return 'bg-red-100 text-red-700 border-red-200';
      if (s === 'cooking' || s === 'processing') return 'bg-orange-100 text-orange-700 border-orange-200';
      if (s === 'out for delivery') return 'bg-blue-100 text-blue-700 border-blue-200';
      return 'bg-gray-100 text-gray-700 border-gray-200';
  };

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;

  // Stats
  const totalOrders = orders.length;
  const completedOrders = orders.filter(o => o.Status === 'Delivered').length;

  return (
    <div className="space-y-8 max-w-3xl mx-auto pb-20">
      
      {/* --- 1. Stats Header --- */}
      <div className="grid grid-cols-2 gap-4">
          <Card className="border-none shadow-md bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                      <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900">{totalOrders}</h3>
                      <p className="text-sm text-muted-foreground font-medium">Total Orders</p>
                  </div>
              </CardContent>
          </Card>
          <Card className="border-none shadow-md bg-white">
              <CardContent className="p-6 flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                      <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <div>
                      <h3 className="text-2xl font-bold text-gray-900">{completedOrders}</h3>
                      <p className="text-sm text-muted-foreground font-medium">Completed</p>
                  </div>
              </CardContent>
          </Card>
      </div>

      {/* --- 2. Orders List --- */}
      <div className="space-y-4">
          <h2 className="text-xl font-bold pl-1">Recent Orders</h2>
          
          {orders.length === 0 ? (
              <div className="text-center py-16 bg-muted/20 rounded-2xl border border-dashed">
                  <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700">No orders yet</h3>
                  <p className="text-sm text-muted-foreground mt-1">Place your first order to see it here!</p>
              </div>
          ) : (
              orders.map((order) => (
                  <div 
                    key={order._id}
                    onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                    className="group bg-white rounded-2xl p-5 shadow-sm border border-gray-100 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden"
                  >
                      {/* Hover Indicator */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>

                      <div className="flex flex-col md:flex-row justify-between gap-4">
                          
                          {/* Left Info */}
                          <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                  <span className="font-mono font-bold text-lg text-gray-800">#{order.OrderNumber}</span>
                                  {/* Badge fix: className দিয়ে স্টাইল ওভাররাইড */}
                                  <Badge variant="outline" className={`${getStatusColor(order.Status)} border-none px-2.5 py-0.5 rounded-md`}>
                                      {order.Status}
                                  </Badge>
                              </div>
                              
                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1.5">
                                      <Calendar className="h-4 w-4" />
                                      {new Date(order.Timestamp).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                                  </div>
                                  <div className="flex items-center gap-1.5">
                                      <Utensils className="h-4 w-4" />
                                      {Array.isArray(order.Items) ? order.Items.reduce((acc: number, item: any) => acc + item.quantity, 0) : 0} Items
                                  </div>
                              </div>
                          </div>

                          {/* Right Price & Arrow */}
                          <div className="flex items-center justify-between md:justify-end gap-6 mt-2 md:mt-0">
                              <div className="text-right">
                                  <p className="text-sm text-muted-foreground mb-0.5">Total Amount</p>
                                  <p className="text-xl font-bold text-primary">{formatPrice(order.FinalPrice)}</p>
                              </div>
                              <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-primary transition-colors" />
                          </div>
                      </div>
                  </div>
              ))
          )}
      </div>

      {/* --- 3. Order Details Modal --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto p-0 gap-0 rounded-2xl">
            {selectedOrder && (
                <>
                    <DialogHeader className="p-6 border-b sticky top-0 bg-white z-10">
                        <DialogTitle className="flex items-center justify-between">
                            <span className="text-xl font-bold">Order Details</span>
                            <Badge variant="outline" className={`${getStatusColor(selectedOrder.Status)} px-3 py-1`}>
                                {selectedOrder.Status}
                            </Badge>
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-1 font-mono">#{selectedOrder.OrderNumber}</p>
                    </DialogHeader>

                    <div className="p-6 space-y-6">
                        
                        {/* Items List */}
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Items Ordered</h4>
                            <div className="space-y-3">
                                {Array.isArray(selectedOrder.Items) && selectedOrder.Items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex justify-between items-start pb-3 border-b border-dashed last:border-0 last:pb-0">
                                        <div className="flex gap-3">
                                            <div className="h-6 w-6 bg-primary/10 rounded-md flex items-center justify-center text-xs font-bold text-primary shrink-0">
                                                {item.quantity}x
                                            </div>
                                            <p className="text-sm font-medium text-gray-800">{item.name}</p>
                                        </div>
                                        <p className="text-sm font-bold text-gray-600">{formatPrice(item.price * item.quantity)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Delivery Info */}
                        <div className="bg-gray-50 p-4 rounded-xl space-y-3 border">
                            <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Delivery Info</h4>
                            <div className="flex items-start gap-3">
                                <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Address</p>
                                    <p className="text-sm text-muted-foreground leading-snug">{selectedOrder.DeliveryAddress || selectedOrder.Address}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Clock className="h-5 w-5 text-primary shrink-0" />
                                <div>
                                    <p className="font-medium text-sm">Preferred Time</p>
                                    <p className="text-sm text-muted-foreground capitalize">
                                        {selectedOrder.PreferredDate ? new Date(selectedOrder.PreferredDate).toLocaleDateString() : 'N/A'} • {selectedOrder.MealTime || 'N/A'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Payment Summary */}
                        <div className="space-y-2 pt-2">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>Subtotal</span>
                                <span>{formatPrice(selectedOrder.Subtotal || selectedOrder.FinalPrice)}</span>
                            </div>
                            {selectedOrder.Discount > 0 && (
                                <div className="flex justify-between text-sm text-green-600 font-medium">
                                    <span>Discount</span>
                                    <span>- {formatPrice(selectedOrder.Discount)}</span>
                                </div>
                            )}
                            <Separator className="my-2" />
                            <div className="flex justify-between text-lg font-bold text-foreground">
                                <span>Grand Total</span>
                                <span>{formatPrice(selectedOrder.FinalPrice)}</span>
                            </div>
                        </div>

                        {/* Invoice Button (Optional) */}
                        <Button className="w-full mt-4" onClick={() => toast.info("Invoice download coming soon!")}>
                            Download Invoice
                        </Button>

                    </div>
                </>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}