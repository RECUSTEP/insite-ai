import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import { Provider } from "./_components/provider";

export const runtime = "edge";

const notoSansJp = Noto_Sans_JP({ subsets: ["latin"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: {
    template: "%s | InstagramAI分析システム",
    default: "InstagramAI分析システム",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={notoSansJp.className}>
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
