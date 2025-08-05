"use client";

import NormalButton from "./Normal";
import RoutingButton from "./Routing";

export default function Modes() {
  return (
    <div className="absolute top-0 left-0 flex items-start gap-2 z-[1000]">
      <NormalButton />
      <RoutingButton />
    </div>
  )
}
