"use client";

import { useContext } from "react";
import { MapContext } from "../DynamicMap";

export default function Battery() {
  const { batteryLevel, setBatteryLevel } = useContext(MapContext);
  return (
    <div className="mb-4">
          <label className="block text-sm font-medium text-gray-500 mb-1">
            バッテリー残量
          </label>
          <input
            type="range"
            min="0"
            max="100"
            value={batteryLevel}
            onChange={(e) => setBatteryLevel(Number(e.target.value))}
            onTouchMove={(e) => {
              const input = e.target as HTMLInputElement;
              const rect = input.getBoundingClientRect();
              const x = e.touches[0].clientX - rect.left;
              const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
              setBatteryLevel(Math.round(percentage));
            }}
            className="m-4 block w-8/10 mx-auto appearance-none bg-gray-300 h-2 rounded-full"
            style={{
              WebkitAppearance: 'none',
              cursor: 'pointer'
            }}
          />
          <div className="text-right mr-4">{batteryLevel}%</div>
        </div>
  );
}
