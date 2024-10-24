import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { zValidator } from "../middlewares/validator.middleware";
import {
  createReceipt,
  createReceiptSchema,
  createReceiptType,
  createReceiptTypeSchema,
  getReceipts,
  getReceiptsFiles,
  getReceiptsFilesSchema,
  getTypes,
  receiptsFilterSchema,
  updateReceiptType,
  updateTypeSchema,
} from "../controllers/receipt.controller";
import { handleError } from "../utils/error.util";
import { prisma } from "../lib/db";

const app = new Hono();

app.use(authMiddleware);

app.post("/", zValidator("form", createReceiptSchema), async (c) => {
  try {
    const { companyId } = c.get("user");
    const data = c.req.valid("form");

    await createReceipt({
      companyId,
      ...data,
    });

    return c.json({ message: "recibo cadastrado com sucesso" });
  } catch (error) {
    console.log(error);
    return handleError(c, error);
  }
});

app.get("/", zValidator("query", receiptsFilterSchema), async (c) => {
  try {
    const { companyId, isAdmin, id } = c.get("user");
    const params = c.req.valid("query");

    const receipts = await getReceipts({
      companyId,
      isAdmin,
      userId: id,
      ...params,
    });

    return c.json(receipts);
  } catch (error) {
    return handleError(c, error);
  }
});

app.get("/file", zValidator("query", getReceiptsFilesSchema), async (c) => {
  try {
    const { companyId } = c.get("user");
    const { receiptId } = c.req.valid("query")

    const files = await getReceiptsFiles({
      companyId,
      receiptId,
    });

    return c.json(files);
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

app.delete("/type/:id", authMiddleware, async c => {
  try {
    const { companyId } = c.get("user")
    const id = c.req.param('id')

    await prisma.receiptsTypes.update({
      where: {
        id: Number(id),
        companyId,
      },
      data: {
        active: false
      }
    })

    return c.json({ message: "Tipo de recibo excluído com sucesso" })

  } catch (error) {
    return handleError(c, error)
  }

})

export default app;
