// stayed_atはyyyy-mm-dd hh:mm:ssの形式である(UTC)
export const calcStayTime = (stayed_at: string) => {
  const stayedAt = new Date(stayed_at + "+0000");
  const diff = Date.now() - stayedAt.getTime();

  if (diff < 1 * 60 * 60 * 1000) {
    return Math.floor(diff / (1000 * 60)) + "分";
  }
  else if (diff > 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + "日";
  }
  else {
    return Math.floor(diff / (1000 * 60 * 60)) + "時間" + Math.floor(diff % (1000 * 60 * 60) / (1000 * 60)) + "分";
  }
}

// startDateはyyyy-mm-ddThh:mmの形式である(local-timezone)
// resDateはDateオブジェクトである
export const validStartDate = (startDate: string, required_minutes: number, reservStart: Date, reserved_minutes: number) => {
  const start = new Date(startDate);
  const end = new Date(start.getTime() + required_minutes * 60 * 1000);
  const reservEnd = new Date(reservStart.getTime() + reserved_minutes * 60 * 1000);
  return end < reservStart || reservEnd < start;
}