import type { z } from "zod";
import { prisma } from "../lib/db";
import type { getEmployeeSchema } from "../types/employee.type";

type getEmployeesDto = {
	companyId: number;
} & z.infer<typeof getEmployeeSchema>;

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
			enrolment: {
				contains: matricula,
			},
			Companies: {
				some: {
					id: companyId,
				},
			},
		},
		include: {
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
	});

	const total_records = aggregate._count._all;
	const total_pages = total_records / (Number(take) || 1)
	const next_page = Number(page) + 1 === total_pages ? null : Number(page) + 1
	const prev_page = Number(page) === 0 ? null :  Number(page) - 1

	return {
		employees,
		pagination: {
			total_records,
			total_pages,
			current_page: page,
			next_page,
			prev_page
		},
	};
}
