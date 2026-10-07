import { supabase, isSupabaseConfigured } from './client';
import type { Address } from '@/lib/types';

/**
 * Get user's addresses
 */
export async function getAddresses(userId: string): Promise<Address[]> {
  if (!isSupabaseConfigured() || !userId) return [];
  try {
    const { data, error } = await supabase
      .from('addresses')
      .select('*')
      .eq('user_id', userId)
      .order('is_default', { ascending: false });

    if (error) throw error;

    return data.map(transformAddress);
  } catch (error) {
    console.error('Error fetching addresses:', error);
    return [];
  }
}

/**
 * Add new address
 */
export async function addAddress(
  userId: string,
  address: Omit<Address, 'id'>
): Promise<Address | null> {
  try {
    const { data, error } = await supabase
      .from('addresses')
      .insert({
        user_id: userId,
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
        is_default: false,
      })
      .select()
      .single();

    if (error) throw error;

    return transformAddress(data);
  } catch (error) {
    console.error('Error adding address:', error);
    return null;
  }
}

/**
 * Update address
 */
export async function updateAddress(
  addressId: string,
  userId: string,
  address: Partial<Address>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('addresses')
      .update({
        name: address.name,
        phone: address.phone,
        line1: address.line1,
        line2: address.line2,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
      })
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error updating address:', error);
    return false;
  }
}

/**
 * Delete address
 */
export async function deleteAddress(
  addressId: string,
  userId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('addresses')
      .delete()
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error deleting address:', error);
    return false;
  }
}

/**
 * Set default address
 */
export async function setDefaultAddress(
  addressId: string,
  userId: string
): Promise<boolean> {
  try {
    // First, remove default from all addresses
    await supabase
      .from('addresses')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Then set the new default
    const { error } = await supabase
      .from('addresses')
      .update({ is_default: true })
      .eq('id', addressId)
      .eq('user_id', userId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error setting default address:', error);
    return false;
  }
}

/**
 * Transform database address to app address format
 */
function transformAddress(data: any): Address {
  return {
    id: data.id,
    name: data.name,
    phone: data.phone,
    line1: data.line1,
    line2: data.line2 ?? undefined,
    city: data.city,
    state: data.state,
    pincode: data.pincode,
    landmark: data.landmark ?? undefined,
  };
}
