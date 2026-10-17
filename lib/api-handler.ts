import "server-only";
import { NextResponse } from "next/server";

const GENERIC_ERROR = "Something went wrong on our side. Please try again.";
const DATABASE_ERROR =
  "Our database is temporarily unavailable. Please try again in a moment.";

function isDatabaseError(error: unknown) {
  return error instanceof Error && /^Mongo/.test(error.name);
}

/**
 * Wraps a route handler so unexpected failures return a JSON `{ error }`
 * response (shown to users as a toast) instead of an unhandled 500 page.
 */
export function withApiErrors<Args extends unknown[]>(
  handler: (...args: Args) => Promise<Response> | Response,
) {
  return async (...args: Args): Promise<Response> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof SyntaxError) {
        return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
      }

      console.error("API route failed:", error);
      const database = isDatabaseError(error);
      return NextResponse.json(
        { error: database ? DATABASE_ERROR : GENERIC_ERROR },
        { status: database ? 503 : 500 },
      );
    }
  };
}
