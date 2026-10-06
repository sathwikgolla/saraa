/**
 * Shared types for the customer checkout/cancellation server actions.
 *
 * These live outside the `'use server'` module because every export of a
 * `'use server'` file must be an async function.
 */

export interface PlaceOrderLineInput {
  productId: string;
  qty: number;
  color?: string;
  size?: string;
}

export interface PlaceOrderShippingInput {
  name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface PlaceOrderInput {
  items: PlaceOrderLineInput[];
  shipping: PlaceOrderShippingInput;
  paymentMethod: string;
  coupon?: string;
}

export type PlaceOrderResult =
  | { success: true; orderId: string }
  | { success: false; error: string };

export type CancelOrderResult =
  | { success: true }
  | { success: false; error: string };
