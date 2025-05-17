"use client";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function GetRouting() {
  const { start, end, mode, isRouting, setIsRouting } = useContext(MapContext);
  return start && end && mode === "routing" && !isRouting && (
    <button
      onClick={() => setIsRouting(true)}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer z-1000"
    >経路を表示</button>
  )
}
