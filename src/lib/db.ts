import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import type { Logger } from "drizzle-orm";

const turso = createClient({
	url: process.env.TURSO_DATABASE_URL,
	authToken: process.env.TURSO_AUTH_TOKEN,
});

class MyLogger implements Logger {
	logQuery(query: string, params: unknown[]): void {
		console.log({ query, params });
	}
}

export const db = drizzle(turso, {
	logger: new MyLogger(),
});
