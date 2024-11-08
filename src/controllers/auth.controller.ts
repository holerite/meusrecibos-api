import "dotenv/config";
import * as jwt from "hono/jwt";
import { prisma } from "../lib/db";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import * as datefns from "date-fns";
import type { Employee, User } from "@prisma/client";

type TokenPayload = {
  id: number;
  email: string;
  expiresIn: string;
  companyId: number;
  isAdmin: boolean;
};

enum TokenExpiration {
  "30s" = 30,
  "1m" = 60,
  "15m" = 15 * 60,
  "8h" = 8 * 60 * 60,
}

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
const ACCESS_TOKEN_EXP = TokenExpiration["8h"];
const REFRESH_TOKEN_EXP = TokenExpiration["8h"];

async function generateToken({
  companyId,
  user,
  isAdmin,
  secret,
  expires = ACCESS_TOKEN_EXP,
}: {
  user: User | Employee;
  companyId: number;
  isAdmin: boolean;
  secret: string;
  expires?: TokenExpiration;
}): Promise<string> {
  return await jwt.sign(
    {
      id: user.id,
      email: user.email,
      isAdmin,
      exp: datefns
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
  user,
  companyId,
  isAdmin,
}: {
  user: User | Employee;
  companyId: number;
  isAdmin: boolean;
}) {
  const company = await prisma.company.findUnique({
    where: {
      id: companyId,
    },
  });

  if (!user) {
    throw new HTTPException(HTTPCode.UNAUTHORIZED, {
      message: "Credenciais inválidas",
    });
  }

  const accessToken = await generateToken({
    user,
    companyId,
    isAdmin,
    secret: ACCESS_TOKEN_SECRET,
    expires: ACCESS_TOKEN_EXP,
  });

  const refreshToken = await generateToken({
    user,
    companyId,
    isAdmin,
    secret: REFRESH_TOKEN_SECRET,
    expires: REFRESH_TOKEN_EXP,
  });

  const routes = await prisma.systemRoutes.findMany({
    where: {
      active: true,
    },
  });

  return {
    accessToken,
    refreshToken,
    user: {
      companyId: companyId,
      companyName: company?.name,
      isAdmin,
      id: user.id,
      name: user.name,
      email: user.email,
      routes: routes,
    },
  };
}

export async function getSystemRoutes(type: "user" | "employee") {
  const query: any = {
    where: {
      active: true,
    },
  };

  if (type === "employee") {
    query.where.clientAccess = true;
  }

  return await prisma.systemRoutes.findMany(query);
}

export async function logout(id: number, isAdmin: any) {
  console.log(id, isAdmin);

  if (isAdmin) {
    await prisma.user.update({
      data: {
        refresh_token: null,
        refresh_token_expires_at: null,
      },
      where: {
        id,
      },
    });
  } else {
    await prisma.employee.update({
      data: {
        refresh_token: null,
        refresh_token_expires_at: null,
      },
      where: {
        id,
      },
    });
  }

  return { message: "Logout successful" };
}

export async function refreshToken({
  refreshToken,
  user,
  isAdmin,
}: {
  refreshToken: string;
  user: User;
  isAdmin: boolean;
}) {
  try {
    const payload = (await jwt.verify(
      refreshToken,
      REFRESH_TOKEN_SECRET,
    )) as TokenPayload;

    // biome-ignore lint/style/noNonNullAssertion: <explanation>
    if (!user || new Date(user.refresh_token_expires_at!) < new Date()) {
      return { message: "Invalid or expired refresh token" };
    }

    const newAccessToken = await generateToken({
      companyId: payload.companyId,
      user,
      isAdmin,
      secret: ACCESS_TOKEN_SECRET,
      expires: ACCESS_TOKEN_EXP,
    });
    const newRefreshToken = await generateToken({
      companyId: payload.companyId,
      user,
      isAdmin,
      secret: REFRESH_TOKEN_SECRET,
      expires: REFRESH_TOKEN_EXP,
    });

    await prisma.user.update({
      data: {
        refresh_token: newRefreshToken,
        refresh_token_expires_at: new Date(
          Date.now() + 7 * 24 * 60 * 60 * 1000,
        ),
      },
      where: {
        id: user.id,
      },
    });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  } catch (error) {
    console.error("Refresh token error:", error);
    return { message: "Invalid refresh token" };
  }
}

export async function saveUserToken(refreshToken: string, user: User) {
  await prisma.user.update({
    data: {
      refresh_token: refreshToken,
      refresh_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000),
    },
    where: {
      id: user.id,
    },
  });
}
