import { Logo } from "@/components/shared/Logo";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-secondary/50 p-4">
      <div className="mb-8">
        <Logo />
      </div>
      {children}
    </div>
  );
}
