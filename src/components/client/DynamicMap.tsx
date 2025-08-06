// TODO デザインを整える
// TODO アイコンを丸にする
"use client";

import dynamic from "next/dynamic";
import { createContext, useEffect, useRef, useState, useCallback } from "react";
import { MapContextType, Location, UserInfo, RouteInfo, walkingResponse } from "@/libs/types";
import SettingButton from "./Button/SettingButton";
import MyPositionButton from "./Button/MyPositionButton";
import Setting from "./Setting/Setting";
import GetRouting from "./Button/Reservation/GetRouting";
import FriendsPositionButton from "./Button/FriendsPositionButton";
import FriendsList from "./FriendsList";
import Modes from "./Button/Modes";
import StopReflectButton from "./Button/Normal/StopReflect";
import ReflectNotification from "./ReflectNotification";
import StopButton from "./Button/Reservation/StopButton";

// dynamicはコールバック関数をクライアントのみで実行し、その結果を返す関数。つまり、サーバーサイドでは実行されない。
// MapsコンポーネントではMapContainerコンポーネントをimportしているが、このコンポーネントはクライアント特有のAPIを使用するので、サーバーサイドで実行されるとエラーになる
// ※"use client"でクライアントコンポーネントにしても初期レンダリングは一度サーバーサイドで行われている
const MapComponent = dynamic(() => import("@/components/client/Map/Maps"), { ssr: false });

// Context.Provider=コンポーネントでchildrenを受け取る
// childrenはContext.Providerに渡されたpropsのkey=valueをuseContextで取得できる
export const MapContext = createContext({} as MapContextType);

export default function DynamicMap({ users, _nowLatLng, profileImage, _expiresDate, token, _stayedAt }: { users: Location[], _nowLatLng: { lat: number, lng: number } | null, profileImage: string, _expiresDate: Date | null, token: string, _stayedAt: Date | null }) {
  // whooに位置情報を反映中かどうかというフラグ、初期値はサーバーから渡された_nowLatLngがnullでなければ、まだ更新中だということ。
  // ※もしexpireされていたら、db中のlat,lngはnullになっている。
  const [isReflecting, setIsReflecting] = useState<boolean>(!!_nowLatLng);
  // 移動モードの際のユーザーが指定した道のりのルート情報を保存するためのstate
  // 位置情報({lat,lng}[])と距離(m)、デフォルトの所要時間(秒)、ユーザーが指定する所要時間（秒）を保存する
  const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);
  // フレンドリストの表示/非表示を管理するstate
  const [showFriendsList, setShowFriendsList] = useState(false);
  // ルーティングモードの際にユーザーがルート情報を取得しているかを管理するstate
  // routeInfoを取得するためのuseEffectを発火するフラグとして必要だった
  const [isRouting, setIsRouting] = useState(false);
  // awsのapiサーバーで実際にユーザーが移動中かどうかを管理するstate
  const [isWalking, setIsWalking] = useState(false);
  // バッテリー残量を管理するstate
  const [batteryLevel, setBatteryLevel] = useState(80);
  // whooに位置情報を反映させる有効期限
  // 初期値はサーバーサイドでdbから取得した値
  // それ以降は実際にdbに反映させる直前に、expiresDateInputの値をexpiresDateに反映させる
  const [expiresDate, setExpiresDate] = useState<Date | null>(_expiresDate);
  // ユーザーが設定で指定しているwhooに位置情報を反映させる有効期限
  const [expiresDateInput, setExpiresDateInput] = useState<Date | null>(_expiresDate);
  // 移動モードの際の目的地の位置情報
  const [end, setEnd] = useState<{ lat: number, lng: number } | null>(null);
  // 設定画面を表示するかどうかを管理するflag
  const [showSetting, setShowSetting] = useState(false);
  // モードの管理
  const [mode, setMode] = useState<"normal" | "routing">("normal");
  // 通常モードの際のピンの位置情報
  const [pinsLatLng, setPinsLatLng] = useState<{ lat: number, lng: number } | null>(null);
  // 実際の自分がwhooに反映している位置情報
  // 初期値はサーバーサイドでdbから取得した値で、もしnullであればブラウザから取得した現在地を反映する（なぜならwhooに反映中でない場合はアプリにログインしており、自分の位置情報をwhooに送っているはずだから）
  // ※もしexpireされていたら、db中のlat,lngはnullになっている。
  const [nowLatLng, setNowLatLng] = useState<{ lat: number, lng: number } | null>(_nowLatLng);
  // いつから現在地にいるかを示す時刻
  // 初期値はサーバーサイドでdbから取得した値
  const [stayedAt, setStayedAt] = useState<Date | null>(_stayedAt);
  // 友達の情報（位置情報、いつから、名前、アイコン画像、id)
  // stayed_atはstringで、yyyy-mm-dd hh:mm:ssの形式である(UTC）
  const [usersInfo, setUsersInfo] = useState<UserInfo[]>(() =>
    users.map((user) => ({
      lat: parseFloat(user.latitude),
      lng: parseFloat(user.longitude),
      stayed_at: user.stayed_at,
      name: user.user.display_name,
      img: user.user.profile_image,
      id: user.user.id,
    }))
  );
  // useEffectを発火させ、mapの中心部を指定した位置に移動させるためのflag
  // idを指定しているのは、どのpopupを表示するかを指定するのに必用だから
  const [flyTarget, setFlyTarget] = useState<number | null>(null);
  // 現在のWs接続を管理するuseRef
  // wsRef.currentを手動で切り替える場合は、必ずwsRef.current.close()を実行してからでないとゾンビコネクションが残る。
  // ※wsRef.current.close()から実行したら、onCloseイベント内で自動でwsRef.current=nullになる。
  const wsRef = useRef<WebSocket | null>(null);
  //useCallbackはuseMemoの関数Ver.useMemoは指定した関数が返す値を保持するが、useCallbackは関数そのものを保持する。
  //クロージャは関数定義時に初めて決定するものである。
  //useCallbackの依存配列に値を指定しないと、関数は初回マウント時のクロージャに縛られてしまい、再レンダリング後の最新のuseStateの値を参照できなくなる。これは「古いクロージャ (Stale Closure)」と呼ばれる典型的な問題。
  //なので、コールバック内で使用する変数（state)をuseCallbackの依存配列に指定し、その変数が変更されたら、新しいクロージャを生成するようにする。
  //setState関数への参照はレンダリングごとに変わらないので、明示的に指定しなくてもよい。
  //※引数の無名関数自体はレンダリングごとに定義されるので、useCallbackの使用はエコシステムのためではない
  //※使用目的は、関数をuseEffectやuseMemoの依存配列に渡す際に関数への参照が頻繁に変更され、その変更を検知して不要なuseEffectの発火を防ぐため。
  //今回のケースでは無名関数内でwsのイベントハンドラを定義している。ws接続は初回マウント時に原則一度だけ行うので、イベントハンドラは初回マウント時のクロージャに縛られる。
  //そのため、今回のケースでは無名関数内でstateを参照するのは不適切=>依存配列にstateを指定して、関数が更新されても、すでにイベントハンドラ自体は定義され、登録されており、更新が無意味になる。
  const connectWs = useCallback(() => {
    try {
      // new WebSocket()が実行されると、接続処理がイベントループにキューされる。
      // サーバーにUPGRADEリクエストが飛ぶ前からws自体は生成される（ws.readyStateはCONNECTING）。
      const ws = new WebSocket(`${process.env.NEXT_PUBLIC_WS_SERVER}/?${new URLSearchParams({ token })}`);

      if (wsRef.current) {
        // もし既に接続している場合は、以前のwsに対してws.close()を実行する→oncloseイベントが発火する→以前の接続が正常に閉じられる。
        // ※onCLOSEイベントでは、if (wsRef.current = ws) wsRef.current=nullにする処理もあるが、wsRef.current = ws;の処理のほうが早いため実行されない。
        // ※接続が僅差で2回実行された場合、１回目のwsがCONNECTINGになりUPGRADEリクエストを飛ばす前に、.close()が呼ばれるため、サーバーにはリクエストが飛ばず、クライアント側ではws接続即時終了という表示になる
        wsRef.current.close();
      }
      wsRef.current = ws;
      ws.onopen = () => {
        console.log('WebSocket接続が確立しました');
      };

      ws.onmessage = (event: MessageEvent<string>) => {
        try {
          // event.dataはstring型であり、サーバーが送った文字列が格納される。
          const msg = event.data;
          if (msg === "ping") {
            // サーバーからpingが送られてきたら、pongを送り返す。
            wsRef.current?.send("pong");
            return;
          }
          // もしevent.dataが"ping"でなければ、JSON形式なのでparseする。
          const data = JSON.parse(msg) as walkingResponse;
          switch (data.type) {
            case "walking":
              //, {type: "walking", data: boolean}
              //. ec2のapiサーバーで移動中であれば、true、そうでなければfalseが返ってくるので、それをクライアントのstateに反映させる。
              data.data ? setIsWalking(true) : setIsWalking(false);
              break;
            case "location":
              //, {type: "location", data: {id: number, lat: number, lng: number}}
              //. id=0の場合は自分の位置情報、それ以外はフレンドの位置情報を反映させる。
              if (data.data.id === 0) {
                setNowLatLng({ lat: data.data.lat, lng: data.data.lng });
              } else {
                // フレンドの位置情報を反映させる。
                // フレンド情報のオブジェクトのリストを.mapで回し、idが一致したオブジェクトの位置情報だけを更新する。
                // ※mapは新しい配列を返すので、位置情報更新はuser.lat=data.data.lat; user.lng=data.data.lng; return user;としてもよいが、一行で済ますためにオブジェクト展開で新しいオブジェクトを作成してリストの要素にしている。
                // ※setStateでprevコールバックを使用しなかった場合、onmessageが定義されたクロージャ=実行されるconnectWs関数が定義された時点でのレンダリング時のuserInfoがクロージャとして参照され続けてしまう。
                // 上記を言い換えるとws接続時点のuserInfoが、接続完了後、何度connectWs関数が更新され、何度userInfoが更新されても、参照され続けてしまう。
                setUsersInfo((prevUsersInfo: UserInfo[]) => prevUsersInfo.map(user => user.id === data.data.id ? { ...user, lat: data.data.lat, lng: data.data.lng } : user));
              }
              break;
            // ec2の30秒ごとの更新処理ではexpiresDateが過去の場合はdb上のlat,lngをnullにする処理が行われている->その場合通知してもらい、UI上の反映状況を更新する。
            case "expired":
              // サーバーからexpiredが送られてきたら、whooに位置情報を反映していることを示すフラグをfalseにする。
              alert("反映期限が切れました。");
              // isReflectingをfalseにすると、useEffectでブラウザの位置情報を取得してnowLatLngに設定する。+ stayedAtもnullにする。 + リアル現在地へ飛ぶ
              setIsReflecting(false);
              break;
            case "success":
            case "error":
              if (data.finish) {
                // finishがtrueの場合は、移動が終了したということ.
                // その場合は、stayeAtを現在時刻に、isWalkingをfalse, setEndを初期化し、Flytargetを自分の位置へ（finishが送られるのは自分の移動のみなのでidは0のみ）
                // ※stayed_atはec2側でnew Date()で反映し、保存しているが、フロントエンドの表示も変えないといけないので、new Date()で更新（厳密にはdbに保存している時間とstateの値はずれているが、誤差）
                setStayedAt(new Date());
                setIsWalking(false);
                setEnd(null);
                setFlyTarget(0);
              }
              console.log(data.detail);
              break;
            case "stopped":
              console.log(data.detail);
          }
        } catch (error) {
          console.error(error);
        }
      };
      // oncloseイベントは、相手の正常＋異常終了、自分の正常＋異常終了の場合に発火する。
      ws.onclose = () => {
        // ws接続を閉じるとwsオブジェクトのreadyStateはCLOSEDになリ、ws.send()やws.close()はエラーになる。
        // そのためwsの参照を削除してガーベジコレクションで開放する必要がある。
        console.log('WebSocket接続が閉じました');
        if (wsRef.current === ws) {
          //, もし、wsRef.currentがwsと一致していなかったら無関係なws接続への参照が消えてしまう（ゾンビコネクション）
          //. そのため、wsRef.current === ws の条件は必須。
          wsRef.current = null;
        }
      };
      // onerrorイベントは、自分と相手の異常終了の場合に発火し、続けてoncloseイベントが発火する。
      ws.onerror = (error) => {
        console.log('WebSocketエラー:', error);
      };
    }
    // このcatchブロックはnew WebSocket()の実行時にエラーが発生した場合に実行される。
    catch (error) {
      console.error(error);
    }
  }, []);

  // モードが変更されたら、とりあえずモード内で変化するstateをすべて初期化する。
  // モード変更ボタンのhandlerでこの処理をするのが理想だが、同じ処理を複数記述する必要があり、コードの可読性が低下ためuseEffect内で書いた。
  useEffect(() => {
    setPinsLatLng(null);
    setEnd(null);
    setIsRouting(false);
    // useEffect(clbk, [isRouting])の戻り値のcallbackが実行され、setRouteInfo(null)が実行されるので、下の行は厳密には不要だが、明示的に記載。
    setRouteInfo(null);
  }, [mode]);

  useEffect(() => {
    if (!isReflecting) {
      // もし初マウント時にnowLatLngがnullつまり、isReflectingの初期値がfalseだったらブラウザの位置情報を取得してnowLatLngに設定する。
      // 初マウント時以外ではisReflectingがtrue->falseの場合なので、stayedAtもnullにする。（expiresDateはnullにしても無期限という意味だし、そもそもIsReflectingがfalseの場合はexpiresDateの値はレンダリングに影響を与えない。） 
      // そういう意味ではstayedAtもisReflectingがfalseの場合にはレンダリングに影響を与えないが、、、、
      navigator.geolocation.getCurrentPosition((position) => {
        setNowLatLng({ lat: position.coords.latitude, lng: position.coords.longitude });
        setStayedAt(null);
        setFlyTarget(0);
      }, (error) => {
        setNowLatLng({ lat: 35.681236, lng: 139.767125 });
        setStayedAt(null);
        setFlyTarget(0);
      });
    }
  }, [isReflecting]);

  return (
    <MapContext.Provider value={{ token, pinsLatLng, setPinsLatLng, nowLatLng, setNowLatLng, usersInfo, setUsersInfo, flyTarget, setFlyTarget, mode, setMode, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, profileImage, batteryLevel, setBatteryLevel, showSetting, setShowSetting, showFriendsList, setShowFriendsList, isReflecting, setIsReflecting, isWalking, setIsWalking, expiresDate, setExpiresDate, expiresDateInput, setExpiresDateInput, wsRef, stayedAt, setStayedAt, connectWs }}>
      <div className="md:w-3/5 md:mx-auto w-full h-10/10 relative">
        <MapComponent />
        <ReflectNotification />
        <>
          <Modes />
          <FriendsPositionButton />
          <MyPositionButton />
        </>

        <>
          <StopReflectButton />
          <GetRouting />
          <StopButton />
          <SettingButton />
        </>
        <>
          <Setting />
          <FriendsList />
        </>
      </div>
    </MapContext.Provider>
  )
}
