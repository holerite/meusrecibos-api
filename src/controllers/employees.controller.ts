import type { z } from "zod";
import { prisma } from "../lib/db";
import type {
	createEmployeeSchema,
	getEmployeeSchema,
} from "../types/employee.type";
import { Prisma } from "@prisma/client";

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
	take,
	page,
}: getEmployeesDto) {
	const employees = await prisma.employee.findMany({
		where: {
			name: {
				contains: nome,
			},
			email: {
				contains: email,
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
			_count: {
				select: {
					Receipts: {
						where: {
							companyId: companyId,
						},
					},
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
			name: {
				contains: nome,
			},
			email: {
				contains: email,
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
		},
	});

	const total_records = aggregate._count._all;
	const total_pages = Math.ceil(total_records / (Number(take) || 1));
	const next_page = Number(page) + 1 === total_pages ? null : Number(page) + 1;
	const prev_page = Number(page) === 0 ? null : Number(page) - 1;

	return {
		employees: employees.map(({ EmployeeEnrolment, _count, ...employee }) => {
			return {
				enrolment: EmployeeEnrolment[0].enrolment,
				...employee,
				receipts: _count.Receipts,
			};
		}),
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
	cpf,
	companyId,
}: createEmployeeDto) {
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
				create: {
					enrolment,
					companyId,
				},
			},
		},
	});
}
