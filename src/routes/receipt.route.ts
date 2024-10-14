import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { zValidator } from "../middlewares/validator.middleware";
import PDFParser from "pdf2json";
import fs from "node:fs";
import pdf from "pdf-parse";
import {
	createReceipt,
	createReceiptSchema,
	createReceiptType,
	createReceiptTypeSchema,
	getReceipts,
	getTypes,
	receiptsFilterSchema,
	updateReceiptType,
	updateTypeSchema,
	type GetReceiptsFilterDto,
} from "../controllers/receipt.controller";
import { handleError } from "../utils/error.util";

const receiptRoute = new Hono();

receiptRoute.use(authMiddleware);

// receiptRoute.post("/", async (c) => {
// 	// const { companyId } = c.get("user");

// 	const data = await c.req.formData();
// 	const file = data.get("recibo");

// 	if (!file) {
// 		return c.json({ message: "O arquivo não foi enviado" }, 400);
// 	}

// 	const buffer = await (file as File).arrayBuffer();

// 	pdf(Buffer.from(buffer)).then((data) => {
// 		console.log(data);
// 	});

// 	// const { validity } = c.req.valid("json");

// 	// await db.insert(ReceitpSchema).values({
// 	// 	opened: false,
// 	// 	employee: 1,
// 	// 	company: companyId,
// 	// 	payday: new Date(),
// 	// 	type: "Salário Normal",
// 	// 	validity: new Date(validity.year, Number(validity.month) - 1, 1),
// 	// });

// 	return c.json({ message: "Recibo criado com sucesso" });
// });

receiptRoute.post("/", zValidator("json", createReceiptSchema), async (c) => {
	try {
		const { companyId } = c.get("user");
		const data = c.req.valid("json");

		await createReceipt({
			companyId,
			...data,
		});

		return c.json({ message: "recibo cadastrado com sucesso" });
	} catch (error) {
		return handleError(c, error);
	}
});

receiptRoute.get("/", zValidator("query", receiptsFilterSchema), async (c) => {
	try {
		const { companyId } = c.get("user");
		const params = c.req.valid("query");

		const receipts = await getReceipts({ companyId, ...params });

		return c.json(receipts);
	} catch (error) {
		return handleError(c, error);
	}
});

receiptRoute.get("/type", async (c) => {
	try {
		const { companyId } = c.get("user");

		const types = await getTypes(companyId);

		return c.json(types);
	} catch (error) {
		return handleError(c, error);
	}
});

receiptRoute.post(
	"/type",
	zValidator("json", createReceiptTypeSchema),
	async (c) => {
		try {
			const { companyId } = c.get("user");
			const { name } = c.req.valid("json");

			const types = await createReceiptType({ companyId, name });

			return c.json(types);
		} catch (error) {
			return handleError(c, error);
		}
	},
);

receiptRoute.put("/type", zValidator("json", updateTypeSchema), async (c) => {
	try {
		const { companyId } = c.get("user");
		const { id, name } = c.req.valid("json");
		await updateReceiptType({
			companyId,
			name,
			id,
		});

		return c.json({ message: "Tipo de recibo editado com sucesso" });
	} catch (error) {
		return handleError(c, error);
	}
});

export default receiptRoute;
