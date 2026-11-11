"use client";

import { useState } from "react";
import Link from "next/link";
import { trackOrder } from "@/lib/db";
import { Order } from "@/lib/types";
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, ArrowLeft, MessageCircle } from "lucide-react";

export default function TrackOrderPage() {
  const [query, setQuery] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setHasSearched(true);
    const results = await trackOrder(query);
    setOrders(results);
    setLoading(false);
  };

  const getStatusStep = (status: Order["order_status"]) => {
    switch (status) {
      case "pending": return 1;
      case "confirmed": return 2;
      case "processing": return 3;
      case "shipped": return 4;
      case "delivered": return 5;
      case "cancelled": return -1;
      default: return 1;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
          Track Your Parcel
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
          Enter your Order Number (e.g. ZS-123456) or your active Mobile Number used during checkout.
        </p>
      </div>

      {/* Search Box */}
      <div className="max-w-xl mx-auto">
        <form onSubmit={handleTrack} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              required
              placeholder="Enter Order # or 03XX-XXXXXXX"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 text-xs sm:text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy shadow-sm uppercase font-semibold"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl shadow-md transition-colors"
          >
            {loading ? "Searching..." : "Track"}
          </button>
        </form>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <h3 className="font-bold text-slate-800 text-sm">No Orders Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                We could not find any orders matching "{query}". Please double-check your Order Number or contact WhatsApp helpline.
              </p>
              <a
                href="https://wa.me/923254622375"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2 px-4 rounded-lg mt-2"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Ask on WhatsApp (0325-4622375)</span>
              </a>
            </div>
          ) : (
            orders.map((order) => {
              const step = getStatusStep(order.order_status);
              return (
                <div key={order.id || order.order_number} className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-sm space-y-6">
                  {/* Top Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-[11px] font-bold text-brand-gold uppercase tracking-wider block">
                        Faisalabad Factory Dispatch
                      </span>
                      <h3 className="text-base sm:text-lg font-black text-brand-navy">
                        Order #{order.order_number}
                      </h3>
                      <p className="text-xs text-slate-500">
                        Placed on {order.created_at ? new Date(order.created_at).toLocaleDateString() : "Recent"}
                      </p>
                    </div>
                    <div className="text-left sm:text-right">
                      <span className="text-xs text-slate-400 block">Total COD Amount</span>
                      <span className="text-lg font-black text-emerald-600">
                        Rs. {order.total_amount.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Status Progress Bar */}
                  {order.order_status === "cancelled" ? (
                    <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-bold text-center">
                      This order was Cancelled. Please contact helpline for reactivation.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <div className="grid grid-cols-4 text-center text-[10px] sm:text-xs font-bold">
                        <span className={step >= 1 ? "text-brand-navy" : "text-slate-400"}>Pending</span>
                        <span className={step >= 2 ? "text-brand-navy" : "text-slate-400"}>Confirmed</span>
                        <span className={step >= 4 ? "text-brand-navy" : "text-slate-400"}>Dispatched (TCS)</span>
                        <span className={step >= 5 ? "text-emerald-600" : "text-slate-400"}>Delivered</span>
                      </div>
                      <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-brand-navy rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, (step / 5) * 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Order Details & Delivery info */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-600 pt-2 border-t border-slate-100">
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Customer Delivery Info:</h4>
                      <p><strong>Name:</strong> {order.customer_name}</p>
                      <p><strong>Phone:</strong> {order.customer_phone}</p>
                      <p><strong>Address:</strong> {order.address}, {order.city}, {order.province}</p>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 mb-1">Items In Parcel:</h4>
                      <ul className="space-y-1">
                        {order.items.map((it, idx) => (
                          <li key={idx}>
                            • {it.title} (x{it.quantity}) - {it.size}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
