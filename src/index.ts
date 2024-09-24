import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

import api from "./routes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";
import { customLogger } from "./middlewares/logger.middleware";
import { requestId } from "hono/request-id";
import "./lib/instrument";

const app = new Hono();

app.use(prettyJSON());
app.use(cors());
app.use(requestId());
app.use(logger(customLogger));

app.route("/api", api);

app.get("health", c => {
	return c.json({ message: "ok" })
})

serve({
	fetch: app.fetch,
	port: Number(process.env.PORT) || 8080,
});
