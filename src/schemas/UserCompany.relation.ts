import { relations } from "drizzle-orm";
import {
	text,
	primaryKey,
	sqliteTable,
	integer,
} from "drizzle-orm/sqlite-core";
import { UserSchema } from "./user.schema";
import { CompanySchema } from "./company.schema";

export const usersRelations = relations(UserSchema, ({ many }) => ({
	usersToCompany: many(userToCompany),
}));

export const companyRelations = relations(CompanySchema, ({ many }) => ({
	usersToCompany: many(userToCompany),
}));

export const userToCompany = sqliteTable(
	"users_to_company",
	{
		userId: integer("user_id")
			.notNull()
			.references(() => UserSchema.id),
		companyId: integer("company_id")
			.notNull()
			.references(() => CompanySchema.id),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.companyId] }),
	}),
);

export const usersToCompanyRelations = relations(userToCompany, ({ one }) => ({
	group: one(CompanySchema, {
		fields: [userToCompany.companyId],
		references: [CompanySchema.id],
	}),
	user: one(UserSchema, {
		fields: [userToCompany.userId],
		references: [UserSchema.id],
	}),
}));
