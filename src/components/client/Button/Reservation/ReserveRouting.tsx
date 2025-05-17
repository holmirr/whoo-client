"use client";
import { useContext, useState } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { reserveRouteLatLngs } from "@/action";

export default function ReserveRouting() {
  const { routeInfo, setRouteInfo, setIsRouting } = useContext(MapContext);
  const [isReserving, setIsReserving] = useState(false);
  return routeInfo && (
    <button
    onClick={async () => {
      setIsReserving(true);
      await reserveRouteLatLngs(routeInfo);
      alert("経路を予約しました");
      setIsRouting(false);
      setIsReserving(false);
    }}
    className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer z-1000"
    disabled={isReserving}
  >
    経路を予約</button>
  )
}


