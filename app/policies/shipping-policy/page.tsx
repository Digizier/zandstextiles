import Link from "next/link";
import { ArrowLeft, Truck, Clock, ShieldCheck } from "lucide-react";

export default function ShippingPolicyPage() {
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
        Shipping & Delivery Policy
      </h1>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
        <h3 className="text-sm font-bold text-slate-800">1. Nationwide Dispatch Hub</h3>
        <p>
          All parcels are packed and dispatched directly from our manufacturing and logistics facility located at Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab.
        </p>

        <h3 className="text-sm font-bold text-slate-800">2. Delivery Charges</h3>
        <p>
          Standard Nationwide Shipping fee is <strong>Rs. 250</strong> per order. All orders with a subtotal of <strong>Rs. 3,000 or more</strong> qualify for <strong>100% FREE Nationwide Delivery</strong>.
        </p>

        <h3 className="text-sm font-bold text-slate-800">3. Estimated Delivery Timelines</h3>
        <ul className="list-disc pl-5 space-y-1">
          <li><strong>Punjab (Lahore, Faisalabad, Rawalpindi, Islamabad, Multan, Gujranwala):</strong> 1–2 Working Days.</li>
          <li><strong>Sindh (Karachi, Hyderabad, Sukkur):</strong> 2–3 Working Days.</li>
          <li><strong>KPK & Northern Areas (Peshawar, Mardan, Abbottabad):</strong> 2–3 Working Days.</li>
          <li><strong>Balochistan (Quetta, Gwadar) & AJK:</strong> 3–5 Working Days.</li>
        </ul>

        <h3 className="text-sm font-bold text-slate-800">4. Courier Partners</h3>
        <p>
          We partner with Pakistan's premier courier networks including TCS, Leopards Courier, Trax, and PostEx to ensure safe Cash On Delivery handling.
        </p>
      </div>
    </div>
  );
}
