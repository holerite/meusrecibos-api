import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { db } from "../lib/db";
import { EmployeeSchema } from "../schemas/employees.schema";
import { eq, sql } from "drizzle-orm";
import { employeeToCompany } from "../schemas/EmployeeCompany.relation";

const employeesRoute = new Hono();

employeesRoute.use(authMiddleware);

employeesRoute.get("/", async (c) => {
	const { companyId } = c.get("user");

	const companyEmployees = await db
		.select()
		.from(employeeToCompany)
		.where(eq(employeeToCompany.companyId, companyId));

	console.log(companyEmployees);

	const employees = await db
		.select()
		.from(EmployeeSchema)
		.where(sql`id IN ${companyEmployees.map((comp) => `${comp.userId}`)}`);

	return c.json(employees);
});

employeesRoute.post("/", async (c) => {
	return c.json({ message: "ok" });
});

export default employeesRoute;
