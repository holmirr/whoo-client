"use client";

import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function RequiredTime() {
  const { routeInfo, setRouteInfo } = useContext(MapContext);
  const [requiredTime, setRequiredTime] = useState<string>("");

  useEffect(() => {
    if (routeInfo) {
      const min = parseInt(requiredTime);
      const seconds = min * 60;
      setRouteInfo({ ...routeInfo, time: seconds });
    }
  }, [requiredTime]);

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="requiredTime" className="pr-4 text-gray-400">移動時間</label>
      <input
        type="number"
        className="w-12"
        min={1}
        value={requiredTime}
        onChange={(e) => setRequiredTime(e.target.value)} />
      <span className="text-gray-400">分</span>
      {routeInfo &&
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRequiredTime(Math.floor(routeInfo.defaultTime / 60).toString())}
            className="flex items-center ml-8"
          >
            デフォルト
          </button>
          <button
            onClick={() => setRequiredTime(Math.floor(routeInfo.distance * 60 / 50 / 1000).toString())}
            className="flex items-center ml-8"
          >
            🚙
          </button>
          <button
            onClick={() => setRequiredTime(Math.floor(routeInfo.distance * 60 / 10 / 1000).toString())}
          >
            🚲
          </button>
          <button
            onClick={() => setRequiredTime(Math.floor(routeInfo.distance * 60 / 3 / 1000).toString())}
          >
            🚶
          </button>
        </div>
      }
    </div>
  );
}
