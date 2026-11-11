"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, Mail, MessageCircle, Send, CheckCircle2 } from "lucide-react";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !message) return;
    const waText = encodeURIComponent(
      `Assalamu Alaikum Z&S Textiles, my name is ${name} (${phone}).\n\nInquiry: ${message}`
    );
    window.open(`https://wa.me/923254622375?text=${waText}`, "_blank");
    setSubmitted(true);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-navy mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home</span>
        </Link>
        <span className="text-xs font-bold text-brand-gold uppercase tracking-widest block">
          Get in Touch
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-brand-navy mt-1">
          Contact Z&S Textiles
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Our Faisalabad customer support and wholesale dispatch team is available 6 days a week (9 AM – 9 PM).
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
        {/* Left: Contact Info */}
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-brand-navy">Factory Dispatch Address</h3>
            <div className="flex items-start gap-2.5 text-xs text-slate-600">
              <MapPin className="w-4 h-4 text-brand-gold flex-shrink-0 mt-0.5" />
              <span>Motorway Valley P-199, Sargodha Road, Faisalabad, Punjab, Pakistan</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-brand-navy">Helpline & WhatsApp</h3>
            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>Mobile Helpline: 0325-4622375 (+92 325 4622375)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>WhatsApp: 0325-4622375</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-brand-gold flex-shrink-0" />
                <span>Email: zandstextiles7@gmail.com</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-2">
            <p className="font-bold">Instant WhatsApp Support</p>
            <p className="text-emerald-700">Need immediate help with parcel delivery or bulk institutional orders?</p>
            <a
              href="https://wa.me/923254622375"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-emerald-600 text-white font-bold py-2 px-4 rounded-lg text-xs"
            >
              Chat on WhatsApp Now
            </a>
          </div>
        </div>

        {/* Right: Message Form */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-brand-navy">Send Us an Inquiry</h3>
          {submitted ? (
            <div className="p-4 bg-emerald-50 rounded-xl text-center space-y-2 text-emerald-800">
              <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
              <p className="text-xs font-bold">Inquiry Sent via WhatsApp!</p>
              <p className="text-[11px]">Our team in Faisalabad will get back to you shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Usman Tariq"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">WhatsApp / Phone Number</label>
                <input
                  type="tel"
                  required
                  placeholder="03XX-XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Message / Question</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ask about product sizing, bulk institutional orders, or order status..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Inquiry</span>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
