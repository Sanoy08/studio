import { Logo } from "@/components/layout/Logo";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground">
              Experience delicious meals delivered right to your doorstep. We operate through cloud kitchens, so you can order online.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="#" className="text-muted-foreground hover:text-primary"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="text-muted-foreground hover:text-primary"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Contact Information</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Address: Janai, Garbagan, Hooghly</li>
              <li>Phone: +91 912406 80234</li>
              <li>Email: info.bumbaskitchen@gmail.com</li>
              <li>Operating hours: Mon-Sun (11 AM to 10 PM IST)</li>
            </ul>
          </div>
           <div>
            <h3 className="font-bold text-lg">Quick Links</h3>
             <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/contact" className="text-muted-foreground hover:text-primary">Contact</Link></li>
                <li><Link href="/delivery-and-pickup" className="text-muted-foreground hover:text-primary">Delivery & Pickup</Link></li>
                <li><Link href="/privacy" className="text-muted-foreground hover:text-primary">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-muted-foreground hover:text-primary">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Bumba's Kitchen. All rights reserved.</p>
            <p className="mt-1">
                <Link href="/terms" className="hover:underline">Terms of Service</Link> | <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </p>
        </div>
      </div>
    </footer>
  );
}
