// src/app/admin/special-dates/page.tsx

'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Cake, PartyPopper } from 'lucide-react';
import { BirthdayCardGenerator } from '@/components/admin/BirthdayCardGenerator';
import { toast } from 'sonner';

// Mock function to get dates (Replace with your API call)
// You need to implement /api/admin/special-dates API route
const fetchSpecialDates = async () => {
    // Temporary mock data based on your description
    return [
        { name: "Amit Roy", dob: "1995-12-25", type: 'birthday' },
        { name: "Priya Das", anniversary: "2020-01-15", type: 'anniversary' }
    ];
};

export default function SpecialDatesPage() {
  const [events, setEvents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Generator State
  const [showGenerator, setShowGenerator] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  useEffect(() => {
    // Load events
    // In real implementation, fetch from /api/admin/get-special-dates
    setTimeout(() => {
        setEvents([
            { name: "Rahul Sharma", date: "2025-11-25", type: "birthday", formattedDate: "25 November 2025" },
            { name: "Sneha Gupta", date: "2025-12-01", type: "anniversary", formattedDate: "1 December 2025" }
        ]);
        setIsLoading(false);
    }, 1000);
  }, []);

  const handleEventClick = (event: any) => {
    if (event.type === 'birthday') {
        setSelectedEvent(event);
        setShowGenerator(true);
    } else {
        toast.info(`${event.name}'s Anniversary on ${event.formattedDate}`);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold font-headline">Events Calendar</h1>
      
      <Card>
        <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
        </CardHeader>
        <CardContent>
            {isLoading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
            ) : (
                <div className="space-y-4">
                    {events.map((event, idx) => (
                        <div 
                            key={idx} 
                            className="flex items-center gap-4 p-4 border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                            onClick={() => handleEventClick(event)}
                        >
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center text-xl ${event.type === 'birthday' ? 'bg-pink-100' : 'bg-purple-100'}`}>
                                {event.type === 'birthday' ? '🎂' : '🎉'}
                            </div>
                            <div>
                                <p className="font-bold">{event.name}'s {event.type === 'birthday' ? 'Birthday' : 'Anniversary'}</p>
                                <p className="text-sm text-muted-foreground">{event.formattedDate}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </CardContent>
      </Card>

      {selectedEvent && (
          <BirthdayCardGenerator 
            isOpen={showGenerator}
            onClose={() => setShowGenerator(false)}
            customerName={selectedEvent.name}
            date={selectedEvent.formattedDate}
            couponCode={`${selectedEvent.name.charAt(0).toUpperCase()}BDAY${new Date().getDate()}`}
          />
      )}
    </div>
  );
}