"use client";

import { useContext } from "react";
import { MapContext } from "../DynamicMap";

export default function ReservationButton() {
  const { showReservationList, setShowReservationList } = useContext(MapContext);
  return (  
    <button className={`text-black px-4 py-2 rounded-md ${showReservationList ? "bg-blue-500 text-white" : "bg-white"}`} onClick={() => setShowReservationList(true)}>予約一覧</button>
  )
}