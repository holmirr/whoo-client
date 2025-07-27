"use client";
import { useContext, useState } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function GetRouting() {
  const { isWalking, wsRef, mode } = useContext(MapContext);
  const [isStopping, setIsStopping] = useState(false);
  return isWalking && mode === "routing" && (
    <button
      onClick={() => {
        wsRef.current?.send(JSON.stringify({ type: "stop" }));
        setIsStopping(true);
      }}
      className={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer z-1000
      ${isStopping ? "bg-red-500 hover:bg-red-600" : "bg-blue-500 hover:bg-blue-600"}`}
    >{isStopping ? "移動を停止中..." : "移動を停止する"}</button>
  )
}
