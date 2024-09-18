import { eq, sql } from "drizzle-orm";
import { CompanySchema } from "../schemas/company.schema";
import { userToCompany } from "../schemas/UserCompany.relation";
import { db } from "../lib/db";

export async function get(userId: number) {
	const userCompanies = await db
		.select()
		.from(userToCompany)
		.where(eq(userToCompany.userId, userId));

	return await db
		.select()
		.from(CompanySchema)
		.where(sql`id IN ${userCompanies.map((comp) => `${comp.companyId}`)}`);
}
