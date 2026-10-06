import { supabase } from './client';

/**
 * Get user's wishlist
 */
export async function getWishlist(userId: string): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('product_id')
      .eq('user_id', userId);

    if (error) throw error;

    return data.map((item: any) => item.product_id);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    return [];
  }
}

/**
 * Add item to wishlist
 */
export async function addToWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .insert({
        user_id: userId,
        product_id: productId,
      });

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    return false;
  }
}

/**
 * Remove item from wishlist
 */
export async function removeFromWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .eq('user_id', userId)
      .eq('product_id', productId);

    if (error) throw error;

    return true;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    return false;
  }
}

/**
 * Check if product is in wishlist
 */
export async function isInWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('wishlist_items')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Not found
        return false;
      }
      throw error;
    }

    return !!data;
  } catch (error) {
    console.error('Error checking wishlist:', error);
    return false;
  }
}

/**
 * Toggle wishlist item
 */
export async function toggleWishlist(
  userId: string,
  productId: string
): Promise<boolean> {
  const inWishlist = await isInWishlist(userId, productId);

  if (inWishlist) {
    return removeFromWishlist(userId, productId);
  } else {
    return addToWishlist(userId, productId);
  }
}
