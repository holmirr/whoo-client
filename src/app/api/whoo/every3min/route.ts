import { NextRequest, NextResponse } from "next/server";
import { getAllWhooUsers } from "@/libs/database";
import { updateLocation } from "@/libs/whooClient";

// dbに保存されている現在地情報をwhooに定期的に反映する処理
// 本来はec2インスタンスが行い、こちらの処理は一切行われないが、スペアとしてこのルート自体は残しておく
export async function GET(request: NextRequest) {
  try{
  // dbからwhooUsersオブジェクトのリストを取得する。
  const whooUsers = await getAllWhooUsers();
  const results = await Promise.allSettled(whooUsers.map(async (user) => {
    if (!user.latitude || !user.longitude) return;
    await updateLocation({
      token: user.token,
      latitude: user.latitude,
      longitude: user.longitude,
      speed: 0,
      stayedAt: user.stayed_at,
      batteryLevel: user.battery_level ?? 100,
      isActive: false,
    });
  }));
  const errorResults = results.filter((result) => result.status === "rejected");
  if (errorResults.length > 0) {
    console.error(errorResults);
    throw new Error(errorResults.map(result => result.reason).join(", "));
  }
  return NextResponse.json({ message: "success" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "error", details: error }, { status: 500 });
  }
}
