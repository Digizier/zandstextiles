import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin Portal | Z&S Textiles Faisalabad",
  description: "Secure Management Dashboard for Z&S Textiles",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 antialiased">
      {children}
    </div>
  );
}
