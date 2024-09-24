import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import { captureException,  } from "@sentry/node";

export function handleError(c: Context, error: any) {
	if (process.env.NODE_ENV === "production") {
		captureException(error);
	}

	if (error instanceof HTTPException) {
		return c.json({ message: error.message }, error.status);
	}
	if (error instanceof Error) {
		return c.json({ message: error.message }, HTTPCode.INTERNAL_SERVER_ERROR);
	}
}
