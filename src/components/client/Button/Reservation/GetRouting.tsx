"use client";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function GetRouting() {
  const { end, mode, isRouting, setIsRouting, isWalking } = useContext(MapContext);
  // 経路表示ボタンを表示する条件は以下の通り
  // 1.終点を指定している。2.モードが移動モードである。3.既に経路表示中でない。4.歩行中ではない
  return end && (mode === "routing") && !isRouting && !isWalking && (
    <button
      onClick={() => setIsRouting(true)}
      className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 cursor-pointer z-1000"
    >経路を表示</button>
  )
}
