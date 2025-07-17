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

export const secToHour = (sec: number) => {
  const hours = Math.floor(sec / 60 / 60);
  const minutes = Math.floor(sec / 60 % 60);
  if (hours === 0 && minutes === 0) return `${sec}秒`;
  if (hours === 0) return `${minutes}分`;
  if (minutes === 0) return `${hours}時間`;
  return `${hours}時間${minutes}分`;  
}

export const mTokm = (m: number) => {
  const km = Math.floor(m / 1000);
  const meter = Math.floor(m % 1000);
  console.log("km", km);
  console.log("meter", meter);
  console.log("m", m);
  if (km === 0) return `${meter}m`;
  return `${km}km${meter}m`;
}
