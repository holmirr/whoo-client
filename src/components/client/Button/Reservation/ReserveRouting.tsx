"use client";
import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { reserveRouteLatLngs } from "@/action";

export default function ReserveRouting() {
  const { routeInfo, setRouteInfo, setIsRouting, batteryLevel, token, expiresDateInput, setExpiresDate, setIsWalking, isWalking, connectWs, wsRef, setIsReflecting, setShowSetting } = useContext(MapContext);
  // fetch中のボタン無効化のフラグ
  const [isReserving, setIsReserving] = useState(false);
  // ポップアップ表示のフラグ
  const [showPopup, setShowPopup] = useState(false);
  // ポップアップメッセージ
  const [popupMsg, setPopupMsg] = useState("");


  const handleReserve = async () => {
    // 移動時間が設定されていない場合はボタンを押しても何も起こらないようにする
    // disabledで設定しない理由は、それだとonMouseイベントも無効化され、popup表示の切り替えができないため。
    if (!routeInfo?.time) {
      return;
    }
    // fetch中のボタン無効化
    setIsReserving(true);
    // もしws接続が未接続の場合は接続する
    if (!wsRef.current) {
      connectWs();
    }
    // サーバーアクションを呼び出し（実際の移動終了ではなく、ec2側でイベントループに予約する処理が成功すれば成功を返す）
    // サーバーアクション内でエラーハンドリングされており、エラーが発生した場合はresult.errorにエラーメッセージが入っている。
    const result = await reserveRouteLatLngs(token, routeInfo, batteryLevel, expiresDateInput);
    // 予約が成功した場合
    if (result.success) {
      alert("経路を予約しました");

      // 予約成功後の後処理
      setIsWalking(true);
      setIsReflecting(true);
      // 成功でも失敗でも結局は移動中の最後の位置情報で現在地を更新するようdbに保存されるので、expiresDateは予約時点で決定事項
      setExpiresDate(expiresDateInput);
      setRouteInfo(null);
      setIsRouting(false);
      setIsReserving(false);
      setShowSetting(false);
      setShowPopup(false);
    } else {
      // エラーメッセージはサーバーアクションで最適化されているのでそのまま表示
      alert(result.error);
      setIsReserving(false);
    }
  }

  // このuseEffectの使用理由は、routeInfoを変更するコンポーネント(e.g. GetRoutingButton.tsx)でsetPopupMsgを呼び出せないから。
  useEffect(() => {
    if (routeInfo && !routeInfo.time) {
      // 移動時間が設定されていない場合のポップアップ文字列を設定（表示するかしないかはshowPopupで管理）
      setPopupMsg("移動時間を設定してください");
      // routeInfoが変更されたら、いったん空文字にしてリセット。
      return () => {
        setPopupMsg("");
      }
    }
  }, [routeInfo]);

  // 経路予約ボタンを表示する条件は以下の通り
  // 1.ルート情報を持っている。2.歩行中ではない。
  return routeInfo && !isWalking && (
    <>
      <button
        onClick={handleReserve}
        // 移動時間が設定されていない場合、ボタンにカーソルを合わせるとポップアップを表示
        onMouseEnter={routeInfo.time ? undefined : () => { setShowPopup(true) }} 
        // カーソルを離すとポップアップを非表示
        onMouseLeave={() => { setShowPopup(false) }}
        className={`absolute bottom-12 left-1/2 -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 z-1000 
      ${routeInfo.time ? "cursor-pointer" : "cursor-not-allowed bg-gray-500 hover:bg-gray-500"}`}
        disabled={isReserving}
      >
        {isReserving ? (<div className="w-4 h-4 bg-white rounded-full animate-ping"/>) : "移動を開始する"}
      </button>
      {showPopup && (
        <div className="absolute bottom-24 left-1/2 -translate-x-1/2 bg-white text-black px-4 py-2 rounded-md z-1000">
          <p>{popupMsg}</p>
        </div>
      )}
    </>
  )
}


