import type { z } from "zod";
import { prisma } from "../lib/db";
import type {
	createEmployeeSchema,
	getEmployeeSchema,
} from "../types/employee.type";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import { Employee, EmployeeEnrolment } from "@prisma/client";
import { randomUUID } from "crypto";
import { sign } from "hono/jwt";
import { addMinutes } from "date-fns";

type getEmployeesDto = {
	companyId: number;
} & z.infer<typeof getEmployeeSchema>;

type createEmployeeDto = {
	companyId: number;
} & z.infer<typeof createEmployeeSchema>;

export async function getEmployees({
	companyId,
	nome,
	email,
	matricula,
	cpf,
	take,
	page,
}: getEmployeesDto) {
	const filter = {
		name: {
			contains: nome,
		},
		email: {
			contains: email,
		},
		cpf: {
			contains: cpf,
		},
		EmployeeEnrolment: {
			some: {
				enrolment: {
					contains: matricula,
				},
				AND: {
					companyId,
				},
			},
		},
	};

	const employees = await prisma.employee.findMany({
		where: {
			...filter,
		},
		include: {
			EmployeeEnrolment: {
				where: {
					companyId,
				},
				select: {
					enrolment: true,
				},
			},
		},
		take: Number(take),
		skip: Number(take) * Number(page),
	});

	const aggregate = await prisma.employee.aggregate({
		_count: {
			_all: true,
		},
		where: {
			...filter,
		},
	});

	const total_records = aggregate._count._all;
	const total_pages = Math.ceil(total_records / (Number(take) || 1));
	const next_page = Number(page) + 1 === total_pages
		? null
		: Number(page) + 1;
	const prev_page = Number(page) === 0 ? null : Number(page) - 1;

	return {
		employees: employees.map(
			({ EmployeeEnrolment, ...employee }) => {
				return {
					enrolment: EmployeeEnrolment[0].enrolment,
					...employee,
				};
			},
		),
		pagination: {
			total_records,
			total_pages,
			current_page: Number(page),
			next_page,
			prev_page,
		},
	};
}

export async function createEmployee({
	email,
	name,
	enrolment,
	enrolmentId,
	cpf,
	companyId,
}: createEmployeeDto) {
	await prisma
		.$queryRaw`DELETE FROM EmployeeEnrolment WHERE enrolment = ${enrolment} AND companyId = ${companyId}`;

	await prisma.employee.upsert({
		where: {
			cpf,
		},
		create: {
			email,
			name,
			cpf,
			EmployeeEnrolment: {
				create: {
					enrolment,
					companyId,
				},
			},
		},
		update: {
			EmployeeEnrolment: {
				connectOrCreate: {
					create: {
						enrolment,
						companyId,
					},
					where: {
						id: enrolmentId,
						enrolment,
					},
				},
			},
		},
	});
}

export async function deletePendingEmployee(
	enrolment: EmployeeEnrolment["enrolment"],
) {
	await prisma
		.$queryRaw`DELETE FROM TemporaryEmployee WHERE enrolment = ${enrolment}`;
}

export async function getByEmail(email: Employee["email"]) {
	const result = await prisma.employee.findUnique({
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

export async function getById(id: Employee["id"]) {
	const result = await prisma.employee.findUnique({
		where: {
			id: id,
		},
	});

	if (result === null) {
		throw new HTTPException(HTTPCode.NOT_FOUND, {
			message: "Usuário inválido",
		});
	}

	return result;
}

export async function saveUserToken(refreshToken: string, employee: Employee) {
	await prisma.employee.update({
		data: {
			refresh_token: refreshToken,
			refresh_token_expires_at: new Date(Date.now() + 8 * 60 * 60 * 1000),
		},
		where: {
			id: employee.id,
		},
	});
}
