import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mi colección",
  description: "Colección digital personal de películas y publicaciones.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body>{children}</body>
    </html>
  );
}
