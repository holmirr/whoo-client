"use client";
import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function GetRouting() {
  const { isWalking, wsRef, mode } = useContext(MapContext);
  // fetch中のボタン無効化のフラグ
  const [isStopping, setIsStopping] = useState(false);

  // このuseEffectの使用理由は、実際に止まったことを確認するコンポーネント(e.g. DynamicMap.tsx)でsetIsStoppingを呼び出せないから。
  useEffect(() => {
    if (!isWalking) {
      setIsStopping(false);
    }
  }, [isWalking]);

  // 移動中止ボタンを押すと、ec2あてにstopイベントを送信する。
  // ec2側ではstopフラグを立て、移動実行中の関数がそれを感知すると、移動を終了する。
  // 終了イベントをec2→クライアントに投げる。クライアントはonmessageでそれを感知し、さまざまな移動終了state処理を行う。
  // ※onmessageはDynamicMap.tsx内で定義されており、クロージャがそのモジュール範囲に固定されているので、isStoppingを呼び出せない。-> isWalkingをフラグとしてuseEffect内でisStoppingをfalseにする。
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
