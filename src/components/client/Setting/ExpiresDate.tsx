"use client";

import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

// input(type="datetime-local")のe.target.valueはyyyy-mm-ddThh:mmの形式で返ってくる
function getLocalISOString(date: Date) {
  const year = date.getFullYear();
  // getMonth()は0から始まるため+1する。padStartで2桁に整形。
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

export default function ExpiresDate() {
  const { expiresDateInput, setExpiresDateInput } = useContext(MapContext);
  
  return (
    <div className="flex items-center gap-2">
      <label htmlFor="expiresDate">有効期限</label>
      <input type="datetime-local" id="expiresDate" value={expiresDateInput ? getLocalISOString(expiresDateInput) : ""} onChange={(e) => setExpiresDateInput(new Date(e.target.value))} />
      <button onClick={() => setExpiresDateInput(null)}>無期限</button>
    </div>
  );
}