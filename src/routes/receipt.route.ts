import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { zValidator } from "../middlewares/validator.middleware";
import PDFParser from "pdf2json";
import { PDFExtract } from 'pdf.js-extract'
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
import { z } from "zod";

const app = new Hono();

app.use(authMiddleware);

type textContent = {
	items: {
		str: string
		dir: string
		width: number
		height: number
		transform: number[],
		fontName: string
	  }[],
	  styles: any
}

function getCoordinates(pageData) {
    //check documents https://mozilla.github.io/pdf.js/
    const render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }

 
    return pageData.getTextContent(render_options)
    .then((textContent: textContent) => {
		console.log({textContent})
		const teste = []
		for (let item of textContent.items) {
			const val = {
				y: item.transform[5],
				x: item.transform[4],
				value: item.str
			}
			teste.push(val)
        }
        return JSON.stringify(teste);
    });
}
 
// TODO: 
async function getPages(pageData) {
    //check documents https://mozilla.github.io/pdf.js/
    const render_options = {
        //replaces all occurrences of whitespace with standard spaces (0x20). The default value is `false`.
        normalizeWhitespace: false,
        //do not attempt to combine same line TextItem's. The default value is `false`.
        disableCombineTextItems: false
    }

	console.log("---")
    const pagina = await pageData.getTextContent(render_options)
    .then((textContent: any) => {
		const teste = []
		for (let item of textContent.items) {
			const val = {
				y: item.transform[5],
				x: item.transform[4],
				value: item.str
			}
			teste.push(val)
        }
        return teste
    });
	console.log({pagina})

	return pagina
}

const testSchem = z.object({
	file: z.string(),
});

app.post("/details", zValidator("json", testSchem), async (c) => {
	const { file } = c.req.valid("json");

	const buffer = Buffer.from(Uint8Array.from(atob(file), (c) => c.charCodeAt(0)))

	const data = await pdf(Buffer.from(buffer), {
		pagerender: (c) =>  getPages(c)
	})

	return c.json({  data: data.text });
});

app.post("/", zValidator("json", createReceiptSchema), async (c) => {
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

app.get("/", zValidator("query", receiptsFilterSchema), async (c) => {
	try {
		const { companyId } = c.get("user");
		const params = c.req.valid("query");

		const receipts = await getReceipts({ companyId, ...params });

		return c.json(receipts);
	} catch (error) {
		return handleError(c, error);
	}
});

app.get("/type", async (c) => {
	try {
		const { companyId } = c.get("user");

		const types = await getTypes(companyId);

		return c.json(types);
	} catch (error) {
		return handleError(c, error);
	}
});

app.post("/type", zValidator("json", createReceiptTypeSchema), async (c) => {
	try {
		const { companyId } = c.get("user");
		const { name } = c.req.valid("json");

		const types = await createReceiptType({ companyId, name });

		return c.json(types);
	} catch (error) {
		return handleError(c, error);
	}
});

app.put("/type", zValidator("json", updateTypeSchema), async (c) => {
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

export default app;
