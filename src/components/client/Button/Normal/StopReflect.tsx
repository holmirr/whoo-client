"use client";

import { deleteLatLngAction } from "@/action";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function StopReflectButton() {
  const { mode, pinsLatLng, isReflecting, setIsReflecting, setNowLatLng, setStayedAt, setFlyTarget } = useContext(MapContext);
  const handleStop = async () => {
    try {
      await deleteLatLngAction();
      alert("更新停止しました");
      setIsReflecting(false);
      navigator.geolocation.getCurrentPosition((position) => {
        setNowLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStayedAt(null);
        setFlyTarget(0);
      }, (error) => {
        setNowLatLng({ lat: 35.681236, lng: 139.767125 });
        setStayedAt(null);
        setFlyTarget(0);
      });
      
    } catch (error) {
      console.error(error);
      alert("更新停止に失敗しました")
    }
  }

  return mode === "normal" && !pinsLatLng && isReflecting && (
    <button onClick={handleStop} className="bg-blue-500 text-white px-4 py-2 rounded-md z-10000 absolute bottom-4 left-1/2 -translate-x-1/2 hover:bg-blue-600 cursor-pointer">
      反映停止
    </button>
  )
}