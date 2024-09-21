import { getCookie, setCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { decode, verify } from "hono/jwt";
import { JwtTokenExpired } from "hono/utils/jwt/types";
import { refreshToken } from "../controllers/auth.controller";

export const authMiddleware = createMiddleware(async (c, next) => {
	const token = c.req.header("Authorization")?.split(" ")[1];
	const refreshCookieToken = getCookie(c, "refreshToken");

	if (!token) {
		console.log("Erro: sem token");
		return c.json({ message: "Unauthorized" }, 401);
	}

	if (!refreshCookieToken) {
		console.log("Erro: sem refreshCookieToken");
		return c.json({ message: "Unauthorized" }, 401);
	}

	try {
		const payload = await verify(token, process.env.ACCESS_TOKEN_SECRET);

		c.set("user", payload);
	} catch (error) {
		if (error instanceof JwtTokenExpired) {
			try {
				const newToken = await refreshToken({
					refreshToken: refreshCookieToken,
				});

				if (!newToken.refreshToken || !newToken.accessToken) {
					console.error("Error refreshing token:", newToken);
					return c.json({ message: "Unauthorized" }, 401);
				}

				setCookie(c, "refreshToken", newToken.refreshToken);

				const { payload } = decode(newToken.refreshToken);

				c.set("user", payload);
				c.res.headers.set("New-Token", newToken.accessToken);
			} catch (error) {
				console.error("Error refreshing token:", error);
				return c.json({ message: "Unauthorized 3" }, 401);
			}
		}
	}

	await next();
});
