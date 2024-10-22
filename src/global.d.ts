declare namespace NodeJS {
	interface ProcessEnv {
		NODE_ENV: "development" | "production" | "test";
		TURSO_DATABASE_URL: string;
		TURSO_AUTH_TOKEN: string;
		PORT: string;
		RESEND_TOKEN: string;
		LOGIN_TOKEN_EMAIL: string;
		JWT_SECRET: string;
		COOKIE_SECRET: string;
		REFRESH_TOKEN_SECRET: string;
		ACCESS_TOKEN_SECRET: string;
		S3_TOKEN: string;
		S3_ACCESS_KEY_ID: string;
		S3_SECRET_KEY: string;
		S3_URL: string;
		S3_BUCKET_NAME: string;
	}
}
