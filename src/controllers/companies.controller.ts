import { prisma } from "../lib/db";

export async function getByUserId(userId: number) {
  const result = await prisma.company.findMany({
    where: {
      Users: {
        some: {
          id: userId,
        },
      },
    },
  });


  return result;
}

export async function getByEmployeeId(employeeId: number) {
  const enrolments = await prisma.employeeEnrolment.findMany({
    where: {
      employeeId,
    },
    select: {
      company: {
        select: {
          name: true,
          id: true,
        },
      },
    },
  });

  const companies = enrolments.map((enrolment) => ({
    name: enrolment.company.name,
    id: enrolment.company.id,
  }));


  return companies;
}
