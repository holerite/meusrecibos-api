import type { z } from "zod";
import { prisma } from "../lib/db";
import type { getEmployeeSchema } from "../types/employee.type";

type getEmployeesDto = {
	companyId: number,
} & z.infer<typeof getEmployeeSchema>

export async function getEmployees({companyId, nome, email, matricula}: getEmployeesDto ) {

	return await prisma.employee.findMany({
		where: {
			name: {
				contains: nome
			},
			email: {
				contains: email
			},
			enrolment: {
				contains: matricula
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
							companyId: companyId
						}
					}
				}
			}
		}
	});
}
