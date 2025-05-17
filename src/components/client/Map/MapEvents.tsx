"use client";
import { useMapEvents, Marker, Popup } from "react-leaflet";
import { useRef, useContext, useEffect, useState } from "react";
import { MapContext } from "../DynamicMap";
import { MapContextType } from "@/libs/types";
import L from "leaflet";
import "leaflet-routing-machine";

const calcStayTime = (stayed_at: string) => {

  const now = new Date();
  const stayedAt = new Date(stayed_at + " +0000");
  const diff = now.getTime() - stayedAt.getTime();

  if (diff < 1 * 60 * 60 * 1000) {
    return Math.floor(diff / (1000 * 60)) + "分";
  }
  else if (diff > 24 * 60 * 60 * 1000) {
    return Math.floor(diff / (1000 * 60 * 60 * 24)) + "日";
  }
  else {
    return Math.floor(diff / (1000 * 60 * 60)) + "時間" + Math.floor(diff % (1000 * 60 * 60) / (1000 * 60)) + "分";
  }
}

export default function MapEvents() {
  const { pinsLatLng, setPinsLatLng, usersInfo, flyTarget, setFlyTarget, mode, start, setStart, end, setEnd, isRouting, setIsRouting, routeInfo, setRouteInfo, nowLatLng, setNowLatLng, profileImage } = useContext<MapContextType>(MapContext);
  const markersRef = useRef<Record<number, L.Marker>>({});
  const iconSize = 48;

  const map = useMapEvents({
    click: (e) => {
      if (mode === "normal") {
        setStart(null);
        setEnd(null);
        setIsRouting(false);
        const position = e.latlng;
        setPinsLatLng({ lat: position.lat, lng: position.lng });
      }
      else if (mode === "routing") {
        setPinsLatLng(null);
        if (start === null) {
          setStart({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
        else if (end === null) {
          setEnd({ lat: e.latlng.lat, lng: e.latlng.lng });
        }
        else {
          setStart(null);
          setEnd(null);
          setIsRouting(false);
        }
      }
    },
  });

  useEffect(() => {
    if (flyTarget) {
      map.flyTo({ lat: flyTarget.lat, lng: flyTarget.lng });
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
    if (isRouting && start && end) {
      const routingControl = L.Routing.control({
        waypoints: [L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)],
        routeWhileDragging: true,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://routing.openstreetmap.de/routed-car/route/v1'
        }),
        showAlternatives: false,
        fitSelectedRoutes: true,
        show: false,
        collapsible: true,
        autoRoute: true,
        plan: new L.Routing.Plan([L.latLng(start.lat, start.lng), L.latLng(end.lat, end.lng)], {
          createMarker: (i, wp) => false,
        }),
      });
      map.addControl(routingControl);
      routingControl.on("routesfound", (e) => {
        const route = e.routes[0];
        const latLngs = route.coordinates;
        const distance = route.summary.totalDistance;
        const time = route.summary.totalTime;
        setRouteInfo({ latlngs: latLngs.map((latLng: L.LatLng) => ({ lat: latLng.lat, lng: latLng.lng })), distance: distance, time: time });
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
          icon={L.icon({
            iconUrl: profileImage,
            iconSize: [iconSize, iconSize],
            iconAnchor: [iconSize / 2, iconSize / 2],
            popupAnchor: [0, -iconSize],
          })}
        >
          <Popup>
            現在地
          </Popup>
        </Marker>
      )}
      {usersInfo.map((user) => (
        <Marker
          key={user.name}
          position={{ lat: user.lat, lng: user.lng }}
          ref={(el: L.Marker) => {
            markersRef.current[user.id] = el;
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
      ))}
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
      {start && (
        <Marker position={start} icon={L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })}>
          <Popup>
            出発地
          </Popup>
        </Marker>
      )}
      {end && (
        <Marker position={end} icon={L.icon({
          iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
          iconSize: [25, 41],
          iconAnchor: [12, 41],
          popupAnchor: [1, -34]
        })}>
          <Popup>
            目的地
          </Popup>
        </Marker>
      )}
    </>
  )
}
