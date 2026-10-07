import { supabase, isSupabaseConfigured } from './client';
import type { Order, OrderItem } from '@/lib/types';

/**
 * Customer-facing order reads.
 *
 * These use the browser (anon/authenticated) client and are constrained by RLS
 * to the signed-in user's own orders.
 *
 * NOTE: order creation and cancellation are NOT here. They are privileged,
 * multi-row writes that RLS intentionally blocks from the browser, so they run
 * through the `placeOrderSecure` / `cancelOrderSecure` server actions, which
 * delegate to the `create_order` / `cancel_order` Postgres functions. See
 * `src/app/actions/orders.ts`.
 */

/**
 * Get user's orders
 */
export async function getOrders(userId: string): Promise<Order[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        order_shipping_addresses (*)
      `)
      .eq('user_id', userId)
      .order('placed_at', { ascending: false });

    if (error) throw error;

    return data.map(transformOrder);
  } catch (error) {
    console.error('Error fetching orders:', error);
    return [];
  }
}

/**
 * Get order by ID
 */
export async function getOrderById(orderId: string): Promise<Order | null> {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (*),
        order_shipping_addresses (*)
      `)
      .eq('id', orderId)
      .single();

    if (error) throw error;

    return transformOrder(data);
  } catch (error) {
    console.error('Error fetching order:', error);
    return null;
  }
}

/**
 * Transform database order to app order format
 */
function transformOrder(data: any): Order {
  const items: OrderItem[] = data.order_items?.map((item: any) => {
    const variantParts = (item.variant ?? '').split(' / ');
    return {
      productId: item.product_id,
      name: item.name,
      brand: item.name.split(' ')[0] || '', // Extract brand from name
      price: Number(item.price),
      qty: item.quantity,
      image: item.image,
      color: variantParts[0] || undefined,
      size: variantParts[1] || undefined,
    };
  }) ?? [];

  const shippingAddress = data.order_shipping_addresses?.[0];
  const addressString = shippingAddress
    ? `${shippingAddress.line1}${shippingAddress.line2 ? ', ' + shippingAddress.line2 : ''}, ${shippingAddress.city}, ${shippingAddress.state} - ${shippingAddress.pincode}`
    : '';

  return {
    id: data.id,
    placedAt: data.placed_at,
    items,
    itemTotal: Number(data.subtotal),
    discount: Number(data.discount),
    deliveryCharge: Number(data.shipping_fee),
    // The orders table has no coupon columns. Any coupon discount is already
    // folded into the server-computed `total`, so it is not persisted here.
    coupon: '',
    couponDiscount: 0,
    total: Number(data.total),
    status: data.order_status as any,
    paymentStatus: data.payment_status as any,
    deliveryBy: new Date(new Date(data.placed_at).getTime() + 5 * 24 * 60 * 60 * 1000).toISOString(),
    address: addressString,
    paymentMethod: data.payment_method,
  };
}
