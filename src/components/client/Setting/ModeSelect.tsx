"use client";

export default function ModeSelect({settingMode, setSettingMode}: {settingMode: "normal" | "routing", setSettingMode: (mode: "normal" | "routing") => void}) {
  return (
    <div className="flex bg-gray-800 rounded-md p-1">
      <button className={`flex-1  px-2 py-1 rounded-md 
      ${settingMode === "normal" ? "bg-white text-gray-700" : "bg-gray-800 text-gray-600"}`}
        onClick={() => setSettingMode("normal")}
      >
        通常モード
      </button>
      <button className={`flex-1  px-2 py-1 rounded-md 
      ${settingMode === "routing" ? "bg-white text-gray-700" : "bg-gray-800 text-gray-600"}`}
        onClick={() => setSettingMode("routing")}
      >
        移動モード
      </button>
    </div>
  );
}
