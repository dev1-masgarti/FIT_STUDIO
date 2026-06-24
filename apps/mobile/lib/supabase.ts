/**
 * Deprecated shim.
 * Runtime data path now uses the dedicated backend API only.
 */
export const isSupabaseConfigured = (): boolean => false;

export const getSupabaseClient = (): never => {
  throw new Error('Supabase transport is disabled. Use dedicated backend client instead.');
};
