import type { Company, Employee, Receipts } from "@prisma/client";
import { prisma } from "../lib/db";
import { z } from "zod";
import { HTTPException } from "hono/http-exception";
import { HTTPCode } from "../utils/http";
import { lastDayOfMonth, setDate, setHours, subHours } from "date-fns";
import { PDFDocument } from "pdf-lib";
import pdf from "pdf-parse";
import { Buffer } from "node:buffer";
import { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand, PutObjectCommandInput } from "@aws-sdk/client-s3";
import process from "node:process";
import { randomUUID } from "node:crypto";
import { S3 } from "../lib/s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";


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
	enrolment?: string;
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
		query.enrolment = {
			employeeId: userId,
		};
	}

	if (filter.employee) {
		const employee = await prisma.employeeEnrolment.findMany({
			where: {
				employee: {
					name: {
						contains: filter.employee,
					},
				},
			},
			select: {
				enrolment: true,
			},
		});

		query.enrolment = {
			enrolment: {
				in: employee.map((e) => e.enrolment),
			},
		};
	}

	if (filter.enrolment) {
		query.enrolment = {
			enrolment: {
				contains: filter.enrolment,
			},
		};
	}

	const receipts = await prisma.receipts.findMany({
		where: query,
		select: {
			id: true,
			enrolment: {
				select: {
					employee: {
						select: {
							name: true,
						},
					},
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
			payday: "desc",
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
	const next_page = Number(page) + 1 === total_pages
		? null
		: Number(page) + 1;
	const prev_page = Number(page) === 0 ? null : Number(page) - 1;

	return {
		receipts: receipts.map((receipt) => ({
			...receipt,
			name: receipt.enrolment?.employee?.name,
		})),
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
	receiptId: z.string(),
});

type GetReceiptFilesDto = {
	companyId: Company["id"];
} & z.infer<typeof getReceiptsFilesSchema>;

export async function getReceiptsFiles(
	{ receiptId, companyId }: GetReceiptFilesDto,
) {
	const receipt = await prisma.receipts.findFirstOrThrow({
		where: {
			companyId: companyId,
			id: Number(receiptId),
			file: {
				not: undefined,
			},
		},
		select: {
			file: true,
		},
	});

	const saved = await getSignedUrl(
		S3,
		new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: receipt.file }),
		{ expiresIn: 3600 }, // 1 hour
	)

	return saved
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
	let pendingEmployees = false;
	let erroredPages = 0;

	if (!files) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "Arquivos são obrigatórios",
		});
	}

	if (files instanceof File) {
		files = [files];
	}


	const config = await prisma.receiptsTypes.findFirstOrThrow({
		where: {
			id: Number(type),
		},
		select: {
			file: true,
		},
	});

	const saved = await getSignedUrl(
		S3,
		new GetObjectCommand({ Bucket: process.env.S3_BUCKET_NAME, Key: config.file }),
		{ expiresIn: 3600 }, // 1 hour
	)


	const configFile = await fetch(
		saved,
	).then((res) => res.json());


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


			const dados = parsed.map((pagina) => {
				const dadosPagina = {};
				pagina.map((val) => {
					configFile.map((field) => {
						if ((field.x === val.x || val.x === field.x2) && field.y === val.y) {
							dadosPagina[field.value] = val.value;
						} 
					});
				});

				return dadosPagina;
			});

			if (dados[0].enrolment === undefined) {
				erroredPages++;
				continue;
			}

			const stream = Readable.from(newBuffeer);

			const fileName = `${randomUUID()}${new Date().getTime()}`

			const params = new PutObjectCommand({
				Bucket: process.env.S3_BUCKET_NAME,
				Key: fileName,
				Body: stream,
				ContentLength: newBuffeer.length,
				ContentType: "application/pdf",

			})

			const result = await S3.send(params)


			let employeeEnrolment = await prisma.employeeEnrolment.findFirst({
				where: {
					enrolment: dados[0].enrolment,
					companyId,
				},
			});

			if (!employeeEnrolment) {
				employeeEnrolment = await prisma.employeeEnrolment.create({
					data: {
						enrolment: dados[0].enrolment,
						companyId,
					},
				});


				const temporaryEmployee = await prisma.temporaryEmployee.findFirst({
					where: {
						enrolmentId: employeeEnrolment.id,
						companyId,
					},
				});

				if (!temporaryEmployee) {

					await prisma.temporaryEmployee.create({
						data: {
							name: dados[0].employeeName,
							enrolmentId: employeeEnrolment.id,
							companyId,
						},
					});


				}

				pendingEmployees = true;
			}

			await prisma.receipts.create({
				data: {
					file: fileName,
					receiptsTypesId: Number(type),
					companyId,
					enrolmentId: employeeEnrolment?.id,
					payday: rest.payday,
					validity: rest.validity,
				},
			});
		}
	}

	return {
		pendingEmployees,
		erroredPages,
	};
}

export async function getTypes(companyId: Company["id"], all?: boolean) {
	return await prisma.receiptsTypes.findMany({
		where: {
			companyId,
			active: all ? undefined : true,
		},
		select: {
			name: true,
			id: true,
			active: true,
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

	if (existingType?.active === true) {
		throw new HTTPException(HTTPCode.BAD_REQUEST, {
			message: "O tipo de recibo já existe",
		});
	}

	if (existingType?.active === false) {
		return await prisma.receiptsTypes.update({
			where: {
				companyId,
				id: existingType.id,
			},
			data: {
				active: true,
			},
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
	id: z.number(),
	active: z.boolean(),
});

export const viewSchema = z.object({
	receiptId: z.number(),
});

type updateReceiptTypeDto = {
	companyId: Company["id"];
} & z.infer<typeof updateTypeSchema>;

export async function updateReceiptType({
	companyId,
	id,
	active,
}: updateReceiptTypeDto) {
	await prisma.receiptsTypes.update({
		data: {
			companyId,
			active,
		},
		where: {
			id,
		},
	});
}

export async function getErrors(companyId: Company["id"]) {
	return await prisma.temporaryEmployee.findMany({
		where: {
			companyId,
		},
		select: {
			id: true,
			name: true,
			enrolment: {
				select: {
					enrolment: true,
					id: true,
				},
			},
		},
	});
}

export async function viewReceipt(
	{ receiptId, companyId }: {
		receiptId: Receipts["id"];
		companyId: number;
	},
) {
	return await prisma.receipts.update({
		data: {
			opened: true,
		},
		where: {
			id: receiptId,
			companyId: companyId,
		},
	});
}

export async function getPDFConfig(files: any) {
	if (files instanceof File) {
		files = [files];
	}

	for (const file of files) {
		const arrayBuffer = await (file as File).arrayBuffer();

		const pdfDoc = await PDFDocument.load(arrayBuffer);

		const numPages = pdfDoc.getPageCount();

		const dados: any[] = [];

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

			dados.push(parsed)
		}

		return dados
	}
}
