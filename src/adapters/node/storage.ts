import {
  DeleteObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import type { ObjectStorage } from "@/ports";

function client() {
  const endpoint = process.env.S3_ENDPOINT;
  return new S3Client({
    region: process.env.S3_REGION || "us-east-1",
    endpoint,
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== "false",
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || "minio",
      secretAccessKey: process.env.S3_SECRET_KEY || "minio-secret",
    },
  });
}

export function createS3Storage(): ObjectStorage {
  const bucket = process.env.S3_BUCKET || "suan-media";
  const c = client();
  return {
    async put(key, body, contentType) {
      await c.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        }),
      );
    },
    async delete(key) {
      await c.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    },
  };
}
