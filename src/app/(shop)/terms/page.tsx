
import { Card, CardContent } from '@/components/ui/card';

export default function TermsPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-headline text-center mb-8">Terms of Service</h1>

        <Card>
            <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
                <p>
                Welcome to Bumba's Kitchen! These Terms of Service ("Terms") govern your use of our cloud kitchen service,
                including home delivery and pickup options, operated by Bumba's Kitchen ("we," "us," or "our"). By accessing or
                using our service, you agree to be bound by these Terms. If you do not agree with these Terms, please do not
                access or use our service.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">1. Overview of Services</h2>

                <p>
                Bumba's Kitchen is a cloud kitchen offering food for home delivery and pickup. Our platform enables customers to
                place orders for meals prepared by us, which are then delivered to their specified location or available for
                pickup. We aim to provide high-quality meals, crafted with care, and ensure a seamless customer experience.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">2. Eligibility</h2>

                <p>
                You must be at least 18 years old to use our service. By accessing or using our services, you confirm that you
                meet this age requirement and have the legal capacity to enter into a binding agreement with us.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">3. Account Registration</h2>

                <p>
                To place an order through Bumba's Kitchen, you may need to create an account. You agree to provide accurate and
                complete information during the registration process. You are responsible for maintaining the confidentiality of
                your account information and for all activities that occur under your account.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">4. Orders and Payment</h2>

                <p>
                All orders placed through Bumba's Kitchen are subject to acceptance and availability. Once you place an order,
                you will receive an order confirmation email. We reserve the right to cancel any order for any reason. Payment
                for your order must be made via the methods we provide, and you agree to pay all fees and applicable taxes
                associated with your order.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">5. Pricing</h2>

                <p>
                Prices for menu items are displayed on our website and are subject to change at any time. While we strive to
                ensure that pricing information is accurate, we are not responsible for any pricing errors. In the event of a
                pricing error, we reserve the right to cancel any orders placed at the incorrect price.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">6. Delivery and Pickup</h2>

                <p>
                <strong>Delivery:</strong> Bumba's Kitchen offers home delivery within specific areas. Delivery times are
                estimated and may vary due to factors beyond our control, such as traffic or weather conditions. You agree to
                provide accurate delivery information, and we will not be responsible for any failed deliveries due to incorrect
                information provided.
                </p>

                <p>
                <strong>Pickup:</strong> If you choose to pick up your order, you will be notified when your order is ready. You
                are responsible for collecting your order within the designated time window. Bumba's Kitchen is not responsible
                for any orders left uncollected beyond this time frame.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">7. Cancellations and Refunds</h2>

                <p>
                If you wish to cancel your order, you must do so within a specified timeframe, typically before the order has
                been prepared. Refunds are subject to our discretion and may be processed for cancellations made within the
                allowed window. Once your order has been prepared or delivered, no refunds will be provided.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">8. Allergies and Dietary Preferences</h2>

                <p>
                Bumba's Kitchen strives to accommodate various dietary preferences and restrictions. However, we cannot guarantee
                that our meals are completely free from allergens. It is your responsibility to inform us of any food allergies
                or restrictions when placing an order. We are not liable for any allergic reactions or health issues arising
                from the consumption of our meals.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">9. Food Quality and Safety</h2>

                <p>
                We take food quality and safety seriously. All meals are prepared in compliance with applicable food safety
                regulations. In the event that you receive an order that you believe does not meet our quality standards, please
                contact us within 24 hours. We will investigate the issue and may, at our discretion, provide a replacement or
                refund.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">10. Prohibited Activities</h2>

                <p>
                You agree not to engage in any of the following prohibited activities while using our service:
                </p>

                <ul className="list-disc pl-5 space-y-2">
                    <li>Attempting to interfere with the proper functioning of our website or service.</li>
                    <li>Providing false or misleading information when placing an order.</li>
                    <li>Using our service for any unlawful or fraudulent purposes.</li>
                    <li>Attempting to gain unauthorized access to our systems or customer accounts.</li>
                </ul>

                <h2 className="text-2xl font-semibold text-foreground pt-4">11. Intellectual Property</h2>

                <p>
                All content on Bumba's Kitchen, including but not limited to text, graphics, logos, images, and software, is the
                property of Bumba's Kitchen or its licensors and is protected by applicable intellectual property laws. You may
                not use any content from our website or service without prior written permission from us.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">12. Limitation of Liability</h2>

                <p>
                Bumba's Kitchen shall not be held liable for any indirect, incidental, or consequential damages arising out of or
                in connection with your use of our service, including but not limited to damages for loss of profits, data, or
                other intangible losses. Our total liability to you for any claim related to the use of our service shall not
                exceed the amount you paid for your order.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">13. Changes to Terms</h2>

                <p>
                We reserve the right to modify these Terms at any time. Any changes will be effective upon posting the revised
                Terms on our website. Your continued use of our service after the changes have been posted will constitute your
                acceptance of the revised Terms.
                </p>

                <h2 className="text-2xl font-semibold text-foreground pt-4">14. Contact Information</h2>

                <p>
                If you have any questions or concerns regarding these Terms, please contact us at:
                </p>

                <p>
                    <strong>Email:</strong> info.bumbaskitchen@gmail.com<br/>
                    <strong>Phone:</strong> (+91) 8240-690-254
                </p>
            </CardContent>
        </Card>
      </div>
    </div>
  );
}
