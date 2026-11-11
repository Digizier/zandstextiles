"use client";

import { useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import CategoryDrawer from "./CategoryDrawer";
import CartDrawer from "./CartDrawer";
import MobileBottomNav from "./MobileBottomNav";
import ScrollToTop from "./ScrollToTop";

export default function StorefrontShell({ children }: { children: React.ReactNode }) {
  const [isCategoryDrawerOpen, setIsCategoryDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <>
      <ScrollToTop />
      <Header
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
        isSearchOpen={isSearchOpen}
        setIsSearchOpen={setIsSearchOpen}
      />
      <CategoryDrawer
        isOpen={isCategoryDrawerOpen}
        onClose={() => setIsCategoryDrawerOpen(false)}
      />
      <CartDrawer />
      <main className="min-h-screen bg-slate-50/50">{children}</main>
      <Footer />
      <MobileBottomNav
        onOpenCategoryDrawer={() => setIsCategoryDrawerOpen(true)}
        onOpenSearch={() => setIsSearchOpen(true)}
      />
    </>
  );
}
