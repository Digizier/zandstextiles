"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Category, Subcategory } from "@/lib/types";
import { getCategories, getSubcategories } from "@/lib/db";
import { X, ChevronDown, ChevronRight, MessageCircle, MapPin, Phone, Package, Info, ShieldCheck } from "lucide-react";

interface CategoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CategoryDrawer({ isOpen, onClose }: CategoryDrawerProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [expandedCat, setExpandedCat] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const [cats, subs] = await Promise.all([getCategories(), getSubcategories()]);
      setCategories(cats);
      setSubcategories(subs);
    }
    load();
  }, []);

  // Prevent background body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.dispatchEvent(new CustomEvent("zs_drawer_state", { detail: { open: true } }));
    } else {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("zs_drawer_state", { detail: { open: false } }));
    }
    return () => {
      document.body.style.overflow = "";
      window.dispatchEvent(new CustomEvent("zs_drawer_state", { detail: { open: false } }));
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const toggleExpand = (catId: string) => {
    setExpandedCat(expandedCat === catId ? null : catId);
  };

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Dark Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-brand-navy-dark/60 backdrop-blur-sm transition-opacity"
      />

      {/* Drawer Container (Left Slide-In) */}
      <div className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-300">
        {/* Header */}
        <div className="p-4 bg-brand-navy text-white flex items-center justify-between border-b border-brand-gold/30">
          <div className="flex items-center gap-2.5">
            <div className="bg-white px-2 py-1 rounded-lg shadow-sm flex items-center justify-center">
              <img
                src="/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp"
                alt="Z&S Textiles"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-bold text-sm tracking-wide block">Z&S TEXTILES</span>
              <span className="text-[10px] text-brand-gold block">Faisalabad Manufacturing</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content (No max-h-64 scroll traps!) */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Main Navigation Links */}
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Browse Collections
            </span>
            <div className="space-y-1">
              <Link
                href="/shop/"
                onClick={onClose}
                className="flex items-center justify-between p-2.5 rounded-lg text-sm font-semibold text-slate-800 hover:bg-slate-50 hover:text-brand-navy"
              >
                <span>All Products</span>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              {categories.map((cat) => {
                const subs = subcategories.filter((s) => s.category_id === cat.id);
                const isExpanded = expandedCat === cat.id;

                return (
                  <div key={cat.id} className="border-b border-slate-100 last:border-none">
                    <div className="flex items-center justify-between">
                      <Link
                        href={`/shop/${cat.slug}/`}
                        onClick={onClose}
                        className="flex-1 py-2.5 px-2 rounded-lg text-sm font-semibold text-slate-800 hover:text-brand-navy"
                      >
                        {cat.name}
                      </Link>
                      {subs.length > 0 && (
                        <button
                          onClick={() => toggleExpand(cat.id)}
                          type="button"
                          className="p-2 text-slate-400 hover:text-brand-navy"
                        >
                          <ChevronDown
                            className={`w-4 h-4 transition-transform duration-200 ${
                              isExpanded ? "rotate-180 text-brand-gold" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {/* Subcategories Dropdown */}
                    {isExpanded && subs.length > 0 && (
                      <div className="pl-4 pb-2 space-y-1 border-l-2 border-brand-gold/40 ml-3 my-1">
                        {subs.map((sub) => (
                          <Link
                            key={sub.id}
                            href={`/shop/${cat.slug}/?sub=${sub.slug}`}
                            onClick={onClose}
                            className="block py-1.5 px-2 text-xs text-slate-600 hover:text-brand-navy font-medium rounded hover:bg-slate-50"
                          >
                            {sub.name}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Services & Order Tracking */}
          <div className="pt-2 border-t border-slate-200">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Customer Services
            </span>
            <div className="space-y-1 text-sm">
              <Link
                href="/track-order/"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Package className="w-4 h-4 text-brand-navy" />
                <span>Track Your Order</span>
              </Link>
              <Link
                href="/about/"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                <Info className="w-4 h-4 text-brand-navy" />
                <span>About Z&S Faisalabad</span>
              </Link>
              <Link
                href="/policies/return-policy/"
                onClick={onClose}
                className="flex items-center gap-2.5 p-2 rounded-lg text-slate-700 hover:bg-slate-50 font-medium"
              >
                <ShieldCheck className="w-4 h-4 text-brand-navy" />
                <span>7-Day Exchange Policy</span>
              </Link>
            </div>
          </div>

          {/* VIP WhatsApp Community Card */}
          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
            <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs">
              <MessageCircle className="w-4 h-4 fill-emerald-600" />
              <span>Official WhatsApp VIP Channel</span>
            </div>
            <p className="text-[11px] text-emerald-700">
              Join for exclusive secret flash discounts, factory deals & fresh arrival drops!
            </p>
            <a
              href="https://whatsapp.com/channel/0029VbDT4sqId7nGeCKOoz43"
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full py-2 text-center bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
            >
              Join VIP Channel
            </a>
          </div>

          {/* Contact Details */}
          <div className="p-3 bg-slate-50 rounded-xl space-y-2 text-xs text-slate-600 border border-slate-200">
            <div className="flex items-start gap-2">
              <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
              <span>Motorway Valley P-199, Sargodha Road, Faisalabad, Pakistan</span>
            </div>
            <div className="flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
              <span>Helpline: 0325-4622375 (+92 325 4622375)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
