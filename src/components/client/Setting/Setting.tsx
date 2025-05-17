"use client";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import ModeSelect from "./ModeSelect";
import Battery from "./Battery";

export default function Setting() {
  const { mode, setMode, batteryLevel, setBatteryLevel, showSetting, setShowSetting } = useContext(MapContext);

  // showSettingがfalseの場合は何も表示しない
  if (!showSetting) return null;

  return (
    <>
    <div 
      className="absolute inset-0 bg-gray-500/50 z-[99999]"
      onClick={() => {
        setShowSetting(false);
      }}
    />
    <div className="absolute bottom-0 left-0 right-0 bg-black text-white shadow-lg rounded-t-lg p-4 z-[100000000]" style={{ height: '50vh' }}>
      <div className="flex justify-end items-center mb-4 relative">
        <h2 className="text-lg font-bold absolute left-1/2 -translate-x-1/2">設定</h2>
        <button
          onClick={() => setShowSetting(false)}
          className="p-1 rounded-full hover:bg-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="overflow-y-auto md:w-5/10 md:mx-auto flex flex-col gap-4" style={{ maxHeight: 'calc(33.333vh - 4rem)' }}>
        {/* ここに設定項目を追加 */}
        <ModeSelect />
        <Battery />
        {/* 他の設定項目をここに追加 */}
      </div>
    </div>
    </>
  )
}