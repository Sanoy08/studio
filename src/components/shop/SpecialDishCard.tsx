// src/components/shop/SpecialDishCard.tsx

'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatPrice } from '@/lib/utils';
import { Utensils, CalendarDays } from 'lucide-react';

type Props = {
    name: string;
    description: string;
    price: number;
    date?: string;
};

export function SpecialDishCard({ name, description, price, date }: Props) {
    // আজকের তারিখ ডিফল্ট হিসেবে
    const displayDate = date || new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

    // ডেসক্রিপশন থেকে লিস্ট আইটেম বের করা
    const items = description.split('\n')
        .map(line => line.trim().replace(/^[-•]\s*/, ''))
        .filter(line => line.length > 0);

    return (
        <div className="w-full h-full bg-gradient-to-br from-amber-100 via-orange-50 to-white p-6 flex flex-col items-center justify-center text-center relative overflow-hidden border-4 border-double border-amber-200">
            {/* ডেকোরেটিভ ব্যাকগ্রাউন্ড এলিমেন্ট */}
            <div className="absolute top-0 left-0 w-full h-2 bg-amber-400 opacity-50"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-300 rounded-full blur-3xl opacity-20"></div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-orange-300 rounded-full blur-3xl opacity-20"></div>

            <div className="relative z-10 w-full">
                {/* হেডার */}
                <div className="inline-flex items-center gap-1.5 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-amber-700 shadow-sm mb-4 border border-amber-100">
                    <Utensils className="h-3 w-3" /> TODAY'S SPECIAL
                </div>

                {/* টাইটেল */}
                <h3 className="text-2xl md:text-3xl font-bold font-headline text-gray-900 mb-2 leading-tight">
                    {name}
                </h3>

                {/* তারিখ */}
                <div className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground mb-6 italic">
                    <CalendarDays className="h-3.5 w-3.5" />
                    <span>{displayDate}</span>
                </div>

                {/* মেনু লিস্ট */}
                <div className="space-y-2 mb-6">
                    {items.slice(0, 5).map((item, idx) => (
                        <p key={idx} className="text-sm md:text-base font-medium text-gray-700 border-b border-dashed border-amber-200/50 pb-1 last:border-0">
                            {item}
                        </p>
                    ))}
                    {items.length > 5 && <p className="text-xs text-muted-foreground italic">+ more items</p>}
                </div>

                {/* দাম */}
                <div className="mt-auto pt-2">
                    <span className="block text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Only At</span>
                    <span className="text-3xl font-extrabold text-primary drop-shadow-sm">{formatPrice(price)}</span>
                </div>
            </div>
        </div>
    );
}