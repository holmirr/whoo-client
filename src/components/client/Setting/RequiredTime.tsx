"use client";

import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function RequiredTime() {
  const { routeInfo, setRouteInfo } = useContext(MapContext);
  const [requiredTime, setRequiredTime] = useState<{ hour: number, min: number, sec: number }>({ hour: 0, min: 0, sec: 0 });

  useEffect(() => {
    if (routeInfo) {
      const totalSec = requiredTime.hour * 3600 + requiredTime.min * 60 + requiredTime.sec;
      setRouteInfo({ ...routeInfo, time: totalSec });
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
        onChange={(e) => setRequiredTime({ ...requiredTime, hour: parseInt(e.target.value) })} />
      <span className="text-gray-400">時間</span>
      <input
        type="number"
        className="w-8"
        min={0}
        value={requiredTime.min}
        onChange={(e) => setRequiredTime({ ...requiredTime, min: parseInt(e.target.value) })} />
      <span className="text-gray-400">分</span>
      <input
        type="number"
        className="w-8"
        min={0}
        value={requiredTime.sec}
        onChange={(e) => setRequiredTime({ ...requiredTime, sec: parseInt(e.target.value) })} />
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
