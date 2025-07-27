import DynamicMap from "@/components/client/DynamicMap";
import { getFriendsInfo, getMyInfo } from "@/libs/whooClient";
import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { deleteLatLng, getWhooUser } from "@/libs/database";
import { encrypt } from "@/libs/encrypt";

export default async function WhooPage() {
  try {
    const session = await auth();
    if (!session?.whoo?.token) {
      redirect("/whoo/login");
    }
    const token = session.whoo.token;
    const myInfo = await getMyInfo(token);
    const profileImage = myInfo.profile_image;
    const users = await getFriendsInfo(token);
    const whooUser = await getWhooUser(token);
    let nowLatLng: { lat: number, lng: number } | null = null;
    let stayedAt: Date | null = null;
    if (whooUser?.latitude && whooUser?.longitude) {
      // 無期限 or 有効期限はあるが、現在時刻よりも先の場合にはdb上の位置情報を使用できる
      if (!whooUser.expires || (whooUser.expires && whooUser.expires > new Date())) {
        nowLatLng = { lat: whooUser.latitude, lng: whooUser.longitude };
        stayedAt = whooUser.stayed_at;
      } 
      // 有効期限が切れている場合はdbの位置情報、有効期限、stayed_atを削除する
      else {
        await deleteLatLng(token);
      }
    }
    return (
      <DynamicMap users={users} _nowLatLng={nowLatLng} profileImage={profileImage} _expiresDate={whooUser?.expires ?? null} _stayedAt={stayedAt} token={encrypt(token)} />
    )
  } catch (error) {
    console.error(error);
    return <div>エラーが発生しました</div>;
  }
}

