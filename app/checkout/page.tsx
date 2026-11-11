"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { createOrder, validateCoupon } from "@/lib/db";
import { compressAndUploadImage } from "@/lib/image-compressor";
import confetti from "canvas-confetti";
import {
  ShoppingBag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  ArrowRight,
  Upload,
  MessageCircle,
  Home,
  Building2,
  CreditCard,
  Banknote,
  Tag,
} from "lucide-react";

const PAKISTAN_CITIES = [
  "Faisalabad",
  "Lahore",
  "Karachi",
  "Islamabad",
  "Rawalpindi",
  "Multan",
  "Peshawar",
  "Quetta",
  "Sialkot",
  "Gujranwala",
  "Sargodha",
  "Bahawalpur",
  "Sukkur",
  "Hyderabad",
  "Abbottabad",
  "Mardan",
  "Rahim Yar Khan",
  "Sheikhupura",
  "Jhang",
  "Gujrat",
  "Kasur",
  "Okara",
  "Sahiwal",
  "Wah Cantt",
  "Dera Ghazi Khan",
  "Mirpur (AJK)",
  "Muzaffarabad",
  "Other City",
];

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, cartTotal, clearCart } = useCart();

  // Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [province, setProvince] = useState("Punjab");
  const [city, setCity] = useState("Faisalabad");
  const [address, setAddress] = useState("");
  const [deliveryInstructions, setDeliveryInstructions] = useState("");
  const [deliveryType, setDeliveryType] = useState<"home" | "office">("home");
  const [paymentMethod, setPaymentMethod] = useState<"cod" | "bank_transfer" | "jazzcash" | "easypaisa">("cod");

  // Payment proof upload
  const [paymentProofFile, setPaymentProofFile] = useState<File | null>(null);
  const [isUploadingProof, setIsUploadingProof] = useState(false);
  const [proofUrl, setProofUrl] = useState("");

  // Coupon state
  const [couponCode, setCouponCode] = useState("");
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponStatus, setCouponStatus] = useState("");

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const FREE_SHIPPING_THRESHOLD = 3000;
  const deliveryCharge = cartTotal >= FREE_SHIPPING_THRESHOLD || couponDiscount >= cartTotal ? 0 : 250;
  const grandTotal = Math.max(0, cartTotal - couponDiscount + deliveryCharge);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim()) return;
    const res = await validateCoupon(couponCode, cartTotal);
    if (res.valid) {
      setCouponDiscount(res.discount);
      setCouponStatus(res.message);
    } else {
      setCouponDiscount(0);
      setCouponStatus(res.message);
    }
  };

  const handleProofChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPaymentProofFile(file);
      setIsUploadingProof(true);
      try {
        const { url } = await compressAndUploadImage(file, "proofs", 1200, 1200, 0.8);
        setProofUrl(url);
      } catch (err) {
        console.error("Failed to upload payment proof", err);
      } finally {
        setIsUploadingProof(false);
      }
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setFormError("");

    if (!customerName.trim() || !customerPhone.trim() || !address.trim() || !city.trim()) {
      setFormError("Please fill in your Name, Phone Number, City, and Delivery Address.");
      return;
    }

    setIsSubmitting(true);

    try {
      const orderNumber = `ZS-${Date.now().toString().slice(-6)}`;
      const orderPayload = {
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail || null,
        province,
        city,
        address,
        delivery_instructions: deliveryInstructions || null,
        delivery_type: deliveryType,
        payment_method: paymentMethod,
        payment_proof_url: proofUrl || null,
        payment_status: paymentMethod === "cod" ? ("pending" as const) : ("pending" as const),
        order_status: "pending" as const,
        items: cart,
        subtotal: cartTotal,
        delivery_charge: deliveryCharge,
        discount: couponDiscount,
        coupon_code: couponDiscount > 0 ? couponCode : null,
        total_amount: grandTotal,
      };

      const result = await createOrder(orderPayload);

      if (result.success && result.order) {
        setCompletedOrder(result.order);
        clearCart();
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setFormError(result.error || "Order failed. Please try again or order via WhatsApp: 0325-4622375");
      }
    } catch (err) {
      console.error(err);
      setFormError("An unexpected error occurred. Please contact us on WhatsApp: 0325-4622375");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Order Confirmation Screen
  if (completedOrder) {
    const waText = encodeURIComponent(
      `Assalamu Alaikum Z&S Textiles, I just placed Order #${completedOrder.order_number} for Rs. ${completedOrder.total_amount}.\nName: ${completedOrder.customer_name}\nCity: ${completedOrder.city}\nAddress: ${completedOrder.address}`
    );

    return (
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-16 text-center space-y-6">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-md">
          <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-bold text-brand-gold uppercase tracking-widest">
            Alhamdulillah! Order Placed
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
            Thank You, {completedOrder.customer_name}!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            Your parcel is being prepped at our Faisalabad factory. Order tracking details will be sent via SMS / WhatsApp.
          </p>
        </div>

        {/* Order Receipt Box */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 text-left space-y-4 shadow-sm max-w-lg mx-auto">
          <div className="flex justify-between items-center pb-3 border-b border-slate-100">
            <div>
              <span className="text-[11px] text-slate-400 block">Order Number</span>
              <span className="font-extrabold text-base text-brand-navy">
                {completedOrder.order_number}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Payable</span>
              <span className="font-black text-base text-emerald-600">
                Rs. {completedOrder.total_amount.toLocaleString()} ({completedOrder.payment_method.toUpperCase()})
              </span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-slate-600">
            <p><strong>Recipient:</strong> {completedOrder.customer_name} ({completedOrder.customer_phone})</p>
            <p><strong>Shipping Address:</strong> {completedOrder.address}, {completedOrder.city}, {completedOrder.province}</p>
            <p><strong>Delivery Method:</strong> Nationwide Courier (TCS / Leopards)</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <a
            href={`https://wa.me/923254622375?text=${waText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <MessageCircle className="w-4 h-4 fill-white" />
            <span>Send Confirmation on WhatsApp</span>
          </a>

          <Link
            href="/track-order/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold py-3 px-6 rounded-xl text-xs sm:text-sm shadow-md transition-all"
          >
            <span>Track Parcel Status</span>
          </Link>
        </div>
      </div>
    );
  }

  // Empty Bag Redirect
  if (cart.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-800">Your bag is empty</h1>
        <p className="text-xs text-slate-500">Please add towels or Hajj/Umrah Ehram sets before proceeding to checkout.</p>
        <Link href="/shop/" className="inline-block bg-brand-navy text-white text-xs font-bold py-2.5 px-6 rounded-xl">
          Browse Collections
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-black text-brand-navy">
          1-Page Fast Checkout
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Cash On Delivery nationwide • Dispatched directly from Faisalabad
        </p>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8">
        {/* Left Form: Delivery & Payment Details (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Address Delivery Type Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">1</span>
              <span>Delivery Address & Contact</span>
            </h2>

            {/* Delivery Type Cards */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType("home")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  deliveryType === "home"
                    ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-bold ring-1 ring-brand-navy"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Home className="w-4 h-4 text-brand-navy" />
                <span className="text-xs">Home Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType("office")}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  deliveryType === "office"
                    ? "border-brand-navy bg-brand-navy/5 text-brand-navy font-bold ring-1 ring-brand-navy"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Building2 className="w-4 h-4 text-brand-navy" />
                <span className="text-xs">Office / Commercial</span>
              </button>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Muhammad Ali"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Mobile Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="0325-1234567"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Email Address (Optional)
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    City (Pakistan) *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy font-medium"
                  >
                    {PAKISTAN_CITIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Province *
                  </label>
                  <select
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy font-medium"
                  >
                    <option value="Punjab">Punjab</option>
                    <option value="Sindh">Sindh</option>
                    <option value="Khyber Pakhtunkhwa">Khyber Pakhtunkhwa (KPK)</option>
                    <option value="Balochistan">Balochistan</option>
                    <option value="Islamabad Capital Territory">Islamabad Capital</option>
                    <option value="Azad Jammu & Kashmir">Azad Kashmir</option>
                    <option value="Gilgit-Baltistan">Gilgit-Baltistan</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Complete Street Address / House / Shop # *
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="House #, Street #, Sector / Area, Landmark"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Special Delivery Instructions (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call before delivery, deliver after 2 PM"
                  value={deliveryInstructions}
                  onChange={(e) => setDeliveryInstructions(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:border-brand-navy"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-brand-navy text-white text-xs flex items-center justify-center font-bold">2</span>
              <span>Payment Method</span>
            </h2>

            <div className="space-y-2.5">
              {/* Cash On Delivery (COD) */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "cod"
                    ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "cod"}
                  onChange={() => setPaymentMethod("cod")}
                  className="mt-0.5 text-brand-navy focus:ring-brand-navy"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800">Cash On Delivery (COD)</span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Recommended</span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">Pay safely in cash to the TCS / Leopards courier at your doorstep.</p>
                </div>
              </label>

              {/* Direct Bank Transfer */}
              <label
                className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                  paymentMethod === "bank_transfer"
                    ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  checked={paymentMethod === "bank_transfer"}
                  onChange={() => setPaymentMethod("bank_transfer")}
                  className="mt-0.5 text-brand-navy focus:ring-brand-navy"
                />
                <div className="flex-1">
                  <span className="text-xs font-bold text-slate-800">Direct Bank Transfer (Meezan Bank)</span>
                  <p className="text-[11px] text-slate-500 mt-0.5">Transfer via online banking or ATM, then upload screenshot receipt.</p>
                </div>
              </label>

              {/* JazzCash / EasyPaisa */}
              <div className="grid grid-cols-2 gap-2.5">
                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "jazzcash"
                      ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "jazzcash"}
                    onChange={() => setPaymentMethod("jazzcash")}
                    className="text-brand-navy"
                  />
                  <span className="text-xs font-bold text-slate-800">JazzCash</span>
                </label>

                <label
                  className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    paymentMethod === "easypaisa"
                      ? "border-brand-navy bg-brand-navy/5 ring-1 ring-brand-navy"
                      : "border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    checked={paymentMethod === "easypaisa"}
                    onChange={() => setPaymentMethod("easypaisa")}
                    className="text-brand-navy"
                  />
                  <span className="text-xs font-bold text-slate-800">EasyPaisa</span>
                </label>
              </div>

              {/* Account Details & Screenshot Upload if non-COD */}
              {paymentMethod !== "cod" && (
                <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-2">
                  <div className="space-y-1">
                    <p className="font-bold">Account Details for Transfer:</p>
                    {paymentMethod === "bank_transfer" && (
                      <p className="font-mono text-[11px]">Bank: Meezan Bank | Title: Z&S Textiles | A/C: 03254622375</p>
                    )}
                    {paymentMethod === "jazzcash" && (
                      <p className="font-mono text-[11px]">JazzCash Account: 0325-4622375 | Title: Z&S Textiles</p>
                    )}
                    {paymentMethod === "easypaisa" && (
                      <p className="font-mono text-[11px]">EasyPaisa Account: 0325-4622375 | Title: Z&S Textiles</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-amber-950 mb-1">
                      Upload Payment Screenshot / Receipt:
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProofChange}
                      className="text-xs text-slate-600 file:mr-2 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-amber-200 file:text-amber-900 hover:file:bg-amber-300"
                    />
                    {isUploadingProof && <p className="text-[10px] text-amber-700 mt-1">Compressing & uploading WebP proof...</p>}
                    {proofUrl && <p className="text-[10px] text-emerald-700 font-bold mt-1">✓ Receipt uploaded successfully!</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Summary: Items & Total (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4 sticky top-20">
            <h2 className="text-sm font-bold text-slate-800 flex items-center justify-between pb-3 border-b border-slate-100">
              <span>Order Summary ({cart.length})</span>
              <span className="text-xs text-brand-navy font-semibold">Faisalabad Dispatch</span>
            </h2>

            {/* Order Items */}
            <div className="space-y-3 max-h-60 overflow-y-auto divide-y divide-slate-100 pr-1">
              {cart.map((item, idx) => (
                <div key={idx} className="pt-2.5 first:pt-0 flex items-center gap-3">
                  <img
                    src={item.image_url}
                    alt={item.title}
                    className="w-12 h-14 object-cover rounded-lg bg-slate-100 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-800 truncate">{item.title}</p>
                    <p className="text-[11px] text-slate-500">{item.size} • Qty: {item.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-brand-navy">
                    Rs. {(item.price * item.quantity).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Coupon Code Field */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Coupon (e.g. WELCOME10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-lg uppercase"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold px-3 py-2 rounded-lg"
                >
                  Apply
                </button>
              </div>
              {couponStatus && (
                <p className={`text-[11px] font-semibold mt-1 ${couponDiscount > 0 ? "text-emerald-600" : "text-red-500"}`}>
                  {couponStatus}
                </p>
              )}
            </div>

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>Rs. {cartTotal.toLocaleString()}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 font-semibold">
                  <span>Coupon Discount</span>
                  <span>- Rs. {couponDiscount.toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Nationwide Shipping</span>
                <span className="font-semibold text-brand-navy">
                  {deliveryCharge === 0 ? "FREE" : `Rs. ${deliveryCharge}`}
                </span>
              </div>
              <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>Grand Total</span>
                <span className="text-brand-navy">Rs. {grandTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Inline Error Message (No Browser Alerts) */}
            {formError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3.5 py-2.5 rounded-xl text-xs font-semibold">
                {formError}
              </div>
            )}

            {/* Submit Order Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-black py-3.5 px-4 rounded-xl text-sm shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>Placing Your Order...</span>
              ) : (
                <>
                  <span>Confirm Order (Rs. {grandTotal.toLocaleString()})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Safe Shopping Guarantee */}
            <div className="pt-2 flex items-center justify-center gap-2 text-[11px] text-slate-500 text-center">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>100% Cotton Authenticity Guaranteed • 7-Day Exchange</span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
