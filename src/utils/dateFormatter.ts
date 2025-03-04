/**
 * 日付文字列を日本語形式でフォーマットする
 * @param dateString ISO形式の日付文字列
 * @returns フォーマットされた日付文字列
 */
export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date
    .toLocaleString("ja-JP", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\//g, "-");
}
