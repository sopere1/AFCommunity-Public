'use client';

import { useState, useEffect } from "react";
import { Plus, FilterIcon } from "lucide-react";
import { getUserContext } from "@/auth/context";
import NavigationBar from "@/components/navbar";
import SidebarMenu from "@/components/sidebar";
import { MapComponent } from "@/components/MapComponent/index";
import type { User, Camera, Sighting, GeoArea } from "@/static/types";
import RequireAuth from "@/auth/redirect";

function MapContainer({ user }: { user: User }) {
    const [sidebarMode, setSidebarMode] = useState<string | null>(null);
    const [cameras, setCameras] = useState<Camera[]>([]);
    const [sightings, setSightings] = useState<Sighting[]>([]);
    const [areas, setAreas] = useState<GeoArea[]>([])

    // retrieve existing marker information from the database
    useEffect(() => {
        const getMarkers = async () => {
            const response = await fetch("http://localhost:5010/get-markers", {
                headers: {
                    Authorization: `Bearer ${user?.idToken}`,
                },
            });
            const data = await response.json();
            if (data.cameras) setCameras(data.cameras);
            if (data.sightings) setSightings(data.sightings);
            if (data.areas) setAreas(data.areas);
        };
        getMarkers();
    }, []);

    return (
        <div className="relative flex flex-1">
            <div className="absolute h-full z-[9999]">
                <SidebarMenu
                    mode={sidebarMode}
                    cameras={cameras}
                    sightings={sightings}
                    areas={areas}
                    setSidebarMode={setSidebarMode}
                    setCameras={setCameras}
                    setSightings={setSightings}
                    setAreas={setAreas}
                />
            </div>
            <div className="flex-1">
                <MapComponent cameras={cameras} sightings={sightings} geoAreas={areas} setSidebarMode={setSidebarMode} />
                {sidebarMode === null && (
                    <div className="absolute bottom-4 left-4 flex space-x-2 z-[9999]">
                        <button onClick={() => setSidebarMode("Menu")} className="w-11 h-11 bg-blue-50 rounded-full">
                            <Plus className="w-7 h-7 mx-auto my-auto" />
                        </button>
                        <button onClick={() => setSidebarMode("Filter")} className="w-11 h-11 bg-blue-50 rounded-full">
                            <FilterIcon className="w-7 h-7 mx-auto my-auto" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function MapPage() {
    const { user } = getUserContext();

    return (
        <RequireAuth>
            <div className="flex flex-col h-screen">
                <NavigationBar />
                <MapContainer user={user} />
            </div>
        </RequireAuth>
    );
}
