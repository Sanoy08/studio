import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const orders = [
    {
        id: 'ORD001',
        date: '2023-06-23',
        status: 'Fulfilled',
        total: 250.00,
    },
    {
        id: 'ORD002',
        date: '2023-06-20',
        status: 'Fulfilled',
        total: 150.75,
    },
    {
        id: 'ORD003',
        date: '2023-06-15',
        status: 'Cancelled',
        total: 350.00,
    },
    {
        id: 'ORD004',
        date: '2023-07-01',
        status: 'Pending',
        total: 450.50,
    }
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Fulfilled: 'default',
  Pending: 'secondary',
  Cancelled: 'destructive',
};

export default function AccountOrdersPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>Check the status of recent orders, manage returns, and discover similar products.</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Desktop View */}
        <div className="hidden md:block">
            <Table>
            <TableHeader>
                <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead><span className="sr-only">Actions</span></TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {orders.map((order) => (
                <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                    <Badge variant={statusVariant[order.status] || 'outline'} className={statusVariant[order.status] === 'default' ? 'bg-green-600' : ''}>
                        {order.status}
                    </Badge>
                    </TableCell>
                    <TableCell className="text-right">{formatPrice(order.total)}</TableCell>
                    <TableCell className="text-right">
                        <Button variant="outline" size="sm">View Order</Button>
                    </TableCell>
                </TableRow>
                ))}
            </TableBody>
            </Table>
        </div>
        {/* Mobile View */}
        <div className="md:hidden space-y-4">
            {orders.map(order => (
                 <Card key={order.id}>
                    <CardHeader className="flex flex-row justify-between items-center pb-2">
                        <CardTitle className="text-base font-medium">{order.id}</CardTitle>
                         <Badge variant={statusVariant[order.status] || 'outline'} className={statusVariant[order.status] === 'default' ? 'bg-green-600 text-xs' : 'text-xs'}>
                            {order.status}
                        </Badge>
                    </CardHeader>
                    <CardContent className="pb-4">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <p>Date</p>
                            <p>{order.date}</p>
                        </div>
                        <div className="flex justify-between text-sm font-semibold">
                            <p>Total</p>
                            <p>{formatPrice(order.total)}</p>
                        </div>
                    </CardContent>
                    <CardFooter className="pt-0">
                         <Button variant="outline" size="sm" className="w-full">View Order</Button>
                    </CardFooter>
                 </Card>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
