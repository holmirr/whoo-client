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
      <div className="relative">
        <input type="datetime-local" id="expiresDate" className={`md:w-50 w-40 border-2 border-gray-300 rounded-md p-2 bg-transparent ${!expiresDateInput ? "datetime-local-placeholder-hidden" : ""}`} value={expiresDateInput ? getLocalISOString(expiresDateInput) : ""} onChange={(e) => setExpiresDateInput(e.target.value ? new Date(e.target.value) : null)} />
        {!expiresDateInput && (
          <span className="absolute top-1/2 left-2 -translate-y-1/2 text-white pointer-events-none">
            無期限更新
          </span>
        )}
      </div>
      <button onClick={() => setExpiresDateInput(null)} className="md:w-20 w-16 bg-blue-500 text-white rounded-md p-2">無期限</button>
    </div>
  );
}