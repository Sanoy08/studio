import { Logo } from "@/components/shared/Logo";
import { Facebook, Instagram, Twitter } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo />
            <p className="mt-4 text-sm text-primary-foreground/80">
              Experience delicious meals delivered right to your doorstep. We operate through cloud kitchens, so you can order online.
            </p>
            <div className="flex gap-4 mt-4">
              <Link href="#" className="hover:text-accent"><Twitter className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent"><Facebook className="h-5 w-5" /></Link>
              <Link href="#" className="hover:text-accent"><Instagram className="h-5 w-5" /></Link>
            </div>
          </div>
          <div>
            <h3 className="font-bold text-lg">Contact Information</h3>
            <ul className="mt-4 space-y-2 text-sm text-primary-foreground/80">
              <li>Address: Janai, Garbagan, Hooghly</li>
              <li>Phone: +91 912406 80234</li>
              <li>Email: info.bumbaskitchen@gmail.com</li>
              <li>Operating hours: Mon-Sun (11 AM to 10 PM IST)</li>
            </ul>
          </div>
           <div>
            <h3 className="font-bold text-lg">Quick Links</h3>
             <ul className="mt-4 space-y-2 text-sm">
                <li><Link href="/about" className="hover:text-accent text-primary-foreground/80">About Us</Link></li>
                <li><Link href="/products" className="hover:text-accent text-primary-foreground/80">Menu</Link></li>
                <li><Link href="/contact" className="hover:text-accent text-primary-foreground/80">Contact</Link></li>
                <li><Link href="/faq" className="hover:text-accent text-primary-foreground/80">FAQ</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary-foreground/20 mt-8 pt-6 text-center text-sm text-primary-foreground/60">
            <p>&copy; {new Date().getFullYear()} Bumbas Kitchen. All rights reserved.</p>
            <p className="mt-1">
                <Link href="/terms" className="hover:underline">Terms of Service</Link> | <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            </p>
        </div>
      </div>
    </footer>
  );
}
