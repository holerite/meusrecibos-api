import { Hono } from "hono";

import { authMiddleware } from "../middlewares/auth.middleware";
import {
	createEmployee,
	getEmployees,
	getByEmail,
	saveUserToken,
} from "../controllers/employees.controller";
import { handleError } from "../utils/error.util";
import { zValidator } from "../middlewares/validator.middleware";
import {
	createEmployeeSchema,
	getEmployeeSchema,
} from "../types/employee.type";
import * as authValidator from "../validators/auth.validator";
import * as pinController from "../controllers/pin.controller";
import { sendToken } from "../controllers/email.controller";
import { jwt } from "hono/jwt";
import * as companyController from "../controllers/companies.controller";
import * as authController from "../controllers/auth.controller";

const employeesRoute = new Hono();

employeesRoute.get(
	"/",
	authMiddleware,
	zValidator("query", getEmployeeSchema),
	async (c) => {
		try {
			const query = c.req.valid("query");
			const { companyId } = c.get("user");
			const employees = await getEmployees({ companyId, ...query });
			return c.json(employees, 200);
		} catch (error) {
			return handleError(c, error);
		}
	},
);

employeesRoute.post(
	"/",
	authMiddleware,
	zValidator("json", createEmployeeSchema),
	async (c) => {
		try {
			const { companyId } = c.get("user");
			const employee = c.req.valid("json");

			await createEmployee({
				...employee,
				companyId: companyId,
			});

			return c.json({ message: "Colaborador criado com sucesso" });
		} catch (error) {
			return handleError(c, error);
		}
	},
);

employeesRoute.post(
	"/login",
	zValidator("json", authValidator.login),
	async (c) => {
		try {
			const { email } = c.req.valid("json");

			const user = await getByEmail(email);

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
	},
);

employeesRoute.post(
	"/signIn",
	zValidator("json", authValidator.signIn),
	jwt({
		secret: process.env.JWT_SECRET,
	}),
	async (c) => {
		try {
			const { pin } = c.req.valid("json");
			const { uuid, id } = c.get("jwtPayload");

			if (process.env.NODE_ENV === "production") {
				await pinController.validate(pin, uuid);
			}

			const companies = await companyController.getByEmployeeId(id);

			return c.json({ companies });
		} catch (error) {
			return handleError(c, error);
		}
	},
);

employeesRoute.post(
	"/company",
	zValidator("json", authValidator.company),
	jwt({
		secret: process.env.JWT_SECRET,
	}),
	async (c) => {
		try {
			const { companyId } = c.req.valid("json");

			const { email } = c.get("jwtPayload");
			const user = await getByEmail(email);

			const routes = await authController.getSystemRoutes("employee");

			const result = await authController.login({
				user,
				companyId,
				isAdmin: false,
			});

			await saveUserToken(result.accessToken, user);

			result.user.routes = routes;

			return c.json(result);
		} catch (error) {
			return handleError(c, error);
		}
	},
);

export default employeesRoute;
