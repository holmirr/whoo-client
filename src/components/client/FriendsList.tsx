"use client";
import { MapContext } from "./DynamicMap";
import { useContext } from "react";
import { getFriendsLatLng } from "@/action";

export default function FriendsList() {
  const { showFriendsList, setShowFriendsList, usersInfo, setUsersInfo, setFlyTarget } = useContext(MapContext);

  const updateFriendsLatLng = async (id: number) => {
    setShowFriendsList(false);
    try {
      const users = await getFriendsLatLng();
      setUsersInfo(users.map((user) => ({
        lat: parseFloat(user.latitude),
        lng: parseFloat(user.longitude),
        name: user.user.display_name,
        img: user.user.profile_image,
        id: user.user.id,
        stayed_at: user.stayed_at,
      })));
      const targetUser = users.find(user => user.user.id === id);
      if (targetUser) {
        setFlyTarget(targetUser.user.id);
      } else {
        throw new Error("ユーザーが見つかりません");
      }
    } catch (error) {
      console.error(error);
    }
  }

  return showFriendsList && (
    <>
      <div
        className="absolute inset-0 bg-gray-500/50 z-[99999]"
        onClick={() => setShowFriendsList(false)}
      />
      <div className="absolute bottom-0 left-0 right-0 bg-black text-white shadow-lg rounded-t-lg p-4 z-[100000000] h-[33vh]" >
        <div className="flex flex-col gap-4 relative md:w-3/5 md:mx-auto">
          <div className="flex justify-end">
            <h2 className="text-lg font-bold absolute left-1/2 -translate-x-1/2">友達リスト</h2>
            <button
              onClick={() => setShowFriendsList(false)}
              className="p-1 rounded-full hover:bg-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex gap-8 justify-center items-center overflow-x-auto pb-2 scrollbar-hide">
            {
              usersInfo.map((user) => (
                <button
                  key={user.name}
                  onClick={() => updateFriendsLatLng(user.id)}
                  className="flex-shrink-0"
                >
                  <img src={user.img} alt={user.name} width={64} height={64} className="rounded-full" />
                </button>
              ))
            }
          </div>
        </div>
      </div>
    </>
  );
}
