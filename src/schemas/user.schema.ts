import { sql } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { createSelectSchema } from "drizzle-zod";

export const UserSchema = sqliteTable("user", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name").notNull(),
	email: text("email").notNull().unique(),
	refreshToken: text("refresh_token"),
	refreshTokenExpiresAt: integer("refresh_token_expires_at", {
		mode: "timestamp",
	}),
	createdAt: integer("created_at", { mode: "timestamp" }).default(
		sql`CURRENT_TIMESTAMP`,
	),
	updatedAt: integer("updated_at", { mode: "timestamp" }).default(
		sql`CURRENT_TIMESTAMP`,
	),
});

export const selectUserSchema = createSelectSchema(UserSchema);

export const loginUserSchema = selectUserSchema.pick({
	name: true,
	email: true,
});
