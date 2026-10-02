"use client";

import { useMemo, useState } from "react";
import {
  AlertOctagon,
  CreditCard,
  Download,
  Search,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { formatPrice } from "@/lib/utils";
import type { AdminPayment, PaymentVerificationStatus } from "@/lib/adminTypes";
import { PaymentVerifyModal } from "@/components/admin/PaymentVerifyModal";

export default function AdminPaymentsPage() {
  const { payments, exportToCsv, settings } = useAdmin();
  const [activeTab, setActiveTab] = useState<PaymentVerificationStatus | "all">(
    "pending_verification"
  );
  const [search, setSearch] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<AdminPayment | null>(null);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const matchTab = activeTab === "all" || p.status === activeTab;
      const q = search.trim().toLowerCase();
      const matchSearch =
        !q ||
        p.orderId.toLowerCase().includes(q) ||
        p.customerName.toLowerCase().includes(q) ||
        p.customerPhone.includes(q) ||
        p.utrNumber.includes(q);
      return matchTab && matchSearch;
    });
  }, [payments, activeTab, search]);

  const verifiedTotal = useMemo(
    () => payments.filter((p) => p.status === "verified").reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  const pendingTotal = useMemo(
    () => payments.filter((p) => p.status === "pending_verification").reduce((s, p) => s + p.amount, 0),
    [payments]
  );

  const duplicateFlagsCount = useMemo(
    () => payments.filter((p) => p.isDuplicateUtr).length,
    [payments]
  );

  const handleExportCsv = () => {
    const data = filteredPayments.map((p) => ({
      Payment_ID: p.id,
      Order_ID: p.orderId,
      Customer: p.customerName,
      Phone: p.customerPhone,
      Amount: p.amount,
      UTR_Number: p.utrNumber,
      Status: p.status,
      Is_Duplicate_UTR: p.isDuplicateUtr ? "YES" : "NO",
      Submitted_At: p.submittedAt,
      Verified_At: p.verifiedAt || "N/A",
      Verified_By: p.verifiedBy || "N/A",
      Rejection_Reason: p.rejectionReason || "N/A",
    }));
    exportToCsv(data, "Miracle_Payments_Reconciliation");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-black" />
            <h1 className="text-xl sm:text-2xl font-extrabold text-black tracking-tight">
              Merchant QR & UTR Verification Queue
            </h1>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Manual bank statement verification, duplicate UTR detection and payment reconciliation
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-md border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-neutral-50 transition-colors shadow-xs"
          >
            <Download className="h-4 w-4 text-black" />
            <span>Export Reconciliation CSV</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Pending Queue Value
          </p>
          <p className="text-xl font-extrabold text-amber-700 mt-1 font-mono">{formatPrice(pendingTotal)}</p>
          <span className="text-[10px] text-neutral-500">
            {payments.filter((p) => p.status === "pending_verification").length} orders awaiting bank check
          </span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Settled / Verified Amount
          </p>
          <p className="text-xl font-extrabold text-emerald-700 mt-1 font-mono">
            {formatPrice(verifiedTotal)}
          </p>
          <span className="text-[10px] text-neutral-500">Credited to {settings.upiId}</span>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">
            Duplicate UTR Flags
          </p>
          <p className="text-xl font-extrabold text-rose-700 mt-1 font-mono">
            {duplicateFlagsCount} Intercepted
          </p>
          <span className="text-[10px] text-neutral-500">Prevented double order fulfillment</span>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-1">
          {[
            { id: "pending_verification", label: "Pending Verification" },
            { id: "verified", label: "Verified & Approved" },
            { id: "rejected", label: "Rejected Payments" },
            { id: "all", label: "All Payments" },
          ].map((tab) => {
            const count =
              tab.id === "all"
                ? payments.length
                : payments.filter((p) => p.status === tab.id).length;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as PaymentVerificationStatus | "all")}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition ${
                  activeTab === tab.id
                    ? "bg-black text-white shadow-xs"
                    : "text-neutral-600 hover:bg-neutral-100 hover:text-black"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                    activeTab === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-neutral-100 text-neutral-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search UTR, order ID, customer name..."
            className="w-full rounded-md border border-neutral-300 bg-white px-3 py-1.5 pl-9 text-xs text-black placeholder-neutral-400 focus:border-black focus:outline-none"
          />
        </div>
      </div>

      {/* Payments Verification Table */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Order & Time</th>
                <th className="p-4">Customer Details</th>
                <th className="p-4">Customer UTR Reference</th>
                <th className="p-4">Payable Amount</th>
                <th className="p-4">Proof Screenshot</th>
                <th className="p-4">Verification Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredPayments.length > 0 ? (
                filteredPayments.map((p) => (
                  <tr key={p.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="p-4 font-mono">
                      <p className="font-bold text-black text-sm">#{p.orderId}</p>
                      <p className="text-neutral-500 text-[11px] font-sans mt-0.5">
                        {new Date(p.submittedAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                          day: "numeric",
                          month: "short",
                        })}
                      </p>
                    </td>

                    <td className="p-4 text-black">
                      <p className="font-semibold text-black">{p.customerName}</p>
                      <p className="text-neutral-500 font-mono text-[11px]">{p.customerPhone}</p>
                    </td>

                    <td className="p-4 font-mono">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-black text-sm tracking-wide bg-neutral-100 border border-neutral-200 px-2 py-0.5 rounded">
                          {p.utrNumber}
                        </span>
                        {p.isDuplicateUtr && (
                          <span className="flex items-center gap-1 rounded bg-rose-50 text-rose-700 px-1.5 py-0.5 text-[10px] font-bold border border-rose-200 font-sans">
                            <AlertOctagon className="h-3 w-3" />
                            <span>DUPLICATE</span>
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 font-mono font-extrabold text-black text-sm">
                      {formatPrice(p.amount)}
                    </td>

                    <td className="p-4">
                      {p.screenshotUrl ? (
                        <div
                          onClick={() => setSelectedPayment(p)}
                          className="flex items-center gap-1.5 text-xs text-black font-semibold hover:underline cursor-pointer"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={p.screenshotUrl}
                            alt="Receipt"
                            className="h-8 w-8 rounded object-cover border border-neutral-200"
                          />
                          <span>View Receipt</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 text-[11px]">No image attached</span>
                      )}
                    </td>

                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-1 text-[11px] font-bold border ${
                          p.status === "verified"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : p.status === "rejected"
                            ? "bg-rose-50 text-rose-700 border-rose-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {p.status === "pending_verification"
                          ? "Pending Check"
                          : p.status === "verified"
                          ? `Verified by ${p.verifiedBy || "Staff"}`
                          : "Rejected"}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      {p.status === "pending_verification" ? (
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="rounded-md bg-black hover:bg-neutral-800 px-3.5 py-1.5 font-semibold text-white text-xs shadow-xs transition-colors"
                        >
                          Verify & Decide
                        </button>
                      ) : (
                        <button
                          onClick={() => setSelectedPayment(p)}
                          className="rounded-md border border-neutral-300 bg-white hover:bg-neutral-50 px-3 py-1 font-semibold text-black text-xs transition-colors"
                        >
                          Audit Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    No payment records found for the selected filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Payment Verify Modal */}
      {selectedPayment && (
        <PaymentVerifyModal
          payment={selectedPayment}
          onClose={() => setSelectedPayment(null)}
        />
      )}
    </div>
  );
}
