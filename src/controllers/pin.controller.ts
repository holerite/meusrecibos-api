import { db } from "../lib/db";
import { randomUUID } from "node:crypto";
import { PinSchema } from "../schemas/pin.schema";
import { sign } from "hono/jwt";
import { and, eq } from "drizzle-orm";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import type { selectUserSchema } from "../schemas/user.schema";
import type { z } from "zod";
import { addMinutes } from "date-fns";

export async function create(user: z.infer<typeof selectUserSchema>) {
	const pin = Math.floor(100000 + Math.random() * 900000);

	const uuid = randomUUID();

	const token = await sign({ uuid, email: user.email, id: user.id, exp: Math.floor(addMinutes(new Date(), 5).getTime() / 1000) }, process.env.JWT_SECRET);

	await db.delete(PinSchema).where(eq(PinSchema.userId, user.id));

	await db
		.insert(PinSchema)
		.values({ id: uuid, userId: user.id, pin: String(pin) });

	return {
		pin: String(pin),
		token: token,
	};
}

export async function validate(pin: string, uuid: string) {
	const result = await db
		.select()
		.from(PinSchema)
		.where(
			and(
				eq(PinSchema.pin, pin),
				eq(PinSchema.id, uuid),
			),
		);

	if (result.length === 0) {
		throw new HTTPException(HTTPCode.NOT_FOUND, {
			message: "PIN inválido",
		});
	}

	await db
		.delete(PinSchema)
		.where(and(eq(PinSchema.pin, pin)));
}
