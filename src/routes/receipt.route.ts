import { Hono } from "hono";
import { authMiddleware } from "../middlewares/auth.middleware";

const receiptRoute = new Hono();


receiptRoute.get("/",authMiddleware, async (c) => {
	return c.json({ 
		"id": "9b95f5a2-f8c1-4078-8671-0b7d1161321e",
		"employee": "Emerson",
		"opened": false,
		"payday": "2024-09-26T14:56:13.711Z",
		"type": "processing",
		"validity": "2024-09-26T09:47:46.474Z"
	 });
});

export default receiptRoute;