import type { Metadata } from "next";
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import "../../index.css";
import Providers from "@/components/providers";
import {cn} from "@/lib/utils";
import localFont from 'next/font/local';

const Hack = localFont({
  src: [
    {
      path: '../../font/fonts/hack-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../font/fonts/hack-italic.woff2',
      weight: '400',
      style: 'italic',
    },
    {
      path: '../../font/fonts/hack-bold.woff2',
      weight: '700',
      style: 'normal',
    },
    {
      path: '../../font/fonts/hack-bolditalic.woff2',
      weight: '700',
      style: 'italic',
    },
  ],
})

export const metadata: Metadata = {
  title: "BWitek.dev",
  appleWebApp: {
    title: 'BWitek.dev',
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
};

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{locale: string}>;
}>) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          Hack.className
        )}
      >
        <Providers>
            <NextIntlClientProvider>
                {children}
            </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
