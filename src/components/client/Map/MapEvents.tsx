"use client";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import { useRef, useContext, useEffect, useMemo } from "react";
import { MapContext } from "../DynamicMap";
import { MapContextType } from "@/libs/types";
import L from "leaflet";
import "leaflet-routing-machine";
import { calcStayTime } from "@/libs/utils";
import { getFriendsLatLng } from "@/action";

// 目的地のアイコン情報を格納するオブジェクトをコンポーネント外で定義しておく。
// コンポーネント内で定義すると、L.icon()の仕様上、何度もiconUrlやshadowUrlにリクエストを飛ばしてしまうため。
const endIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  // アイコンの先端（地図座標ぴったりの位置を指す画像のピクセル座標）
  iconAnchor: [12, 41],
  // ポップアップの表示位置（ピクセル座標）
  popupAnchor: [1, -34]
});

// whooに位置情報が反映されていない時のアイコン（分かりやすく停止マーク）
const notReflectedIcon = L.icon({
  iconUrl: '/images/prohibitSign.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -40]
});

export default function MapEvents() {
  const { pinsLatLng, setPinsLatLng, usersInfo, isReflecting, flyTarget, setFlyTarget, mode, end, setEnd, isRouting, setIsRouting, setRouteInfo, nowLatLng, profileImage, setUsersInfo, stayedAt } = useContext<MapContextType>(MapContext);
  // マーカーのhtml要素に対してメソッドを用いるため、refを用いて参照を保持する。
  // 複数のMaker要素を同時に保持するため、ref.currentはRecord<number, L.Marker>型としている。
  // numberはユーザーのidを表す。（自分自身のidは存在しないため0を使う）
  const markersRef = useRef<Record<number, L.Marker>>({});
  const zIndexRef = useRef<number | null>(null);
  const iconSize = 48;

  // useMemoは依存配列の変化を検知し、変化したらコールバックを実行し、その戻り値を返す。
  // 依存配列が変化していなければ、コールバックは定義されるだけで実行されず、前回実行時の戻り値を返す。
  // profileImageのurlが変化しない限り、L.icon()は実行されず、リクエスト削減しつつ、アイコン情報を保持できる。
  const myIcon = useMemo(() => L.icon({
    iconUrl: profileImage,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize],
  }), [profileImage, iconSize]);

  // 友達のマーカーはアイコン情報だけでなく、マーカー情報自体を保持する必要がある。
  // なぜなら、.mapで<Marker>自体のリストを生成しているため。（その内部で使われるIconオブジェクトのリストだけをメモ化していても意味がない）
  const userMarkers = useMemo(() => usersInfo.map((user) => (
    <Marker
      key={user.name}
      position={{ lat: user.lat, lng: user.lng }}
      // refには通常ref={elemRef}というようにrefオブジェクトを渡すが、ref={callback}というようにコールバック関数を渡すこともできる。
      // コールバック関数の引数には、html要素のオブジェクトが渡される。
      // コールバック関数の内部でrefオブジェクトとhtml要素のオブジェクトを操作し、ref.currentのuser.idをキーにして、html要素のオブジェクトを保持する。
      ref={(el: L.Marker) => {
        markersRef.current[user.id] = el;
      }}
      // マーカーごとにeventHandlersを設定する。
      eventHandlers={{
        // クリックイベントでは、getFriendsLatLng()を実行し、最新のフレンド情報を取得、その結果をsetUsersInfo()で更新する。
        // その後、setFlyTarget()でフライトの対象を設定し、useEffectでフライトが実行される。
        // つまりアイコンをクリック→デフォルトのクリック動作としてのポップアップ→設定したクリックハンドラー（新しいUserInfoをfetchし、setStateして再レンダリング→フライト対象としてsetFlyTarget)
        click: async () => {
          const result = await getFriendsLatLng();
          setUsersInfo(result.map((usr) => ({
            lat: Number(usr.latitude),
            lng: Number(usr.longitude),
            stayed_at: usr.stayed_at,
            name: usr.user.display_name,
            img: usr.user.profile_image,
            id: usr.user.id
          })));
          setFlyTarget(user.id);
        }
      }}
      icon={L.icon({
        iconUrl: user.img,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
        popupAnchor: [0, -iconSize],
      })}
    >
      <Popup>
        {user.name}
        <br />
        {calcStayTime(user.stayed_at)}
      </Popup>
    </Marker>
  )), [usersInfo]);

  // useMapEventsは、内部でuseContext()を実行している。
  // つまり、useMapEvents()が実行されるコンポーネント（ここでは<MapEvents>)がchildrenとして、<MapContainer>に渡されていれば良い。
  // この場合、useMapEvents()の戻り値は<MapContainer>内部で定義されているmapオブジェクトへの参照となる。
  // useMapEvents()はmapオブジェクトへの参照を返すだけでなく、引数にコールバックを含めることで、mapにイベントリスナーを定義することが可能である。
  const map = useMapEvents({
    // マップへのクリックイベント
    click: (e) => {
      if (mode === "normal") {
        // ノーマルモードではノーマルピンを設置する。
        const position = e.latlng;
        setPinsLatLng({ lat: position.lat, lng: position.lng });
      }
      else if (mode === "routing") {
        // ルーティングモードでは、目的地を設定する。
        if (end === null) {
          setEnd({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
        else {
          // 目的地が設定されている場合に、再度クリックした場合はリセット
          setEnd(null);
          setIsRouting(false);
          // isRoutingがfalseになったら、useEffect(clbk, [isRouting])の戻り値のcallbackが実行され、setRouteInfo(null)が実行されるので、下の行は厳密には不要だが、明示的に記載。
          setRouteInfo(null);
        }
      }
    }
  });

  // フライトの対象が変化したら、フライトを実行する。
  useEffect(() => {
    // flyTarget===nullの場合は、なにも実行しない
    if (flyTarget !== null) {
      // flyTargetが変化した場合、かつ、flyTargetがnullではない場合には前回のフライトで設定したz-indexを0に戻す。
      if (zIndexRef.current !== null) {
        // ちなみにこの間、useMemo()が更新され、新しいFriendsのMaker要素が生成されていれば、その新しい要素のz-indexは0になっているので、この処理が意味なかったりもする。
        // ただ、一度もusersInfoが更新されない場合は、z-index=1000のままなので、この処理は意味がある。
        const marker = markersRef.current[zIndexRef.current];
        if (marker) marker.setZIndexOffset(0);
      }
      let targetPosition: { lat: number, lng: number } | null = null;
      // フライトの対象が自分の場合は、現在位置にフライトする。
      if (flyTarget === 0) targetPosition = nowLatLng;
      // フライトの対象が友達の場合は、友達の位置にフライトする。
      else {
        // flyTargetに指定したidに対応するユーザーの情報を取得できる。
        const target = usersInfo.find((user) => user.id === flyTarget);
        // もしtargetが存在したら、その位置にフライトする。
        if (target) targetPosition = { lat: target.lat, lng: target.lng };
      }
      // もしtargetPositionが存在したら、その位置にフライトする。
      if (targetPosition) map.flyTo(targetPosition, 16);
      // nullに設定しなかったら同じユーザーに２回連続で飛ぼうとしても、flyTargetが変化しないのでuseEffectが発火しない
      setFlyTarget(null);

      // 飛んだ際にポップアップを表示したい。
      // まずはmarkerのhtml要素を取得する。
      const marker = markersRef.current[flyTarget];
      if (marker) {
        // .openPopup()は、マーカーのポップアップを表示する。
        marker.openPopup();
        // 対象のマーカーがほかのマーカーの上に表示されるように、z-indexを1000に設定する。
        marker.setZIndexOffset(1000);
        // z-index=1000となっているマーカーのidを保持する。
        zIndexRef.current = flyTarget;
      } else {
        // マーカーが見つからない場合はエラーを出力する。
        console.log("marker not found");
      }
    }
  }, [flyTarget]);

  //, isRoutingを依存配列に持つuseEffect内で、addControl()を実行し、マップにルートを表示する。
  //. なぜisRoutingを用いずボタンコンポーネントで直接、addControl()を実行しないのか？→ボタンコンポーネントはMapContainerのchildrenではないから
  useEffect(() => {
    if (isRouting && nowLatLng && end) {
      const routingControl = L.Routing.control({
        // 始点（現在地）と終点（endで設定した位置）の緯度・経度を指定
        waypoints: [L.latLng(nowLatLng.lat, nowLatLng.lng), L.latLng(end.lat, end.lng)],
        // trueの場合、ルート上の経由地をドラッグしてルートを再検索できます。
        routeWhileDragging: true,
        // 使用するルーティングエンジンを指定します。
        // ここではOSRM (Open Source Routing Machine) を使う設定です。
        router: L.Routing.osrmv1({
          serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1'
        }),
        // 代替ルートを表示するかどうか。falseなので表示しません。
        showAlternatives: false,
        // 算出されたルート全体がマップに収まるように、自動でズーム・中心位置を調整します。
        fitSelectedRoutes: true,
        // falseの場合、経路案内のUI（曲がり角の指示など）を非表示にします。
        show: false,
        // trueの場合、コントロールがマップに追加されたときに自動でルート検索を開始します。
        autoRoute: true,
        // 経由地（waypoints）の計画や表示に関する設定です。
        plan: new L.Routing.Plan([L.latLng(nowLatLng.lat, nowLatLng.lng), L.latLng(end.lat, end.lng)], {
          // 各経由地に表示されるマーカーをカスタマイズする関数です。
          // ここでは `false` を返しているため、始点と終点にマーカーは表示されません。
          // もとからある現在地のマーカーとendのマーカーは表示されているが、、
          createMarker: (i, wp) => false,
        }),
      });
      map.addControl(routingControl);
      routingControl.on("routesfound", (e) => {
        // ルートが見つかったら、ルートの情報をsetRouteInfo()で更新する。
        // e.routes[0]は、{coordinates: L.LatLng[], summary: {totalDistance: number, totalTime: number}}型のオブジェクトである。
        const route = e.routes[0];
        // e.routes[0].coordinatesは、L.LatLng[]型の配列であり、その実態は{lat:number, lng:number}[]である。
        const latLngs = route.coordinates;
        // route.summary.totalDistanceは、number型である。
        const distance = route.summary.totalDistance;
        const defaultTime = Math.floor(route.summary.totalTime);
        setRouteInfo({ latlngs: latLngs.map((latLng: L.LatLng) => ({ lat: latLng.lat, lng: latLng.lng })), distance, defaultTime });
      });
      // isRoutingがfalseになったら戻り値のcallbackが実行され、map自体からルートが取り除かれるだけでなく、内部的なルート情報も破棄するよう設定。
      return () => {
        map.removeControl(routingControl);
        setRouteInfo(null);
      }
    }
  }, [isRouting]);

  return (
    <>
      {nowLatLng && (
        <Marker
          position={nowLatLng}
          ref={(el: L.Marker) => {
            markersRef.current[0] = el;
          }}
          eventHandlers={{
            click: () => {
              setFlyTarget(0);
            }
          }}
          icon={isReflecting ? myIcon : notReflectedIcon}
        >
          <Popup>
            {isReflecting ? (
              <>
                現在地
                {stayedAt && (
                  <>
                    <br />
                    {calcStayTime(stayedAt)}
                  </>
                )}
              </>
            ) : (
              <>
                位置情報が反映されていません
              </>
            )}
          </Popup>
        </Marker>
      )}
      {userMarkers}
      {pinsLatLng && (
        <div>
          <Marker position={pinsLatLng}>
            <Popup>
              <button
                className="absolute inset-0 bg-blue-500 text-white rounded-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setPinsLatLng(null);
                }}>
                ピンを削除
              </button>
            </Popup>
          </Marker>
        </div>
      )}

      {end && (
        <Marker position={end} icon={endIcon}>
          <Popup>
            目的地
          </Popup>
        </Marker>
      )}
    </>
  )
}
