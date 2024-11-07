import { Hono } from "hono";
import { handleError } from "../utils/error.util";
import { authMiddleware } from "../middlewares/auth.middleware";
import { getReceiptsTypes, getTotalEmployees, getTotalUsers } from "../controllers/dashboard.controller";

const app = new Hono() 

app.use(authMiddleware)

app.get("/", async c => {
    try {
        const { companyId } = c.get("user")
        const receipts = await getReceiptsTypes(companyId)
        const users = await getTotalUsers(companyId)
        const employees = await getTotalEmployees(companyId)
        return c.json({receipts, users, employees})
    } catch (error) {
        return handleError(c, error)
    }
})

export default app