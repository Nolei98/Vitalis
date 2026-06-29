import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import { getCurrentUser } from "@/lib/user";

const font = Nunito({ subsets: ["latin"], weight: ["400", "500", "600", "700", "800", "900"] });

export const metadata: Metadata = {
  title: "LifeOS",
  description: "Personal Life Operating System",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  const firstName = (user.name || "você").split(" ")[0];

  return (
    <html lang="pt-BR">
      <body className={`${font.className} antialiased h-screen flex items-center justify-center p-4 md:p-6 overflow-hidden`} style={{ background: 'var(--app-bg)', color: 'var(--text-strong)' }}>
        {/* Centered container wrapper */}
        <div className="flex gap-6 w-full max-w-[1400px] h-full max-h-[900px]">

          <Sidebar userName={firstName} />

          {/* Main Content */}
          <main className="flex-1 w-full overflow-y-auto h-full rounded-[32px] p-2 pr-6 no-scrollbar relative">
            {children}
          </main>

        </div>
      </body>
    </html>
  );
}
