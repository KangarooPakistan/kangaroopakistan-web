import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ModalProvider } from "@/components/providers/modal-provider";
import AuthRedirect from "./components/AuthRedirect";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "School Login KSF Pakistan",
  description: "Owned by KSF Pakistan",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ModalProvider />
          <AuthRedirect />
          {children}
        </Providers>
      </body>
    </html>
  );
}
