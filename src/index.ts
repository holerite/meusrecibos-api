import { serve } from "@hono/node-server";
import { Hono } from "hono";

import { db } from "./lib/db";
import { fooTable } from "./schema/foo.schema";

const result = await db.select().from(fooTable).all();

const app = new Hono();

app.get("/", (c) => {
	return c.text("Hello Hono!");
});

const port = 3000;
console.log(`Server is running on port ${port}`);

serve({
	fetch: app.fetch,
	port,
});
