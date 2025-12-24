import Link from 'next/link';
import { AuthProvider } from '@/components/auth/AuthProvider';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex flex-col">
        {/* Simple Header */}
        <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <Link href="/" className="inline-block">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                SeolCoding
              </h1>
            </Link>
          </div>
        </header>

        {/* Centered Content */}
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="w-full max-w-md">{children}</div>
        </main>

        {/* Footer */}
        <footer className="py-6 text-center text-sm text-slate-500">
          &copy; 2024 SeolCoding. All rights reserved.
        </footer>
      </div>
    </AuthProvider>
  );
}
