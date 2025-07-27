import { useContext, useState } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { updatePinsLatLng } from "@/action";

export default function UpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { expiresDateInput, pinsLatLng, setNowLatLng, setFlyTarget, batteryLevel, setPinsLatLng, setIsReflecting, setExpiresDate, setStayedAt } = useContext(MapContext);
  const handleUpdateLocation = async () => {
    if (!pinsLatLng) {
      alert("ピンの位置を選択してください");
      return;
    }
    try {
      setIsUpdating(true);
      const result = await updatePinsLatLng({
        lat: pinsLatLng.lat,
        lng: pinsLatLng.lng,
      }, batteryLevel / 100, expiresDateInput);
      if (result.success) {
        setNowLatLng({ lat: pinsLatLng.lat, lng: pinsLatLng.lng });
        setStayedAt(new Date());
        setIsReflecting(true);
        setExpiresDate(expiresDateInput);
        setFlyTarget({ lat: pinsLatLng.lat, lng: pinsLatLng.lng, id: 0 });
        setPinsLatLng(null);
        setIsUpdating(false);
        alert(result.success);
      } 
      else {
        setIsUpdating(false);
        alert(result.error);
      }
    } catch (error) {
      console.error(error);
      alert("位置情報の更新に失敗しました");
      setIsUpdating(false);
    }
  }
  return pinsLatLng && (
    <button
      onClick={handleUpdateLocation}
      disabled={isUpdating}
      className="bg-blue-500 text-white px-4 py-2 rounded-md z-10000 absolute bottom-4 left-1/2 -translate-x-1/2 hover:bg-blue-600 cursor-pointer"
    >
      {isUpdating ? "位置情報更新中..." : "位置情報更新"}
    </button>
  )
}