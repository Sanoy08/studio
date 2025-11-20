'use client'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import { MoreVertical, Plus } from "lucide-react"

const addresses = [
    {
        id: 1,
        name: 'Home',
        address: '123, Dream Lane, Fantasy City, 700001',
        isDefault: true,
    },
    {
        id: 2,
        name: 'Work',
        address: '456, Business Bay, Worksville, 700002',
        isDefault: false,
    }
]

export default function AccountAddressesPage() {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Addresses</CardTitle>
                <CardDescription>Manage your saved addresses for faster checkout.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {addresses.map(addr => (
                    <div key={addr.id} className="rounded-lg border bg-card text-card-foreground shadow-sm p-4 flex justify-between items-start">
                       <div>
                            <p className="font-semibold">{addr.name} {addr.isDefault && <span className="text-xs bg-primary text-primary-foreground rounded-full px-2 py-0.5 ml-2">Default</span>}</p>
                            <p className="text-sm text-muted-foreground">{addr.address}</p>
                       </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="flex-shrink-0">
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem>Edit</DropdownMenuItem>
                                <DropdownMenuItem>Delete</DropdownMenuItem>
                                {!addr.isDefault && <DropdownMenuItem>Set as default</DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                ))}
            </CardContent>
            <CardFooter className="border-t pt-6">
                <Button><Plus className="h-4 w-4 mr-2" /> Add New Address</Button>
            </CardFooter>
        </Card>
    )
}
