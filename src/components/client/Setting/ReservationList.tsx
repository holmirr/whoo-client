"use client";

import { useState, useEffect } from "react";
import { getReservationList, deleteReservation } from "@/action";
import { MapContext } from "../DynamicMap";
import { useContext } from "react";
import { secToHour, mTokm } from "@/libs/utils";

export default function ReservationList() {
  const [reservationList, setReservationList] = useState<null | { sessionId: string, scheduledTime: Date, requiredTime: number, distance: number, batteryLevel: number }[]>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const { setShowReservationList } = useContext(MapContext);

  useEffect(() => {
    const fetchReservationList = async () => {
      const reservationList = await getReservationList();
      setReservationList(reservationList);
      console.log("reservationList", reservationList);
    }
    fetchReservationList();
  }, []);

  const handleDelete = async (session_id: string) => {
    try {
      setIsDeleting(session_id);
      await deleteReservation(session_id);
      setReservationList(null);
      setReservationList(await getReservationList());
    } catch (error) {
      alert("予約を削除できませんでした");
    } finally {
      setIsDeleting(null);
    }
  }

  return (
    <>
      <div className="absolute inset-0 bg-gray-500/50 z-[99999]" onClick={() => setShowReservationList(false)}>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-black/80 text-white shadow-lg rounded-t-lg p-4 z-[100000000] pb-5">
        <div className="max-w-xl mx-auto px-10 relative">
          <h1 className="text-center text-2xl font-bold mb-4">予約一覧</h1>
          <button className="absolute top-0 right-0" onClick={() => setShowReservationList(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {reservationList ? (
            <>
              <ul className="grid grid-cols-[140px_1fr_1fr_1fr] text-left gap-2">
                <li>開始時刻</li>
                <li>所要時間</li>
                <li>距離</li>
                <li>バッテリー</li>
              </ul>
              <ul>
                {reservationList.map((reservation) => (
                  <li key={reservation.sessionId} className="grid grid-cols-[140px_1fr_1fr_1fr] text-left gap-2">
                    <p>{reservation.scheduledTime.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                    <p>{secToHour(reservation.requiredTime)}</p>
                    <p>{mTokm(reservation.distance)}</p>
                    <p>{reservation.batteryLevel}%</p>
                    <button
                      className={`bg-red-500 text-white rounded-md ${isDeleting === reservation.sessionId ? "opacity-50" : ""}`}
                      onClick={() => handleDelete(reservation.sessionId)}
                    >{isDeleting === reservation.sessionId ? "削除中..." : "削除"}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          ) : (
            <div className="flex justify-center mt-4">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

