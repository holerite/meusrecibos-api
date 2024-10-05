import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const EmployeeSchema = sqliteTable("employee", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	name: text("name"),
	email: text("email"),
	enrolment: text("enrolment"),
});
