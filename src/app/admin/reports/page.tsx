// src/app/admin/reports/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Download, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { toast } from 'sonner';
import { formatPrice } from '@/lib/utils';

export default function AdminReportsPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [csvData, setCsvData] = useState<any[]>([]);
  
  const today = new Date().toISOString().split('T')[0];
  const lastMonth = new Date();
  lastMonth.setDate(lastMonth.getDate() - 30);
  const thirtyDaysAgo = lastMonth.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(thirtyDaysAgo);
  const [endDate, setEndDate] = useState(today);

  const fetchReport = async () => {
    const token = localStorage.getItem('token');
    setIsLoading(true);
    try {
        const res = await fetch(`/api/admin/reports?start=${startDate}&end=${endDate}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.success) {
            setReportData(data.data);
            setCsvData(data.csvData);
        } else {
            toast.error(data.error || "Failed to load report");
        }
    } catch (e) {
        toast.error("Error fetching report");
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
      fetchReport();
  }, []);

  const downloadCSV = () => {
    if (csvData.length === 0) {
        toast.error("No data to download");
        return;
    }

    // ★★★ FIX: ফাইলের নামের জন্য তারিখ ফরম্যাট (DD-MM-YYYY) ★★★
    const formatForFileName = (isoDate: string) => {
        const [year, month, day] = isoDate.split('-');
        return `${day}-${month}-${year}`;
    };

    const headers = ["Order ID", "Date", "Customer", "Phone", "Items", "Amount", "Status"];
    const rows = csvData.map(row => [
        row.id, row.date, row.customer, row.phone, `"${row.items}"`, row.amount, row.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
        + headers.join(",") + "\n" 
        + rows.map(e => e.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    // ফাইলের নাম এখন হবে: sales_report_25-12-2024_to_31-12-2024.csv
    link.setAttribute("download", `sales_report_${formatForFileName(startDate)}_to_${formatForFileName(endDate)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalRevenue = reportData.reduce((sum, item) => sum + item.sales, 0);
  const totalOrders = reportData.reduce((sum, item) => sum + item.orders, 0);

  // চার্টের জন্য তারিখ ফরম্যাটার
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto">
      
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
        <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
                <BarChart3 className="h-6 w-6 text-primary" /> Sales Reports
            </h1>
            <p className="text-sm text-muted-foreground mt-1">Analyze your business performance.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 items-end">
            <div className="grid gap-1.5">
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9" />
            </div>
            <div className="grid gap-1.5">
                <Label className="text-xs">End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9" />
            </div>
            <Button onClick={fetchReport} disabled={isLoading} className="h-9">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Generate'}
            </Button>
            <Button onClick={downloadCSV} variant="outline" className="h-9 gap-2" disabled={csvData.length === 0}>
                <Download className="h-4 w-4" /> CSV
            </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Revenue (Selected Period)</p>
                  <p className="text-3xl font-bold text-primary">{formatPrice(totalRevenue)}</p>
              </CardContent>
          </Card>
          <Card>
              <CardContent className="p-6 text-center">
                  <p className="text-sm font-medium text-muted-foreground mb-1">Total Orders</p>
                  <p className="text-3xl font-bold">{totalOrders}</p>
              </CardContent>
          </Card>
      </div>

      <Card className="border-0 shadow-md">
          <CardHeader>
              <CardTitle>Daily Sales Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
              {reportData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={reportData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} />
                          <XAxis 
                            dataKey="date" 
                            fontSize={12} 
                            tickLine={false} 
                            axisLine={false} 
                            tickFormatter={formatDate} 
                          />
                          <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                          <Tooltip 
                              cursor={{fill: 'transparent'}}
                              formatter={(value: number) => [formatPrice(value), 'Sales']}
                              labelFormatter={formatDate}
                              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                          />
                          <Bar dataKey="sales" fill="#84cc16" radius={[4, 4, 0, 0]} barSize={50} />
                      </BarChart>
                  </ResponsiveContainer>
              ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                      <p>No data available for this period.</p>
                  </div>
              )}
          </CardContent>
      </Card>
    </div>
  );
}