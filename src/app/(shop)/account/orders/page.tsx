'use client';

import { useState } from 'react';
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
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';


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
    },
    {
        id: 'ORD005',
        date: '2023-07-05',
        status: 'Fulfilled',
        total: 50.25,
    },
    {
        id: 'ORD006',
        date: '2023-07-10',
        status: 'Pending',
        total: 200.00,
    },
];

const statusVariant: { [key: string]: 'default' | 'secondary' | 'destructive' | 'outline' } = {
  Fulfilled: 'default',
  Pending: 'secondary',
  Cancelled: 'destructive',
};

const ORDERS_PER_PAGE = 5;

export default function AccountOrdersPage() {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(orders.length / ORDERS_PER_PAGE);
  const currentOrders = orders.slice(
    (currentPage - 1) * ORDERS_PER_PAGE,
    currentPage * ORDERS_PER_PAGE
  );

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };


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
                {currentOrders.map((order) => (
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
            {currentOrders.map(order => (
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
      {totalPages > 1 && (
        <CardFooter className="border-t pt-6 justify-center">
            <Pagination>
                <PaginationContent>
                    <PaginationItem>
                        <PaginationPrevious href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage - 1)}} aria-disabled={currentPage === 1} />
                    </PaginationItem>
                    {[...Array(totalPages)].map((_, i) => (
                         <PaginationItem key={i}>
                            <PaginationLink href="#" onClick={(e) => {e.preventDefault(); handlePageChange(i + 1)}} isActive={currentPage === i + 1}>
                                {i + 1}
                            </PaginationLink>
                        </PaginationItem>
                    ))}
                    <PaginationItem>
                        <PaginationNext href="#" onClick={(e) => {e.preventDefault(); handlePageChange(currentPage + 1)}} aria-disabled={currentPage === totalPages} />
                    </PaginationItem>
                </PaginationContent>
            </Pagination>
        </CardFooter>
      )}
    </Card>
  );
}
