import Link from "next/link";
import { ArrowLeft, Award, Factory, ShieldCheck, HeartHandshake, CheckCircle2 } from "lucide-react";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">
          Our Faisalabad Heritage
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-brand-navy mt-1">
          Purity & Luxury in Every Thread
        </h1>
      </div>

      {/* Main Story */}
      <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <p>
          Founded in the world-renowned textile capital of Pakistan—<strong>Faisalabad</strong>—<strong>Z&S Textiles</strong> was born out of a simple manufacturing conviction: Pakistani combed cotton is among the finest, softest, and longest-staple cotton in the world, yet local consumers are often subjected to low-grade synthetic polyester blends or overpriced mall retail markups.
        </p>
        <p>
          We set out to change that by operating a direct-from-manufacturer model. Every single bath towel, hand towel, washcloth, and Terry cotton Hajj & Umrah Ehram in our inventory is spun, woven, and dyed under strict export quality-control standards right at our facility on Sargodha Road, Faisalabad.
        </p>
      </div>

      {/* Pillars Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold">
            <Factory className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy">Faisalabad Manufacturing</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Direct from our looms to your home. Zero trading middlemen means authentic factory pricing and fresh stock.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy">550–650 GSM Density</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Plush, thirsty zero-twist terry loops engineered to absorb moisture 3x faster without leaving lint.
          </p>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <div className="w-10 h-10 rounded-xl bg-brand-gold/20 text-brand-gold flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-brand-navy">Shariah Compliant Ehrams</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Standard 45x90 inches, 100% pure combed cotton unstitched 2-piece sets crafted for total sacred comfort.
          </p>
        </div>
      </div>

      {/* Physical Dispatch Base */}
      <div className="p-6 bg-brand-navy text-white rounded-2xl space-y-2">
        <h3 className="text-base font-bold text-brand-gold">Physical Dispatch Hub & Warehouse</h3>
        <p className="text-xs sm:text-sm text-slate-300">
          Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab, Pakistan.
        </p>
        <p className="text-xs text-slate-400">
          Helpline / WhatsApp: +92 325 4622375 • Email: zandstextiles7@gmail.com
        </p>
      </div>
    </div>
  );
}
