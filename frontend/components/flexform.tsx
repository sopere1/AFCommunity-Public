import { useState } from "react";
import DatePicker from "react-datepicker";
import Select from 'react-select';
import "react-datepicker/dist/react-datepicker.css";
import { Camera as CameraIcon, Bird, MapIcon, Users } from "lucide-react";
import { getUserContext } from "@/auth/context";
import { hexToRgba } from "@/static/utility"
import type { FieldProps, Camera, Sighting, GeoArea, Community } from "@/static/types";

function buildFormData<T>(state: Record<string, any>): [FormData, T] {
    const formData = new FormData();
    const partial: Partial<T> = {};

    for (const key of Object.keys(state)) {
        formData.append(key, state[key]);
        // handle issue where formData cannot properly encode area objects
        if (key === 'geom' && typeof state[key] === 'string') {
            partial[key as keyof T] = JSON.parse(state[key]);
        } else {
            partial[key as keyof T] = state[key];
        }
    }

    return [formData, partial as T];
}

export default function FlexibleForm({
    fields,
    mode,
    onSubmit,
}: {
    fields: FieldProps[];
    mode: string;
    onSubmit: (marker: any) => void;
}) {
    const { user } = getUserContext();
    const [formState, setFormState] = useState<Record<string, any>>({});
    const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);

    // helper function to fetch and update location suggestions from MapBox
    function updateLocationSuggestions(value: string) {
        const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
        const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(value)}.json?access_token=${token}&autocomplete=true&limit=3`;

        fetch(url)
            .then((res) => res.json())
            .then((data) => {
                const options = data.features;
                setLocationSuggestions(options);
            })
            .catch(console.error);
    }

    function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
        const target = e.target;
        const name = target.name;

        if (target instanceof HTMLInputElement && target.type === "file") {
            if (target.files && target.files.length > 0) {
                const file = target.files[0];

                if (file.type === "application/json" || file.name.endsWith(".json") || file.name.endsWith(".geojson")) {
                    file.text().then((text) => {
                        try {
                            const geojsonObject = JSON.parse(text);
                            setFormState(prev => ({ ...prev, [name]: JSON.stringify(geojsonObject) }));
                        } catch (err) {
                            console.error("Invalid GeoJSON file: ", err);
                        }
                    });
                } else if (file.type.startsWith("image/")) {
                    setFormState(prev => ({ ...prev, [name]: file }));
                } else {
                    console.warn("Unsupported file type");
                }
            }
        } else {
            setFormState(prev => ({ ...prev, [name]: target.value }));

            if (name === "location" && target.value.length >= 3) {
                updateLocationSuggestions(target.value);
            } else if (name === "location") {
                setLocationSuggestions([]);
            }
        }
    }

    function handleSuggestion(feature: any) {
        setFormState((prev) => ({
            ...prev,
            location: feature.place_name,
            crds: JSON.stringify({ lat: feature.center[1], lon: feature.center[0] }),
        }));
        setLocationSuggestions([]);
    }

    async function handleSubmit(e: React.FormEvent) {
        if (!user) return;
        e.preventDefault();

        let marker: Camera | Sighting | GeoArea | Community;
        let endpoint: string;
        let formData: FormData;

        if (mode === "Camera Trap") {
            [formData, marker] = buildFormData<Camera>(formState);
            endpoint = "http://localhost:5010/add-camera";
        } else if (mode === "Wildlife Sighting") {
            [formData, marker] = buildFormData<Sighting>(formState);
            endpoint = "http://localhost:5010/add-sighting";
        } else if (mode === "Geographic Area") {
            [formData, marker] = buildFormData<GeoArea>(formState);
            endpoint = "http://localhost:5010/add-area";
        } else if (mode === "Create Community") {
            [formData, marker] = buildFormData<Community>(formState);
            endpoint = "http://localhost:5010/add-community";
        } else {
            return;
        }
        formData.append('uid', user.uid)

        try {
            const response = await fetch(endpoint, {
                headers: {
                    Authorization: `Bearer ${user?.idToken}`,
                },
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(`Server responded with ${result.message}`);
            if (mode === "Create Community" && result.community) {
                (marker as Community).code = result.community.code;
                (marker as Community).imageUrl = result.community.imageUrl;
            }
            onSubmit(marker);
        } catch (error) {
            console.error("An unexpected server error occurred while adding the marker.", error);
        }
    }

    let color = "#677f91";
    let icon = <CameraIcon color={color} className="w-4 h-4" />;

    if (mode === "Wildlife Sighting") {
        color = "#7f8953";
        icon = <Bird color={color} className="w-4 h-4" />;
    } else if (mode === "Geographic Area") {
        color = "#c39616";
        icon = <MapIcon color={color} className="w-4 h-4" />;
    } else if (mode === "Create Community") {
        color = "#c2753d";
        icon = <Users color={color} className="w-4 h-4" />;
    }

    const shadow = `shadow-[0_0_15px_${hexToRgba(color)}]`;
    const inputClass = `px-2 py-1 rounded border focus:outline-none focus:ring-2`;
    const fileInputClass = `cursor-pointer border border-dashed rounded py-2 px-3 text-center text-sm text-gray-700 hover:bg-[${color}10] hover:border-[${color}] focus:outline-none focus:ring-2 focus:ring-[${color}]`;

    return (
        <form
            onSubmit={handleSubmit}
            className={`flex flex-col space-y-4 bg-white rounded-xl p-6 shadow-md ${shadow}`}
        >
            {fields.map((field) => (
                <div key={field.name} className="flex flex-col">
                    <label htmlFor={field.name} className="mb-1 font-semibold flex items-center gap-1" style={{ color }}>
                        {icon}
                        {field.label}
                    </label>

                    {field.type === "text" && (
                        <input
                            id={field.name}
                            name={field.name}
                            type="text"
                            value={formState[field.name] || ""}
                            onChange={handleChange}
                            required={field.required}
                            className={inputClass}
                            style={{ borderColor: color, outlineColor: color }}
                        />
                    )}

                    {field.type === "file" && (
                        <input
                            id={field.name}
                            name={field.name}
                            type="file"
                            onChange={handleChange}
                            className={fileInputClass}
                            style={{ borderColor: color, outlineColor: color }}
                        />
                    )}

                    {field.type === "datetime" && (
                        <div className="w-full">
                            <DatePicker
                                selected={formState[field.name] ? new Date(formState[field.name]) : null}
                                onChange={(date: Date | null) =>
                                    setFormState((prev) => ({ ...prev, [field.name]: date?.toISOString() ?? "" }))
                                }
                                showTimeSelect
                                timeIntervals={1}
                                timeCaption="Time"
                                dateFormat="yyyy-MM-dd h:mm aa"
                                placeholderText="Select date and time"
                                required={field.required}
                                className={inputClass + " w-full"}
                                wrapperClassName="w-full"
                            />
                        </div>
                    )}

                    {field.type === "autocomplete" && (
                        <div className="relative">
                            <input
                                id={field.name}
                                name={field.name}
                                type="text"
                                value={formState[field.name] || ""}
                                onChange={handleChange}
                                autoComplete="off"
                                required={field.required}
                                className={`${inputClass} w-full`}
                                style={{
                                    borderColor: color,
                                    outlineColor: color,
                                    boxShadow: `0 0 0 2px ${hexToRgba(color, 0.3)}`,
                                }}
                            />
                            {locationSuggestions.length > 0 && (
                                <ul className="absolute z-10 bg-white border rounded shadow mt-1 max-h-40 overflow-y-auto w-full">
                                    {locationSuggestions.map((suggestion, idx) => (
                                        <li
                                            key={idx}
                                            className="px-2 py-1 hover:bg-gray-100 cursor-pointer"
                                            onClick={() => handleSuggestion(suggestion)}
                                        >
                                            {suggestion.place_name}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}

                    {field.type === "dropdown" && field.options && (
                        <Select
                            options={field.options.map((option) => ({ value: option, label: option }))}
                            value={
                                formState[field.name]
                                    ? { value: formState[field.name], label: formState[field.name] }
                                    : null
                            }
                            onChange={(selected) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    [field.name]: selected?.value ?? "",
                                }))
                            }
                            styles={{
                                control: (base, state) => ({
                                    ...base,
                                    backgroundColor: "white",
                                    borderColor: color,
                                    boxShadow: state.isFocused ? `0 0 0 2px ${hexToRgba(color, 0.25)}` : "none",
                                    "&:hover": { borderColor: color },
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
                    )}

                    {field.type === "next-action" && (
                        <div className="flex flex-wrap items-center gap-2 w-full">
                            <div className="min-w-[120px] flex-1">
                                <Select
                                    options={[
                                        { value: "set", label: "Set" },
                                        { value: "pull", label: "Pull" },
                                    ]}
                                    value={
                                        formState["next"]
                                            ? {
                                                value: formState["next"],
                                                label: formState["next"].charAt(0).toUpperCase() + formState["next"].slice(1),
                                            }
                                            : null
                                    }
                                    onChange={(selected) =>
                                        setFormState((prev) => ({
                                            ...prev,
                                            next: selected?.value ?? "",
                                        }))
                                    }
                                    styles={{
                                        control: (base, state) => ({
                                            ...base,
                                            backgroundColor: "white",
                                            borderColor: color,
                                            boxShadow: state.isFocused ? `0 0 0 2px ${hexToRgba(color, 0.25)}` : "none",
                                            "&:hover": { borderColor: color },
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
                                    placeholder="Select action"
                                    isSearchable={false}
                                    menuPortalTarget={typeof window !== "undefined" ? document.body : null}
                                    className="w-full"
                                />
                            </div>

                            <span className="font-semibold" style={{ color }}>
                                in
                            </span>

                            <input
                                type="number"
                                min={0}
                                className={`${inputClass} w-20`}
                                value={formState["daysAhead"] ?? ""}
                                onChange={(e) =>
                                    setFormState((prev) => ({
                                        ...prev,
                                        daysAhead: Number(e.target.value),
                                    }))
                                }
                                required={field.required}
                                style={{ borderColor: color, outlineColor: color }}
                            />

                            <span className="font-semibold" style={{ color }}>
                                Days
                            </span>
                        </div>
                    )}

                    {formState[field.name] === "Other" && (
                        <input
                            type="text"
                            placeholder="Please specify"
                            value={formState[`${field.name}_other`] || ""}
                            onChange={(e) =>
                                setFormState((prev) => ({
                                    ...prev,
                                    [`${field.name}_other`]: e.target.value,
                                }))
                            }
                            className={`${inputClass} mt-2`}
                            style={{
                                borderColor: color,
                                outlineColor: color,
                                boxShadow: `0 0 0 2px ${hexToRgba(color, 0.3)}`,
                            }}
                        />
                    )}
                </div>
            ))}
            <button
                type="submit"
                className="mt-4 px-4 py-2 text-white rounded hover:opacity-90"
                style={{ backgroundColor: color }}
            >
                Submit
            </button>
        </form>
    );
}
