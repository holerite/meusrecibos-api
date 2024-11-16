import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { createUser, deleteUser, getAll } from "../controllers/user.controller";
import { handleError } from "../utils/error.util";
import { z } from "zod";
import { zValidator } from "../middlewares/validator.middleware";

const userRoute = new Hono();

userRoute.use(authMiddleware);

userRoute.get("/", async (c) => {
	try {
		const { companyId, id } = c.get("user");

		const users = await getAll(companyId, id);

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
	} catch (e) {
		return handleError(c, e);
	}
});

const addUserSchema = z.object({
	email: z.string(),
	name: z.string(),
});

userRoute.post("/", zValidator("json", addUserSchema), async (c) => {
	try {
		const { companyId } = c.get("user");
		const { email, name } = c.req.valid("json");

		await createUser(email, name, companyId);
		//TODO: Enviar email para o usuário, dizendo que foi cadastrado na empresa

		return c.json({ message: "Usuário vinculado com sucesso" });
	} catch (e) {
		return handleError(c, e);
	}
});

export default userRoute;
