import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import { captureException,  } from "@sentry/node";
import { Prisma } from "@prisma/client";

export function handleError(c: Context, error: any) {
	console.log(error)
	if (process.env.NODE_ENV === "production") {
		captureException(error);
	}

	if (error instanceof Prisma.PrismaClientKnownRequestError || error instanceof Prisma.PrismaClientValidationError ) {
			return c.json({ message: error.message }, HTTPCode.BAD_REQUEST);
	}

	if (error instanceof HTTPException) {
		return c.json({ message: error.message }, error.status);
	}

	if (error instanceof Error) {
		return c.json(error, HTTPCode.INTERNAL_SERVER_ERROR);
	}
}
