import { eq } from "drizzle-orm";
import { db } from "../lib/db";
import { UserSchema } from "../schemas/user.schema";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";

export async function getByEmail(email: string) {
	const result = await db
		.select()
		.from(UserSchema)
		.where(eq(UserSchema.email, email));

	if (result.length === 0) {
		throw new HTTPException(HTTPCode.NOT_FOUND, {
			message: "Usuário não encontrado",
		});
	}

	return result[0];
}
