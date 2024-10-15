import type { Company } from "@prisma/client";
import { prisma } from "../lib/db";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import {
	lastDayOfMonth,
	setDate,
	setHours,
	subHours,
} from "date-fns";

export const receiptsFilterSchema = z.object({
	employee: z.string().optional(),
	type: z.string().optional(),
	paydayFrom: z.string().optional(),
	paydayTo: z.string().optional(),
	validity: z.string().optional(),
	opened: z.string().optional(),
	take: z.string({
		message: "Quantidade por página é obrigatório",
	}),
	page: z.string({
		message: "Página é obrigatória	",
	}),
});

export type GetReceiptsFilterDto = z.infer<typeof receiptsFilterSchema>;

type GetReceiptsDto = {
	companyId: Company["id"];
} & GetReceiptsFilterDto;

export async function getReceipts({
	companyId,
	take,
	page,
	...filter
}: GetReceiptsDto) {

	const query: any = {
		company: {
			id: companyId,
		},
		employee: {
			name: {
				contains: filter.employee,
			},
		},
		
	};

	if(filter.paydayFrom && filter.paydayTo) {
		query.payday = {
			gte: setHours(filter.paydayFrom, 0),
			lte: setHours(filter.paydayTo, 23)
		}
	}

	if (filter.opened !== undefined) {
		query.opened = JSON.parse(filter.opened);
	}

	if (filter.validity) {
		query.validity = {
			gte: subHours(setDate(filter.validity, 1), 3),
			lte: subHours(lastDayOfMonth(filter.validity), 3),
		};
	}

	if (filter.type) {
		query.receiptsTypesId = Number(filter.type);
	}


	const receipts = await prisma.receipts.findMany({
		where:query,
		select: {
			employee: {
				select: {
					name: true,
				},
			},
			ReceiptsTypes: {
				select: {
					name: true,
				},
			},
			payday: true,
			validity: true,
			opened: true,
		},
		orderBy: {
			payday: {
				sort: "desc",
			},
		},
		take: Number(take),
		skip: Number(take) * Number(page),
	});

	const aggregate = await prisma.receipts.aggregate({
		_count: {
			_all: true,
		},
		where: {
			...query,
		},
	});

	const total_records = aggregate._count._all;
	const total_pages = Math.ceil(total_records / (Number(take) || 1));
	const next_page = Number(page) + 1 === total_pages ? null : Number(page) + 1;
	const prev_page = Number(page) === 0 ? null : Number(page) - 1;

	return {
		receipts: receipts,
		pagination: {
			total_records,
			total_pages,
			current_page: Number(page),
			next_page,
			prev_page,
		},
	};
}

export const ReceiptDetailSchema = z.object({
	code: z.string().optional(),
	description: z.string().optional(),
	reference: z.number().optional(),
	salary: z.number().optional(),
	discount: z.number().optional(),
});

export const createReceiptSchema = z.object({
	type: z.number(),
	validity: z.string(),
	payday: z.string(),
	file: z.string(),
	
	// employeeId: z.number().optional(),
	// opened: z.boolean().optional(),
	// baseWage: z.number().optional(),
	// contributionSalaryINSS: z.number().optional(),
	// baseSalaryFGTS: z.number().optional(),
	// FGTS: z.number().optional(),
	// IRRF: z.number().optional(),
	// totalWage: z.number().optional(),
	// liquidWage: z.number().optional(),
	// details: z.array(ReceiptDetailSchema).optional(),
});

type CreateReceiptDto = {
	companyId: Company["id"];
} & z.infer<typeof createReceiptSchema>;

export async function createReceipt({
	companyId,
	type,
	file,
	...rest
}: CreateReceiptDto) {
	await prisma.receipts.create({
		data: {
			validity: new Date(rest.validity),
			payday: new Date(rest.payday),
			employeeId: 27,
			companyId,
			receiptsTypesId: type,
		},
	});
}

export async function getTypes(companyId: Company["id"]) {
	return await prisma.receiptsTypes.findMany({
		where: {
			companyId,
		},
		select: {
			name: true,
			id: true,
		},
	});
}

export const createReceiptTypeSchema = z.object({
	name: z
		.string({
			message: "O nome do tipo é obrigatório",
		})
		.min(1),
});

type createTypeDto = {
	companyId: Company["id"];
} & z.infer<typeof createReceiptTypeSchema>;

export async function createReceiptType({ name, companyId }: createTypeDto) {
	const existingType = await prisma.receiptsTypes.findFirst({
		where: {
			companyId,
			name,
		},
	});

	if (existingType) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "O tipo de recibo já existe",
		});
	}

	return await prisma.receiptsTypes.create({
		data: {
			name,
			companyId,
		},
	});
}

export const updateTypeSchema = z.object({
	name: z.string(),
	id: z.number(),
});

type updateReceiptTypeDto = {
	companyId: Company["id"];
} & z.infer<typeof updateTypeSchema>;

export async function updateReceiptType({
	companyId,
	id,
	name,
}: updateReceiptTypeDto) {
	await prisma.receiptsTypes.update({
		data: {
			companyId,
			name,
		},
		where: {
			id,
		},
	});
}
