"use client";
import { useState, useContext, useEffect } from "react";
import { MapContext } from "../DynamicMap";

export default function StartDate() {
  const { routeInfo, setRouteInfo, startDate, setStartDate } = useContext(MapContext);
  
  const handleNow = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setStartDate("now");
    } else {
      setStartDate("");
    }
  }
  useEffect(() => {
    if (routeInfo) {
      setRouteInfo({ ...routeInfo, startDate: startDate });
    }
  }, [startDate]);

  // datetime-localのe.target.valueはyyyy-mm-ddThh:mmの形式である
  return (
    <div className="flex gap-4">
      <label htmlFor="startDate" className="text-gray-400">出発日</label>
      
      <input type="datetime-local" aria-label="出発日" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border-2 border-gray-300 rounded-md w-42" />
      <div className="flex items-center gap-2">
        <input type="checkbox" name="isNow" onChange={handleNow} checked={startDate === "now"} />
        <label htmlFor="isNow" className="text-gray-400">今すぐ出発</label>
      </div>
    </div>
  )
}
