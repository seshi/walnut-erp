import type { Metadata } from "next";
import "./globals.css";
import { SideNav } from "@/components/layout/side-nav";

export const metadata: Metadata = {
  title: "Walnut Studios ERP",
  description: "Manufacturing operations platform for Walnut Studios",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <div className="flex h-screen overflow-hidden">
          <SideNav />
          <main className="flex-1 overflow-y-auto bg-stone-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
