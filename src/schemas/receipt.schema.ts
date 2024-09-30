import { sql } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const ReceitpSchema = sqliteTable("receipt", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	opened:  integer('opened', { mode: 'boolean' }).default(false),
    employee: integer("employee").notNull(),
    company: integer("company").notNull(),
    payday: integer("payday", { mode: "timestamp" }).notNull(),
    type: text("type").notNull(),
    validity: integer("validity", { mode: "timestamp" }).notNull(),
});

export const selectReceiptSchema = createSelectSchema(ReceitpSchema);
