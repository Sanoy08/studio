// src/app/admin/page.tsx

'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ShoppingBag, 
  IndianRupee, 
  Clock, 
  Users, 
  Loader2, 
  TrendingUp 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    revenue: 0,
    todayRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    pendingOrders: 0
  });
  const [chartData, setChartData] = useState([]);
  const [topSellingData, setTopSellingData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const res = await fetch('/api/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (data.success) {
            setStats(data.stats);
            setChartData(data.chartData);
            setTopSellingData(data.topSellingItems);
        } else {
            toast.error("Failed to load dashboard data");
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
        <div className="flex flex-col items-center justify-center h-[60vh] text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-2" />
            <p>Loading Dashboard...</p>
        </div>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* 1. Stats Cards Section (Responsive Grid) */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        
        {/* Total Orders */}
        <Card className="border-l-4 border-l-blue-500 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Orders</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.totalOrders}</h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
              <ShoppingBag className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Today's Revenue */}
        <Card className="border-l-4 border-l-green-500 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Revenue</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-green-600">{formatPrice(stats.todayRevenue)}</h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-100 flex items-center justify-center text-green-600">
              <IndianRupee className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Pending Orders */}
        <Card className="border-l-4 border-l-orange-500 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Pending Orders</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1 text-orange-600">{stats.pendingOrders}</h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
              <Clock className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>

        {/* Total Customers */}
        <Card className="border-l-4 border-l-purple-500 shadow-sm">
          <CardContent className="p-4 sm:p-6 flex items-center justify-between">
            <div>
              <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Customers</p>
              <h3 className="text-xl sm:text-2xl font-bold mt-1">{stats.totalCustomers}</h3>
            </div>
            <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
              <Users className="h-5 w-5 sm:h-6 sm:w-6" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Charts Section (Responsive Height) */}
      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        
        {/* Sales Trend Chart */}
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <TrendingUp className="h-5 w-5 text-primary" /> 
                    Sales Trend Over Time
                </CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="month" fontSize={12} tickLine={false} axisLine={false} />
                        <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                        <Tooltip 
                            cursor={{fill: 'transparent'}}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <Bar dataKey="sales" fill="#84cc16" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        {/* Top Selling Items Chart */}
        <Card className="shadow-sm">
            <CardHeader>
                <CardTitle className="text-base sm:text-lg">Top 5 Selling Items</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px] sm:h-[350px]">
                {topSellingData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={topSellingData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                fill="#8884d8"
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {topSellingData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend 
                                verticalAlign="bottom" 
                                height={36}
                                iconType="circle"
                                wrapperStyle={{ fontSize: '12px' }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                        <p>No sales data available yet.</p>
                    </div>
                )}
            </CardContent>
        </Card>
      </div>
    </div>
  );
}