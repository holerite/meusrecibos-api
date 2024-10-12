import type { Company, Employee, ReceiptsTypes } from "@prisma/client";
import { prisma } from "../lib/db";

export type GetReceiptsFilterDto = {
	employeeName: Employee["name"];
	type: ReceiptsTypes["id"];
	paydayFrom: string;
	paydayTo: string;
}

type GetReceiptsDto = {
	companyId: Company["id"];
} & GetReceiptsFilterDto

export async function getReceipts(filter: GetReceiptsDto) {
	return await prisma.receipts.findMany({
		where: {
			employee: {
				name: filter.employeeName,
			},
			type: {
				id: filter.type,
			},
			payday: {
				gte: filter.paydayFrom,
				lte: filter.paydayTo,
			},
			company: {
				id: filter.companyId,
			},
		},
	});
}
