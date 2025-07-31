import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";

import api from "./routes";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { customLogger } from "./middlewares/logger.middleware";
import { verifySMTPConnection } from "./lib/email";

const app = new Hono();

app.use(cors());
app.use(logger(customLogger));

app.route("/api", api);

serve(
	{
		fetch: app.fetch,
		port: Number(process.env.PORT) || 8080,
		hostname: process.env.ADDRESS || "0.0.0.0",
	},
	async ({ port, address, family }) => {
		console.log(
			`Server is running on ${port} at ${address} with ${family} family`,
		);
		console.log(process.env.NODE_ENV);
		console.log(`http://localhost:${port}`);

		const isConnected = await verifySMTPConnection();
      
      if (!isConnected) {
        console.error('SMTP connection failed');
      }
	},
);
