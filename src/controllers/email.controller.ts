import { resend } from "../lib/email";

export async function sendToken(token: string, to: string) {
	return await resend.emails.send({
		from: "Meus Recibos <login@vitas.app>",
		to,
		subject: "Código de acesso",
		html: token,
	});
}

export async function sendInvite(to: string, token: string) {
	return await resend.emails.send({
		from: "Meus Recibos <login@vitas.app>",
		to,
		subject: "Código de acesso",
		html: token,
	});
}
