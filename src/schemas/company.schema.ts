import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const CompanySchema = sqliteTable("company", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name"),
});
