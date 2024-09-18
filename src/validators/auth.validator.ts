import { z } from "zod";

export const login = z.object({
	email: z.string().email("Email é obrigatório"),
});

export const signIn = z.object({
	pin: z
		.string({
			message: "PIN é obrigatório",
		})
		.length(6, "PIN deve ter 6 caracteres"),
	userId: z.number().int("O ID do usuário é obrigatório"),
});

export const company = z.object({
	companyId: z.number().int("O ID da empresa é obrigatório"),
});
