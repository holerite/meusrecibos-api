import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const SystemRoutesSchema = sqliteTable("system_routes", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	route: text("rotue").notNull(),
	active:  integer('active', { mode: 'boolean' })
});

