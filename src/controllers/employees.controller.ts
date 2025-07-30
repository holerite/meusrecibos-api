import type { z } from "zod";
import { prisma } from "../lib/db";
import type {
	createEmployeeSchema,
	getEmployeeSchema,
} from "../types/employee.type";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import type { Company, Employee, EmployeeEnrolment } from "@prisma/client";

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
					employeeId: true,
					_count: {
						select: {
							Receipts: true,
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
					receipts: EmployeeEnrolment[0]._count.Receipts,
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
	if (enrolmentId) {
		const existingCPFEmployee = await prisma.employee.findUnique({
			where: {
				cpf,
				EmployeeEnrolment: {
					some: {
						companyId,
					},
				},
			},
		});

		if (existingCPFEmployee) {
			throw new HTTPException(HTTPCode.BAD_REQUEST, {
				message: "CPF já utilizado",
			});
		}

		const existingEmailEmployee = await prisma.employee.findUnique({
			where: {
				email,
				EmployeeEnrolment: {
					some: {
						companyId,
					},
				},
			},
		});

		if (existingEmailEmployee) {
			throw new HTTPException(HTTPCode.BAD_REQUEST, {
				message: "Email já utilizado",
			});
		}

		let employee = await prisma.employee.findUnique({
			where: {
				cpf,
			},
		});

		if (!employee) {
			employee = await prisma.employee.create({
				data: {
					email,
					name,
					cpf,
				},
			});
		}

		await prisma.employeeEnrolment.update({
			where: {
				id: enrolmentId,
			},
			data: {
				employeeId: employee.id,
			},
		});

		await prisma
			.$queryRaw`DELETE FROM TemporaryEmployee WHERE enrolmentId = ${enrolmentId}`;

		return;
	}

	const usedEnrolment = await prisma.employeeEnrolment.findMany({
		where: {
			enrolment,
			companyId,
		},
	});

	if (usedEnrolment.length > 0) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "Matrícula já utilizada",
		});
	}

	const existingCPFEmployee = await prisma.employee.findUnique({
		where: {
			cpf,
			EmployeeEnrolment: {
				some: {
					companyId,
				},
			},
		},
	});

	if (existingCPFEmployee) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "CPF já utilizado",
		});
	}

	const existingEmailEmployee = await prisma.employee.findUnique({
		where: {
			email,
			EmployeeEnrolment: {
				some: {
					companyId,
				},
			},
		},
	});

	if (existingEmailEmployee) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "Email já utilizado",
		});
	}

	let employee = await prisma.employee.findUnique({
		where: {
			cpf,
		},
	});

	if (!employee) {
		employee = await prisma.employee.create({
			data: {
				email,
				name,
				cpf,
			},
		});
	}

	await prisma.employeeEnrolment.create({
		data: {
			enrolment,
			companyId,
			employeeId: employee.id,
		},
	});

	await prisma
		.$queryRaw`DELETE FROM TemporaryEmployee WHERE enrolmentId = ${enrolment}`;

	return;
}

export async function deletePendingEmployee(
	enrolmentId: EmployeeEnrolment["id"],
) {
	await prisma
		.$queryRaw`DELETE FROM TemporaryEmployee WHERE enrolmentId = ${enrolmentId}`;
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

export async function deleteEmployee(employeeId: Employee["id"], companyId: Company["id"]) {

	const employeeEnrolment = await prisma.employeeEnrolment.findMany({
		where: {
			employeeId,
		}
	})

	if (employeeEnrolment.length === 0) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "Colaborador não encontrado",
		});
	}

	if (employeeEnrolment.length > 1) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "Colaborador não pode ser deletado, entre em contato com o suporte",
		});
	}


	const receipts = await prisma.receipts.count({
		where: {
			enrolmentId: employeeEnrolment[0].id,
			companyId,
		},
	});


	if (receipts > 0) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "Colaborador não pode ser deletado, pois possui recibos",
		});
	}

	await prisma.employeeEnrolment.deleteMany({
		where: {
			id: {
				in: employeeEnrolment.map((enrolment) => enrolment.id),
			}
		},
	});

	await prisma.employee.delete({
		where: {
			id: employeeId,
		}
	})

}