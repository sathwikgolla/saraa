"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Download,
  Mail,
  MapPin,
  Phone,
  Search,
  ShoppingBag,
  User,
  Users,
  X,
} from "lucide-react";
import { useAdmin } from "@/context/AdminContext";
import { formatPrice } from "@/lib/utils";
import type { AdminCustomer } from "@/lib/adminTypes";

export default function AdminCustomersPage() {
  const { customers, orders, toggleCustomerBlock, exportToCsv } = useAdmin();
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<AdminCustomer | null>(null);
  const [blockReason, setBlockReason] = useState("");
  const [blockingTarget, setBlockingTarget] = useState<AdminCustomer | null>(null);

  const filteredCustomers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return customers.filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.includes(q)
    );
  }, [customers, search]);

  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      (o) =>
        o.customerPhone === selectedCustomer.phone ||
        o.customerEmail.toLowerCase() === selectedCustomer.email.toLowerCase()
    );
  }, [orders, selectedCustomer]);

  const handleExportCsv = () => {
    const data = customers.map((c) => ({
      ID: c.id,
      Name: c.name,
      Email: c.email,
      Phone: c.phone,
      Total_Orders: c.totalOrders,
      Total_Spent: c.totalSpend,
      Joined_Date: c.joinedDate,
      Last_Order_Date: c.lastOrderDate,
      Status: c.status,
      Block_Reason: c.blockReason || "N/A",
    }));
    exportToCsv(data, "Miracle_Customers");
  };

  const handleConfirmBlock = () => {
    if (!blockingTarget) return;
    toggleCustomerBlock(blockingTarget.id, blockReason.trim() || "Flagged by Admin");
    setBlockingTarget(null);
    setBlockReason("");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-sm">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-black">
                Customer Directory
              </h1>
              <p className="text-xs text-neutral-500">
                Customer accounts, order histories, lifetime metrics, and fraud controls
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3.5 py-2 text-xs font-semibold text-black hover:bg-neutral-100 transition shadow-sm"
          >
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Export Customers CSV</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-neutral-200 pb-3">
        <div className="text-xs text-neutral-500 font-medium">
          Showing <strong className="text-black">{filteredCustomers.length}</strong> registered shoppers
        </div>

        <div className="relative min-w-[260px]">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, email, phone..."
            className="w-full rounded-lg border border-neutral-300 bg-white px-3 py-1.5 pl-9 text-xs text-black placeholder-neutral-400 focus:border-black focus:outline-none"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider text-[11px] font-semibold">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Details</th>
                <th className="p-4">Total Orders</th>
                <th className="p-4">Lifetime Spend</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-neutral-500">
                    No matching customers found.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50 transition">
                    <td className="p-4">
                      <p className="font-semibold text-black text-sm">{c.name}</p>
                      <p className="text-[11px] text-neutral-400">ID: {c.id}</p>
                    </td>

                    <td className="p-4 text-neutral-600">
                      <p>{c.email}</p>
                      <p className="font-mono text-neutral-400 text-[11px]">{c.phone}</p>
                    </td>

                    <td className="p-4 font-mono">
                      <span className="font-bold text-black text-sm">{c.totalOrders}</span> orders
                    </td>

                    <td className="p-4 font-mono font-bold text-black text-sm">
                      {formatPrice(c.totalSpend)}
                    </td>

                    <td className="p-4 text-neutral-500">{c.joinedDate}</td>

                    <td className="p-4">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-[10px] font-bold ${
                          c.status === "active"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-rose-50 text-rose-700 border border-rose-200"
                        }`}
                      >
                        {c.status.toUpperCase()}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="rounded-lg border border-neutral-300 bg-white hover:bg-neutral-100 px-3 py-1 font-semibold text-black transition shadow-sm"
                        >
                          Profile & History
                        </button>

                        {c.status === "active" ? (
                          <button
                            onClick={() => setBlockingTarget(c)}
                            className="rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50 px-2.5 py-1 text-[11px] font-semibold transition"
                          >
                            Block
                          </button>
                        ) : (
                          <button
                            onClick={() => toggleCustomerBlock(c.id)}
                            className="rounded-lg border border-emerald-200 text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold transition"
                          >
                            Unblock
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Detail Drawer / Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-neutral-200 bg-white shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-neutral-200 bg-neutral-50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-neutral-200 text-black">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-black">{selectedCustomer.name}</h2>
                  <p className="text-xs text-neutral-500">Customer Purchase Record</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="rounded-lg p-1.5 text-neutral-500 hover:bg-neutral-200 hover:text-black transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-neutral-500 text-[10px]">Total Orders</p>
                  <p className="text-base font-bold text-black mt-0.5">{selectedCustomer.totalOrders}</p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-neutral-500 text-[10px]">Total Spent</p>
                  <p className="text-base font-bold text-black font-mono mt-0.5">
                    {formatPrice(selectedCustomer.totalSpend)}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-neutral-500 text-[10px]">Avg Order Value</p>
                  <p className="text-base font-bold text-black font-mono mt-0.5">
                    {selectedCustomer.totalOrders > 0
                      ? formatPrice(Math.round(selectedCustomer.totalSpend / selectedCustomer.totalOrders))
                      : "₹0"}
                  </p>
                </div>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3">
                  <p className="text-neutral-500 text-[10px]">Account Status</p>
                  <p
                    className={`text-xs font-bold mt-1 uppercase ${
                      selectedCustomer.status === "active" ? "text-emerald-700" : "text-rose-600"
                    }`}
                  >
                    {selectedCustomer.status}
                  </p>
                </div>
              </div>

              {selectedCustomer.blockReason && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 p-3.5 text-rose-800">
                  <p className="font-bold text-xs">Fraud / Block Reason:</p>
                  <p className="text-[11px] mt-1 text-rose-700">{selectedCustomer.blockReason}</p>
                </div>
              )}

              {/* Order History */}
              <div className="space-y-2">
                <p className="font-semibold uppercase tracking-wider text-neutral-500">
                  Order History ({customerOrders.length} records)
                </p>
                <div className="rounded-xl border border-neutral-200 divide-y divide-neutral-200 overflow-hidden">
                  {customerOrders.length > 0 ? (
                    customerOrders.map((o) => (
                      <div key={o.id} className="p-3 bg-neutral-50/50 flex justify-between items-center">
                        <div>
                          <p className="font-bold text-black font-mono">#{o.id}</p>
                          <p className="text-neutral-500 text-[11px]">
                            {new Date(o.placedAt).toLocaleDateString()} • {o.items.length} items
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono font-bold text-black">{formatPrice(o.total)}</p>
                          <span className="text-[10px] text-neutral-600 font-semibold">{o.orderStatus}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="p-4 text-center text-neutral-500">No linked orders found.</p>
                  )}
                </div>
              </div>

              {/* Saved Address */}
              <div className="space-y-1.5">
                <p className="font-semibold uppercase tracking-wider text-neutral-500">
                  Registered Addresses
                </p>
                <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-neutral-700">
                  {selectedCustomer.addresses.join(", ")}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Block Confirmation Modal */}
      {blockingTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-3 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl space-y-4 text-xs">
            <h3 className="text-sm font-bold text-rose-600">
              Block Customer &quot;{blockingTarget.name}&quot;?
            </h3>
            <p className="text-neutral-600">
              Blocked customers are restricted from submitting further UTR payments or guest checkout orders.
            </p>
            <div className="space-y-1">
              <label className="text-neutral-700 font-medium">Specify Reason</label>
              <textarea
                rows={2}
                value={blockReason}
                onChange={(e) => setBlockReason(e.target.value)}
                placeholder="e.g. Repeated fraudulent UTR submissions..."
                className="w-full rounded-lg border border-neutral-300 bg-white p-2 text-black placeholder-neutral-400 focus:border-black focus:outline-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setBlockingTarget(null)}
                className="px-3 py-1.5 font-semibold text-neutral-600 hover:text-black transition"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBlock}
                className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 font-semibold text-white transition shadow-sm"
              >
                Confirm Block
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
