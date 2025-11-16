import { Logo } from "@/components/shared/Logo";

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <Logo />
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Bumbas Kitchen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
