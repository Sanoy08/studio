
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { MoreHorizontal } from "lucide-react"

const users = [
    {
        name: "Liam Johnson",
        email: "liam@example.com",
        avatar: "/avatars/01.png",
        fallback: "LJ",
        role: "Customer",
        lastOrder: "2023-06-23",
        totalSpent: "$250.00"
    },
    {
        name: "Olivia Smith",
        email: "olivia@example.com",
        avatar: "/avatars/02.png",
        fallback: "OS",
        role: "Customer",
        lastOrder: "2023-06-24",
        totalSpent: "$150.00"
    },
    {
        name: "Noah Williams",
        email: "noah@example.com",
        avatar: "/avatars/03.png",
        fallback: "NW",
        role: "Admin",
        lastOrder: "2023-06-25",
        totalSpent: "$350.00"
    },
    {
        name: "Emma Brown",
        email: "emma@example.com",
        avatar: "/avatars/04.png",
        fallback: "EB",
        role: "Customer",
        lastOrder: "2023-06-26",
        totalSpent: "$450.00"
    }
]

export default function AdminUsersPage() {
    return (
        <div className="space-y-6">
             <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold font-headline">Customers</h1>
                    <p className="text-muted-foreground">
                        View and manage your customers.
                    </p>
                </div>
            </div>
            <Card>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Customer</TableHead>
                                <TableHead className="hidden sm:table-cell">Role</TableHead>
                                <TableHead className="hidden md:table-cell">Last Order</TableHead>
                                <TableHead className="text-right">Total Spent</TableHead>
                                <TableHead><span className="sr-only">Actions</span></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.email}>
                                    <TableCell>
                                        <div className="flex items-center gap-4">
                                            <Avatar className="hidden h-9 w-9 sm:flex">
                                                <AvatarImage src={user.avatar} alt="Avatar" />
                                                <AvatarFallback>{user.fallback}</AvatarFallback>
                                            </Avatar>
                                            <div className="grid gap-1">
                                                <p className="text-sm font-medium leading-none">{user.name}</p>
                                                <p className="text-sm text-muted-foreground">{user.email}</p>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden sm:table-cell">
                                        <Badge variant={user.role === 'Admin' ? 'destructive' : 'outline'}>{user.role}</Badge>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell">{user.lastOrder}</TableCell>
                                    <TableCell className="text-right">{user.totalSpent}</TableCell>
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
                                            <DropdownMenuItem>View Orders</DropdownMenuItem>
                                            <DropdownMenuItem>Edit</DropdownMenuItem>
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
