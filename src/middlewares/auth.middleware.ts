import { createMiddleware } from "hono/factory";
import { verify } from "hono/jwt";
import type { ContextVariableMap } from "hono";

type UserPayload = ContextVariableMap["user"];

export const authMiddleware = createMiddleware(async (c, next) => {
	const token = c.req.header("Authorization")?.split(" ")[1];

	if (!token) {
		console.log("Erro: sem token");
		return c.json({ message: "Unauthorized" }, 401);
	}

	try {
		const payload = (await verify(
			token,
			process.env.ACCESS_TOKEN_SECRET,
		)) as UserPayload;
		c.set("user", payload);
	} catch (error) {
		console.log(error);
		return c.json({ message: "Unauthorized" }, 401);
	}

	await next();
});
