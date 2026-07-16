import type { Metadata } from "next";
import "./globals.css";

import { ToastContainer } from "react-toastify";

export const metadata: Metadata = {
  title: "PaisaTracker",
  description: "Finance tracking platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="dark"
    >
      <body className="bg-black text-white ">
        {children}
        <ToastContainer position="bottom-right" />
      </body>
    </html>
  );
}
