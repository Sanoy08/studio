import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

const faqs = [
  {
    question: "What are your delivery hours?",
    answer: "We deliver from 11:00 AM to 10:00 PM, seven days a week."
  },
  {
    question: "What is your delivery range?",
    answer: "We currently deliver within a 10km radius of our cloud kitchen in Janai, Hooghly."
  },
  {
    question: "How can I place an order?",
    answer: "You can place an order directly through our website. Simply add items to your cart and proceed to checkout."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept online payments via credit card, debit card, UPI, and major mobile wallets. Cash on Delivery (COD) is also available."
  },
  {
    question: "Can I customize my order?",
    answer: "For specific dietary requirements or customizations, please mention them in the 'notes' section while placing your order. We will do our best to accommodate your request."
  },
  {
    question: "How do I track my order?",
    answer: "Once your order is confirmed, you will receive updates via email and SMS. You can also track the status of your order from your account page on our website."
  },
  {
    question: "What is your cancellation policy?",
    answer: "You can cancel your order within 10 minutes of placing it for a full refund. After that, cancellations are not possible as the kitchen would have already started preparing your meal."
  }
]

export default function FAQPage() {
  return (
    <div className="container py-12">
      <h1 className="text-4xl font-bold font-headline text-center mb-8">
        Frequently Asked Questions
      </h1>
      <div className="max-w-3xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <Accordion type="single" collapsible className="w-full">
              {faqs.map((faq, index) => (
                <AccordionItem value={`item-${index}`} key={index}>
                  <AccordionTrigger className="text-lg text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
