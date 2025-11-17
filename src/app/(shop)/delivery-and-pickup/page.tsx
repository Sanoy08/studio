
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function DeliveryAndPickupPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-headline text-center mb-8">
          Delivery and Pickup
        </h1>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Delivery</h2>
              <p>
                Bumba's Kitchen offers home delivery within specific areas. Delivery times are
                estimated and may vary due to factors beyond our control, such as traffic or weather conditions. You agree to
                provide accurate delivery information, and we will not be responsible for any failed deliveries due to incorrect
                information provided.
              </p>
            </div>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">Pickup</h2>
              <p>
                If you choose to pick up your order, you will be notified when your order is ready. You
                are responsible for collecting your order within the designated time window. Bumba's Kitchen is not responsible
                for any orders left uncollected beyond this time frame.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
