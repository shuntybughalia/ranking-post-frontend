import "server-only";
import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

// S3_* names instead of AWS_*: Vercel reserves the AWS_* credential variables.
interface S3Config {
  bucket: string;
  region: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl: string;
}

let client: S3Client | null = null;

function getS3Config(): S3Config | null {
  const bucket = process.env.S3_BUCKET?.trim();
  const region = process.env.S3_REGION?.trim();
  const accessKeyId = process.env.S3_ACCESS_KEY_ID?.trim();
  const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY?.trim();
  if (!bucket || !region || !accessKeyId || !secretAccessKey) return null;

  // Optional CDN / custom domain in front of the bucket (e.g. CloudFront).
  const publicUrl =
    process.env.S3_PUBLIC_URL?.trim().replace(/\/$/, "") ||
    `https://${bucket}.s3.${region}.amazonaws.com`;

  return { bucket, region, accessKeyId, secretAccessKey, publicUrl };
}

export function isS3Configured(): boolean {
  return getS3Config() !== null;
}

/** Uploads a file to the S3 bucket and returns its public URL. */
export async function uploadToS3(key: string, body: Buffer, contentType: string): Promise<string> {
  const config = getS3Config();
  if (!config) throw new Error("S3 is not configured.");

  client ??= new S3Client({
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  await client.send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: key,
      Body: body,
      ContentType: contentType,
      // Keys are content hashes, so the object at a key never changes.
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );

  return `${config.publicUrl}/${key}`;
}
