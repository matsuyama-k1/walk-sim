export function formatDate(date: Date) {
  const year = date.getFullYear(); // 年を取得
  const month = date.getMonth() + 1; // 月を取得（0から始まるため+1）
  const day = date.getDate(); // 日を取得
  const hours = date.getHours(); // 時を取得
  const minutes = date.getMinutes(); // 分を取得
  const seconds = date.getSeconds(); // 秒を取得

  // 各部分を二桁に整形するヘルパー関数
  const padTo2Digits = (num: number) => num.toString().padStart(2, "0");

  // フォーマットされた日付文字列を返す
  return `${year}/${padTo2Digits(month)}/${padTo2Digits(day)} ${padTo2Digits(
    hours
  )}:${padTo2Digits(minutes)}:${padTo2Digits(seconds)}`;
}
