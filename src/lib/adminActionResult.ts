/**
 * Shared result shape for server-side admin operations.
 *
 * Admin server actions never leak raw database errors, SQL, or stack traces to
 * the browser. They return a safe message plus the HTTP-equivalent status the
 * server would have used:
 *   - 401 when the caller is not authenticated
 *   - 403 when authenticated but not an admin
 *   - 500 for an unexpected server-side failure
 */
export interface AdminActionFailure {
  success: false;
  status: number;
  error: string;
}

export interface AdminActionSuccess<T> {
  success: true;
  data: T;
}

export type AdminActionResult<T = undefined> =
  | AdminActionSuccess<T>
  | AdminActionFailure;

/** Safe, non-revealing messages returned to the client. */
export const ADMIN_MESSAGES = {
  unauthorized: "You must be logged in.",
  forbidden: "You do not have permission to perform this action.",
  failed: "Operation failed. Please try again.",
} as const;
