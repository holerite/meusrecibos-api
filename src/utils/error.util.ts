import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";

export function handleError(c: Context, error: any) {
	if (error instanceof HTTPException) {
		return c.json({ message: error.message }, error.status);
	}
	if (error instanceof Error) {
		return c.json({ message: error.message }, HTTPCode.INTERNAL_SERVER_ERROR);
	}
}
