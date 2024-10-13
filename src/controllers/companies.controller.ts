import { prisma } from "../lib/db";

export async function getByUserId(userId: number) {
	const result = await prisma.company.findMany({
		where: {
			Users: {
				some: {
					id: userId
				}
			}
		}
	})

	console.log(result)

	return result
}
