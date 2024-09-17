import { serve } from "@hono/node-server";
import { Hono } from "hono";

import api from "./routes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { prettyJSON } from "hono/pretty-json";

const app = new Hono();

app.use(prettyJSON());
app.use(logger());
app.use(cors());

app.route("/api", api);

serve({
	fetch: app.fetch,
	port: Number(process.env.PORT) || 3000,
});
