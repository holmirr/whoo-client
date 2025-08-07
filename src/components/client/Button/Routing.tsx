"use client";

import { useContext, useState } from "react";
import { MapContext } from "../DynamicMap";

// モードを移動モードにするボタン
// もし始点が設定されていなければ、押せないかつカーソルを合わせるとポップアップが表示される。
export default function RoutingButton() {
  const { mode, setMode, isReflecting } = useContext(MapContext);
  // ポップアップメッセージ自体を管理(nullとstringを使い分けることでshowPopUpを使用しなくても表示非表示まで管理できる)
  const [popupMsg, setPopupMsg] = useState<string | null>(null);

  // クリックイベントハンドラー
  const handleClick = () => {
    // onMouseEnterでポップアップを管理したいので, disabled={!isReflecting}にできない。（onMouseEnterまで無効化されてしまうので）
    // -> クリックイベントハンドラーで!isReflectingの場合は、ボタンクリックを無効化する。
    if (isReflecting) {
      setMode("routing");
    } else {
      return;
    }
  }

  // スマホの場合はタッチしてonMouseEnterが発火してもonMouseLeaveが発火しないのでポップアップが表示され続ける
  // -> そのため、ボタンを再度タッチしたらポップアップを閉じる処理を追加する。
  // ※スマホの場合、タップすると1.touchStart 2.touchend 3.mousedown 4.mouseup 5.click の順にイベントが発火する。
  const handleTouchStart = () => {
    if (!isReflecting) {
      setPopupMsg(prev => prev ? null : "移動開始は位置情報を反映してからです。");
    }
  }
  // ルーティングモードボタンは押せるか押せないか（ポップアップ表示）の二択
  // 条件はisReflecting
  return (
    // 親の<Modes.tsx>がflexcontainerでこのコンポーネントを囲っているので、このコンポーネントの最上位要素はflex-itemになる。
    // このdivはflex-itemなのでshrink-to-fit.-> 子要素がbuttonとdivだが、divはabsoluteなので、影響を受ける子要素はbuttonのみ。
    // このdivのwidthはbuttonのwidthと等しい。
    <div className="relative">
      <button
        className={`text-black px-4 py-2 rounded-md ${mode === "routing" ? "bg-blue-500 text-white" : isReflecting ? "bg-white" : "bg-gray-500 cursor-not-allowed"}`}
        onClick={handleClick}
        onMouseEnter={isReflecting ? undefined : () => setPopupMsg("移動開始は位置情報を反映してからです。")}
        onMouseLeave={() => setPopupMsg(null)}
        onTouchStart={handleTouchStart}
      >
        ルーティング
      </button>
      //, absoluteな要素は強制的にshrink-to-fitになる。
      // topとleftを指定し、左上の開始位置は決定したが、対応するbottomとrightを指定していないため、大きさは決定されていない。
      // 1. topとleftで開始位置決定
      // 2. shrink-to-fitで内部のテキストに合わせて大きさ(width, height)決定
      // 3. ただし、親要素のwidthは超えない。→ 親要素のwidthはshrink-to-fitでボタンの大きさとなっている。
      //    この要素は開始点（left-1/2）から親要素のwidthを超えない大きさだけ横方向に広がる。つまりこの要素のwidth = 親要素のwidthの1/2
      // 4. -translate-x-1/2で中心を親要素の中心に合わせる。
      // 上記が通常のフローだ。しかし、これではテキストが長い場合、何度も折り返されheight方向に伸びて行ってしまう。
      // そこで、absoluteなdivに強制的にwidthを設定する。
      // width: max-contentを指定することで、テキストの長さに合わせてwidthが決定される。
      //. これで、shrink-to-fitの子要素に合わせて柔軟に広がることができる長所と、width指定による親要素のwidthを超えないという制限に縛られないという長所両方を得ることができる。
      {popupMsg && <div className="absolute top-full left-1/2 w-max -translate-x-1/2 mt-2 bg-white p-2 text-black text-sm rounded-md z-[1000]">{popupMsg}</div>}
    </div>
  )
}
