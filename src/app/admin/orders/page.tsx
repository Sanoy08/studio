
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ArrowUpRight, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const orders = [
    {
        id: 'ORD001',
        customer: 'Liam Johnson',
        email: 'liam@example.com',
        date: '2023-06-23',
        amount: '$250.00',
        status: 'Fulfilled'
    },
    {
        id: 'ORD002',
        customer: 'Olivia Smith',
        email: 'olivia@example.com',
        date: '2023-06-24',
        amount: '$150.00',
        status: 'Declined'
    },
    {
        id: 'ORD003',
        customer: 'Noah Williams',
        email: 'noah@example.com',
        date: '2023-06-25',
        amount: '$350.00',
        status: 'Fulfilled'
    },
    {
        id: 'ORD004',
        customer: 'Emma Brown',
        email: 'emma@example.com',
        date: '2023-06-26',
        amount: '$450.00',
        status: 'Pending'
    },
];

const statusVariant: { [key: string]: "default" | "secondary" | "destructive" | "outline" } = {
    'Fulfilled': 'default',
    'Pending': 'secondary',
    'Declined': 'destructive'
}


export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
       <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-headline">Orders</h1>
            <p className="text-muted-foreground">
              Recent orders from your store.
            </p>
          </div>
          <Button asChild size="sm" className="gap-1">
            <Link href="#">
              View All
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      <Card>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Status</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>
                  <span className="sr-only">Actions</span>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                  <TableRow key={order.id}>
                      <TableCell>
                          <div className="font-medium">{order.customer}</div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                              {order.email}
                          </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        <Badge className="text-xs" variant={statusVariant[order.status]}>
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">{order.date}</TableCell>
                    <TableCell className="text-right">{order.amount}</TableCell>
                      <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button size="icon" variant="ghost">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Toggle menu</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                      </TableCell>
                  </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
