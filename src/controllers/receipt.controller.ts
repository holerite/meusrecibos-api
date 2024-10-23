import type { Company } from "@prisma/client";
import { prisma } from "../lib/db";
import { string, z } from "zod";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import { lastDayOfMonth, setDate, setHours, subHours } from "date-fns";
import { PDFDocument } from "pdf-lib";
import { Buffer } from "node:buffer";
import pdf from "pdf-parse";
import { Readable } from "node:stream";
import { Upload } from "@aws-sdk/lib-storage";
import { PutObjectCommandInput } from "@aws-sdk/client-s3";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { S3 } from "../lib/s3";
import fs from "node:fs";

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
	isAdmin: boolean;
	userId: number;
} & GetReceiptsFilterDto;

export async function getReceipts({
	companyId,
	take,
	page,
	isAdmin,
	userId,
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

	if (filter.paydayFrom && filter.paydayTo) {
		query.payday = {
			gte: setHours(filter.paydayFrom, 0),
			lte: setHours(filter.paydayTo, 23),
		};
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

	if (!isAdmin) {
		query.employeeId = userId;
	}

	const receipts = await prisma.receipts.findMany({
		where: query,
		select: {
			id: true,
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

export const getReceiptsFilesSchema = z.object({
	receiptId: z.string()
});

type GetReceiptFilesDto = {
	companyId: Company["id"];
} & z.infer<typeof getReceiptsFilesSchema>;

export async function getReceiptsFiles({ receiptId, companyId }: GetReceiptFilesDto) {

	const receipt = await prisma.receipts.findFirstOrThrow({
		where: {
			companyId: companyId,
			id: Number(receiptId),
			file: {
				not: undefined
			}
		},
		select: {
			file: true
		}
	})

	// const newPdfDoc = await PDFDocument.create()
	//
	// for (const receipt of receipts) {
	// 	const fileBuffer = await fetch(
	// 		process.env.S3_BUCKET_DOMAIN + receipt.file
	// 	).then(res => res.arrayBuffer())
	//
	// 	const pdfDoc = await PDFDocument.load(fileBuffer)
	//
	// 	const [page] = await newPdfDoc.copyPages(pdfDoc, [0])
	// 	newPdfDoc.addPage(page)
	// }
	//
	// const newPdfBytes = await newPdfDoc.save()
	//
	//
	// const base64 = Buffer.from(newPdfBytes).toString("base64")

	return process.env.S3_BUCKET_DOMAIN + receipt.file



}

function getPages(pageData) {
	const render_ooption = {
		normalizeWhitespace: true,
		disableCombineTextItems: false,
	};

	return pageData.getTextContent(render_ooption).then((textContent) => {
		const data = textContent.items.map((item) => {
			return {
				y: item.transform[5],
				x: item.transform[4],
				value: item.str.trim(),
			};
		});
		return JSON.stringify(data);
	});
}

export const createReceiptSchema = z.object({
	type: z.string(),
	validity: z.string(),
	payday: z.string(),
	files: z.any(),
});

type CreateReceiptDto = {
	companyId: Company["id"];
} & z.infer<typeof createReceiptSchema>;

export async function createReceipt({
	companyId,
	type,
	files,
	...rest
}: CreateReceiptDto) {
	if (files instanceof File) {
		files = [files];
	}


	const configFile = JSON.parse(
		fs.readFileSync("./configs/1.json", "utf-8"),
	);

	for (const file of files) {
		const arrayBuffer = await (file as File).arrayBuffer();

		const pdfDoc = await PDFDocument.load(arrayBuffer);

		const numPages = pdfDoc.getPageCount();


		for (let i = 0; i < numPages; i++) {
			const newPdfDoc = await PDFDocument.create();

			const [page] = await newPdfDoc.copyPages(pdfDoc, [i]);
			newPdfDoc.addPage(page);

			const newPdfBytes = await newPdfDoc.save();

			const newBuffeer = Buffer.from(newPdfBytes);

			const data = await pdf(newBuffeer, {
				pagerender: getPages,
			});

			const parsed = JSON.parse(
				`[${data.text}]`.replaceAll("\n\n", ",").replace(",", ""),
			);

			console.log(parsed)

			const dados = parsed.map((pagina) => {
				const dadosPagina = {};
				pagina.map((val) => {
					configFile.map((field) => {
						if (field.x === val.x && field.y === val.y) {
							dadosPagina[field.value] = val.value;
						}
					});
				});

				return dadosPagina;
			});

			const stream = Readable.from(newBuffeer);

			const params: PutObjectCommandInput = {
				Bucket: process.env.S3_BUCKET_NAME,
				Key: `${dados[0].enrolment}${randomUUID()}${new Date().getTime()}`,
				Body: stream,
				ContentType: "application/pdf",
			};

			const parallelUploads3 = new Upload({
				client: S3,
				queueSize: 4,
				leavePartsOnError: false,
				params: params,
			});

			const result = await parallelUploads3.done();
			const employee = await prisma.employeeEnrolment.findFirst({
				where: {
					enrolment: dados[0].enrolment,
					companyId,
				},
			});

			await prisma.receipts.create({
				data: {
					file: result.Key!,
					receiptsTypesId: Number(type),
					employeeId: employee!.employeeId,
					companyId,
					payday: rest.payday,
					validity: rest.validity
				},
			});
		}
	}


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
