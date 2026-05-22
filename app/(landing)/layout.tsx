import Navbar from "./_components/Navbar";
import SmoothScroll from "@/components/SmoothScroll/SmoothScroll";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* OUTSIDE smooth wrapper */}
      <Navbar />

      {/* INSIDE smooth scrolling */}
      <SmoothScroll>
        {children}
      </SmoothScroll>
    </>
  );
}