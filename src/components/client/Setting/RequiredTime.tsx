"use client";

import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function RequiredTime({requiredTime, setRequiredTime}: {requiredTime: string, setRequiredTime: (time: string) => void}) {
  const { routeInfo, setRouteInfo } = useContext(MapContext);

  useEffect(() => {
    if (routeInfo?.time) {
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
      min={0}
      value={requiredTime} 
      onChange={(e) => setRequiredTime(e.target.value)} />
      <span className="text-gray-400">分</span>
      {routeInfo &&
      <div className="flex items-center gap-2">
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
