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
import { ArrowUpRight } from 'lucide-react'
import Link from 'next/link'

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
    <Card>
      <CardHeader className="flex flex-row items-center">
        <div className="grid gap-2">
          <CardTitle>Orders</CardTitle>
          <CardDescription>
            Recent orders from your store.
          </CardDescription>
        </div>
        <Button asChild size="sm" className="ml-auto gap-1">
          <Link href="#">
            View All
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead className="hidden xl:table-cell">
                Date
              </TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="hidden sm:table-cell">
                Status
              </TableHead>
              <TableHead className="hidden sm:table-cell text-right">
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
                    <TableCell className="hidden xl:table-cell">{order.date}</TableCell>
                    <TableCell className="text-right">{order.amount}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                        <Badge className="text-xs" variant={statusVariant[order.status]}>
                            {order.status}
                        </Badge>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell text-right">
                        <Button asChild size="sm" variant="outline">
                            <Link href="#">View</Link>
                        </Button>
                    </TableCell>
                </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
