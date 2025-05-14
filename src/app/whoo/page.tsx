import DynamicMap from "@/components/client/DynamicMap";
import { getFriendsInfo, getMyInfo } from "@/libs/whooClient";
import { auth } from "@/auth/auth";
import { redirect } from "next/navigation";
import { getWhooUser } from "@/libs/database";
export const dynamic = "force-dynamic";

export default async function WhooPage() {
  try {
    const session = await auth();
    if (!session?.whoo) {
      redirect("/whoo/login");
    }
    const myInfo = await getMyInfo(session.whoo.token);
    const profileImage = myInfo.profile_image;
    const users = await getFriendsInfo(session.whoo.token);
    const whooUser = await getWhooUser(session.whoo.token);
    let nowLatLng: { lat: number, lng: number } | null = null;
    if (whooUser?.latitude && whooUser?.longitude) {
      nowLatLng = { lat: whooUser.latitude, lng: whooUser.longitude };
    }

    return (
      <div>
        <DynamicMap users={users} _nowLatLng={nowLatLng} profileImage={profileImage} />
      </div>
    )
  } catch (error) {
    console.error(error);
    return <div>エラーが発生しました</div>;
  }
}

