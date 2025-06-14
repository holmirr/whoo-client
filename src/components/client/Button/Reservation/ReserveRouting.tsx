"use client";
import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { reserveRouteLatLngs } from "@/action";
import { validStartDate } from "@/libs/utils";
import { getReservationList } from "@/action";

export default function ReserveRouting() {
  const { routeInfo, setRouteInfo, setIsRouting, mode, batteryLevel } = useContext(MapContext);
  const [isReserving, setIsReserving] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [isGray, setIsGray] = useState(true);
  const [popupMsg, setPopupMsg] = useState("");

  const handleReserve = async () => {
    if (isGray) {
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
  }

  useEffect(() => {
    if (routeInfo?.startDate) {
      if (routeInfo.startDate === "now") {
        setIsGray(false);
        return;
      }
      const compareReservation = async () => {
        const reservationList = await getReservationList();
        if (reservationList.every((reservation) => validStartDate(routeInfo.startDate as string, routeInfo.time, reservation.scheduledTime, reservation.requiredTime))) {
          setIsGray(false);
        } else {
          setIsGray(true);
          setPopupMsg("予約時間が重複しています")
        }
      }
      compareReservation();
    } else {
      setIsGray(true);
      setPopupMsg("予約時間を設定してください");
    }
  }, [routeInfo]);

  return routeInfo && (
    <>
      <button
        onClick={handleReserve}
        onMouseEnter={isGray ? () => { setShowPopup(true) } : undefined}
        onMouseLeave={() => { setShowPopup(false) }}
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 z-1000 
      ${isGray ? "cursor-not-allowed bg-gray-500 hover:bg-gray-500" : "cursor-pointer"}`}
        disabled={isReserving}
      >
        {isReserving ? "予約中..." : "経路を予約"}
      </button>
      {showPopup && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md z-1000">
          <p>{popupMsg}</p>
        </div>
      )}
    </>
  )
}


