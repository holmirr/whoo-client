"use client";
import { useState, useContext, useEffect } from "react";
import { MapContext } from "../DynamicMap";

export default function StartDate() {
    const { routeInfo, setRouteInfo, startDate, setStartDate } = useContext(MapContext);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (new Date(e.target.value) < new Date()) {
            alert("出発日は現在の日付以降にしてください");
            return;
        }
        setStartDate(e.target.value);
        if (routeInfo) {
            setRouteInfo({ ...routeInfo, startDate: e.target.value });
        }
    }

    return (
        <div className="flex gap-4">
            <label htmlFor="startDate" className="text-gray-400">出発日</label>
            <input type="datetime-local" value={startDate} onChange={handleChange}/>
        </div>
    )
}
