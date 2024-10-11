import { z } from "zod"

export const getEmployeeSchema = z.object({
	matricula: z.string().optional(),
	nome: z.string().optional(),
	email: z.string().email().optional()
}) 

type GetEmployeesDto = {
	companyId?: number
	enrolment?: string
	nome?: string
	email?: string
}
