/** Đuôi file viết thường, không dấu chấm ("Ảnh.JPG" → "jpg"); không có đuôi → "". */
export const getFileExtension = (filename: string) => {
  const dot = filename.lastIndexOf(".");
  return dot > 0 ? filename.slice(dot + 1).toLowerCase() : "";
};
