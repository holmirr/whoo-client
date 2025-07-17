"use client";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import { useRef, useContext, useEffect, useMemo } from "react";
import { MapContext } from "../DynamicMap";
import { MapContextType } from "@/libs/types";
import L from "leaflet";
import "leaflet-routing-machine";
import { calcStayTime } from "@/libs/utils";
import { getFriendsLatLng } from "@/action";

const endIcon = L.icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
});

export default function MapEvents() {
  const { pinsLatLng, setPinsLatLng, usersInfo, flyTarget, setFlyTarget, mode, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, nowLatLng, setNowLatLng, profileImage, setUsersInfo } = useContext<MapContextType>(MapContext);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const iconSize = 48;

  const myIcon = useMemo(() => L.icon({
    iconUrl: profileImage,
    iconSize: [iconSize, iconSize],
    iconAnchor: [iconSize / 2, iconSize / 2],
    popupAnchor: [0, -iconSize],
  }), [profileImage, iconSize]);

  const userMarkers = useMemo(() => usersInfo.map((user) => (
    <Marker
      key={user.name}
      position={{ lat: user.lat, lng: user.lng }}
      ref={(el: L.Marker) => {
        markersRef.current[user.id] = el;
      }}
      eventHandlers={{
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
          setFlyTarget({ id: user.id, lat: user.lat, lng: user.lng });
        }
      }}
      icon={L.icon({
        iconUrl: user.img,
        iconSize: [iconSize, iconSize],
        iconAnchor: [iconSize / 2, iconSize / 2],
        popupAnchor: [0, -iconSize],
        className: "rounded-icon",
      })}
    >
      <Popup>
        {user.name}
        <br />
        {calcStayTime(user.stayed_at)}
      </Popup>
    </Marker>
  )), [usersInfo]);

  const map = useMapEvents({
    click: (e) => {
      if (mode === "normal") {
        const position = e.latlng;
        setPinsLatLng({ lat: position.lat, lng: position.lng });
      }
      else if (mode === "routing") {
        if (end === null) {
          setEnd({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
        else {
          setEnd(null);
          setIsRouting(false);
        }
      }
    },
  });

  useEffect(() => {
    if (flyTarget) {
      map.flyTo({ lat: flyTarget.lat, lng: flyTarget.lng }, 16);

      const marker = markersRef.current[flyTarget.id];
      if (marker) {
        marker.openPopup();
        marker.setZIndexOffset(1000);
      } else {
        console.log("marker not found");
      }
      return () => {
        if (marker) {
          marker.setZIndexOffset(0);
        }
      }
    }
  }, [flyTarget]);


  useEffect(() => {
    if (isRouting && nowLatLng && end) {
      const routingControl = L.Routing.control({
        waypoints: [L.latLng(nowLatLng.lat, nowLatLng.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: true,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1'
        }),
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false,
        collapsible: true,
        autoRoute: true,
        plan: new L.Routing.Plan([L.latLng(nowLatLng.lat, nowLatLng.lng), L.latLng(end.lat, end.lng)], {
          createMarker: (i, wp) => false,
        }),
      });
      map.addControl(routingControl);
      routingControl.on("routesfound", (e) => {
        const route = e.routes[0];
        const latLngs = route.coordinates;
        const distance = route.summary.totalDistance;
        const defaultTime = Math.floor(route.summary.totalTime);
        setRouteInfo({ latlngs: latLngs.map((latLng: L.LatLng) => ({ lat: latLng.lat, lng: latLng.lng })), distance, defaultTime });
      });
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
              setFlyTarget({ lat: nowLatLng.lat, lng: nowLatLng.lng, id: 0 })
            }
          }}
          icon={myIcon}
        >
          <Popup>
            現在地
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
