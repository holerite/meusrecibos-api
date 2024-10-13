import type { Company, Employee, ReceiptsTypes } from "@prisma/client";
import { prisma } from "../lib/db";
import { string, z } from "zod";
import { randomUUID } from "node:crypto";

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
		payday: {
			gte: filter.paydayFrom,
			lte: filter.paydayTo,
		},
	};

	if (filter.opened !== undefined) {
		query.opened = Boolean(filter.opened);
	}

	if (filter.type) {
		query.receiptType = {
			some: {
				id: Number(filter.type),
			},
		};
	}

	const receipts = await prisma.receipts.findMany({
		where: query,
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
	employeeId: z.number(),
	payday: z.string().optional(),
	validity: z.string().optional(),
	opened: z.boolean().optional(),
	type: z.number(),
	baseWage: z.number().optional(),
	contributionSalaryINSS: z.number().optional(),
	baseSalaryFGTS: z.number().optional(),
	FGTS: z.number().optional(),
	IRRF: z.number().optional(),
	totalWage: z.number().optional(),
	liquidWage: z.number().optional(),
	details: z.array(ReceiptDetailSchema),
});

type CreateReceiptDto = {
	companyId: Company["id"];
} & z.infer<typeof createReceiptSchema>;

export async function createReceipt({
	companyId,
	type,
	details,
	...rest
}: CreateReceiptDto) {
	await prisma.receipts.create({
		data: {
			...rest,
			companyId,
			receiptsTypesId: type,
			receiptDetails: {
				createMany: {
					data: details,
				},
			},
		},
	});
}
