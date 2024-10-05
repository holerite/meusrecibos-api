import { db } from "../lib/db";
import { ReceitpSchema } from "../schemas/receipt.schema";

export async function createReceipts(
	receipt: (typeof ReceitpSchema.$inferInsert)[],
) {
	return db.insert(ReceitpSchema).values(receipt);
}
