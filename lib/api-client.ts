import { showToast } from "./toast";

/** Error raised by apiFetch; `message` is safe to show to users. */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

const NETWORK_ERROR = "Network error. Please check your connection and try again.";
const SERVER_ERROR = "Something went wrong on our side. Please try again.";

interface ApiFetchOptions extends Omit<RequestInit, "body"> {
  /** JSON-serialisable body; sets the Content-Type header automatically. */
  json?: unknown;
  body?: BodyInit;
  /** Show the error message as a toast (default true). */
  toastOnError?: boolean;
}

export function getErrorMessage(error: unknown, fallback = SERVER_ERROR): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

/**
 * fetch wrapper for the app's JSON API: parses the response, turns non-2xx
 * responses into ApiError using the backend's `{ error }` message, and toasts it.
 */
export async function apiFetch<T = unknown>(
  url: string,
  { json, toastOnError = true, headers, ...init }: ApiFetchOptions = {},
): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      ...init,
      headers:
        json !== undefined
          ? { "Content-Type": "application/json", ...headers }
          : headers,
      body: json !== undefined ? JSON.stringify(json) : init.body,
    });
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    const apiError = new ApiError(NETWORK_ERROR, 0);
    if (toastOnError) showToast(apiError.message, "error");
    throw apiError;
  }

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (data && typeof data.error === "string" && data.error) ||
      (response.status >= 500 ? SERVER_ERROR : `Request failed (${response.status}).`);
    const apiError = new ApiError(message, response.status);
    if (toastOnError) showToast(message, "error");
    throw apiError;
  }

  return data as T;
}
