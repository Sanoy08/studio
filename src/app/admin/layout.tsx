

'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  LogOut,
  PanelLeft,
  Home,
  Tag, // এই আইকনটি import করুন
} from 'lucide-react';  

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import { Logo } from '@/components/layout/Logo'
import { cn } from '@/lib/utils'

const adminNavLinks = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/products', label: 'Products', icon: Package },
  { href: '/admin/orders', label: 'Orders', icon: ShoppingBag },
  { href: '/admin/users', label: 'Customers', icon: Users },
  { href: '/admin/offers', label: 'Offers', icon: Tag }, // নতুন লিংক
]

function AdminSidebar() {
  const pathname = usePathname()

  return (
    <Sidebar>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {adminNavLinks.map((link) => (
            <SidebarMenuItem key={link.href}>
              <Link href={link.href}>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={link.label}
                >
                  <link.icon className="size-4" />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <Link href="/">
              <SidebarMenuButton tooltip="Back to Store">
                <Home className="size-4" />
                <span>Back to Store</span>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="Logout">
              <LogOut className="size-4" />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function MobileAdminHeader() {
  const pathname = usePathname()
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b bg-background px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6">
      <Sheet>
        <SheetTrigger asChild>
          <Button size="icon" variant="outline" className="sm:hidden">
            <PanelLeft className="h-5 w-5" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="sm:max-w-xs p-0">
          <SheetHeader className="sr-only">
            <SheetTitle>Admin Menu</SheetTitle>
          </SheetHeader>
          <nav className="flex flex-col h-full bg-sidebar text-sidebar-foreground">
            <div className="p-4 border-b border-sidebar-border">
              <Logo />
            </div>
            <div className="flex-grow p-4 space-y-1">
              {adminNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                    pathname === link.href
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                      : 'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              ))}
            </div>
            <div className="p-4 mt-auto border-t border-sidebar-border space-y-1">
               <Link href="/" className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all',
                     'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}>
                  <Home className="h-4 w-4" />
                  Back to Store
               </Link>
               <button className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 transition-all w-full',
                     'hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )}>
                  <LogOut className="h-4 w-4" />
                  Logout
               </button>
            </div>
          </nav>
        </SheetContent>
      </Sheet>
    </header>
  )
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-muted/40">
        <div className="hidden sm:block">
          <AdminSidebar />
        </div>
        <div className="flex flex-col flex-1">
          <MobileAdminHeader />
          <main className="flex-1 p-4 sm:px-6 sm:py-6">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
