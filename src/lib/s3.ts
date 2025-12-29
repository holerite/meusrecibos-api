import { S3Client } from "@aws-sdk/client-s3";
import process from "node:process";


export const S3 = new S3Client({
	region: "auto",
	endpoint: process.env.S3_BUCKET_DOMAIN,
	forcePathStyle: false,
	credentials: {
		accessKeyId: process.env.S3_ACCESS_KEY_ID,
		secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
	},
});
