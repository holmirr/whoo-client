"use client";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function SettingButton() {
  const { setShowSetting, mode, pinsLatLng, end, routeInfo } = useContext(MapContext);
  const handleClick = () => {
    setShowSetting(true);
  }
  if (!pinsLatLng && (!end || !routeInfo)) {
    return null;
  }

  return (
    <button
      onClick={handleClick}
      className="bg-blue-500 text-white px-4 py-2 rounded-md z-10000 absolute bottom-4 left-1/2 -translate-x-1/2 hover:bg-blue-600 cursor-pointer"
    >
      {mode === "normal" ? "位置情報を更新" : "移動を開始する"}
    </button>
  )
}