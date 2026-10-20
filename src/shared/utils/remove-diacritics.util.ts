/** Bỏ dấu tiếng Việt (và dấu Latin khác): "Bệnh đạo ôn" → "Benh dao on". Dùng cho slug / so khớp không dấu. */
export function removeDiacritics(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}
