import { Hono } from "hono";

import { authMiddleware } from "../middlewares/auth.middleware";
import { getEmployees } from "../controllers/employees.controller";
import { handleError } from "../utils/error.util";
import { zValidator } from "../middlewares/validator.middleware";
import { getEmployeeSchema } from "../types/employee.type";

const employeesRoute = new Hono();

employeesRoute.use(authMiddleware);

employeesRoute.get("/", zValidator("query", getEmployeeSchema), async (c) => {
	try {
		const query = c.req.valid("query");
		const { companyId } = c.get("user");
		const employees = await getEmployees({ companyId, ...query });
		return c.json(employees, 200);
	} catch (error) {
		return handleError(c, error);
	}
});

// employeesRoute.post("/", async (c) => {
// 	const { companyId } = c.get("user")

// 	await  createEmployee({
// 		employee: "",
// 		companyId: companyId
// 	})

// 	return c.json({ message: "ok" });
// });

export default employeesRoute;
