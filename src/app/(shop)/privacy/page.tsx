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
            <p>
              Your privacy is important to us. It is Bumba's Kitchen's policy to respect your privacy regarding any information we may collect from you across our website, and other sites we own and operate.
            </p>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">1. Information We Collect</h2>
              <p>
                We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used. This information may include your name, email address, phone number, and delivery address.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">2. How We Use Your Information</h2>
              <p>
                We use the information we collect to process your orders, provide customer support, and improve our services. We may also use your information to send you promotional materials or other communications if you have opted in to receive them.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">3. Security of Your Information</h2>
              <p>
                We take the security of your personal information seriously and use commercially acceptable means to protect it. However, no method of transmission over the Internet or method of electronic storage is 100% secure, and we cannot guarantee its absolute security.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">4. Sharing Your Information</h2>
              <p>
                We do not share any personally identifying information publicly or with third-parties, except when required to by law. We may share your information with our delivery partners for the sole purpose of fulfilling your order.
              </p>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">5. Your Rights</h2>
              <p>
                You are free to refuse our request for your personal information, with the understanding that we may be unable to provide you with some of your desired services. You have the right to access, update, or delete your personal information at any time by contacting us.
              </p>
            </div>

             <div className="space-y-2">
              <h2 className="text-xl font-semibold text-foreground">6. Changes to This Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>

            <p className="pt-4">
              If you have any questions about how we handle user data and personal information, feel free to contact us.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
