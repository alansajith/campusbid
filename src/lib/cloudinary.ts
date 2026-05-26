import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function uploadImage(
  dataUri: string,
  folder = "campusbid/auctions"
): Promise<string> {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "image",
    transformation: [
      { width: 1200, height: 1200, crop: "limit" },
      { quality: "auto:good" },
      { fetch_format: "auto" },
    ],
  });
  return result.secure_url;
}

export async function uploadMultipleImages(
  dataUris: string[],
  folder = "campusbid/auctions"
): Promise<string[]> {
  const uploads = dataUris.map((uri) => uploadImage(uri, folder));
  return Promise.all(uploads);
}

export async function deleteImage(publicId: string): Promise<void> {
  await cloudinary.uploader.destroy(publicId);
}

export function getOptimizedUrl(
  url: string,
  width = 800,
  height = 600
): string {
  // Transform Cloudinary URL to add optimizations
  if (!url.includes("cloudinary.com")) return url;
  return url.replace(
    "/upload/",
    `/upload/w_${width},h_${height},c_fill,q_auto,f_auto/`
  );
}

export default cloudinary;
