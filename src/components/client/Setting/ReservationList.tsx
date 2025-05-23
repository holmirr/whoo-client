"use client";

import { useState, useEffect } from "react";
import { getReservationList } from "@/action";
export default function ReservationList() {
  const [reservationList, setReservationList] = useState<null | { sessionId: string, scheduledTime: Date, requiredTime: number, distance: number, batteryLevel: number }[]>(null);
  useEffect(() => {
    const fetchReservationList = async () => {
      const reservationList = await getReservationList();
      setReservationList(reservationList);
    }
    fetchReservationList();
  }, []);
  return reservationList ? (
    <div>
      <h1>予約一覧</h1>
      <ul>
        {reservationList.map((reservation) => ( 
          <li key={reservation.sessionId} className="flex justify-between">
            <p>{reservation.scheduledTime.toLocaleString()}</p>
            <p>{reservation.requiredTime}分</p>
            <p>{reservation.distance}m</p>
            <p>{reservation.batteryLevel}%</p>
          </li>
        ))}
      </ul>
    </div>
  ) : (
      <div className="flex justify-center mt-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
  )
}
