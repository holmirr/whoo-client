"use client";
import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { reserveRouteLatLngs } from "@/action";

export default function ReserveRouting() {
  const { routeInfo, setRouteInfo, setIsRouting, batteryLevel, token, expiresDateInput, setIsWalking, isWalking } = useContext(MapContext);
  const [isReserving, setIsReserving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [popupMsg, setPopupMsg] = useState("");

  const handleReserve = async () => {
    setIsReserving(true);
    const result = await reserveRouteLatLngs(token, routeInfo, batteryLevel, expiresDateInput);
    if (result.success) {
      alert("経路を予約しました");
      setRouteInfo(null);
      setIsRouting(false);
      setIsReserving(false);
      setIsWalking(true);
    } else {
      alert(result.error)
      setIsReserving(false);
    }
  }

  useEffect(() => {
    if (routeInfo) {
      if (!routeInfo.time) {
        setPopupMsg("移動時間を設定してください");
        return () => {
          setPopupMsg("");
        }
      } 
    }
  }, [routeInfo]);

  return routeInfo && !isWalking && (
    <>
      <button
        onClick={handleReserve}
        onMouseEnter={routeInfo.time ? undefined : () => { setShowPopup(true) }} 
        onMouseLeave={() => { setShowPopup(false) }}
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 z-1000 
      ${routeInfo.time ? "cursor-pointer" : "cursor-not-allowed bg-gray-500 hover:bg-gray-500"}`}
        disabled={isReserving}
      >
        {isReserving ? (<div className="w-4 h-4 bg-white rounded-full animate-ping"/>) : "移動を開始する"}
      </button>
      {showPopup && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md z-1000">
          <p>{popupMsg}</p>
        </div>
      )}
    </>
  )
}


