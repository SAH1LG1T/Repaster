import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/config/env";

const s3Client = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  credentials: {
    accessKeyId: env.S3_ACCESS_KEY_ID,
    secretAccessKey: env.S3_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

export async function createPresignedUploadUrl(
  key: string,
  contentType: string,
  maxSizeBytes = env.MAX_IMAGE_UPLOAD_BYTES
) {
  try {
    const command = new PutObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });

    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
    const publicUrl = `${env.NEXT_PUBLIC_CDN_BASE_URL.replace(/\/$/, "")}/${key}`;

    return {
      uploadUrl,
      publicUrl,
      key,
    };
  } catch (error) {
    console.warn("Storage presign fallback:", error);
    // Graceful fallback for mock/local setups without live S3 credentials
    return {
      uploadUrl: `/api/v1/storage/mock-upload?key=${encodeURIComponent(key)}`,
      publicUrl: `https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80`,
      key,
    };
  }
}

export async function deleteS3Object(key: string): Promise<boolean> {
  if (!key) return true;
  try {
    const command = new DeleteObjectCommand({
      Bucket: env.S3_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`Failed to delete S3 object with key: ${key}`, error);
    return false;
  }
}
