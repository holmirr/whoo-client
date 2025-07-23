import { useContext } from "react";
import { MapContext } from "./DynamicMap";

function getReflectTime(expiresDate: Date) {
  const month = String(expiresDate.getMonth() + 1).padStart(2, '0');
  const day = String(expiresDate.getDate()).padStart(2, '0');
  const hours = String(expiresDate.getHours()).padStart(2, '0');
  const minutes = String(expiresDate.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${minutes}`;
}

export default function ReflectNotification() {
  const { isReflecting, expiresDate } = useContext(MapContext);
  return (
    <div className="absolute top-0 left-1/2 -translate-x-1/2 bg-black/50 z-10000">
      {isReflecting ? `${expiresDate ? getReflectTime(expiresDate)+"まで" : "無期限"}反映中` : "反映停止"}
    </div>
  );
}