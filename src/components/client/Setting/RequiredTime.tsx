"use client";

import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { RouteInfo } from "@/libs/types";

export default function RequiredTime({ requiredTime, setRequiredTime }: { requiredTime: { hour: number, min: number, sec: number }, setRequiredTime: React.Dispatch<React.SetStateAction<{ hour: number, min: number, sec: number }>> }) {
  const { routeInfo, setRouteInfo } = useContext(MapContext);
  

  useEffect(() => {
    // routeInfo && <RequiredTime/>で表示されているので、このコンポーネントが表示されているときはrouteInfoが存在する=if条件は常に真
    // フォーム入力→setRequiredTime→routeInfo.timeが更新される（onChangeの流れで更新してもよいが、この処理が共通なのでuseEffectで分けているが、、改めて考えるとこの無名関数をuseCallbackなどで定義して、onChangeで呼び出せばよいか、、）
    // ※フォーム入力時だけでなく初回マウント時にも強制的にrouteInfo.timeをフォームの値(0)で更新する。
    if (routeInfo) {
      const totalSec = requiredTime.hour * 3600 + requiredTime.min * 60 + requiredTime.sec;
      setRouteInfo((prev: RouteInfo | null) => prev ? { ...prev, time: totalSec } : null);
    }
  }, [requiredTime]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="requiredTime" className="pr-4 text-gray-400">移動時間</label>
      <input
        type="number"
        className="w-8"
        min={0}
        value={requiredTime.hour}
        onChange={(e) => setRequiredTime(prev => ({ ...prev, hour: parseInt(e.target.value) }))} />
      <span className="text-gray-400">時間</span>
      <input
        type="number"
        className="w-8"
        min={0}
        value={requiredTime.min}
        onChange={(e) => setRequiredTime(prev => ({ ...prev, min: parseInt(e.target.value) }))} />
      <span className="text-gray-400">分</span>
      <input
        type="number"
        className="w-8"
        min={0}
        value={requiredTime.sec}
        onChange={(e) => setRequiredTime(prev => ({ ...prev, sec: parseInt(e.target.value) }))} />
      <span className="text-gray-400">秒</span>

      {routeInfo &&
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRequiredTime({ hour: Math.floor(routeInfo.defaultTime / 3600), min: Math.floor((routeInfo.defaultTime % 3600) / 60), sec: routeInfo.defaultTime % 60 })}
            className="flex items-center ml-8"
          >
            デフォルト
          </button>
          <button
            onClick={() => setRequiredTime({ hour: Math.floor(((routeInfo.distance / 1000) / (50 / 3600)) / 3600), min: Math.floor(((routeInfo.distance / 1000) / (50 / 3600)) % 3600 / 60), sec: Math.floor(((routeInfo.distance / 1000) / (50 / 3600)) % 60) })}
            className="flex items-center ml-8"
          >
            🚙
          </button>
          <button
            onClick={() => setRequiredTime({ hour: Math.floor(((routeInfo.distance / 1000) / (10 / 3600)) / 3600), min: Math.floor(((routeInfo.distance / 1000) / (10 / 3600)) % 3600 / 60), sec: Math.floor(((routeInfo.distance / 1000) / (10 / 3600)) % 60) })}
          >
            🚲
          </button>
          <button
            onClick={() => setRequiredTime({ hour: Math.floor(((routeInfo.distance / 1000) / (3 / 3600)) / 3600), min: Math.floor(((routeInfo.distance / 1000) / (3 / 3600)) % 3600 / 60), sec: Math.floor(((routeInfo.distance / 1000) / (3 / 3600)) % 60) })}
          >
            🚶
          </button>
        </div>
      }
    </div>
  );
}
