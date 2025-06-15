"use client";

import NormalButton from "./Normal";
import RoutingButton from "./Routing";
import ReservationButton from "./Reservation";

export default function Modes() {
  return (
    <div className="absolute top-0 left-0 flex gap-2 z-[1000]">
      <NormalButton />
      <RoutingButton />
      <ReservationButton />
    </div>
  )
}