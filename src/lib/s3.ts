import { S3Client } from "@aws-sdk/client-s3";
import process from "node:process";

const config = {
	region: "auto",
	endpoint: process.env.S3_URL,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_KEY,
	},
};

export const S3 = new S3Client(config);
