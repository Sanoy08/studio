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
} from '@/components/ui/card';
import { formatPrice } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
                  <Badge variant={statusVariant[order.status] || 'outline'}>
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
      </CardContent>
    </Card>
  );
}
