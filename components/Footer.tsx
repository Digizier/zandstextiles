"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail, MessageCircle, ShieldCheck, Truck, Sparkles } from "lucide-react";

export default function Footer() {
  const pathname = usePathname();

  // Don't render storefront footer in admin panel
  if (pathname.startsWith("/admin")) return null;

  return (
    <footer className="bg-brand-navy-dark text-slate-300 border-t border-brand-gold/20 pt-6 sm:pt-8 pb-20 md:pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-5 sm:gap-8 pb-6 sm:pb-8 border-b border-slate-800">
          {/* Col 1: Brand & Factory Heritage */}
          <div className="space-y-3 md:col-span-1">
            <Link href="/" className="inline-block bg-white px-3 py-1.5 rounded-xl shadow-sm">
              <img
                src="/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp"
                alt="Z&S Textiles - Feel the Softness"
                className="h-9 sm:h-10 w-auto object-contain"
              />
            </Link>
            <p className="text-xs text-slate-400 leading-relaxed">
              Export-quality 100% combed cotton bath towels, luxury linens, and pure cotton Terry Hajj & Umrah Ehrams dispatched directly from the textile capital of Pakistan (Faisalabad).
            </p>
            <div className="pt-1">
              <a
                href="https://whatsapp.com/channel/0029VbDT4sqId7nGeCKOoz43"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-gold hover:text-white transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Join Official WhatsApp VIP Channel</span>
              </a>
            </div>
          </div>

          {/* Col 2 & 3: Mobile 2-Column Links Group (Towels & Collections) */}
          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            {/* Quick Collections */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider mb-3 text-brand-gold">
                Collections
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/shop/towels/" className="hover:text-white transition-colors">
                    Bath Towels (600 GSM)
                  </Link>
                </li>
                <li>
                  <Link href="/shop/towels/" className="hover:text-white transition-colors">
                    Hand & Face Towels
                  </Link>
                </li>
                <li>
                  <Link href="/shop/towels/" className="hover:text-white transition-colors">
                    Family 3-Piece Bundles
                  </Link>
                </li>
                <li>
                  <Link href="/shop/ehram/" className="hover:text-white transition-colors">
                    Hajj & Umrah Ehrams
                  </Link>
                </li>
                <li>
                  <Link href="/shop/ehram/" className="hover:text-white transition-colors">
                    Pilgrim Combos & Belts
                  </Link>
                </li>
                <li>
                  <Link href="/shop/bedding/" className="hover:text-white transition-colors">
                    Luxury Bedding Sets
                  </Link>
                </li>
              </ul>
            </div>

            {/* Customer Care & Policies */}
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider mb-3 text-brand-gold">
                Customer Care
              </h4>
              <ul className="space-y-2 text-xs">
                <li>
                  <Link href="/track-order/" className="hover:text-white transition-colors">
                    Track Your Parcel
                  </Link>
                </li>
                <li>
                  <Link href="/about/" className="hover:text-white transition-colors">
                    About Z&S Faisalabad
                  </Link>
                </li>
                <li>
                  <Link href="/policies/shipping-policy/" className="hover:text-white transition-colors">
                    Shipping & Delivery
                  </Link>
                </li>
                <li>
                  <Link href="/policies/return-policy/" className="hover:text-white transition-colors">
                    7-Day Exchange Policy
                  </Link>
                </li>
                <li>
                  <Link href="/contact/" className="hover:text-white transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link href="/admin/" className="text-slate-500 hover:text-slate-400 transition-colors">
                    Staff Portal
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Col 4: Faisalabad Factory Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider text-brand-gold">
              Factory Dispatch Hub
            </h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <MapPin className="w-3.5 h-3.5 text-brand-gold flex-shrink-0 mt-0.5" />
                <span>Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab, Pakistan</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>Helpline: 0325-4622375</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>WhatsApp: +92 325 4622375</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-brand-gold flex-shrink-0" />
                <span>zandstextiles7@gmail.com</span>
              </div>
            </div>

            {/* Courier Dispatch Partners */}
            <div className="pt-2">
              <p className="text-[11px] text-slate-400 font-semibold mb-1">
                Nationwide Courier Dispatch:
              </p>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-bold text-slate-300">
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">TCS</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Leopards</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">Trax</span>
                <span className="bg-slate-800 px-2 py-0.5 rounded border border-slate-700">PostEx</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Payment Badges */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} Z&S TEXTILES (zandstextiles.com). All rights reserved.</p>
          <div className="flex items-center gap-2 text-[11px] font-medium text-slate-400">
            <span>Cash On Delivery</span>
            <span>•</span>
            <span>Meezan Bank</span>
            <span>•</span>
            <span>JazzCash</span>
            <span>•</span>
            <span>EasyPaisa</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
