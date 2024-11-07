import { prisma } from "../lib/db";
import { randomUUID } from "node:crypto";
import { sign } from "hono/jwt";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import { addMinutes } from "date-fns";

export async function create(user: any) {
	const pin = Math.floor(100000 + Math.random() * 900000);

	const uuid = randomUUID();

	const token = await sign(
		{
			uuid,
			email: user.email,
			id: user.id,
			exp: Math.floor(addMinutes(new Date(), 5).getTime() / 1000),
		},
		process.env.JWT_SECRET,
	);

	await prisma.pin.upsert({
		create: {
			loginId: user.id,
			pin: String(pin),
		},
		update: {
			pin: String(pin),
		},
		where: {
			loginId: user.id,
		},
	});

	return {
		pin: String(pin),
		token: token,
	};
}

export async function validate(pin: string, uuid: string) {
	const result = await prisma.pin.findUnique({
		where: {
			pin: pin,
			id: uuid,
		},
	});

	if (result === null) {
		throw new HTTPException(HTTPCode.NOT_FOUND, {
			message: "PIN inválido",
		});
	}

	await prisma.pin.delete({
		where: {
			pin: pin,
			id: uuid,
		},
	});
}
