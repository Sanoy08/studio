import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';

export default function AboutUsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-headline text-center mb-8">
          About Bumba's Kitchen
        </h1>

        <Card className="mb-8 overflow-hidden">
          <div className="relative h-64 w-full">
            <Image
              src="https://picsum.photos/seed/kitchen/1200/400"
              alt="Bumba's Kitchen"
              fill
              className="object-cover"
              data-ai-hint="warm kitchen"
            />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Our Story</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Welcome to Bumba's Kitchen, where passion for authentic flavors meets the convenience of modern dining. Born from a love for traditional home-cooked meals, Bumba's Kitchen started as a small dream in a home kitchen. Our founder, affectionately known as Bumba, believed that everyone deserves to enjoy a delicious, wholesome meal, even on their busiest days.
            </p>
            <p>
              Operating as a cloud kitchen allows us to focus purely on the quality and taste of our food. We source the freshest local ingredients and use age-old family recipes to create dishes that are not just food, but an experience. From our aromatic biryanis to our rich, flavorful curries, every dish is prepared with love and attention to detail.
            </p>
            <p>
              Our mission is simple: to deliver happiness to your doorstep, one meal at a time. We are committed to providing our customers with exceptional food and service, ensuring that every order from Bumba's Kitchen is a delightful one.
            </p>
            <p>
              Thank you for being a part of our journey. We look forward to serving you!
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
