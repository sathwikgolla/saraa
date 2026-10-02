"use client";

import { useState } from "react";
import {
  Bell,
  Clock,
  CreditCard,
  Percent,
  QrCode,
  Save,
  Settings,
  ShieldCheck,
  Store,
  Truck,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import type { AdminSettings } from "@/lib/adminTypes";

export default function AdminSettingsPage() {
  const { settings, saveSettings } = useAdmin();

  // Local form state initialized from context
  const [storeName, setStoreName] = useState(settings.storeName);
  const [tagline, setTagline] = useState(settings.tagline);
  const [supportEmail, setSupportEmail] = useState(settings.supportEmail);
  const [supportPhone, setSupportPhone] = useState(settings.supportPhone);
  const [address, setAddress] = useState(settings.address);

  // UPI & Payments
  const [upiId, setUpiId] = useState(settings.upiId);
  const [upiMerchantName, setUpiMerchantName] = useState(settings.upiMerchantName);
  const [qrCodeUrl, setQrCodeUrl] = useState(settings.qrCodeUrl);
  const [utrLength, setUtrLength] = useState(settings.utrLength || 12);

  // Shipping
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(
    settings.freeShippingThreshold
  );
  const [standardShippingFee, setStandardShippingFee] = useState(
    settings.standardShippingFee
  );
  const [expressShippingFee, setExpressShippingFee] = useState(
    settings.expressShippingFee
  );

  // GST & Tax
  const [gstin, setGstin] = useState(settings.gstin);
  const [defaultGstRate, setDefaultGstRate] = useState(settings.defaultGstRate);
  const [pricesIncludeGst, setPricesIncludeGst] = useState(settings.pricesIncludeGst);

  // Timeouts
  const [cartTimeoutMinutes, setCartTimeoutMinutes] = useState(
    settings.cartTimeoutMinutes
  );
  const [utrExpiryHours, setUtrExpiryHours] = useState(settings.utrExpiryHours);

  // Notification templates
  const [tplOrderPlaced, setTplOrderPlaced] = useState(
    settings.notificationTemplates.orderPlaced
  );
  const [tplPaymentVerified, setTplPaymentVerified] = useState(
    settings.notificationTemplates.paymentVerified
  );
  const [tplOrderShipped, setTplOrderShipped] = useState(
    settings.notificationTemplates.orderShipped
  );
  const [tplPaymentRejected, setTplPaymentRejected] = useState(
    settings.notificationTemplates.paymentRejected
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const patch: Partial<AdminSettings> = {
      storeName: storeName.trim(),
      tagline: tagline.trim(),
      supportEmail: supportEmail.trim(),
      supportPhone: supportPhone.trim(),
      address: address.trim(),
      upiId: upiId.trim(),
      upiMerchantName: upiMerchantName.trim(),
      qrCodeUrl: qrCodeUrl.trim(),
      utrLength: Number(utrLength),
      freeShippingThreshold: Number(freeShippingThreshold),
      standardShippingFee: Number(standardShippingFee),
      expressShippingFee: Number(expressShippingFee),
      gstin: gstin.trim().toUpperCase(),
      defaultGstRate: Number(defaultGstRate),
      pricesIncludeGst,
      cartTimeoutMinutes: Number(cartTimeoutMinutes),
      utrExpiryHours: Number(utrExpiryHours),
      notificationTemplates: {
        orderPlaced: tplOrderPlaced.trim(),
        paymentVerified: tplPaymentVerified.trim(),
        orderShipped: tplOrderShipped.trim(),
        paymentRejected: tplPaymentRejected.trim(),
      },
    };

    saveSettings(patch);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <Settings className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                Store & Payment Configuration
              </h1>
              <p className="text-xs text-neutral-500">
                Merchant UPI QR, GST rates, shipping thresholds, inventory reservation timeouts, and notification copy
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 rounded-lg bg-black hover:bg-neutral-800 px-5 py-2 text-xs font-semibold text-white transition shadow-sm"
        >
          <Save className="h-4 w-4" />
          <span>Save All Settings</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 text-xs">
        {/* 1. Merchant UPI & QR Code Settings */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <QrCode className="h-5 w-5 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Merchant UPI & QR Payment Engine
            </h2>
          </div>
          <p className="text-xs text-neutral-500">
            Single merchant UPI ID & dynamic QR presented to customers during checkout
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
            <div className="md:col-span-2 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Merchant VPA / UPI ID *</label>
                  <input
                    type="text"
                    required
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="e.g. miraclecollections@okaxis"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Merchant Registered Name</label>
                  <input
                    type="text"
                    required
                    value={upiMerchantName}
                    onChange={(e) => setUpiMerchantName(e.target.value)}
                    placeholder="e.g. Miracle Collections Retail Pvt Ltd"
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">
                    Required UTR Length
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="18"
                    value={utrLength}
                    onChange={(e) => setUtrLength(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                  />
                  <p className="text-[10px] text-neutral-500">
                    Indian banking UPI UTR standard: 12 numerical digits
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">QR Code Image URL</label>
                  <input
                    type="url"
                    value={qrCodeUrl}
                    onChange={(e) => setQrCodeUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* QR Code Live Preview */}
            <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4 flex flex-col items-center justify-center text-center">
              <p className="text-[11px] font-semibold text-neutral-500 mb-2">
                Customer Checkout Preview
              </p>
              <div className="p-2 bg-white rounded-lg border border-neutral-200 shadow-sm">
                <img
                  src={qrCodeUrl}
                  alt="Merchant QR"
                  className="h-28 w-28 object-contain"
                />
              </div>
              <p className="font-mono text-[11px] font-bold text-black mt-2">{upiId}</p>
              <p className="text-[10px] text-neutral-500">{upiMerchantName}</p>
            </div>
          </div>
        </div>

        {/* 2. Store Business Profile */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Store className="h-5 w-5 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Store Identity & Contact Details
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Store Name</label>
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Brand Tagline</label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Support Phone / WhatsApp</label>
              <input
                type="text"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label className="font-semibold text-neutral-700">Registered Business Address</label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* 3. Shipping Rules & GST Taxation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Shipping */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-black" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                Shipping & Delivery Fees
              </h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">
                  Free Shipping Minimum Order (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(Number(e.target.value))}
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                />
                <p className="text-[10px] text-neutral-500">
                  Orders equal or above this value qualify for free delivery (Default: ₹999)
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Standard Delivery (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={standardShippingFee}
                    onChange={(e) => setStandardShippingFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Express Courier (₹)</label>
                  <input
                    type="number"
                    min="0"
                    value={expressShippingFee}
                    onChange={(e) => setExpressShippingFee(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* GST Taxation */}
          <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Percent className="h-5 w-5 text-black" />
              <h2 className="text-sm font-bold text-black uppercase tracking-wider">
                GSTIN & Taxation Rules
              </h2>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="font-semibold text-neutral-700">Merchant GSTIN Number</label>
                <input
                  type="text"
                  value={gstin}
                  onChange={(e) => setGstin(e.target.value.toUpperCase())}
                  placeholder="29AAAAA0000A1Z5"
                  className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono font-bold focus:border-black focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Default GST Rate (%)</label>
                  <select
                    value={defaultGstRate}
                    onChange={(e) => setDefaultGstRate(Number(e.target.value))}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
                  >
                    <option value={5}>5% (Apparel under ₹1000)</option>
                    <option value={12}>12% (Standard Fashion & Footwear)</option>
                    <option value={18}>18% (Accessories / Leather goods)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-semibold text-neutral-700">Price Display</label>
                  <select
                    value={pricesIncludeGst ? "inclusive" : "exclusive"}
                    onChange={(e) => setPricesIncludeGst(e.target.value === "inclusive")}
                    className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black focus:border-black focus:outline-none"
                  >
                    <option value="inclusive">GST Inclusive (MRP)</option>
                    <option value="exclusive">GST Added at Checkout</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Automated Inventory & Payment Timeouts */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Automated Inventory Timeouts & Stock Release
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">
                Cart Soft-Reservation Timeout (Minutes)
              </label>
              <input
                type="number"
                min="5"
                max="120"
                value={cartTimeoutMinutes}
                onChange={(e) => setCartTimeoutMinutes(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
              />
              <p className="text-[10px] text-neutral-500">
                Default: 30 mins. Temporarily locks stock in customer cart; auto-releases upon expiry.
              </p>
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">
                UTR Verification Window (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="48"
                value={utrExpiryHours}
                onChange={(e) => setUtrExpiryHours(Number(e.target.value))}
                className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-2 text-black font-mono focus:border-black focus:outline-none"
              />
              <p className="text-[10px] text-neutral-500">
                Default: 2 hours. If payment is unverified past this window, alert admin and release reserved stock.
              </p>
            </div>
          </div>
        </div>

        {/* 5. Notification Templates */}
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-black" />
            <h2 className="text-sm font-bold text-black uppercase tracking-wider">
              Customer Notification Templates (WhatsApp / SMS / Email)
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Order Placed Notification</label>
              <textarea
                rows={3}
                value={tplOrderPlaced}
                onChange={(e) => setTplOrderPlaced(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Payment Verified Notification</label>
              <textarea
                rows={3}
                value={tplPaymentVerified}
                onChange={(e) => setTplPaymentVerified(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Order Dispatched / Shipped</label>
              <textarea
                rows={3}
                value={tplOrderShipped}
                onChange={(e) => setTplOrderShipped(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>

            <div className="space-y-1">
              <label className="font-semibold text-neutral-700">Payment Rejected Notification</label>
              <textarea
                rows={3}
                value={tplPaymentRejected}
                onChange={(e) => setTplPaymentRejected(e.target.value)}
                className="w-full rounded-lg border border-neutral-300 bg-white p-2.5 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-lg bg-black hover:bg-neutral-800 px-6 py-2.5 text-xs font-semibold text-white transition shadow-sm"
          >
            <Save className="h-4 w-4" />
            <span>Save Store Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
}
