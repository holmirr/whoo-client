"use client";
import { useContext, useState } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { reserveRouteLatLngs } from "@/action";

export default function ReserveRouting() {
  const { routeInfo, setRouteInfo, setIsRouting, mode, batteryLevel } = useContext(MapContext);
  const [isReserving, setIsReserving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  return routeInfo && mode === "routing" && (
    <>
    <button
    onClick={async () => {
      if (!routeInfo.startDate) {
        return;
      }
      setIsReserving(true);
      const result = await reserveRouteLatLngs(routeInfo, batteryLevel);
      if (result.success) {
        alert("経路を予約しました");
        setRouteInfo(null);
        setIsRouting(false);
        setIsReserving(false);
      } else {
        alert("経路を予約に失敗しました");
        setIsReserving(false);
      }
    }}
    onMouseEnter={!routeInfo.startDate ? () => {setShowPopup(true)} : undefined}
    onMouseLeave={!routeInfo.startDate ? () => {setShowPopup(false)} : undefined}
    className={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 z-1000 
      ${routeInfo.startDate ? "cursor-pointer" : "cursor-not-allowed bg-gray-500 hover:bg-gray-500"}`}
    disabled={isReserving}
  >
    {isReserving ? "予約中..." : "経路を予約"}
    </button>
    {showPopup && (
      <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md z-1000">
        <p>開始時間を設定してください。</p>
      </div>
    )}
    </>
  )
}


