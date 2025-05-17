"use client";

import { useContext } from "react";
import { MapContext } from "../DynamicMap";

export default function ModeSelect() {
  const { mode, setMode } = useContext(MapContext);
  return (
    <div className="flex bg-gray-800 rounded-md p-1">
      <button className={`flex-1  px-2 py-1 rounded-md 
      ${mode === "normal" ? "bg-white text-gray-700" : "bg-gray-800 text-gray-600"}`}
        onClick={() => setMode("normal")}
      >
        通常モード
      </button>
      <button className={`flex-1  px-2 py-1 rounded-md 
      ${mode === "routing" ? "bg-white text-gray-700" : "bg-gray-800 text-gray-600"}`}
        onClick={() => setMode("routing")}
      >
        予約モード
      </button>
    </div>
  );
}
