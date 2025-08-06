"use client";

import { useContext, useState } from "react";
import { MapContext } from "../DynamicMap";

// モードを移動モードにするボタン
// もし始点が設定されていなければ、押せないかつカーソルを合わせるとポップアップが表示される。
export default function RoutingButton() {
  const { mode, setMode, isReflecting } = useContext(MapContext);
  const [popupMsg, setPopupMsg] = useState<string | null>(null);

  const handleClick = () => {
    if (isReflecting) {
      setMode("routing");
    } else {
      return;
    }
  }
  return (
    <div className="relative">
    <button
      className={`text-black px-4 py-2 rounded-md ${mode === "routing" ? "bg-blue-500 text-white" : isReflecting ? "bg-white" : "bg-gray-500 cursor-not-allowed"}`}
      onClick={handleClick}
      onMouseEnter={isReflecting ? undefined : () => setPopupMsg("移動開始は位置情報を反映してからです。")}
      onMouseLeave={() => setPopupMsg(null)}
    >
      ルーティング
    </button>
      { popupMsg && <div className=" bg-white p-2 text-black text-sm rounded-md z-1000">{popupMsg}</div> }
    </div>
  )
}
