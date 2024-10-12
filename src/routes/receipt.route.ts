import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { zValidator } from "../middlewares/validator.middleware";
import { createReceiptSchema } from "../validators/receipt.validator";
import PDFParser from "pdf2json";
import fs from "node:fs";
import pdf from "pdf-parse";
import { getReceipts, type GetReceiptsFilterDto } from "../controllers/receipt.controller";

const receiptRoute = new Hono();

// receiptRoute.use(authMiddleware);

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

receiptRoute.get("/", async (c) => {
	try {
		const { companyId } = c.get("user")
		const params = c.req.query() as GetReceiptsFilterDto
		const receipts = await getReceipts({companyId, ...params})

		return c.json(receipts)
	} catch (error) {
		
	}
});

export default receiptRoute;
