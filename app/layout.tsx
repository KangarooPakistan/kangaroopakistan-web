import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { ModalProvider } from "@/components/providers/modal-provider";
import Head from "next/head";

import AuthRedirect from "./components/AuthRedirect";
import GoogleTM from "./components/GoogleTM";

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
      <Head>
        <GoogleTM containerId="GTM-P4G559T8" />
      </Head>
      <body className={inter.className}>
        {/* <!-- Google Tag Manager (noscript) --> */}
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-P4G559T8"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}></iframe>
        </noscript>
        {/* <!-- End Google Tag Manager (noscript) --> */}
        <Providers>
          <ModalProvider />
          <AuthRedirect />
          {children}
        </Providers>
      </body>
    </html>
  );
}
