import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import * as jwt from "hono/jwt";
import { UserSchema } from "../schemas/user.schema";
import { db } from "../lib/db";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import * as datefns from "date-fns";
import { SystemRoutesSchema } from "../schemas/system-routes.schema";

type TokenPayload = {
	id: number;
	email: string;
	expiresIn: string;
	companyId: number;
};

enum TokenExpiration {
	"30s" = 30,
	"1m" = 60,
	"15m" = 15 * 60,
	"8h" = 8 * 60 * 60,
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = TokenExpiration["1m"];
const REFRESH_TOKEN_EXP = TokenExpiration["15m"];

async function generateToken({
	companyId,
	user,
	secret,
	expires = ACCESS_TOKEN_EXP,
}: {
	user: { id: number; email: string };
	companyId: number;
	secret: string;
	expires?: TokenExpiration;
}): Promise<string> {
	return await jwt.sign(
		{
			id: user.id,
			email: user.email,
			exp:
				datefns
					.add(new Date(), {
						seconds: expires,
					})
					.getTime() / 1000,
			companyId,
		},
		secret,
	);
}

export async function login({
	email,
	companyId,
}: {
	email: string;
	companyId: number;
}) {
	const user = await db
		.select()
		.from(UserSchema)
		.where(eq(UserSchema.email, email))
		.get();

	if (!user) {
		throw new HTTPException(HTTPCode.UNAUTHORIZED, {
			message: "Credenciais inválidas",
		});
	}

	const accessToken = await generateToken({
		user,
		companyId,
		secret: ACCESS_TOKEN_SECRET,
		expires: ACCESS_TOKEN_EXP,
	});

	const refreshToken = await generateToken({
		user,
		companyId,
		secret: REFRESH_TOKEN_SECRET,
		expires: REFRESH_TOKEN_EXP,
	});

	const routes = await db.select({
		id: SystemRoutesSchema.id,
		name: SystemRoutesSchema.name,
		href: SystemRoutesSchema.route
	}).from(SystemRoutesSchema).where(eq(SystemRoutesSchema.active, true))

	await db
		.update(UserSchema)
		.set({
			refreshToken: refreshToken,
			refreshTokenExpiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000), // 8 hours now
		})
		.where(eq(UserSchema.id, user.id));

	return {
		accessToken,
		refreshToken,
		user: {
			companyId: companyId,
			id: user.id,
			name: user.name,
			email: user.email,
			routes: routes
		},
	};
}

export async function logout(id: number) {
	await db
		.update(UserSchema)
		.set({
			refreshToken: null,
			refreshTokenExpiresAt: null,
		})
		.where(eq(UserSchema.id, id));

	return { message: "Logout successful" };
}

export async function register({
	name,
	email,
}: {
	name: string;
	email: string;
	password: string;
}) {
	try {
		await db
			.insert(UserSchema)
			.values({
				name: name,
				email: email,
				refreshToken: null,
				refreshTokenExpiresAt: null,
			})
			.returning();

		return {
			message: "User registered successfully",
		};
	} catch (error) {
		console.error("Registration error:", error);
		return { message: "An error occurred during registration" };
	}
}

export async function refreshToken({ refreshToken }: { refreshToken: string }) {
	try {
		const payload = (await jwt.verify(
			refreshToken,
			REFRESH_TOKEN_SECRET,
		)) as TokenPayload;
		const user = await db
			.select()
			.from(UserSchema)
			.where(
				sql`${eq(UserSchema.id, payload.id)} AND ${eq(UserSchema.refreshToken, refreshToken)}`,
			)
			.get();

		// biome-ignore lint/style/noNonNullAssertion: <explanation>
		if (!user || new Date(user.refreshTokenExpiresAt!) < new Date()) {
			return { message: "Invalid or expired refresh token" };
		}

		const newAccessToken = await generateToken({
			companyId: payload.companyId,
			user: { id: user.id, email: user.email },
			secret: ACCESS_TOKEN_SECRET,
			expires: ACCESS_TOKEN_EXP,
		});
		const newRefreshToken = await generateToken({
			companyId: payload.companyId,
			user: { id: user.id, email: user.email },
			secret: REFRESH_TOKEN_SECRET,
			expires: REFRESH_TOKEN_EXP,
		});

		await db
			.update(UserSchema)
			.set({
				refreshToken: newRefreshToken,
				refreshTokenExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
			})
			.where(eq(UserSchema.id, user.id));

		return { accessToken: newAccessToken, refreshToken: newRefreshToken };
	} catch (error) {
		console.error("Refresh token error:", error);
		return { message: "Invalid refresh token" };
	}
}
