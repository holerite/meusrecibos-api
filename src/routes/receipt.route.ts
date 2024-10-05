import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { zValidator } from "../middlewares/validator.middleware";
import { createReceiptSchema } from "../validators/receipt.validator";
import { db } from "../lib/db";
import { ReceitpSchema } from "../schemas/receipt.schema";
import PDFParser from "pdf2json";
import fs from "node:fs";
import pdf from "pdf-parse";
import { arrayBuffer } from "node:stream/consumers";

const receiptRoute = new Hono();

// receiptRoute.use(authMiddleware);

receiptRoute.post("/", async (c) => {
	// const { companyId } = c.get("user");

	const data = await c.req.formData();
	const file = data.get("recibo");

	if (!file) {
		return c.json({ message: "O arquivo não foi enviado" }, 400);
	}

	const buffer = await (file as File).arrayBuffer();

	pdf(Buffer.from(buffer)).then((data) => {
		console.log(data);
	});

	// const { validity } = c.req.valid("json");

	// await db.insert(ReceitpSchema).values({
	// 	opened: false,
	// 	employee: 1,
	// 	company: companyId,
	// 	payday: new Date(),
	// 	type: "Salário Normal",
	// 	validity: new Date(validity.year, Number(validity.month) - 1, 1),
	// });

	return c.json({ message: "Recibo criado com sucesso" });
});

receiptRoute.get("/", async (c) => {
	return c.json({
		id: "9b95f5a2-f8c1-4078-8671-0b7d1161321e",
		employee: "Emerson",
		opened: false,
		payday: "2024-09-26T14:56:13.711Z",
		type: "processing",
		validity: "2024-09-26T09:47:46.474Z",
	});
});

export default receiptRoute;
