"use client";

import { useContext } from "react";
import { MapContext } from "../DynamicMap";

export default function RoutingButton() {
  const { mode, setMode } = useContext(MapContext);
  return (
    <button className={`text-black px-4 py-2 rounded-md ${mode === "routing" ? "bg-blue-500 text-white" : "bg-white"}`} onClick={() => setMode("routing")}>ルーティング</button>
  )
}