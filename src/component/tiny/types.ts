export interface PreviewProps {
  /**
   * 图片的 base64 编码
   */
  base64: string;
}

export interface TinyProps {
  base64?: string;
  filename?: string;
}

export interface CompressResult {
  success: boolean;
  url?: string;
  error?: string;
}