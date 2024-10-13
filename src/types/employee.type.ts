import { z } from "zod";

export const getEmployeeSchema = z.object({
	matricula: z.string().optional(),
	nome: z.string().optional(),
	email: z.string().optional(),
	take: z
		.string({
			message: "Items por página é obrigatório",
		})
		.refine((val) => Number(val) >= 1, {
			message: "Items por página não pode ser menor que 1",
		}),
	page: z
		.string({
			message: "Número da página é obrigatório",
		})
		.refine((val) => Number(val) >= 0, {
			message: "Items por página não pode ser menor que 0",
		}),
});


export const createEmployeeSchema = z.object({
	name: z.string({
		message: "Nome do colaborador é obrigatório"
	}),
	email: z.string({
		message: "O email do colaborador é obrigatório"
	}),
	enrolment: z.string({
		message: "A matrícula do colaborador é obrigatória"
	})
})