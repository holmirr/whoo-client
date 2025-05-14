import "./globals.css";

import Link from "next/link";
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <header className="flex justify-between items-center p-4 w-full">
          <div className="flex-1">
            {/* 左側の空白スペース */}
          </div>
          
          <h1 className="flex-1 text-center">GPS Hacking</h1>
          
          <nav className="flex-1 flex justify-end">
            <ul className="flex gap-4">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/whoo">whoo</Link></li>
              <li><Link href="/contact">Contact</Link></li>
            </ul>
          </nav>
        </header>
        <main>
          {children}
        </main>
        <footer className="flex justify-center items-center p-4 w-full border-t border-gray-300 mt-10">
          <p>© 2025 GPS Hacking</p>
        </footer>
      </body>
    </html>
  );
}
