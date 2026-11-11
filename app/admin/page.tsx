"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  adminGetProducts,
  adminSaveProduct,
  adminDeleteProduct,
  adminGetCategories,
  adminSaveCategory,
  adminDeleteCategory,
  adminGetSubcategories,
  adminSaveSubcategory,
  adminDeleteSubcategory,
  adminGetBanners,
  adminSaveBanner,
  adminDeleteBanner,
  adminGetOrders,
  adminUpdateOrderStatus,
  adminDeleteOrder,
  adminSaveSiteSettings,
  adminGetCoupons,
  adminSaveCoupon,
  adminDeleteCoupon,
} from "@/lib/admin-db";
import { getSiteSettings } from "@/lib/db";
import { Product, Category, Subcategory, Banner, Order, SiteSettings, Coupon } from "@/lib/types";
import { compressAndUploadImage } from "@/lib/image-compressor";
import PrintableInvoice from "@/components/PrintableInvoice";
import {
  Package,
  Layers,
  ShoppingBag,
  Sliders,
  Image as ImageIcon,
  Tag,
  Key,
  Eye,
  EyeOff,
  LogOut,
  RefreshCw,
  Download,
  Plus,
  Trash2,
  Edit,
  Printer,
  CheckCircle2,
  X,
  Upload,
  Search,
  ExternalLink,
  Shield,
  Menu,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState("");

  // Master Hard Password (loaded at build time from environment configuration)
  const MASTER_PIN = process.env.NEXT_PUBLIC_ADMIN_PIN || "";

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<
    "overview" | "products" | "categories" | "orders" | "banners" | "settings" | "coupons"
  >("overview");

  // Live Data States
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // In-App Toast State (Zero "localhost says" alert popups!)
  const [toastMessage, setToastMessage] = useState("");

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  // Check Local Auth Session
  useEffect(() => {
    const session = sessionStorage.getItem("zs_admin_session");
    if (session === "authenticated") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch All Admin Data
  const refreshAllData = async (silent = false) => {
    if (!silent) setIsSyncing(true);
    try {
      const [p, c, s, b, o, cp, set] = await Promise.all([
        adminGetProducts(),
        adminGetCategories(),
        adminGetSubcategories(),
        adminGetBanners(),
        adminGetOrders(),
        adminGetCoupons(),
        getSiteSettings(),
      ]);
      setProducts(p);
      setCategories(c);
      setSubcategories(s);
      setBanners(b);
      setOrders(o);
      setCoupons(cp);
      setSettings(set);
    } catch (err) {
      console.error("Error refreshing admin data:", err);
    } finally {
      if (!silent) setIsSyncing(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshAllData();
      // 30-Second Silent Background Auto-Sync
      const timer = setInterval(() => {
        refreshAllData(true);
      }, 30000);
      return () => clearInterval(timer);
    }
  }, [isAuthenticated]);

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!MASTER_PIN) {
      setAuthError("Admin Security Password is not configured in environment variables.");
      return;
    }
    if (passwordInput === MASTER_PIN) {
      setIsAuthenticated(true);
      sessionStorage.setItem("zs_admin_session", "authenticated");
      setAuthError("");
    } else {
      setAuthError("Incorrect Admin Security Password. Access Denied.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("zs_admin_session");
  };

  // CSV Product Export Function
  const handleExportProductsCSV = () => {
    if (products.length === 0) {
      showToast("No products available to export.");
      return;
    }

    const headers = [
      "ID",
      "Title",
      "Slug",
      "SKU",
      "Price",
      "Sale_Price",
      "Stock",
      "Fabric_Material",
      "GSM",
      "Size_Dimensions",
      "Colors",
      "Category",
      "Flash_Deal",
      "Cover_Image_URL",
    ];

    const rows = products.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.slug,
      p.sku || "",
      p.price,
      p.sale_price || "",
      p.stock,
      `"${(p.fabric_material || "").replace(/"/g, '""')}"`,
      `"${(p.gsm || "").replace(/"/g, '""')}"`,
      `"${(p.size_dimensions || "").replace(/"/g, '""')}"`,
      `"${(p.colors || []).join(", ")}"`,
      `"${(p.category?.name || "").replace(/"/g, '""')}"`,
      p.is_flash_deal ? "Yes" : "No",
      p.cover_image,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `zandstextiles_products_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast("Products CSV spreadsheet exported successfully!");
  };

  // Sub-Modals State
  const [editingProduct, setEditingProduct] = useState<Partial<Product> | null>(null);
  const [editingCategory, setEditingCategory] = useState<Partial<Category> | null>(null);
  const [editingSubcategory, setEditingSubcategory] = useState<Partial<Subcategory> | null>(null);
  const [editingBanner, setEditingBanner] = useState<Partial<Banner> | null>(null);
  const [editingCoupon, setEditingCoupon] = useState<Partial<Coupon> | null>(null);
  const [activeInvoiceOrder, setActiveInvoiceOrder] = useState<Order | null>(null);
  const [viewingProofUrl, setViewingProofUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [bannerError, setBannerError] = useState("");
  const [confirmDialog, setConfirmDialog] = useState<{
    title: string;
    message: string;
    confirmLabel?: string;
    onConfirm: () => Promise<void>;
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  // -------------------------------------------------------------
  // 1. AUTH LOGIN SCREEN
  // -------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl space-y-6 text-center">
          <div className="space-y-3">
            <div className="inline-flex items-center justify-center bg-white px-4 py-2 rounded-2xl shadow-md mx-auto">
              <img
                src="/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp"
                alt="Z&S Textiles"
                className="h-12 w-auto object-contain"
              />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white">
              Z&S Textiles Control Hub
            </h1>
            <p className="text-xs text-slate-400">
              Faisalabad Factory Management & Orders Portal
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Admin Security Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="Enter secure password..."
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl px-4 py-3 text-xs sm:text-sm focus:outline-none focus:border-brand-gold pr-11"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p className="text-xs text-red-400 font-semibold">{authError}</p>
            )}

            <button
              type="submit"
              className="w-full bg-brand-navy hover:bg-brand-navy-light text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm transition-all shadow-md active:scale-95"
            >
              Authenticate & Enter Dashboard
            </button>
          </form>

          <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
            Protected with Cloud Database RLS & Zero-Load Architecture
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // 2. MAIN DASHBOARD WITH PINNED/FIXED LEFT SIDEBAR
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-100">
      {/* Toast Notification Container */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-4 h-4" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* FIXED PINNED LEFT SIDEBAR */}
      {/* Left menu is sticky/fixed: right side content scrolls independently! */}
      <aside
        className={`fixed left-0 top-0 bottom-0 w-64 h-screen bg-slate-950 border-r border-slate-800 flex flex-col z-30 transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        {/* Brand Header in Sidebar */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="bg-white px-1.5 py-1 rounded-lg shadow-sm flex-shrink-0">
              <img
                src="/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp"
                alt="Z&S Textiles"
                className="h-7 w-auto object-contain"
              />
            </div>
            <div>
              <span className="font-black text-xs sm:text-sm tracking-wide text-white block">
                Z&S TEXTILES
              </span>
              <span className="text-[10px] text-brand-gold block font-semibold">
                Faisalabad Portal
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="md:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 text-xs font-bold">
          <button
            onClick={() => {
              setActiveTab("overview");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "overview"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <Sliders className="w-4 h-4 text-brand-gold" />
            <span>Overview & KPIs</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("products");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "products"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-brand-gold" />
              <span>Product Hub</span>
            </div>
            <span className="bg-slate-800 text-[10px] px-1.5 py-0.5 rounded text-slate-300">
              {products.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("orders");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "orders"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-4 h-4 text-brand-gold" />
              <span>Order Manager</span>
            </div>
            <span className="bg-emerald-950 text-emerald-400 border border-emerald-800 text-[10px] px-1.5 py-0.5 rounded font-black">
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveTab("categories");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "categories"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <Layers className="w-4 h-4 text-brand-gold" />
            <span>Categories & Tags</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("banners");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "banners"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <ImageIcon className="w-4 h-4 text-brand-gold" />
            <span>Banners Hub</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("coupons");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "coupons"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <Tag className="w-4 h-4 text-brand-gold" />
            <span>Coupons & Vouchers</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("settings");
              setMobileMenuOpen(false);
            }}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors ${
              activeTab === "settings"
                ? "bg-brand-navy text-white shadow-sm"
                : "text-slate-400 hover:text-slate-100 hover:bg-slate-900"
            }`}
          >
            <Shield className="w-4 h-4 text-brand-gold" />
            <span>Store Settings</span>
          </button>
        </div>

        {/* Sidebar Footer Controls */}
        <div className="p-3 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between text-xs text-slate-400 hover:text-white px-2 py-1.5 rounded-lg hover:bg-slate-900"
          >
            <span>View Live Storefront</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 text-xs font-bold text-red-400 hover:text-red-300 px-2 py-2 rounded-lg hover:bg-red-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Portal</span>
          </button>
        </div>
      </aside>

      {/* INDEPENDENT RIGHT CONTENT AREA */}
      <main className="flex-1 md:ml-64 min-h-screen flex flex-col bg-slate-900 overflow-y-auto">
        {/* Top Bar */}
        <div className="bg-slate-950 border-b border-slate-800 px-4 sm:px-6 py-3 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 text-slate-400 hover:text-white"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-white capitalize">
              {activeTab} Management
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => refreshAllData(false)}
              disabled={isSyncing}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Sync Live Data</span>
            </button>
          </div>
        </div>

        {/* Tab View Body */}
        <div className="p-4 sm:p-6 space-y-6">
          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Total Orders</span>
                  <span className="text-xl sm:text-2xl font-black text-white">{orders.length}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Total Gross Revenue</span>
                  <span className="text-xl sm:text-2xl font-black text-emerald-400">
                    Rs. {orders.reduce((sum, o) => sum + Number(o.total_amount), 0).toLocaleString()}
                  </span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Active Products</span>
                  <span className="text-xl sm:text-2xl font-black text-brand-gold">{products.length}</span>
                </div>
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <span className="text-[11px] font-bold text-slate-400 block">Pending Orders</span>
                  <span className="text-xl sm:text-2xl font-black text-amber-400">
                    {orders.filter((o) => o.order_status === "pending").length}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-3">
                <h3 className="font-bold text-sm text-white">Quick Shortcuts</h3>
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => {
                      setEditingProduct({ is_active: true, is_featured: true, stock: 20 });
                      setActiveTab("products");
                    }}
                    className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-brand-gold" />
                    <span>Add New Product</span>
                  </button>

                  <button
                    onClick={handleExportProductsCSV}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Products (CSV)</span>
                  </button>

                  <button
                    onClick={() => setActiveTab("orders")}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <ShoppingBag className="w-4 h-4 text-brand-gold" />
                    <span>Manage Orders ({orders.length})</span>
                  </button>
                </div>
              </div>

              {/* Recent Orders List */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden space-y-3 p-4">
                <h3 className="font-bold text-sm text-white">Recent Customer Orders</h3>
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-500 py-4 text-center">No orders placed yet.</p>
                ) : (
                  <div className="divide-y divide-slate-800 text-xs">
                    {orders.slice(0, 5).map((o) => (
                      <div key={o.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">#{o.order_number} • {o.customer_name}</p>
                          <p className="text-[11px] text-slate-400">{o.city} • {o.items.length} items</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-emerald-400">Rs. {o.total_amount.toLocaleString()}</p>
                          <span className="text-[10px] uppercase font-bold text-brand-gold">
                            {o.order_status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: PRODUCT HUB */}
          {activeTab === "products" && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setEditingProduct({
                        is_active: true,
                        is_featured: true,
                        stock: 20,
                        colors: ["Royal Navy", "Pure White"],
                        fabric_material: "100% Combed Pakistani Cotton",
                        gsm: "600 GSM",
                        size_dimensions: "70x140 cm",
                      })
                    }
                    className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5"
                  >
                    <Plus className="w-4 h-4 text-brand-gold" />
                    <span>Add Product</span>
                  </button>

                  <button
                    onClick={handleExportProductsCSV}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold py-2.5 px-3.5 rounded-xl flex items-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Export CSV</span>
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Product</th>
                      <th className="py-3 px-3">SKU</th>
                      <th className="py-3 px-3">Price</th>
                      <th className="py-3 px-3">Stock</th>
                      <th className="py-3 px-3">GSM / Material</th>
                      <th className="py-3 px-3">Flash?</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 flex items-center gap-2.5">
                          <img
                            src={p.cover_image}
                            alt=""
                            className="w-10 h-12 object-cover rounded bg-slate-900 flex-shrink-0"
                          />
                          <span className="font-semibold text-white max-w-xs truncate block">
                            {p.title}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{p.sku || "-"}</td>
                        <td className="py-2.5 px-3 font-bold text-white">
                          Rs. {(p.sale_price || p.price).toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.stock > 5 ? "bg-emerald-950 text-emerald-400" : "bg-red-950 text-red-400"
                            }`}
                          >
                            {p.stock} units
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{p.gsm || p.fabric_material}</td>
                        <td className="py-2.5 px-3">
                          {p.is_flash_deal ? (
                            <span className="text-brand-gold font-bold text-[10px]">⚡ YES</span>
                          ) : (
                            <span className="text-slate-500 text-[10px]">No</span>
                          )}
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            onClick={() => setEditingProduct(p)}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                title: "Delete Product",
                                message: `Permanently delete "${p.title}" from store catalog?`,
                                onConfirm: async () => {
                                  await adminDeleteProduct(p.id);
                                  showToast("Product deleted permanently!");
                                  refreshAllData();
                                },
                              })
                            }
                            className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: ORDER MANAGER */}
          {activeTab === "orders" && (
            <div className="space-y-4">
              <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-900 border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-3">Order #</th>
                      <th className="py-3 px-3">Customer</th>
                      <th className="py-3 px-3">City & Address</th>
                      <th className="py-3 px-3">Items</th>
                      <th className="py-3 px-3">Amount</th>
                      <th className="py-3 px-3">Payment</th>
                      <th className="py-3 px-3">Status</th>
                      <th className="py-3 px-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80">
                    {orders.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-900/50">
                        <td className="py-2.5 px-3 font-bold text-white">#{o.order_number}</td>
                        <td className="py-2.5 px-3">
                          <p className="font-semibold text-white">{o.customer_name}</p>
                          <p className="text-[11px] text-slate-400">{o.customer_phone}</p>
                        </td>
                        <td className="py-2.5 px-3 text-slate-300 max-w-xs truncate">
                          {o.city}, {o.address}
                        </td>
                        <td className="py-2.5 px-3 text-slate-400">{o.items.length} item(s)</td>
                        <td className="py-2.5 px-3 font-bold text-emerald-400">
                          Rs. {o.total_amount.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="uppercase text-[10px] font-bold text-slate-300">
                              {o.payment_method}
                            </span>
                            {/* EYE ICON: View customer screenshot receipt */}
                            {o.payment_proof_url && (
                              <button
                                onClick={() => setViewingProofUrl(o.payment_proof_url!)}
                                className="text-brand-gold hover:text-white p-0.5"
                                title="View Payment Proof Screenshot"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          <select
                            value={o.order_status}
                            onChange={async (e) => {
                              await adminUpdateOrderStatus(
                                o.id!,
                                e.target.value as Order["order_status"]
                              );
                              showToast(`Order status updated to ${e.target.value}!`);
                              refreshAllData();
                            }}
                            className="bg-slate-900 border border-slate-700 text-white text-[11px] font-bold rounded px-2 py-1"
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped (TCS)</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="py-2.5 px-3 text-right space-x-1">
                          <button
                            onClick={() => setActiveInvoiceOrder(o)}
                            className="p-1.5 hover:bg-slate-800 text-slate-300 hover:text-white rounded"
                            title="Print Clean Tax Invoice"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                title: "Delete Order",
                                message: `Remove Order #${o.order_number} from dashboard records?`,
                                onConfirm: async () => {
                                  await adminDeleteOrder(o.id!);
                                  showToast("Order removed!");
                                  refreshAllData();
                                },
                              })
                            }
                            className="p-1.5 hover:bg-red-950 text-slate-400 hover:text-red-400 rounded"
                            title="Delete Order"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: CATEGORIES & DARAZ-STYLE SUBCATEGORIES */}
          {activeTab === "categories" && (
            <div className="space-y-6">
              {/* Category CRUD */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm text-white">Main Root Categories</h3>
                  <button
                    onClick={() =>
                      setEditingCategory({ is_active: true, show_in_top_categories: true })
                    }
                    className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Add Root Category</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2 relative"
                    >
                      <img
                        src={c.image_url || "/images/zandstextiles-luxury-home-bedding-and-linens-logo.webp"}
                        alt=""
                        className="w-12 h-12 rounded-full object-cover bg-slate-950 mx-auto"
                      />
                      <div className="text-center">
                        <p className="font-bold text-xs text-white">{c.name}</p>
                        <p className="text-[10px] text-slate-400">/{c.slug}/</p>
                        {c.show_in_top_categories && (
                          <span className="text-[9px] bg-brand-gold text-brand-navy-dark px-1.5 py-0.5 rounded font-black mt-1 inline-block">
                            Top Categories: Visible
                          </span>
                        )}
                      </div>
                      <div className="flex justify-center gap-2 pt-1 border-t border-slate-800">
                        <button
                          onClick={() => setEditingCategory(c)}
                          className="text-slate-400 hover:text-white p-1"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setConfirmDialog({
                              title: "Delete Category",
                              message: `Permanently delete category "${c.name}"? Products inside it will become uncategorized.`,
                              onConfirm: async () => {
                                await adminDeleteCategory(c.id);
                                showToast("Category permanently deleted!");
                                refreshAllData();
                              },
                            })
                          }
                          className="text-slate-400 hover:text-red-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Multi-Level Subcategories (Daraz-Style Nesting) */}
              <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      Daraz-Style Multi-Tier Subcategories
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Create subcategories and nested child departments under main collections
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      setEditingSubcategory({
                        is_active: true,
                        category_id: categories[0]?.id || "",
                      })
                    }
                    className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-brand-gold" />
                    <span>Add Subcategory</span>
                  </button>
                </div>

                <div className="divide-y divide-slate-800 text-xs">
                  {subcategories.map((s) => {
                    const parentCat = categories.find((c) => c.id === s.category_id);
                    const parentSub = s.parent_subcategory_id
                      ? subcategories.find((sub) => sub.id === s.parent_subcategory_id)
                      : null;
                    return (
                      <div key={s.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="font-bold text-white">{s.name}</p>
                          <p className="text-[11px] text-slate-400">
                            Category: {parentCat?.name || "None"}
                            {parentSub ? ` → Under: ${parentSub.name}` : ""} • Slug: /{s.slug}/
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditingSubcategory(s)}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() =>
                              setConfirmDialog({
                                title: "Delete Subcategory",
                                message: `Delete subcategory "${s.name}" permanently?`,
                                onConfirm: async () => {
                                  await adminDeleteSubcategory(s.id);
                                  showToast("Subcategory deleted!");
                                  refreshAllData();
                                },
                              })
                            }
                            className="p-1 text-slate-400 hover:text-red-400"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: BANNERS HUB */}
          {activeTab === "banners" && (
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-bold text-sm text-white">Homepage Banners Hub</h3>
                  <p className="text-xs text-brand-gold mt-0.5 font-semibold">
                    Recommended Dimensions: Desktop 1920x600 px • Mobile 750x450 px
                  </p>
                  <p className="text-[11px] text-slate-400">
                    Pure image banners: no overlapping text or buttons cutting off edges.
                  </p>
                </div>
                <button
                  onClick={() => setEditingBanner({ is_active: true, sort_order: 1 })}
                  className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2.5 px-4 rounded-xl flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 text-brand-gold" />
                  <span>Upload New Banner</span>
                </button>
              </div>

              {/* Banners Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {banners.map((b) => (
                  <div key={b.id} className="bg-slate-900 rounded-xl overflow-hidden border border-slate-800 space-y-2 p-2">
                    <img src={b.image_url} alt="" className="w-full aspect-[16/6] object-cover rounded-lg" />
                    <div className="flex items-center justify-between p-2">
                      <div>
                        <p className="font-bold text-xs text-white">{b.title}</p>
                        <p className="text-[11px] text-slate-400">Link: {b.link_url}</p>
                      </div>
                      <button
                        onClick={() =>
                          setConfirmDialog({
                            title: "Delete Banner",
                            message: `Remove banner "${b.title}" from Homepage Hero Carousel?`,
                            onConfirm: async () => {
                              await adminDeleteBanner(b.id);
                              showToast("Banner deleted from Cloud Database!");
                              refreshAllData();
                            },
                          })
                        }
                        className="text-red-400 hover:text-red-300 p-1.5"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: STORE SETTINGS */}
          {activeTab === "settings" && settings && (
            <div className="bg-slate-950 p-4 sm:p-6 rounded-2xl border border-slate-800 space-y-6 max-w-3xl">
              <div>
                <h3 className="font-bold text-base text-white">Global Store & Delivery Settings</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Changes made here update the storefront headers, checkout rules, and invoice receipts automatically.
                </p>
              </div>

              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  await adminSaveSiteSettings(settings);
                  showToast("Store settings saved successfully!");
                  refreshAllData();
                }}
                className="space-y-4 text-xs"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Store Name</label>
                    <input
                      type="text"
                      value={settings.store_name}
                      onChange={(e) => setSettings({ ...settings, store_name: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Official WhatsApp</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Standard Delivery Fee (PKR)</label>
                    <input
                      type="number"
                      value={settings.delivery_charge}
                      onChange={(e) => setSettings({ ...settings, delivery_charge: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Free Delivery Spend Threshold (PKR)</label>
                    <input
                      type="number"
                      value={settings.free_shipping_threshold}
                      onChange={(e) => setSettings({ ...settings, free_shipping_threshold: Number(e.target.value) })}
                      className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Official VIP Deals WhatsApp Channel Link</label>
                  <input
                    type="url"
                    value={settings.whatsapp_channel}
                    onChange={(e) => setSettings({ ...settings, whatsapp_channel: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Faisalabad Dispatch Address</label>
                  <input
                    type="text"
                    value={settings.address}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>

                <div className="pt-2 border-t border-slate-800">
                  <h4 className="font-bold text-white mb-2">Electronic Payment Gateway Accounts (Pakistan)</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-slate-200">Meezan Bank Account</p>
                      <input
                        type="text"
                        placeholder="A/C or IBAN"
                        value={settings.bank_account_iban}
                        onChange={(e) => setSettings({ ...settings, bank_account_iban: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded text-white text-[11px]"
                      />
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-slate-200">JazzCash Account</p>
                      <input
                        type="text"
                        value={settings.jazzcash_number}
                        onChange={(e) => setSettings({ ...settings, jazzcash_number: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded text-white text-[11px]"
                      />
                    </div>
                    <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 space-y-1">
                      <p className="font-bold text-slate-200">EasyPaisa Account</p>
                      <input
                        type="text"
                        value={settings.easypaisa_number}
                        onChange={(e) => setSettings({ ...settings, easypaisa_number: e.target.value })}
                        className="w-full bg-slate-950 border border-slate-700 px-2.5 py-1.5 rounded text-white text-[11px]"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="bg-brand-navy hover:bg-brand-navy-light text-white font-bold py-2.5 px-6 rounded-xl text-xs shadow-md"
                >
                  Save Store Settings
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === "coupons" && (
            <div className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-white">Coupons & Promo Codes</h3>
                <button
                  onClick={() =>
                    setEditingCoupon({
                      is_active: true,
                      discount_type: "percentage",
                      discount_value: 10,
                      min_spend: 2500,
                    })
                  }
                  className="bg-brand-navy hover:bg-brand-navy-light text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5 text-brand-gold" />
                  <span>Create Coupon</span>
                </button>
              </div>

              <div className="divide-y divide-slate-800 text-xs">
                {coupons.map((c) => (
                  <div key={c.id} className="py-2.5 flex items-center justify-between">
                    <div>
                      <span className="font-black text-brand-gold font-mono text-sm">{c.code}</span>
                      <p className="text-[11px] text-slate-400">
                        {c.discount_type === "percentage" ? `${c.discount_value}% Discount` : `Rs. ${c.discount_value} OFF`} • Min Spend: Rs. {c.min_spend}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setConfirmDialog({
                          title: "Delete Coupon",
                          message: `Delete promo coupon "${c.code}"?`,
                          onConfirm: async () => {
                            await adminDeleteCoupon(c.id);
                            showToast("Coupon removed!");
                            refreshAllData();
                          },
                        })
                      }
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* -------------------------------------------------------------
          SUB-MODALS (DIRECT WEBP UPLOADS, EDITORS, AND PROOF VIEWER)
      -------------------------------------------------------------- */}

      {/* Product Edit / Add Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-2xl rounded-2xl p-6 text-xs text-slate-200 space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h3 className="font-bold text-sm text-white">
                {editingProduct.id ? "Edit Product" : "Add New Cotton Product"}
              </h3>
              <button onClick={() => setEditingProduct(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                const rawColorsText = (editingProduct as any)._colorsText;
                const parsedColors =
                  typeof rawColorsText === "string"
                    ? rawColorsText
                        .split(",")
                        .map((c) => c.trim())
                        .filter(Boolean)
                    : Array.isArray(editingProduct.colors)
                    ? editingProduct.colors
                    : [];
                const productToSave = {
                  ...editingProduct,
                  colors: parsedColors,
                };
                try {
                  await adminSaveProduct(productToSave);
                  showToast("Product saved successfully to Cloud Database!");
                  setEditingProduct(null);
                  refreshAllData();
                } catch (err: any) {
                  console.error(err);
                  showToast(err?.message || "Failed to save product.");
                }
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold mb-1">Product Title *</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">SKU Code</label>
                  <input
                    type="text"
                    value={editingProduct.sku || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sku: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white uppercase"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Category</label>
                  <select
                    value={editingProduct.category_id || ""}
                    onChange={(e) => {
                      const nextCatId = e.target.value;
                      const validSub = subcategories.some(
                        (s) => s.id === editingProduct.subcategory_id && s.category_id === nextCatId
                      );
                      setEditingProduct({
                        ...editingProduct,
                        category_id: nextCatId,
                        subcategory_id: validSub ? editingProduct.subcategory_id : null,
                      });
                    }}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  >
                    <option value="">Select Root Category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Subcategory</label>
                  <select
                    value={editingProduct.subcategory_id || ""}
                    disabled={!editingProduct.category_id}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        subcategory_id: e.target.value || null,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white disabled:opacity-50"
                  >
                    <option value="">Optional Subcategory</option>
                    {subcategories
                      .filter((s) => s.category_id === editingProduct.category_id)
                      .map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">Regular Price (PKR) *</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Sale Price (PKR)</label>
                  <input
                    type="number"
                    value={editingProduct.sale_price || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, sale_price: Number(e.target.value) || null })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.stock || 0}
                    onChange={(e) => setEditingProduct({ ...editingProduct, stock: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Textile Specification Fields */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold mb-1">GSM Density</label>
                  <input
                    type="text"
                    placeholder="e.g. 600 GSM"
                    value={editingProduct.gsm || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, gsm: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Dimensions</label>
                  <input
                    type="text"
                    placeholder="e.g. 70x140 cm"
                    value={editingProduct.size_dimensions || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, size_dimensions: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold mb-1">Material Composition</label>
                  <input
                    type="text"
                    placeholder="100% Combed Cotton"
                    value={editingProduct.fabric_material || ""}
                    onChange={(e) => setEditingProduct({ ...editingProduct, fabric_material: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Available Colors (Comma-Separated)</label>
                <input
                  type="text"
                  placeholder="Royal Navy Blue, Crisp Pure White, Pearl Grey"
                  value={
                    (editingProduct as any)._colorsText ??
                    (Array.isArray(editingProduct.colors) ? editingProduct.colors.join(", ") : "")
                  }
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      _colorsText: e.target.value,
                    } as any)
                  }
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              {/* DIRECT WEBP COVER IMAGE UPLOAD (NO BASE64 IN DATABASE) */}
              <div>
                <label className="block font-bold mb-1">Cover Image (Direct File Upload to WebP)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIsUploading(true);
                      try {
                        const { url } = await compressAndUploadImage(e.target.files[0], "products", 1200, 1200, 0.8);
                        setEditingProduct({ ...editingProduct, cover_image: url });
                        showToast("Cover image compressed to WebP and uploaded!");
                      } catch (err) {
                        console.error(err);
                        showToast("Failed to upload cover image.");
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-white"
                />
                {editingProduct.cover_image && (
                  <div className="mt-2 flex items-center gap-2">
                    <img src={editingProduct.cover_image} alt="" className="w-12 h-14 object-cover rounded border border-slate-700" />
                    <span className="text-[11px] text-emerald-400 font-semibold">Optimized Cloud WebP Image Ready</span>
                  </div>
                )}
                {isUploading && <p className="text-[10px] text-brand-gold mt-1">Compressing image to WebP (KB size)...</p>}
              </div>

              {/* MULTIPLE GALLERY IMAGES WEBP UPLOAD */}
              <div>
                <label className="block font-bold mb-1">Additional Gallery Images (Multiple WebP Upload)</label>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={async (e) => {
                    if (e.target.files && e.target.files.length > 0) {
                      setIsUploading(true);
                      try {
                        const uploadedUrls: string[] = [];
                        for (const file of Array.from(e.target.files)) {
                          const { url } = await compressAndUploadImage(file, "products", 1200, 1200, 0.8);
                          uploadedUrls.push(url);
                        }
                        const existing = Array.isArray(editingProduct.gallery_images)
                          ? editingProduct.gallery_images
                          : [];
                        setEditingProduct({
                          ...editingProduct,
                          gallery_images: [...existing, ...uploadedUrls],
                        });
                        showToast(`${uploadedUrls.length} gallery image(s) compressed to WebP & uploaded!`);
                      } catch (err) {
                        console.error(err);
                        showToast("Failed to upload one or more gallery images.");
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-300 file:mr-2 file:py-1 file:px-2.5 file:rounded-lg file:border-0 file:text-xs file:bg-slate-800 file:text-white"
                />
                {Array.isArray(editingProduct.gallery_images) && editingProduct.gallery_images.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {editingProduct.gallery_images.map((gUrl, idx) => (
                      <div key={idx} className="relative group">
                        <img
                          src={gUrl}
                          alt=""
                          className="w-12 h-12 object-cover rounded border border-slate-700 bg-slate-950"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setEditingProduct({
                              ...editingProduct,
                              gallery_images: (editingProduct.gallery_images || []).filter((_, i) => i !== idx),
                            })
                          }
                          className="absolute -top-1.5 -right-1.5 bg-red-600 text-white rounded-full p-0.5 shadow"
                          title="Remove gallery image"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Short & Long Description */}
              <div>
                <label className="block font-bold mb-1">Short Description</label>
                <input
                  type="text"
                  value={editingProduct.short_description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, short_description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Full Rich Description</label>
                <textarea
                  rows={3}
                  value={editingProduct.description || ""}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              {/* Toggles */}
              <div className="flex gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_flash_deal || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_flash_deal: e.target.checked })}
                  />
                  <span>Show in Flash Deals ⚡</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editingProduct.is_featured || false}
                    onChange={(e) => setEditingProduct({ ...editingProduct, is_featured: e.target.checked })}
                  />
                  <span>Featured on Homepage</span>
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl"
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Category Edit / Add Modal */}
      {editingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 text-xs text-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-white">
              {editingCategory.id ? "Edit Category" : "Add Category"}
            </h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminSaveCategory(editingCategory);
                showToast("Category updated in Cloud Database!");
                setEditingCategory(null);
                refreshAllData();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold mb-1">Category Name *</label>
                <input
                  type="text"
                  required
                  value={editingCategory.name || ""}
                  onChange={(e) => setEditingCategory({ ...editingCategory, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Upload Category Tile Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      const { url } = await compressAndUploadImage(e.target.files[0], "products", 600, 600, 0.8);
                      setEditingCategory({ ...editingCategory, image_url: url });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-300"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={editingCategory.show_in_top_categories ?? true}
                  onChange={(e) => setEditingCategory({ ...editingCategory, show_in_top_categories: e.target.checked })}
                />
                <span className="font-bold text-brand-gold">
                  Show in "Top Categories" Carousel on Homepage
                </span>
              </label>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl"
                >
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Edit / Add Modal */}
      {editingSubcategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 text-xs text-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-white">Add / Edit Subcategory</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminSaveSubcategory(editingSubcategory);
                showToast("Subcategory updated in Cloud Database!");
                setEditingSubcategory(null);
                refreshAllData();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold mb-1">Parent Category</label>
                <select
                  value={editingSubcategory.category_id || ""}
                  onChange={(e) =>
                    setEditingSubcategory({
                      ...editingSubcategory,
                      category_id: e.target.value,
                      parent_subcategory_id: null,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Parent Subcategory (Optional - Multi-Tier Nesting)</label>
                <select
                  value={editingSubcategory.parent_subcategory_id || ""}
                  onChange={(e) =>
                    setEditingSubcategory({
                      ...editingSubcategory,
                      parent_subcategory_id: e.target.value || null,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                >
                  <option value="">Top-Level Subcategory (Directly under Category)</option>
                  {subcategories
                    .filter(
                      (sub) =>
                        sub.category_id === editingSubcategory.category_id &&
                        sub.id !== editingSubcategory.id
                    )
                    .map((sub) => (
                      <option key={sub.id} value={sub.id}>{sub.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold mb-1">Subcategory Name *</label>
                <input
                  type="text"
                  required
                  value={editingSubcategory.name || ""}
                  onChange={(e) => setEditingSubcategory({ ...editingSubcategory, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingSubcategory(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl"
                >
                  Save Subcategory
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Banner Upload Modal */}
      {editingBanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 text-xs text-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-white">Upload New Image Banner</h3>
            <p className="text-[11px] text-brand-gold">
              Dimensions: Desktop 1920x600 px • Mobile 750x450 px
            </p>

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBannerError("");
                if (!editingBanner.image_url) {
                  setBannerError("Please upload a banner image first before publishing.");
                  return;
                }
                await adminSaveBanner(editingBanner);
                showToast("Banner added to Cloud Database!");
                setEditingBanner(null);
                setBannerError("");
                refreshAllData();
              }}
              className="space-y-3"
            >
              {bannerError && (
                <div className="bg-red-950/60 border border-red-700/60 text-red-300 px-3 py-2 rounded-xl text-[11px] font-semibold">
                  {bannerError}
                </div>
              )}
              <div>
                <label className="block font-bold mb-1">Banner Title / Alt Tag *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Faisalabad Cotton Towels Promo"
                  value={editingBanner.title || ""}
                  onChange={(e) => setEditingBanner({ ...editingBanner, title: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="block font-bold mb-1">Upload Banner Image File *</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    if (e.target.files && e.target.files[0]) {
                      setIsUploading(true);
                      try {
                        const { url } = await compressAndUploadImage(e.target.files[0], "banners", 1920, 800, 0.85);
                        setEditingBanner({ ...editingBanner, image_url: url });
                        setBannerError("");
                      } finally {
                        setIsUploading(false);
                      }
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-slate-300"
                />
                {isUploading && <p className="text-[10px] text-brand-gold mt-1">Compressing banner WebP...</p>}
                {editingBanner.image_url && (
                  <img src={editingBanner.image_url} alt="" className="mt-2 w-full h-24 object-cover rounded-lg" />
                )}
              </div>

              <div>
                <label className="block font-bold mb-1">Destination URL / Route</label>
                <input
                  type="text"
                  placeholder="/shop/"
                  value={editingBanner.link_url || "/shop/"}
                  onChange={(e) => setEditingBanner({ ...editingBanner, link_url: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingBanner(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl"
                >
                  Publish Banner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Coupon Modal */}
      {editingCoupon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 text-xs text-slate-200 space-y-4">
            <h3 className="font-bold text-sm text-white">Create Promo Voucher</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await adminSaveCoupon(editingCoupon);
                showToast("Coupon created in Cloud Database!");
                setEditingCoupon(null);
                refreshAllData();
              }}
              className="space-y-3"
            >
              <div>
                <label className="block font-bold mb-1">Coupon Code *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FLASH20"
                  value={editingCoupon.code || ""}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, code: e.target.value.toUpperCase() })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white uppercase font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Discount Type</label>
                  <select
                    value={editingCoupon.discount_type || "percentage"}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_type: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed PKR Amount</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold mb-1">Discount Value</label>
                  <input
                    type="number"
                    required
                    value={editingCoupon.discount_value || 10}
                    onChange={(e) => setEditingCoupon({ ...editingCoupon, discount_value: Number(e.target.value) })}
                    className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1">Minimum Spend Limit (PKR)</label>
                <input
                  type="number"
                  value={editingCoupon.min_spend || 0}
                  onChange={(e) => setEditingCoupon({ ...editingCoupon, min_spend: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-700 px-3 py-2 rounded-xl text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingCoupon(null)}
                  className="px-4 py-2 bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-navy hover:bg-brand-navy-light text-white font-bold rounded-xl"
                >
                  Save Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EYE ICON: PAYMENT PROOF SCREENSHOT VIEWER MODAL */}
      {viewingProofUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-slate-900 border border-slate-800 max-w-xl w-full rounded-2xl overflow-hidden p-4 space-y-3">
            <div className="flex justify-between items-center pb-2 border-b border-slate-800">
              <h4 className="font-bold text-sm text-white flex items-center gap-2">
                <Eye className="w-4 h-4 text-brand-gold" />
                <span>Customer Payment Proof Screenshot</span>
              </h4>
              <button onClick={() => setViewingProofUrl(null)}>
                <X className="w-5 h-5 text-slate-400 hover:text-white" />
              </button>
            </div>
            <div className="max-h-[75vh] overflow-y-auto rounded-lg bg-slate-950 flex items-center justify-center p-2">
              <img src={viewingProofUrl} alt="Payment Proof" className="max-w-full h-auto rounded object-contain" />
            </div>
            <div className="flex justify-end">
              <a
                href={viewingProofUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-brand-gold hover:underline flex items-center gap-1"
              >
                <span>Open Full Original Image</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* PRINTABLE PDF INVOICE MODAL */}
      {activeInvoiceOrder && settings && (
        <PrintableInvoice
          order={activeInvoiceOrder}
          settings={settings}
          onClose={() => setActiveInvoiceOrder(null)}
        />
      )}

      {/* IN-APP CONFIRMATION DIALOG (ZERO BROWSER CONFIRM POPUPS) */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-sm rounded-2xl p-5 sm:p-6 text-xs text-slate-200 space-y-4 shadow-2xl">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-full bg-red-950/70 border border-red-800/60 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
              <div className="space-y-1">
                <h4 className="font-black text-sm text-white">{confirmDialog.title}</h4>
                <p className="text-slate-400 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                disabled={isConfirming}
                onClick={() => setConfirmDialog(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isConfirming}
                onClick={async () => {
                  setIsConfirming(true);
                  try {
                    await confirmDialog.onConfirm();
                    setConfirmDialog(null);
                  } catch (err: any) {
                    console.error(err);
                    showToast(err?.message || "Action failed. Please try again.");
                  } finally {
                    setIsConfirming(false);
                  }
                }}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl disabled:opacity-50"
              >
                {isConfirming ? "Deleting..." : confirmDialog.confirmLabel || "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
