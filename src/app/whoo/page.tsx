import DynamicMap from "@/components/client/DynamicMap";
import { getFriendsInfo, getMyInfo } from "@/libs/whooClient";
import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { getWhooUser } from "@/libs/database";
import { encrypt } from "@/libs/encrypt";
export const dynamic = "force-dynamic";

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
    if (whooUser?.latitude && whooUser?.longitude) {
      nowLatLng = { lat: whooUser.latitude, lng: whooUser.longitude };
    }

    return (
        <DynamicMap users={users} _nowLatLng={nowLatLng} profileImage={profileImage} token={encrypt(token)} />
    )
  } catch (error) {
    console.error(error);
    return <div>エラーが発生しました</div>;
  }
}

