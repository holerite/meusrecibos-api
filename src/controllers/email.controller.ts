import { transporter } from "../lib/email";

export async function sendToken(token: string, to: string) {
	return await transporter.sendMail({
		from: `"Meus Recibos" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Código de acesso",
		text: `Seu código de acesso é: ${token}`,
		html: `<b>Seu código de acesso é: ${token}</b>`,
	  });
}

export async function sendInvite(to: string, token: string) {
	return await transporter.sendMail({
		from: `"Meus Recibos" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Código de acesso",
		text: `Seu código de acesso é: ${token}`,
		html: `<b>Seu código de acesso é: ${token}</b>`,
	});
}
