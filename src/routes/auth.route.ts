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
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";

const auth = new Hono();

auth.post("/login", zValidator("json", authValidator.login), async (c) => {
  try {
    const { email } = c.req.valid("json");

    const user = await userController.getUserByEmail(email);

    if (user === null) {
      throw new HTTPException(HTTPCode.NOT_FOUND, {
        message: "Usuário inválido",
      });
    }

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
      const { pin } = c.req.valid("json");
      const { uuid, id } = c.get("jwtPayload");

      if (process.env.NODE_ENV === "production") {
        await pinController.validate(pin, uuid);
      }

      const companies = await companyController.getByUserId(id);

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
      const user = await userController.getUserByEmail(email);

      if (user === null) {
        throw new HTTPException(HTTPCode.NOT_FOUND, {
          message: "Usuário inválido",
        });
      }

      const result = await authController.login({
        user,
        companyId,
        isAdmin: true,
      });

      const routes = await authController.getSystemRoutes("user");

      await authController.saveUserToken(result.accessToken, user);

      result.user.routes = routes;

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  },
);

auth.post(
  "/change-company",
  zValidator("json", authValidator.company),
  authMiddleware,
  async (c) => {
    try {
      const { companyId } = c.req.valid("json");

      const { id } = c.get("user");

      const user = await userController.getUserById(id);

      if (user === null) {
        throw new HTTPException(HTTPCode.NOT_FOUND, {
          message: "Usuário inválido",
        });
      }

      const result = await authController.login({
        user,
        companyId,
        isAdmin: true,
      });

      const routes = await authController.getSystemRoutes("user");

      await authController.saveUserToken(result.accessToken, user);

      result.user.routes = routes;

      return c.json(result);
    } catch (error) {
      return handleError(c, error);
    }
  },
);

auth.post("/logout", authMiddleware, async (c) => {
  try {
    const { id, isAdmin } = c.get("user");

    await authController.logout(id, isAdmin);
    return c.json({ message: "Usuário deslogado com sucesso" }, 200);
  } catch (error) {
    return handleError(c, error);
  }
});

auth.get(
  "/company",
  authMiddleware,
  async (c) => {
    try {
      const { id } = c.get("user");

      const employees = await companyController.getByUserId(id);
      return c.json(employees, 200);
    } catch (error) {
      return handleError(c, error);
    }
  },
);

auth.get(
  "/company",
  authMiddleware,
  async (c) => {
    try {
      const { id } = c.get("user");

      const employees = await companyController.getByUserId(id);
      return c.json(employees, 200);
    } catch (error) {
      return handleError(c, error);
    }
  },
);

export default auth;
