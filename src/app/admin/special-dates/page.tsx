// src/app/admin/special-dates/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Calendar } from 'lucide-react';
import { BirthdayCardGenerator } from '@/components/admin/BirthdayCardGenerator';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';

export default function SpecialDatesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    fetchSpecialDates();
  }, []);

  const fetchSpecialDates = async () => {
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('/api/admin/special-dates', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        
        if (Array.isArray(data)) {
            processAndSetEvents(data);
        }
    } catch (error) {
        console.error("Failed to fetch dates", error);
    } finally {
        setIsLoading(false);
    }
  };

  const processAndSetEvents = (data: any[]) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    let allEvents: any[] = [];

    const getNextEventDate = (dateString: string) => {
        const date = new Date(dateString);
        let eventDate = new Date(currentYear, date.getMonth(), date.getDate());
        if (eventDate < new Date(now.setHours(0,0,0,0))) {
            eventDate.setFullYear(currentYear + 1);
        }
        return eventDate;
    };

    data.forEach(item => {
        if (item.dob) {
            const nextDate = getNextEventDate(item.dob);
            allEvents.push({
                ...item,
                type: 'birthday',
                nextDate: nextDate,
                formattedDate: nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            });
        }
        if (item.anniversary) {
            const nextDate = getNextEventDate(item.anniversary);
            allEvents.push({
                ...item,
                type: 'anniversary',
                nextDate: nextDate,
                formattedDate: nextDate.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
            });
        }
    });

    // Sort by date
    allEvents.sort((a, b) => a.nextDate - b.nextDate);
    setEvents(allEvents);
  };

  const handleEventClick = async (event: any) => {
    if (event.type === 'birthday') {
        const couponCode = `${event.name.charAt(0).toUpperCase()}BDAY${event.nextDate.getDate()}`.toUpperCase();
        
        // অপশনাল: আপনি চাইলে এখানে অটোমেটিক কুপন জেনারেট করার API কল করতে পারেন
        // await createCoupon(couponCode, ...);

        setSelectedEvent({ ...event, couponCode });
        setShowGenerator(true);
        toast.info(`Opening card generator for ${event.name}`);
    } else {
        toast.success(`🎉 ${event.name}'s Anniversary is coming up on ${event.formattedDate}!`);
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Events Calendar</h1>
      
      <Card>
        <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" /> Upcoming Celebrations
            </CardTitle>
        </CardHeader>
        <CardContent>
            {events.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No upcoming birthdays or anniversaries found.</p>
            ) : (
                <div className="space-y-3">
                    {events.map((event, idx) => {
                        const isBirthday = event.type === 'birthday';
                        return (
                            <div 
                                key={idx} 
                                className="flex items-center gap-4 p-4 border rounded-xl cursor-pointer hover:bg-muted/50 transition-all hover:shadow-sm"
                                onClick={() => handleEventClick(event)}
                            >
                                <div className={`h-12 w-12 rounded-full flex items-center justify-center text-2xl shrink-0 ${isBirthday ? 'bg-pink-100 text-pink-600' : 'bg-purple-100 text-purple-600'}`}>
                                    {isBirthday ? '🎂' : '🎉'}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-lg">{event.name}'s {isBirthday ? 'Birthday' : 'Anniversary'}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                                        {event.formattedDate}
                                    </p>
                                </div>
                                {isBirthday && (
                                    <Button size="sm" variant="outline" className="hidden sm:flex">
                                        Generate Card
                                    </Button>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </CardContent>
      </Card>

      {/* Card Generator Modal */}
      {selectedEvent && (
          <BirthdayCardGenerator 
            isOpen={showGenerator}
            onClose={() => setShowGenerator(false)}
            customerName={selectedEvent.name}
            date={selectedEvent.formattedDate}
            couponCode={selectedEvent.couponCode}
          />
      )}
    </div>
  );
}