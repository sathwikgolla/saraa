"use server";

import { ADMIN_MESSAGES, type AdminActionResult } from "@/lib/adminActionResult";
import { requireAdmin } from "@/lib/supabase/require-admin";
import { adminSupabase } from "@/lib/supabase/admin";

/**
 * Server actions for order management (admin only).
 *
 * Customers can never reach these: they require a server-verified admin
 * session, and order-status writes use the service-role client.
 */

export async function adminUpdateOrderStatus(
  orderId: string,
  status: string,
  staffName: string,
  note?: string
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    const now = new Date().toISOString();

    const { error } = await adminSupabase
      .from('orders')
      .update({
        order_status: status,
        updated_at: now,
      })
      .eq('id', orderId);

    if (error) throw error;

    // Add timeline entry
    await adminSupabase.from('order_timeline').insert({
      order_id: orderId,
      status,
      timestamp: now,
      note: note || `Status updated to ${status}`,
      staff_name: staffName,
    });

    // Create audit log
    await adminSupabase.from('audit_logs').insert({
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
      staff_name: staffName,
      role: 'Admin',
      module: 'Orders',
      action: 'Update',
      description: `Updated order ${orderId} status to ${status}`,
      ip_address: 'unknown',
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error updating order status:', error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}

export async function adminVerifyPayment(
  paymentId: string,
  staffName: string
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    const now = new Date().toISOString();

    const { error } = await adminSupabase
      .from('payments')
      .update({
        status: 'verified',
        verified_at: now,
        verified_by: staffName,
      })
      .eq('id', paymentId);

    if (error) throw error;

    // Update order status
    const { data: payment } = await adminSupabase
      .from('payments')
      .select('order_id')
      .eq('id', paymentId)
      .single();

    if (payment) {
      await adminSupabase
        .from('orders')
        .update({
          payment_status: 'Verified',
          order_status: 'Payment Verified',
          updated_at: now,
        })
        .eq('id', payment.order_id);
    }

    // Create audit log
    await adminSupabase.from('audit_logs').insert({
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
      staff_name: staffName,
      role: 'Admin',
      module: 'Payments',
      action: 'Verify',
      description: `Verified payment ${paymentId}`,
      ip_address: 'unknown',
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}

export async function adminRejectPayment(
  paymentId: string,
  reason: string,
  staffName: string
): Promise<AdminActionResult<undefined>> {
  const guard = await requireAdmin();
  if (!guard.ok) return guard.failure;

  try {
    const now = new Date().toISOString();

    const { error } = await adminSupabase
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: reason,
        verified_at: now,
        verified_by: staffName,
      })
      .eq('id', paymentId);

    if (error) throw error;

    // Update order status
    const { data: payment } = await adminSupabase
      .from('payments')
      .select('order_id')
      .eq('id', paymentId)
      .single();

    if (payment) {
      await adminSupabase
        .from('orders')
        .update({
          payment_status: 'Failed',
          order_status: 'Payment Rejected',
          updated_at: now,
        })
        .eq('id', payment.order_id);
    }

    // Create audit log
    await adminSupabase.from('audit_logs').insert({
      id: `LOG-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date().toISOString(),
      staff_name: staffName,
      role: 'Admin',
      module: 'Payments',
      action: 'Reject',
      description: `Rejected payment ${paymentId}: ${reason}`,
      ip_address: 'unknown',
    });

    return { success: true, data: undefined };
  } catch (error) {
    console.error('Error rejecting payment:', error);
    return { success: false, status: 500, error: ADMIN_MESSAGES.failed };
  }
}
