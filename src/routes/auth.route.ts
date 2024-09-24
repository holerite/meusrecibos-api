import { Hono } from "hono";
import { zValidator } from "../middlewares/validator.middleware";
import { sendToken } from "../controllers/email.controller";
import { jwt } from "hono/jwt";
import { handleError } from "../utils/error.util";
import * as userController from "../controllers/user.controller";
import * as pinController from "../controllers/pin.controller";
import * as companyController from "../controllers/companies.controller";
import * as authController from "../controllers/auth.controller";
import * as authValidator from "../validators/auth.validator";
import { authMiddleware } from "../middlewares/auth.middleware";
import { setCookie } from "hono/cookie";

type Variables = {
	user: {
		id: number;
		email: string;
		companyId: number;
	}
  }
  
const auth = new Hono<{ Variables: Variables }>();

auth.post("/login", zValidator("json", authValidator.login), async (c) => {
	try {
		const { email } = c.req.valid("json");

		const user = await userController.getByEmail(email);

		const { pin, token } = await pinController.create(user);

		if (process.env.NODE_ENV === "production") {
			await sendToken(String(pin), email);
		} else {
			return c.json({ token, pin });
		}

		return c.json({ token });
	} catch (error) {
		return handleError(c, error);
	}
});

auth.post(
	"/signIn",
	zValidator("json", authValidator.signIn),
	jwt({
		secret: process.env.JWT_SECRET,
	}),
	async (c) => {
		try {
			const { pin, userId } = c.req.valid("json");
			const { uuid } = c.get("jwtPayload");

			if (process.env.NODE_ENV === "production") {
				await pinController.validate(userId, pin, uuid);
			}

			const companies = await companyController.get(userId);

			return c.json({ companies });
		} catch (error) {
			return handleError(c, error);
		}
	},
);

auth.post(
	"/company",
	zValidator("json", authValidator.company),
	jwt({
		secret: process.env.JWT_SECRET,
	}),
	async (c) => {
		try {
			const { companyId } = c.req.valid("json");

			const { email } = c.get("jwtPayload");

			const result = await authController.login({ email, companyId });

			setCookie(c, "refreshToken", result.refreshToken);

			return c.json(result);
		} catch (error) {
			return handleError(c, error);
		}
	},
);

auth.post("/logout", authMiddleware, async (c) => {
	try {
		const { id } = c.get("user");

		await authController.logout(id);
		return c.json({ message: "Usuário deslogado com sucesso" }, 200);
	} catch (error) {
		return handleError(c, error);
	}
});

export default auth;
