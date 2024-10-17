import { prisma } from "../lib/db";

export async function getByUserId(userId: number) {
  console.log(userId);
  const result = await prisma.company.findMany({
    where: {
      Users: {
        some: {
          id: userId,
        },
      },
    },
  });

  console.log(result);

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

  console.log(companies);

  return companies;
}
