import { z } from "zod";

export const createReceiptSchema = z.object({
	validity: z.object({
        month: z.enum( ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12"]),
	    year: z.number().int().refine(val => String(val).length === 4, {
            message: "O ano deve ter 4 dígitos",
        }),
    }),
	receipt: z.string({
		message: "O recibo é obrigatório",
	}),
});