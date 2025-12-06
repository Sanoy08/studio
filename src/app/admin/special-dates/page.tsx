// src/app/admin/special-dates/page.tsx

'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Loader2, Plus, Trash2, CalendarHeart, Cake, Gift, Sparkles, ArrowRight, Save, Download, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';
import { FloatingInput } from '@/components/ui/floating-input';
import Image from 'next/image';
import { ImageUpload } from '@/components/admin/ImageUpload';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

type Event = {
    id: string;
    title: string;
    date: string;
    type: 'birthday' | 'anniversary' | 'other';
    imageUrl?: string;
};

type CustomerEvent = {
    id: string;
    name: string;
    nextDate: string;
    type: 'birthday' | 'anniversary';
    daysLeft: number;
};

export default function SpecialDatesPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [customerEvents, setCustomerEvents] = useState<CustomerEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Dialog States
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isWarningOpen, setIsWarningOpen] = useState(false); // ওয়ার্নিং এর জন্য স্টেট
  const [pendingCustomer, setPendingCustomer] = useState<CustomerEvent | null>(null); // টেম্পোরারি স্টোরেজ
  
  // Form States
  const [title, setTitle] = useState("");
  const [date, setDate] = useState("");
  const [type, setType] = useState<'birthday' | 'anniversary' | 'other'>("birthday");
  const [manualImageUrl, setManualImageUrl] = useState("");

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const fetchData = async () => {
    const token = localStorage.getItem('token');
    try {
      const resEvents = await fetch('/api/admin/special-dates');
      const dataEvents = await resEvents.json();
      if (dataEvents.success) setEvents(dataEvents.events);

      const resCustomers = await fetch('/api/admin/customers-with-dates', {
          headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataCustomers = await resCustomers.json();
      if (dataCustomers.success) setCustomerEvents(dataCustomers.events);

    } catch (error) {
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  useEffect(() => {
    if (isDialogOpen && (type === 'birthday' || type === 'anniversary') && title && date) {
        setTimeout(() => {
            if (canvasRef.current) drawOnCanvas(canvasRef.current);
        }, 500);
    }
  }, [isDialogOpen, title, date, type]);

  // ★★★ আপগ্রেড: ইভেন্ট চেক এবং ওয়ার্নিং লজিক ★★★
  const handlePreCheck = (cust: CustomerEvent) => {
      // চেক করা হচ্ছে এই ইভেন্ট অলরেডি আছে কিনা
      const alreadyExists = events.some(e => 
          e.title.toLowerCase() === cust.name.toLowerCase() && 
          e.type === cust.type &&
          new Date(e.date).getFullYear() === new Date(cust.nextDate).getFullYear()
      );

      if (alreadyExists) {
          setPendingCustomer(cust);
          setIsWarningOpen(true); // ডুপ্লিকেট হলে ওয়ার্নিং দেখাও
      } else {
          handleOpenDialog(cust); // নতুন হলে সরাসরি ওপেন করো
      }
  };

  const handleOpenDialog = (prefill?: CustomerEvent) => {
      if (prefill) {
          setTitle(prefill.name);
          const dateObj = new Date(prefill.nextDate);
          setDate(dateObj.toISOString().split('T')[0]);
          setType(prefill.type);
      } else {
          setTitle("");
          setDate("");
          setType("birthday");
          setManualImageUrl("");
      }
      setIsDialogOpen(true);
      setIsWarningOpen(false); // ওয়ার্নিং বন্ধ করে দাও
      setPendingCustomer(null);
  };

  const generateCouponCode = (name: string, dateStr: string, eventType: string) => {
      const nameParts = name.trim().split(" ");
      const firstInitial = nameParts[0] ? nameParts[0][0].toUpperCase() : "";
      const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1][0].toUpperCase() : "";
      
      const day = new Date(dateStr).getDate();
      const codeSuffix = eventType === 'anniversary' ? 'ANNI' : 'BDAY';
      
      return `${firstInitial}${lastInitial}${codeSuffix}${day}`;
  };

  const drawOnCanvas = async (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 1753;
    canvas.height = 2480;

    try {
        await document.fonts.ready;

        const bgImage = new window.Image();
        if (type === 'anniversary') {
            bgImage.src = '/anniversary.jpg';
        } else {
            bgImage.src = '/birthday.jpg';
        }
        bgImage.crossOrigin = "anonymous";
        
        await new Promise((resolve, reject) => {
            bgImage.onload = resolve;
            bgImage.onerror = reject;
        });
        
        ctx.drawImage(bgImage, 0, 0, canvas.width, canvas.height);

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const centerX = canvas.width / 2;

        ctx.fillStyle = "#f2ce00"; 
        ctx.font = "400 200px Pacifico, cursive"; 
        if (title.length > 10) ctx.font = "400 150px Pacifico, cursive";
        ctx.fillText(title, centerX, 1000); 
        
        const eventDate = new Date(date);
        const dateText = eventDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long' });
        
        ctx.fillStyle = "#000000ff"; 
        ctx.font = "300 70px Poppins, sans-serif";
        
        const line1 = "As a small celebration from us, enjoy a";
        const line2 = `5% discount on your order after ${dateText}`;
        
        ctx.fillText(line1, centerX, 1470-40);
        ctx.fillText(line2, centerX, 1560-40);

        const couponCode = generateCouponCode(title, date, type);
        
        ctx.fillStyle = "#f2ce00"; 
        ctx.font = "700 85px Poppins, sans-serif"; 
        
        ctx.fillText(`Use code: ${couponCode}`, centerX, 1736-15);

    } catch (e) {
        console.error("Canvas drawing error:", e);
    }
  };

  const downloadPoster = () => {
    if (!canvasRef.current) return;
    try {
        const link = document.createElement('a');
        const filename = `${title.replace(/\s+/g, '_')}_${type}_Poster.jpg`;
        link.download = filename;
        link.href = canvasRef.current.toDataURL('image/jpeg', 0.95);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success("Poster Downloaded! 📥");
    } catch (e) {
        toast.error("Failed to download image");
    }
  };

  const handleSaveAndDownload = async () => {
    if (!title || !date) {
        toast.error("Title and Date required");
        return;
    }
    setIsSaving(true);
    const token = localStorage.getItem('token');

    try {
        let finalImageUrl = manualImageUrl; 

        if (type === 'birthday' || type === 'anniversary') {
            const couponCode = generateCouponCode(title, date, type);
            
            const startDateObj = new Date(date);
            startDateObj.setDate(startDateObj.getDate() - 1);
            const startDate = startDateObj.toISOString().split('T')[0];

            const expiryDateObj = new Date(date);
            expiryDateObj.setDate(expiryDateObj.getDate() + 2);
            const expiryDate = expiryDateObj.toISOString().split('T')[0];

            try {
                const couponRes = await fetch('/api/admin/coupons', {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json', 
                        'Authorization': `Bearer ${token}` 
                    },
                    body: JSON.stringify({
                        code: couponCode,
                        description: `${type === 'birthday' ? 'Birthday' : 'Anniversary'} Special for ${title}`,
                        discountType: 'percentage',
                        value: 5,
                        minOrder: 0,
                        usageLimit: 1,
                        startDate: startDate,
                        expiryDate: expiryDate, 
                        isActive: true
                    })
                });

                if (couponRes.ok) {
                    toast.success("Automatic Coupon Created! 🎟️");
                }
            } catch (couponErr) {
                console.error("Coupon API Error:", couponErr);
            }

            if (canvasRef.current) {
                downloadPoster();
                finalImageUrl = ""; 
            }
        }

        const res = await fetch('/api/admin/special-dates', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ title, date, type, imageUrl: finalImageUrl }),
        });

        if (res.ok) {
            toast.success("Event Saved Successfully! 🎉");
            setIsDialogOpen(false);
            fetchData();
        } else {
            throw new Error('Failed to save');
        }
    } catch (e) {
        toast.error('Error saving event');
    } finally {
        setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this event?')) return;
    const token = localStorage.getItem('token');
    try {
        await fetch(`/api/admin/special-dates?id=${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        toast.success('Event deleted');
        fetchData();
    } catch (e) { toast.error('Delete failed'); }
  };

  const isPast = (eventDate: string) => {
      return new Date(eventDate) < new Date(new Date().setHours(0,0,0,0));
  }

  // ★★★ সর্টিং লজিক (Sorting by Date) ★★★
  const sortedEvents = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  if (isLoading) return <div className="flex justify-center p-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="max-w-[1600px] mx-auto space-y-6">
        
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-card p-6 rounded-xl border shadow-sm">
            <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                    <CalendarHeart className="h-6 w-6 text-primary" /> Events & Special Dates
                </h1>
                <p className="text-sm text-muted-foreground mt-1">Manage upcoming birthdays, anniversaries, and events.</p>
            </div>
            <Button onClick={() => handleOpenDialog()} className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" /> Add Manual Event
            </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Upcoming Customer Celebrations */}
            <Card className="border-0 shadow-md bg-primary/5 border-primary/10 h-fit">
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-amber-500 fill-amber-500" /> 
                        Upcoming Customer Celebrations
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {customerEvents.length === 0 ? (
                        <p className="text-center text-muted-foreground py-8 text-sm">No upcoming customer dates found.</p>
                    ) : (
                        <div className="grid grid-cols-1 gap-3">
                            {customerEvents.map((cust) => (
                                <div key={cust.id} className="flex items-center justify-between p-3 bg-background rounded-lg border hover:shadow-sm transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-10 w-10 rounded-full flex items-center justify-center ${cust.type === 'birthday' ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
                                            {cust.type === 'birthday' ? <Cake className="h-5 w-5"/> : <Gift className="h-5 w-5"/>}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{cust.name}</p>
                                            <p className="text-xs text-muted-foreground">
                                                {new Date(cust.nextDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} 
                                                <span className="ml-1 text-primary font-medium">({cust.daysLeft} days left)</span>
                                            </p>
                                        </div>
                                    </div>
                                    {/* এখানে handlePreCheck কল করা হচ্ছে */}
                                    <Button size="sm" variant="outline" className="h-8 text-xs" onClick={() => handlePreCheck(cust)}>
                                        Generate <ArrowRight className="ml-1 h-3 w-3" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Saved Events List (Sorted) */}
            <Card className="border-0 shadow-md">
                <CardHeader>
                    <CardTitle>Saved Events & Posters</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {sortedEvents.length === 0 ? (
                            <p className="text-center text-muted-foreground py-8">No events saved yet.</p>
                        ) : (
                            // এখানে sortedEvents ম্যাপ করা হচ্ছে
                            sortedEvents.map((event) => {
                                const past = isPast(event.date);
                                return (
                                    <div key={event.id} className={`flex items-center gap-4 p-4 rounded-xl border bg-card hover:shadow-sm transition-all ${past ? 'opacity-60' : ''}`}>
                                        <div className="h-20 w-20 flex-shrink-0 rounded-lg overflow-hidden bg-muted relative border">
                                            {event.imageUrl ? (
                                                <Image src={event.imageUrl} alt={event.title} fill className="object-cover" unoptimized={true} />
                                            ) : (
                                                <div className="h-full w-full flex items-center justify-center text-muted-foreground bg-muted">
                                                     {event.type === 'birthday' ? <Cake className="h-8 w-8 text-pink-400"/> : 
                                                      event.type === 'anniversary' ? <Gift className="h-8 w-8 text-purple-400"/> :
                                                      <CalendarHeart className="h-8 w-8 text-blue-400"/>}
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-grow">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-bold text-lg">{event.title}</h3>
                                                {past && <Badge variant="secondary">Past</Badge>}
                                            </div>
                                            <p className="text-sm text-primary font-medium">
                                                {new Date(event.date).toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                            </p>
                                            <Badge variant="secondary" className="mt-1 capitalize">{event.type}</Badge>
                                        </div>
                                        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => handleDelete(event.id)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Create Modal */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Create Event / Poster</DialogTitle>
                </DialogHeader>
                
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                         <FloatingInput label="Event Title" value={title} onChange={(e) => setTitle(e.target.value)} />
                         <FloatingInput label="Date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                         
                         <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground ml-1">Event Type</Label>
                            <Select value={type} onValueChange={(val: any) => setType(val)}>
                                <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="birthday">Birthday (Auto Poster + Coupon)</SelectItem>
                                    <SelectItem value="anniversary">Anniversary (Auto Poster + Coupon)</SelectItem>
                                    <SelectItem value="other">Other</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {type === 'other' && (
                             <div className="space-y-2">
                                 <Label>Image (Optional)</Label>
                                 <ImageUpload 
                                     value={manualImageUrl ? [manualImageUrl] : []}
                                     onChange={(urls) => setManualImageUrl(urls[0] || '')}
                                     maxFiles={1}
                                     folder="general"
                                 />
                             </div>
                        )}
                    </div>

                    <div className="flex flex-col items-center justify-center bg-muted/30 rounded-xl border p-4 min-h-[300px]">
                        {type === 'birthday' || type === 'anniversary' ? (
                            <>
                                <Label className="mb-2 text-muted-foreground">Live Poster Preview</Label>
                                <canvas ref={canvasRef} className="w-full h-auto object-contain shadow-lg max-h-[400px]" />
                            </>
                        ) : (
                            <p className="text-sm text-muted-foreground">Preview available for Birthdays & Anniversaries only.</p>
                        )}
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                    <Button onClick={handleSaveAndDownload} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
                        Save & Download
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

        {/* Warning Dialog for Duplicates */}
        <Dialog open={isWarningOpen} onOpenChange={setIsWarningOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-6 w-6" /> Duplicate Event Detected
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        An event for <strong>{pendingCustomer?.name}</strong> already exists in the saved list for this year.
                        <br/><br/>
                        Do you want to create it again?
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsWarningOpen(false)}>Cancel</Button>
                    <Button onClick={() => pendingCustomer && handleOpenDialog(pendingCustomer)}>
                        Continue Anyway
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>

    </div>
  );
}