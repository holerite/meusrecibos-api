import { Hono } from "hono";

import { authMiddleware } from "../middlewares/auth.middleware";
import {
	createEmployee,
	getEmployees,
} from "../controllers/employees.controller";
import { handleError } from "../utils/error.util";
import { zValidator } from "../middlewares/validator.middleware";
import {
	createEmployeeSchema,
	getEmployeeSchema,
} from "../types/employee.type";

const employeesRoute = new Hono();

employeesRoute.use(authMiddleware);

employeesRoute.get("/", zValidator("query", getEmployeeSchema), async (c) => {
	try {
		const query = c.req.valid("query");
		const { companyId } = c.get("user");
		const employees = await getEmployees({ companyId, ...query });
		return c.json(employees, 200);
	} catch (error) {
		console.log(error);
		return handleError(c, error);
	}
});

employeesRoute.post(
	"/",
	zValidator("json", createEmployeeSchema),
	async (c) => {
		const { companyId } = c.get("user");
		const employee = c.req.valid("json");

		await createEmployee({
			...employee,
			companyId: companyId,
		});

		return c.json({ message: "Colaborador criado com sucesso" });
	},
);

export default employeesRoute;
