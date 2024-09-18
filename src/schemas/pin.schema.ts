import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const PinSchema = sqliteTable("pin", {
	id: text("id").primaryKey(),
	userId: integer("userId"),
	pin: text("pin"),
});
