"use client";
import { useContext } from "react";
import { MapContext } from "@/components/client/DynamicMap";

export default function MyPositionButton() {
  const { setFlyTarget } = useContext(MapContext);

  return (
    <button
      className="z-10000 absolute bottom-12 md:right-12 right-4 md:w-16 md:h-16 w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center"
      onClick={() => setFlyTarget(0)}
      aria-label="送信"
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="1 0 24 22" 
        fill="#4169e1"
        stroke="#4169e1" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="w-8 h-8 md:w-10 md:h-10"
      >
        <path d="M22 2L11 13"></path>
        <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
      </svg>
    </button>
  )
}
