import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";
import { zValidator } from "../middlewares/validator.middleware";
import {
  createReceipt,
  createReceiptSchema,
  createReceiptType,
  createReceiptTypeSchema,
  getErrors,
  getPDFConfig,
  getReceipts,
  getReceiptsFiles,
  getReceiptsFilesSchema,
  getTypes,
  receiptsFilterSchema,
  updateReceiptType,
  updateTypeSchema,
} from "../controllers/receipt.controller";
import { handleError } from "../utils/error.util";

const app = new Hono();

app.use(authMiddleware);

app.post("/", zValidator("form", createReceiptSchema), async (c) => {
  try {
    const { companyId } = c.get("user");
    const data = c.req.valid("form");

    const { pendingEmployees } = await createReceipt({
      companyId,
      ...data,
    });

    return c.json({
      message: "recibo cadastrado com sucesso",
      pendingEmployees,
    });
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
    const { receiptId } = c.req.valid("query");

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
    const all = c.req.query("all");
    const types = await getTypes(companyId, Boolean(all));

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
    const { id, active } = c.req.valid("json");
    await updateReceiptType({
      companyId,
      active,
      id,
    });

    return c.json({ message: "Tipo de recibo editado com sucesso" });
  } catch (error) {
    return handleError(c, error);
  }
});

app.get("/errors", async (c) => {
  try {
    const { companyId } = c.get("user");

    const errors = await getErrors(companyId);

    return c.json(errors);
  } catch (error) {
    return handleError(c, error);
  }
});

app.post("/base", async (c) => {
  try {
    const data = await c.req.formData();

    await getPDFConfig(data.get("files"));

    return c.json({ message: "Foi" });
  } catch (error) {
    return handleError(c, error);
  }
});

export default app;
