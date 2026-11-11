"use client";

import { ShieldCheck, Truck, RefreshCw, Award, Sparkles, Factory } from "lucide-react";

const TRUST_BADGES = [
  {
    icon: Factory,
    title: "Direct From Faisalabad",
    desc: "Pakistan's Textile Capital",
  },
  {
    icon: Award,
    title: "100% Pure Combed Cotton",
    desc: "Zero Synthetic Blends",
  },
  {
    icon: Truck,
    title: "Cash On Delivery (COD)",
    desc: "Nationwide Safe Delivery",
  },
  {
    icon: RefreshCw,
    title: "7-Day Easy Exchange",
    desc: "100% Satisfaction Guaranteed",
  },
  {
    icon: Sparkles,
    title: "550 - 650 GSM Plush Weave",
    desc: "Ultra Thirsty & Soft",
  },
  {
    icon: ShieldCheck,
    title: "Shariah Compliant Ehrams",
    desc: "Non-See-Through Pure Cotton",
  },
];

export default function BrandsMarquee() {
  return (
    <section className="py-4 sm:py-6 bg-brand-navy-dark text-white overflow-hidden border-y border-brand-gold/30">
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
        <div className="flex gap-6 sm:gap-10 animate-marquee hover:[animation-play-state:paused] whitespace-nowrap py-1">
          {[...TRUST_BADGES, ...TRUST_BADGES].map((badge, idx) => {
            const Icon = badge.icon;
            return (
              <div
                key={idx}
                className="flex items-center gap-3 px-4 py-2 bg-brand-navy/60 rounded-xl border border-brand-gold/20 flex-shrink-0"
              >
                <div className="w-8 h-8 rounded-lg bg-brand-gold/20 text-brand-gold flex items-center justify-center flex-shrink-0">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-left">
                  <p className="text-xs sm:text-sm font-bold text-white tracking-wide">
                    {badge.title}
                  </p>
                  <p className="text-[10px] sm:text-xs text-slate-300">
                    {badge.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
