import { NextRequest, NextResponse } from "next/server";
import { getAllWhooUsers, deleteLatLng } from "@/libs/database";
import { updateLocation } from "@/libs/whooClient";

// dbに保存されている現在地情報をwhooに定期的に反映する処理
// 本来はec2インスタンスが行い、こちらの処理は一切行われないが、スペアとしてこのルート自体は残しておく
export async function GET(request: NextRequest) {
  try {
    // dbからwhooユーザー一覧を取得する(戻り値はrowオブジェクトのリスト)
    // WHERE no_exec = false で、歩行中でないユーザーを取得している。
    const rows = await getAllWhooUsers();

    // 取得したrowオブジェクトのリストをmapで処理し、Promiseのリストにする。
    // もしlatitudeやlongitudeがnullなら、既にexpiresされているのでスキップする。
    // PromiseのリストをPromise.allSettled()で実行し、結果のリストを取得する。
    // 結果は({status: "fulfilled", value: undefined}|{status: "rejected", reason: Error})[] の配列になる。
    const results = await Promise.allSettled(rows.map(async (row) => {
      // Promise.allSettled()の引数のリストの要素valueはPromise型以外でも良い。
      // .all()や.allSettled()は内部で各要素に対してPromise.resolve(value)を実行するので、Promise型なら変わらず、定値なら即座にfullfilledされるPromiseになる。
      if (!row.latitude || !row.longitude) return;

      // もしexpiresが無期限でなく、現在時刻より過去なら、dbから位置情報やその他情報を削除し、undefinedを返す。  
      if (row.expires && row.expires < new Date()) {
        await deleteLatLng(row.token);
        return;
      }

      // 位置情報を更新する。
      await updateLocation({
        token: row.token,
        latitude: row.latitude,
        longitude: row.longitude,
        speed: 0,
        stayedAt: row.stayed_at,
        batteryLevel: row.battery_level ?? 100,
        isActive: false,
      });
      // もし更新したら1を返し、スキップで返すundefinedと区別する。
      return 1;
    }));

    // エラーが起きたPromiseのリストを取得する。
    const errorResults = results.filter((result) => result.status === "rejected");
    if (errorResults.length > 0) {
      console.error(errorResults);
    }

    // 成功したPromiseの数を取得する。
    // lat,lngがnullの場合とexpiresが過去の場合はundefinedを返し、スキップされているので、成功したPromiseの数には含めない。成功したPromiseは1を返している。
    const successResultsLength = results.filter((result) => result.status === "fulfilled" && result.value !== undefined).length;
    console.log(`location update is done. ${successResultsLength} users are updated.`);
    return NextResponse.json({ message: `location update is done. ${successResultsLength} users are updated and ${errorResults.length} users are in error.` }, { status: 200 });
  }
  catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
