import type { Company } from "@prisma/client";
import { prisma } from "../lib/db";

export async function getReceiptsTypes(companyId: Company["id"]) {
    return await prisma.receiptsTypes.findMany({
        where: {
            companyId,
        },
        include: {
            _count: {
                select: {
                    Receipts: true
                }
            }
        }        
    })
}

export async function getTotalUsers(companyId: Company["id"]) {
    return await prisma.user.aggregate({
        _count: true,
        where: {
            Companies: {
                some: {
                    id: companyId
                }
            }
        }
    })
}

export async function getTotalEmployees(companyId: Company["id"]) {
    return await prisma.employee.aggregate({
        _count: true,
        where: {
            EmployeeEnrolment: {
                some: {
                    companyId,
                }
            }
        }
    })}