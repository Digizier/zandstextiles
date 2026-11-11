"use client";

import { Order, SiteSettings } from "@/lib/types";
import { Printer, X } from "lucide-react";

interface Props {
  order: Order;
  settings: SiteSettings;
  onClose: () => void;
}

export default function PrintableInvoice({ order, settings, onClose }: Props) {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      {/* Container */}
      <div className="bg-white text-black w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Actions bar (Hidden in print) */}
        <div className="no-print bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-slate-700" />
            <span className="font-bold text-sm text-slate-800">Print Official Tax & Courier Invoice</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2 px-4 rounded-lg flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* The Printable Invoice Canvas */}
        <div id="printable-invoice" className="p-8 sm:p-10 bg-white text-black space-y-6">
          {/* Header */}
          <div className="flex justify-between items-start border-b border-black/20 pb-6">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-black">Z&S TEXTILES</h1>
              <p className="text-xs text-slate-600 mt-0.5 font-medium">Export Quality Home & Religious Linens</p>
              <p className="text-xs text-slate-600">Dispatch Hub: Motorway Valley P-199, Sargodha Road, Faisalabad</p>
              <p className="text-xs text-slate-600">Helpline: +92 325 4622375 • Email: zandstextiles7@gmail.com</p>
            </div>
            <div className="text-right">
              <span className="inline-block bg-black text-white text-xs font-bold px-3 py-1 rounded">
                PARCEL DISPATCH INVOICE
              </span>
              <p className="text-xs text-slate-500 mt-2">Invoice #: <strong>{order.order_number}</strong></p>
              <p className="text-xs text-slate-500">Date: {order.created_at ? new Date(order.created_at).toLocaleDateString() : new Date().toLocaleDateString()}</p>
              <p className="text-xs text-slate-500">Payment: <strong>{order.payment_method.toUpperCase()}</strong></p>
            </div>
          </div>

          {/* Customer & Courier Details */}
          <div className="grid grid-cols-2 gap-6 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                DELIVER TO RECIPIENT:
              </span>
              <p className="font-bold text-sm text-black">{order.customer_name}</p>
              <p className="text-slate-700">Phone / WhatsApp: <strong>{order.customer_phone}</strong></p>
              <p className="text-slate-700 mt-1">{order.address}</p>
              <p className="text-slate-700 font-bold">{order.city}, {order.province}</p>
            </div>
            <div>
              <span className="font-bold text-slate-500 uppercase tracking-wider block mb-1">
                DISPATCH & CARRIER ROUTING:
              </span>
              <p className="text-slate-700">Dispatch Origin: <strong>Faisalabad Hub</strong></p>
              <p className="text-slate-700">Courier: <strong>TCS / Leopards / Trax</strong></p>
              <p className="text-slate-700">Delivery Instructions: {order.delivery_instructions || "Standard Delivery"}</p>
              <p className="text-slate-700 font-bold mt-1">Payment Status: {order.payment_status.toUpperCase()}</p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="border border-black/20 rounded-xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 border-b border-black/20 text-black font-bold">
                <tr>
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Item Description</th>
                  <th className="py-2.5 px-3">Size & Color</th>
                  <th className="py-2.5 px-3 text-center">Qty</th>
                  <th className="py-2.5 px-3 text-right">Price (PKR)</th>
                  <th className="py-2.5 px-3 text-right">Total (PKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50">
                    <td className="py-2.5 px-3 text-slate-500">{idx + 1}</td>
                    <td className="py-2.5 px-3 font-semibold text-black">{item.title}</td>
                    <td className="py-2.5 px-3 text-slate-600">{item.size} • {item.color}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-black">{item.quantity}</td>
                    <td className="py-2.5 px-3 text-right">Rs. {item.price.toLocaleString()}</td>
                    <td className="py-2.5 px-3 text-right font-bold">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="flex justify-end text-xs">
            <div className="w-64 space-y-1.5 text-right">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>Rs. {order.subtotal.toLocaleString()}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Discount ({order.coupon_code || "Promo"}):</span>
                  <span>- Rs. {order.discount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-600">
                <span>Courier Shipping Fee:</span>
                <span>{order.delivery_charge === 0 ? "FREE" : `Rs. ${order.delivery_charge}`}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-black pt-2 border-t border-black/20">
                <span>Total Net Payable:</span>
                <span>Rs. {order.total_amount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Return & Warranty Policy */}
          <div className="pt-4 border-t border-slate-200 text-[10px] text-slate-500 space-y-1">
            <p className="font-bold text-black">Z&S Textiles Official Exchange Guarantee:</p>
            <p>
              All items are covered under our 7-Day Hassle-Free Exchange Policy. If you find any manufacturing defect, contact our official helpline at <strong>0325-4622375</strong> within 7 days.
            </p>
            <p className="text-center pt-3 text-slate-400">
              Thank you for trusting Faisalabad's finest 100% combed cotton craftsmanship!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
