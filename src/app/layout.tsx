import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { publicEnv } from "@/shared/config";
import { AppProviders } from "@/shared/providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  // `vietnamese`: chữ có dấu không bị rơi về font hệ thống.
  subsets: ["latin", "vietnamese"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "vietnamese"],
});

/** Trang con chỉ đặt `title` ngắn — template thêm "| AgriPedia"; URL tương đối (canonical, OG) theo `metadataBase`. */
export const metadata: Metadata = {
  metadataBase: new URL(publicEnv.siteUrl),
  title: { default: "AgriPedia", template: "%s | AgriPedia" },
  description:
    "AgriPedia — chẩn đoán bệnh cây trồng bằng ảnh, bài viết về bệnh hại cây trồng và kết nối nhà phân phối vật tư nông nghiệp.",
  applicationName: "AgriPedia",
  openGraph: { siteName: "AgriPedia", locale: "vi_VN", type: "website" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
