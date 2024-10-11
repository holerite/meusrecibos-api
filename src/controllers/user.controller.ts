import { HTTPException } from "hono/http-exception";
import { prisma } from "../lib/db";
import { HTTPCode } from "../utils/http";

export async function getByEmail(email: string) {
	const result = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (result === null) {
		throw new HTTPException(HTTPCode.NOT_FOUND, {
			message: "Usuário inválido",
		});
	}

	return result
}
