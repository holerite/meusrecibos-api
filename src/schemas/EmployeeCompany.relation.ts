import { integer, primaryKey, sqliteTable } from "drizzle-orm/sqlite-core";
import { EmployeeSchema } from "./employees.schema";
import { CompanySchema } from "./company.schema";

export const employeeToCompany = sqliteTable(
	"employee_to_company",
	{
		userId: integer("emloyee_id")
			.notNull()
			.references(() => EmployeeSchema.id),
		companyId: integer("company_id")
			.notNull()
			.references(() => CompanySchema.id),
	},
	(t) => ({
		pk: primaryKey({ columns: [t.userId, t.companyId] }),
	}),
);
