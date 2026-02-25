import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Expense Tracker",
  description: "Modern, professional personal expense tracking application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-slate-50 text-slate-900 min-h-screen`}>
        <div className="flex min-h-screen flex-col">
          <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
            <div className="container mx-auto flex h-16 items-center px-4 md:px-6">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
                  <span className="font-bold text-lg leading-none">E</span>
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900">
                  Expense<span className="text-indigo-600">Tracker</span>
                </span>
              </div>
            </div>
          </header>
          <main className="flex-1">
            <div className="container mx-auto px-4 md:px-6 py-8">
              {children}
            </div>
          </main>
          <footer className="border-t border-slate-200 bg-white py-6 mt-auto">
            <div className="container mx-auto flex flex-col items-center justify-between gap-4 md:flex-row px-4 md:px-6">
              <p className="text-sm text-slate-500">
                &copy; {new Date().getFullYear()} Expense Tracker. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
