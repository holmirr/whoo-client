import "./globals.css";

import Link from "next/link";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="h-screen flex flex-col">
        <header className="flex justify-between items-center p-4 mb-1 w-full bg-gray-100 shadow-sm relative">
          <div className="flex-1 text-center sm:text-left absolute left-1/2 -translate-x-1/2">
            <Link href="/" className="font-bold text-lg sm:text-xl hover:text-blue-600 transition-colors">
              GPS Hacking
            </Link>
          </div>
          
          <nav className="flex-1 flex justify-end">
            <ul className="flex gap-2 sm:gap-6 text-sm sm:text-base">
              <li><Link href="/" className="hover:text-blue-600 transition-colors">ホーム</Link></li>
              <li><Link href="/about" className="hover:text-blue-600 transition-colors">概要</Link></li>
              <li><Link href="/contact" className="hover:text-blue-600 transition-colors">お問い合わせ</Link></li>
            </ul>
          </nav>
        </header>
        <main className="flex-1">
          {children}
        </main>
      </body>
    </html>
  );
}
