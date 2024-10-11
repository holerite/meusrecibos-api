import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { prisma } from "../lib/db";

type Variables = {
	user: User;
};

const userRoute = new Hono<{ Variables: Variables }>();

userRoute.use(authMiddleware);

userRoute.get("/", async (c) => {
	try {
		const teste = c.get("user");
		return c.json({ message: teste });
	} catch (e) {
		return c.json({ message: "Error", e }, 500);
	}
});	

export default userRoute;
