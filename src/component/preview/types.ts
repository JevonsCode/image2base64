export interface PreviewProps {
  /**
   * 图片的 base64 编码
   */
  base64: string;
  /**
   * 图片的文件名
   */
  filename: string;
  /**
   * 图片的大小（字节）
   */
  size: number;
  /**
   * 图片的宽度（像素）
   */
  width?: number;
  /**
   * 图片的高度（像素）
   */
  height?: number;
  /**
   * 图片的类型（MIME）
   */
  type?: string;
}
