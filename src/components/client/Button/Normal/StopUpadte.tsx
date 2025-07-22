"use client";

import { deleteLatLngAction } from "@/action";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function StopUpdateButton() {
  const { mode, pinsLatLng, isReflecting, setIsReflecting } = useContext(MapContext);
  const handleStop = async () => {
    try {
      await deleteLatLngAction();
      alert("更新停止しました");
      setIsReflecting(false);
    } catch (error) {
      console.error(error);
      alert("更新停止に失敗しました")
    }
  }

  return mode === "normal" && !!pinsLatLng || isReflecting && (
    <button onClick={handleStop} className="bg-blue-500 text-white px-4 py-2 rounded-md z-10000 absolute bottom-4 left-1/2 -translate-x-1/2 hover:bg-blue-600 cursor-pointer">
      更新停止
    </button>
  )
}