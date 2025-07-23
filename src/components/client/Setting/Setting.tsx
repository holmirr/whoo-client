"use client";
import { useContext, useState, useEffect } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import ModeSelect from "./ModeSelect";
import Battery from "./Battery";
import RequiredTime from "./RequiredTime";
import ExpiresDate from "./ExpiresDate";


export default function Setting() {
  const { mode, setMode, setBatteryLevel, showSetting, setShowSetting, routeInfo } = useContext(MapContext);
  const [settingMode, setSettingMode] = useState<"normal" | "routing">(mode);

  useEffect(() => {
    setSettingMode(mode);
  }, [mode]);


  return showSetting && (
    <>
      <div
        className="absolute inset-0 bg-gray-500/50 z-[99999]"
        onClick={() => {
          setShowSetting(false);
        }}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black/80 text-white shadow-lg rounded-t-lg p-4 z-[100000000] pb-5" style={{ height: '60vh' }}>
        <div className="flex flex-col w-full max-w-xl mx-auto h-full">
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
          <ModeSelect settingMode={settingMode} setSettingMode={setSettingMode} />
          <div className="overflow-y-auto flex flex-col gap-4 no-scrollbar pt-4" >
            <Battery/>
            <ExpiresDate/>
            {settingMode === "routing" && <RequiredTime/>}
            
          </div>
        </div>
      </div>
    </>
  )
}