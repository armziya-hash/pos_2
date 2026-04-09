import { Metadata } from "next";

export const metadata: Metadata = {
  title: "POS Terminal Checkout",
};

export default function POSLayout({ children }: { children: React.ReactNode }) {
  // No sidebar, pure full screen layout for cashiers
  return (
    <div className="bg-slate-100 min-h-screen text-slate-900 overflow-hidden font-sans">
      {children}
    </div>
  );
}
