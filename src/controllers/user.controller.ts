import { prisma } from "../lib/db";
import type { Company, User } from "@prisma/client";

export async function getUserByEmail(email: User["email"]) {
	return await prisma.user.findUnique({
		where: {
			email: email,
		},
	});
}

export async function getUserById(id: User["id"]) {
	return await prisma.user.findUnique({
		where: {
			id: id,
		},
	});
}

export async function getAllUsers(companyId: number, userId: User["id"]) {
	return await prisma.user.findMany({
		where: {
			Companies: {
				some: {
					id: companyId,
				},
			},
			AND: {
				id: {
					not: userId,
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
}

export async function deleteUser(
	companyId: Company["id"],
	userId: User["id"],
) {
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
}

export async function createUser(
	email: User["email"],
	name: User["name"],
	companyId: Company["id"],
) {
	await prisma.user.upsert({
		create: {
			email,
			name,
			Companies: {
				connect: {
					id: companyId,
				},
			},
		},
		update: {
			Companies: {
				connect: {
					id: companyId,
				},
			},
		},
		where: {
			email,
		},
	});
}
