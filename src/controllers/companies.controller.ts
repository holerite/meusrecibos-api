import { prisma } from "../lib/db";

export async function getByUserId(userId: number) {

	console.log(userId)
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


export async function getByEmployeeId(employeeId: number) {

	const enrolment = await prisma.employeeEnrolment.findMany({
		where: {
			employeeId
		}, select: {
			company: true
		}
	})

	console.log(enrolment)

	return enrolment
}

