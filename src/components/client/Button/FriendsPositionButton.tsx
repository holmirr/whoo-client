"use client";

import { MapContext } from "@/components/client/DynamicMap";
import { useContext } from "react";

// 友達一覧を表示するボタン
export default function FriendsPositionButton() {
  const { setShowFriendsList } = useContext(MapContext);

  return (
    <button 
      onClick={() => setShowFriendsList(true)}
      className="absolute md:bottom-36 bottom-28 md:right-12 right-4 md:w-16 md:h-16 w-12 h-12 bg-white p-2 rounded-full shadow-md z-10000"
      aria-label="友達の位置"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 md:h-10 md:w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0z"/>
        <path d="M12 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
        <path d="M19 4a3 3 0 1 1-6 0 3 3 0 0 1 6 0z"/>
        <path d="M20 10c1.65 0 3 1.35 3 3v2h-6"/>
      </svg>
    </button>
  );
}