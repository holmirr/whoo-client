"use client";

import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function RequiredTime() {
  const [inputValue, setInputValue] = useState<string>("");
  const { routeInfo, setRouteInfo } = useContext(MapContext);

  useEffect(() => {
    console.log("first mount")
  }, []);

  useEffect(() => {
    if (routeInfo?.time && inputValue === "") {
      const min = Math.floor(routeInfo.time / 60);
      setInputValue(min.toString());
    }
  }, [routeInfo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.value);
    setInputValue(e.target.value);
    if (routeInfo?.time) {
      const min = parseInt(e.target.value);
      const seconds = min * 60;
      setRouteInfo({ ...routeInfo, time: seconds });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <label htmlFor="requiredTime" className="pr-4 text-gray-400">移動時間</label>
      <input 
      type="number" 
      className="w-12"
      min={0}
      value={inputValue} 
      onChange={handleInputChange} />
      <span className="text-gray-400">分</span>
      {routeInfo?.time && 
      <button 
        onClick={() => setInputValue(Math.floor(routeInfo.time / 60).toString())}
        className="flex items-center ml-8"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
          <path d="M3 3v5h5"></path>
          <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
          <path d="M16 16h5v5"></path>
        </svg>
      </button>
      }
    </div>
  );
}
