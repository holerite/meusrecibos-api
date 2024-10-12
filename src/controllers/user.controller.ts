import { HTTPException } from "hono/http-exception";
import { prisma } from "../lib/db";
import { HTTPCode } from "../utils/http";
import type { Company, User } from "@prisma/client";

export async function getByEmail(email: User["email"]) {
	const result = await prisma.user.findUnique({
		where: {
			email: email,
		},
	});

	if (result === null) {
		throw new HTTPException(HTTPCode.NOT_FOUND, {
			message: "Usuário inválido",
		});
	}

	return result;
}


/**
 * @param companyId 
 */
export async function getAll(companyId: number) {
	const result = await prisma.user.findMany({
		where: {
			Companies: {
				some: {
					id: companyId,
				},
			},
		},
		select: {
			id: true,
			name: true,
			email: true,
			updatedAt: true,
		},
	});

	return result;
}

/**
 *
 * @param companyId 
 * ID da empresa
 * @param userId
 * ID do usuário
 * @returns null
 */
export async function deleteUser(companyId: Company["id"], userId: User["id"]): Promise<null> {
	await prisma.user.update({
		data: {
			Companies: {
				disconnect: {
					id: companyId,
				},
			},
		},
		where: {
			id: userId,
		},
	});
	return null
}
