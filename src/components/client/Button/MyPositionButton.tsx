"use client";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function MyPositionButton() {
  const { nowLatLng, actualLatLng, setFlyTarget } = useContext(MapContext);
  const handleFlyToMe = () => {
    if (!nowLatLng && actualLatLng) {
      setFlyTarget({ lat: actualLatLng.lat, lng: actualLatLng.lng, id: 0 });
    } else if (nowLatLng) {
      setFlyTarget({ lat: nowLatLng.lat, lng: nowLatLng.lng, id: 0 });
    } else {
      setFlyTarget({ lat: 35.681236, lng: 139.767125, id: 0 });
    }
  }
  return (
    <button
      className="z-10000 absolute bottom-12 right-12 md:w-16 md:h-16 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center"
      onClick={handleFlyToMe}
      aria-label="送信"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="1 0 24 22" 
        fill="#4169e1"
        stroke="#4169e1" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-8 h-8 md:w-10 md:h-10"
      >
        <path d="M22 2L11 13"></path>
        <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
      </svg>
    </button>
  )
}
