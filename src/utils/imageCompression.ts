import imageCompression from "browser-image-compression";

// 将 base64 转换为 Blob
export const base64ToBlob = async (base64: string): Promise<Blob> => {
  const response = await fetch(base64);
  return await response.blob();
};

// 获取 base64 字符串的大小（字节）
export const getBase64Size = (base64: string): number => {
  const base64Length = base64.length - (base64.indexOf(",") + 1);
  const padding = base64.endsWith("==") ? 2 : base64.endsWith("=") ? 1 : 0;
  return Math.floor((base64Length * 3) / 4 - padding);
};

// 格式化文件大小
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
}

// 压缩图片
export const compressImage = async (
  base64: string,
  filename: string = "image.png",
  options: CompressionOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1920,
    useWebWorker: true,
  }
): Promise<string> => {
  const blob = await base64ToBlob(base64);
  const file = new File([blob], filename, { type: blob.type });

  const compressedFile = await imageCompression(file, options);
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(compressedFile);
  });
}; 