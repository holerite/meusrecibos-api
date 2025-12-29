declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "test";
		TURSO_DATABASE_URL: string;
		TURSO_AUTH_TOKEN: string;

		EMAIL_USER: string;
		EMAIL_PASSWORD: string;
		EMAIL_SMTP: string;
		EMAIL_PORT: string;

		JWT_SECRET: string;

		REFRESH_TOKEN_SECRET: string;
		ACCESS_TOKEN_SECRET: string;

		S3_ACCESS_KEY_ID: string;
		S3_SECRET_ACCESS_KEY: string;
		S3_URL: string;
		S3_BUCKET_NAME: string;
		S3_BUCKET_DOMAIN: string;

		PORT: string;
		NODE_ENV: string;
	}
}
