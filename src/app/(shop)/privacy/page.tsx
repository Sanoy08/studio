
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function PrivacyPolicyPage() {
  return (
    <div className="container py-12">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold font-headline text-center mb-8">
          Privacy Policy
        </h1>

        <Card>
          <CardContent className="p-6 md:p-8 space-y-6 text-muted-foreground">
            <p className="text-sm">
              <strong>Last Updated:</strong> 07/10/2024
            </p>
            <p>
              Bumba's Kitchen is committed to protecting your privacy and ensuring your personal information is handled in a secure and responsible manner. This Privacy Policy explains how we collect, use, and share your personal data when you interact with our services, including home delivery and pickup. We also explain your rights regarding your personal information and how you can exercise them.
            </p>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">1. Information We Collect</h2>
              <p>
                We collect various types of information depending on how you interact with us, including:
              </p>

              <h3 className="text-xl font-semibold text-foreground pt-2">1.1 Personal Information</h3>
              <p>
                When you use our services or place an order, we collect personal data that allows us to provide our service to you. This may include:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Name:</strong> Used to identify you as a customer.</li>
                <li><strong>Contact Details:</strong> Email address, phone number, and delivery address are used for order confirmation, communication, and delivery purposes.</li>
                <li><strong>Payment Information:</strong> Credit/debit card information, transaction history, and billing address are collected to process payments securely. We use trusted third-party payment processors to handle transactions and do not store your full payment details.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">1.2 Order Information</h3>
              <p>
                We collect information related to your orders, such as:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                  <li>Items ordered, delivery instructions, and preferences.</li>
                  <li>History of previous orders, so we can provide a personalized experience (e.g., suggesting frequently ordered items).</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">1.3 Usage Information</h3>
              <p>
                When you interact with our website or mobile app, we collect data that helps us understand how you use our services:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Device Information:</strong> The type of device, operating system, and browser you use.</li>
                  <li><strong>IP Address and Location Data:</strong> For purposes such as delivering the best service, preventing fraud, and offering localized promotions or services.</li>
              </ul>

              <h3 className="text-xl font-semibold text-foreground pt-2">1.4 Location Data</h3>
              <p>
                With your explicit permission, we may collect precise geolocation data from your mobile device or browser to:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                  <li>Facilitate accurate delivery services.</li>
                  <li>Provide location-based promotions or suggestions.</li>
                  <li>Optimize pickup experiences.</li>
              </ul>
              <p>You can control this by adjusting your device settings or browser permissions.</p>

              <h3 className="text-xl font-semibold text-foreground pt-2">1.5 Communication Data</h3>
              <p>
                When you contact us by phone, email, or via our website chat services, we may collect:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                  <li>Recordings or transcripts of your communication with our support team.</li>
                  <li>Feedback or survey responses to improve customer service.</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">2. How We Use Your Information</h2>
              <p>
                We primarily use your data to fulfill your orders, but also for various other purposes related to improving our services and customer experience. Specifically, your information is used for:
              </p>
              <h3 className="text-xl font-semibold text-foreground pt-2">2.1 Order Fulfillment and Service Delivery</h3>
              <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Processing Orders:</strong> We use your personal and payment information to process and complete orders.</li>
                  <li><strong>Home Delivery and Pickup:</strong> We rely on your location data and address to deliver your orders in a timely and efficient manner.</li>
                  <li><strong>Communications:</strong> We send confirmations, order updates, and alerts regarding the status of your delivery or pickup.</li>
              </ul>
              <h3 className="text-xl font-semibold text-foreground pt-2">2.2 Customer Support and Interaction</h3>
              <ul className="list-disc pl-6 space-y-2">
                  <li>Responding to inquiries or complaints via phone, email, or other communication channels.</li>
                  <li>Managing any feedback or reviews you may leave on our website or social media platforms.</li>
              </ul>
              <h3 className="text-xl font-semibold text-foreground pt-2">2.3 Personalization and Enhancements</h3>
              <ul className="list-disc pl-6 space-y-2">
                  <li><strong>User Experience:</strong> We use your previous order history and preferences to provide personalized recommendations and promotions.</li>
                  <li><strong>Marketing Communications:</strong> With your consent, we may send you promotional materials or special offers. You can unsubscribe at any time by using the “unsubscribe” link in our emails or by contacting customer support.</li>
              </ul>
              <h3 className="text-xl font-semibold text-foreground pt-2">2.4 Security and Fraud Prevention</h3>
              <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Fraud Detection:</strong> We monitor transactions and activities for suspicious behavior to protect your data and prevent unauthorized access.</li>
                  <li><strong>Legal Compliance:</strong> We process your data when required by law or to enforce our legal rights.</li>
              </ul>
               <h3 className="text-xl font-semibold text-foreground pt-2">2.5 Improving Our Services</h3>
               <ul className="list-disc pl-6 space-y-2">
                    <li>We analyze usage data to enhance our website, app, and services. This includes:</li>
                    <li>Debugging issues and improving system performance.</li>
                    <li>A/B testing new features and layout designs to improve customer experience.</li>
                    <li>Identifying patterns and trends in customer behavior.</li>
                </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">3. Sharing Your Information</h2>
              <p>We respect your privacy and only share your data in the following circumstances:</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">3.1 Service Providers and Partners</h3>
                <ul className="list-disc pl-6 space-y-2">
                    <li>We work with trusted third-party service providers that perform functions such as:</li>
                    <li>Payment processing (e.g., Stripe, PayPal).</li>
                    <li>Delivery services (e.g., third-party delivery drivers or logistics companies).</li>
                    <li>Website hosting, data analytics, and email communications.</li>
                </ul>
                <p>These service providers have access to your personal data only to perform specific tasks on our behalf and are obligated to maintain the confidentiality and security of your information.</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">3.2 Legal Obligations</h3>
                <p>We may share your data if required to comply with legal processes, enforce agreements, or protect the rights, property, or safety of Bumba's Kitchen, our customers, or others. This includes cooperating with law enforcement or addressing claims or disputes.</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">3.3 Business Transfers</h3>
                <p>If Bumba's Kitchen is involved in a merger, acquisition, or asset sale, your information may be transferred as part of that transaction. You will be notified if your data becomes subject to a new privacy policy due to a business transfer.</p>
            </div>
            
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground pt-4">4. Data Security</h2>
                <p>We take the security of your information seriously and implement a range of technical and organizational measures to protect your personal data from unauthorized access, loss, or misuse. These measures include:</p>
                <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Encryption:</strong> We use SSL encryption for all payment transactions and sensitive data transmissions.</li>
                    <li><strong>Access Controls:</strong> Only authorized personnel have access to your personal data, and they are bound by confidentiality agreements.</li>
                    <li><strong>Data Minimization:</strong> We collect only the information needed for the specific purposes outlined in this policy.</li>
                </ul>
                <p>Despite these precautions, no system is completely secure. We encourage you to take steps to protect your information, such as using strong passwords and not sharing your account information.</p>
            </div>

            <div className="space-y-2">
                <h2 className="text-2xl font-semibold text-foreground pt-4">5. Your Rights and Choices</h2>
                <p>You have several rights regarding your personal information. These rights include:</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">5.1 Access and Correction</h3>
                <p>You can request access to the personal data we hold about you and ask that we correct any inaccuracies. If you have an account with us, you may also update your information directly by logging in.</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">5.2 Deletion</h3>
                <p>You can request that we delete your personal information, subject to certain legal obligations (e.g., retention for tax or regulatory purposes).</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">5.3 Opt-Out of Marketing Communications</h3>
                <p>You can opt out of receiving promotional communications at any time by following the unsubscribe instructions in our emails or contacting us directly. Please note that we may still send transactional emails related to your orders.</p>
                <h3 className="text-xl font-semibold text-foreground pt-2">5.4 Data Portability</h3>
                <p>Where applicable, you can request a copy of your personal data in a machine-readable format to transfer it to another service.</p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">6. Cookies and Tracking Technologies</h2>
              <p>
                We use cookies and other tracking technologies to enhance your experience on our website and app. Cookies help us understand your preferences, track your orders, and improve our services.
              </p>
              <p>You can control the use of cookies through your browser settings. However, disabling cookies may affect your ability to use certain features of our site.</p>
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">7. Data Retention</h2>
              <p>
                We retain your personal data only for as long as necessary to fulfill the purposes for which it was collected, or to comply with legal, regulatory, or reporting obligations. When your data is no longer needed, we will securely delete or anonymize it.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">8. Children's Privacy</h2>
              <p>
                Bumba's Kitchen does not knowingly collect or store personal information from children under the age of 13. If you believe that a child under 13 has provided us with personal information, please contact us, and we will take appropriate steps to remove such information.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">9. International Data Transfers</h2>
              <p>
                If you are located outside the region where our services are offered, please note that your information may be transferred to and processed in a country that may not have the same data protection laws as your jurisdiction. However, we take steps to ensure your privacy is protected in compliance with applicable laws.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">10. Changes to This Policy</h2>
              <p>
                We may update this Privacy Policy periodically to reflect changes in our practices, technologies, or legal requirements. We will notify you of significant changes by posting the updated policy on our website and updating the effective date. We encourage you to review this policy regularly to stay informed.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground pt-4">11. Contact Us</h2>
              <p>
                If you have any questions, concerns, or requests regarding this Privacy Policy or how we handle your data, please contact us at:
              </p>
              <p>
                Bumba's Kitchen<br />
                Address: Janai , Garbagan , Hooghly<br />
                Email: info.bumbaskitchen@gmail.com<br />
                Phone: +91 82406 90254
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
