import Link from "next/link";
import { ArrowLeft, RefreshCw, ShieldCheck } from "lucide-react";

export default function ReturnPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy mb-2"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Home</span>
      </Link>
      <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
        7-Day Hassle-Free Exchange & Return Policy
      </h1>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-800">1. Our Purity & Softness Guarantee</h3>
        <p>
          At Z&S Textiles, customer peace of mind is our highest priority. If you receive a product with any manufacturing defect, weaving flaw, wrong color, or if you simply find the product does not match the softness described, you are entitled to a replacement or refund within <strong>7 days of parcel receipt</strong>.
        </p>

        <h3 className="text-sm font-bold text-slate-800">2. Conditions for Exchange</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li>Item must be unwashed, unused, and in its original packaging with tags intact.</li>
          <li>For religious Hajj & Umrah Ehrams, the unstitched Shariah seals must not be soiled or used.</li>
          <li>Contact our official WhatsApp helpline at <strong>0325-4622375</strong> with your Order Number and photo proof of the issue.</li>
        </ul>

        <h3 className="text-sm font-bold text-slate-800">3. Exchange Process</h3>
        <p>
          Once verified, our courier will pick up the item or you can dispatch it to our Faisalabad warehouse. Replacement items are dispatched within 24 hours of inspection.
        </p>
      </div>
    </div>
  );
}
