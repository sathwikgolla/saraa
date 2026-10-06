import { supabase } from './client';

export interface AuthError {
  message: string;
}

export interface SignUpResult {
  success: boolean;
  error?: string;
  user?: any;
  /** True when Supabase requires email confirmation before a session exists. */
  needsEmailConfirmation?: boolean;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  user?: any;
}

/**
 * Sign up a new user
 */
export async function signUp(data: {
  email: string;
  password: string;
  name: string;
  mobile?: string;
}): Promise<SignUpResult> {
  try {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          name: data.name,
          mobile: data.mobile,
        },
      },
    });

    if (error) {
      return { success: false, error: error.message };
    }

    // With "Confirm email" enabled, signUp returns a user but no session. The
    // caller must not treat that as a logged-in state.
    return {
      success: true,
      user: authData.user,
      needsEmailConfirmation: !authData.session,
    };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred during sign up.' };
  }
}

/**
 * Sign in an existing user
 */
export async function signIn(data: {
  email: string;
  password: string;
}): Promise<SignInResult> {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, user: authData.user };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred during sign in.' };
  }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'An unexpected error occurred during sign out.' };
  }
}

/**
 * Get the current user
 */
export async function getCurrentUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return user;
  } catch (error) {
    return null;
  }
}

/**
 * Get the current session
 */
export async function getSession() {
  try {
    const { data: { session }, error } = await supabase.auth.getSession();

    if (error) {
      return null;
    }

    return session;
  } catch (error) {
    return null;
  }
}

/**
 * Listen to auth state changes
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

/**
 * Get user profile from profiles table
 */
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      return null;
    }

    return data;
  } catch (error) {
    return null;
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(userId: string, data: {
  name?: string;
  mobile?: string;
}) {
  try {
    const { error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to update profile' };
  }
}
