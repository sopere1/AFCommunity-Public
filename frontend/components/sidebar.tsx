import Select from "react-select";
import { MapPin, X } from "lucide-react";
import FlexibleForm from "@/components/flexform";
import CameraSite from "@/components/camera"
import WildlifeSighting from "@/components/sighting";
import GeographicArea from "@/components/area";
import CommunityInfo from "@/components/community";
import type { FieldProps, Camera, Sighting, GeoArea, Community } from "@/static/types";
import { ADD_TRAP_FIELDS, ADD_SIGHT_FIELDS, ADD_AREA_FIELDS, ADD_COMMUNITY_FIELDS } from "@/static/fields";
import { hexToRgba } from "@/static/utility";

function MenuSelection({
    mode,
    setSidebarMode
}: {
    mode: string,
    setSidebarMode: React.Dispatch<React.SetStateAction<string | null>>
}) {
    const color = "#5d514e";
    const options = [
        { value: "Camera Trap", label: "Camera Trap" },
        { value: "Wildlife Sighting", label: "Wildlife Sighting" },
        { value: "Geographic Area", label: "Geographic Area" },
    ];

    const selectedOption = options.find((opt) => opt.value === mode) || null;

    return (
        <form className="flex flex-col mb-4">
            <label
                htmlFor="menu"
                className="mb-1 font-semibold flex items-center gap-1"
                style={{ color }}
            >
                <MapPin color={color} className="w-4 h-4" />
                Select a Feature to Add
            </label>
            <Select
                inputId="menu"
                options={options}
                value={selectedOption}
                onChange={(selected) =>
                    setSidebarMode(selected ? selected.value : null)
                }
                styles={{
                    control: (base, state) => ({
                        ...base,
                        backgroundColor: "white",
                        borderColor: color,
                        boxShadow: state.isFocused
                            ? `0 0 0 2px ${hexToRgba(color, 0.25)}`
                            : "none",
                        "&:hover": { borderColor: color },
                        cursor: "pointer",
                    }),
                    option: (base, state) => ({
                        ...base,
                        backgroundColor: state.isFocused ? "#fef3ec" : "white",
                        color: "#333",
                        cursor: "pointer",
                    }),
                    dropdownIndicator: (base) => ({
                        ...base,
                        color: color,
                    }),
                    singleValue: (base) => ({
                        ...base,
                        color: "#333",
                    }),
                    menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                }}
                placeholder="Select"
                isSearchable={false}
                menuPortalTarget={typeof window !== "undefined" ? document.body : null}
            />
        </form>
    );
}

export default function SidebarMenu({
    mode,
    setSidebarMode,
    cameras,
    setCameras,
    sightings,
    setSightings,
    areas,
    setAreas,
    communities,
    setCommunities
}: {
    mode: string | null,
    setSidebarMode: React.Dispatch<React.SetStateAction<string | null>>,
    cameras?: Camera[],
    setCameras?: React.Dispatch<React.SetStateAction<Camera[]>>,
    sightings?: Sighting[],
    setSightings?: React.Dispatch<React.SetStateAction<Sighting[]>>
    areas?: GeoArea[],
    setAreas?: React.Dispatch<React.SetStateAction<GeoArea[]>>,
    communities?: Community[],
    setCommunities?: React.Dispatch<React.SetStateAction<Community[]>>
}) {
    if (!mode) return null;

    // helper function to render additive menus
    function MarkerMenu({ mode, fields, onSubmit }: { mode: string, fields: FieldProps[], onSubmit: (data: any) => void }) {
        return (
            <>
                <MenuSelection mode={mode} setSidebarMode={setSidebarMode} />
                <FlexibleForm fields={fields} mode={mode} onSubmit={onSubmit} />
            </>
        )
    }

    let content;
    const parts: string[] = mode.split("-");
    const id: string = parts.slice(1).join("-");
    if (mode === "Menu") content = <MenuSelection mode={mode} setSidebarMode={setSidebarMode} />;
    else if (mode === "Camera Trap" && cameras && setCameras) {
        const onSubmit = (camera: Camera | null) => {
            if (!camera) return;
            setSidebarMode("Success-Camera-Trap")
            setCameras(prev => [...prev, camera])
        };
        content = <MarkerMenu mode={mode} fields={ADD_TRAP_FIELDS} onSubmit={onSubmit} />
    }
    else if (mode === "Wildlife Sighting" && sightings && setSightings) {
        const onSubmit = (sighting: Sighting | null) => {
            if (!sighting) return;
            setSidebarMode("Success-Wildlife-Sighting")
            setSightings(prev => [...prev, sighting])
        };
        content = <MarkerMenu mode={mode} fields={ADD_SIGHT_FIELDS} onSubmit={onSubmit} />
    }
    else if (mode === "Geographic Area" && areas && setAreas) {
        const onSubmit = (area: GeoArea | null) => {
            if (!area) return;
            setSidebarMode("Success-Geographic-Area")
            setAreas(prev => [...prev, area])
        };
        content = <MarkerMenu mode={mode} fields={ADD_AREA_FIELDS} onSubmit={onSubmit} />
    } else if (mode === "Create Community" && communities && setCommunities) {
        const onSubmit = (community: Community | null) => {
            if (!community) return;
            setSidebarMode("Success-Community")
            setCommunities(prev => [...prev, community])
        };
        content = <FlexibleForm mode={mode} fields={ADD_COMMUNITY_FIELDS} onSubmit={onSubmit} />
    } else if (mode.startsWith("Success")) {
        const type: string = parts.slice(1).join(" ");
        content = (
            <button onClick={() => setSidebarMode(type)} className="px-4 py-2 bg-green-700 w-full text-white rounded hover:cursor-pointer">
                {type} added. Click here to submit another.
            </button>
        );
    }
    else if (mode === "Filter") { }
    else if (mode.startsWith("Camera") && cameras) content = <CameraSite camera={cameras.find(camera => `${camera.camera_id}-${camera.date}` === id)} />;
    else if (mode.startsWith("Sighting") && sightings) content = <WildlifeSighting sighting={sightings.find(sight => `${sight.observer}-${sight.species}-${sight.date}` === id)} />;
    else if (mode.startsWith("Area") && areas) content = <GeographicArea area={areas.find(area => `${area.name}` === id)} />;
    else if (mode.startsWith("Community") && communities) content = <CommunityInfo community={communities.find(community => `${community.code}` === id)} />;
    else content = <p> A system error has occurred. Please contact the system administrator. </p>;

    return (
        <aside className="block w-120 bg-[#465a41] p-5 h-full overflow-scroll hide-scrollbar">
            <div className="bg-white rounded shadow-md p-6 relative">
                <button
                    onClick={() => setSidebarMode(null)}
                    aria-label="Close sidebar"
                    className="absolute top-2 right-2 p-1 rounded hover:bg-gray-200 text-[#6b705c] hover:text-[#d0d5bf] transition"
                >
                    <X className="w-5 h-5" />
                </button>
                {content}
            </div>
        </aside>
    );
}
