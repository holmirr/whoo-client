import { useContext, useState } from "react";
import { MapContext } from "@/components/client/DynamicMap";
import { updatePinsLatLng } from "@/action";

export default function UpdateButton() {
  const [isUpdating, setIsUpdating] = useState(false);
  const { expiresDateInput, pinsLatLng, setNowLatLng, setShowSetting, setFlyTarget, batteryLevel, setPinsLatLng, setIsReflecting, setExpiresDate, setStayedAt } = useContext(MapContext);
  const handleUpdateLocation = async () => {
    // そもそもpinsLatLngがnullの場合はボタンも表示されないが、、、、typescriptを納得させるためにnullチェック
    if (!pinsLatLng) {
      alert("ピンの位置を選択してください");
      return;
    }

    try {
      // ボタンを無効化
      setIsUpdating(true);
      // サーバーアクションを呼び出し
      const result = await updatePinsLatLng({
        lat: pinsLatLng.lat,
        lng: pinsLatLng.lng,
      }, batteryLevel / 100, expiresDateInput);
      // サーバーアクションで成功した場合
      if (result.success) {
        // 現在地を反映された場所にする
        setNowLatLng({ lat: pinsLatLng.lat, lng: pinsLatLng.lng });
        // server側でdbに登録された時刻とは異なるが誤差程度なので、new Date()で画面上のstayedAtを更新
        setStayedAt(new Date());
        // isReflectingを依存配列に加えたuseEffectで、これより下の処理を行おうとも考えたが、true→trueの際に実行されないので却下
        setIsReflecting(true);
        // 反映期限をUI上に反映（実際の反映期限はserver側でdbに登録されている、成功も確認済み）
        setExpiresDate(expiresDateInput);
        // 反映された場所に飛ぶ
        setFlyTarget(0);

        // 成功後後処理（ピンを外す、設定ポップアップを閉じる、ボタンを無効化解除）
        setPinsLatLng(null);
        setIsUpdating(false);
        setShowSetting(false);
        alert(result.success);
      } 
      // サーバーアクションで意図的にerrorオブジェクトを返した場合
      else {
        setIsUpdating(false);
        // メッセージも最適化されているのでそのまま表示できる
        alert(result.error);
      }
    } 
    // サーバーアクションでエラーハンドリングしていないので、予期せぬエラーは呼び出し元のクライアントで処理する。
    catch (error) {
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