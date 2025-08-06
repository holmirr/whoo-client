"use client";
import { deleteLatLngAction } from "@/action";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

// whooサーバーへの現在地更新を停止するボタン
export default function StopReflectButton() {
  const { mode, pinsLatLng, isReflecting, setIsReflecting, setNowLatLng, setStayedAt, setFlyTarget } = useContext(MapContext);
  
  const handleStop = async () => {
    try {
      // サーバーアクションでdbのlat,lng,expires,stayed_at,no_execをnullにする->ec2が現在地を更新しないようにする
      // 失敗したら（内部的にはエラーレスポンス）catchでエラーをキャッチして、alertでエラーメッセージを表示する。
      await deleteLatLngAction();
      alert("更新停止しました");
      // 成功しているのでレンダリング上も反映停止している状態にする。
      // DynamicMap.tsxのuseEffectでisReflectingがfalseになったら、ブラウザの位置情報を取得してnowLatLngに設定する。+ stayedAtもnullにする。 + リアル現在地へ飛ぶ
      setIsReflecting(false);
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