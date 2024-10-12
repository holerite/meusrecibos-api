import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { deleteUser, getAll } from "../controllers/user.controller";
import { handleError } from "../utils/error.util";

const userRoute = new Hono();

userRoute.use(authMiddleware);

userRoute.get("/", async (c) => {
	try {
		const { companyId } = c.get("user");

		const users = await getAll(companyId);

		return c.json(users);
	} catch (e) {
		return handleError(c, e);
	}
});

userRoute.delete("/:id", async (c) => {
	try {
		const userId = c.req.param("id");
		const { companyId } = c.get("user");

		await deleteUser(companyId, Number(userId));

		return c.json({ message: "Usuário removido com sucesso" });
	} catch (error) {
		return handleError(c, e);
	}
});

export default userRoute;
