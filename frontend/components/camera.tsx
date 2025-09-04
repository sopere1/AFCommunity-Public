import { useState, useRef } from "react";
import { Upload, Camera as CameraIcon } from "lucide-react";
import Select from "react-select";
import { getUserContext } from "@/auth/context";
import { Camera } from "@/static/types";
import { RETRIEVAL_ERROR } from "@/errors";

export default function CameraSite({ camera }: { camera: Camera | undefined }) {
    if (!camera) return RETRIEVAL_ERROR;

    const { user } = getUserContext();
    const fileInput = useRef<HTMLInputElement>(null);

    // predefined status options
    const statusTypeOptions = [
        { value: "set", label: "Set" },
        { value: "pull", label: "Pull" },
        { value: "other", label: "Other" },
    ];

    const detailedStatusOptions = [
        { value: "", label: "Select status" },
        { value: "Camera Retrieved. Awaiting Image Processing.", label: "Camera Retrieved. Awaiting Image Processing." },
        { value: "Camera Lost or Stolen.", label: "Camera Lost or Stolen." },
        { value: "Image Processing Complete. Awaiting Species Identification", label: "Image Processing Complete. Awaiting Species Identification" },
        { value: "Complete", label: "Complete" },
    ];

    const parseInitialStatus = () => {
        const s = camera.status || "";
        if (s.startsWith("set")) {
            const match = s.match(/set,(\d+)/);
            return { type: "set", days: match ? parseInt(match[1], 10) : 0, text: "" };
        }
        if (s.startsWith("pull")) {
            const match = s.match(/pull,(\d+)/);
            return { type: "pull", days: match ? parseInt(match[1], 10) : 0, text: "" };
        }
        const predefined = [
            "Camera Retrieved. Awaiting Image Processing.",
            "Camera Lost or Stolen.",
            "Image Processing Complete. Awaiting Species Identification.",
            "Complete.",
        ];
        if (predefined.includes(s)) {
            return { type: "other", days: 0, text: s };
        }
        return { type: "set", days: 0, text: "" };
    };

    const initialStatus = parseInitialStatus();
    const [statusType, setStatusType] = useState<string>(initialStatus.type);
    const [daysAhead, setDaysAhead] = useState<number>(initialStatus.days);
    const [statusText, setStatusText] = useState<string>(initialStatus.text);

    function openFile() {
        fileInput.current?.click();
    }

    async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const formData = new FormData();
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }

        try {
            const response = await fetch("http://localhost:5010/upload-photo", {
                headers: {
                    Authorization: `Bearer ${user?.idToken}`,
                },
                method: "POST",
                body: formData,
            });
            const result = await response.json();
            console.log(result.message);
        } catch {
            console.error("An unexpected error occurred while uploading the photo(s).");
        }
    }

    async function handleStatusChange(newStatusType: string, newDays?: number, newText?: string) {
        if (!camera) return RETRIEVAL_ERROR;
        let statusToSend = "";

        if (newStatusType === "set") {
            statusToSend = `set,${newDays ?? 0}`;
        } else if (newStatusType === "pull") {
            statusToSend = `pull,${newDays ?? 0}`;
        } else if (newStatusType === "other") {
            statusToSend = newText ?? "";
        }

        try {
            const response = await fetch(`http://localhost:5010/update-camera-status/${camera.camera_id}-${camera.date}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${user?.idToken}`,
                },
                body: JSON.stringify({ status: statusToSend }),
            });
            if (!response.ok) {
                console.error("Failed to update status");
            } else {
                console.log("Status updated:", statusToSend);
            }
        } catch (err) {
            console.error("Error updating status:", err);
        }
    }

    // handlers for react-select changes
    function onStatusTypeChange(selected: { value: string } | null) {
        const val = selected?.value ?? "";
        setStatusType(val);
        if (val !== "pull" && val !== "set") setDaysAhead(0);
        if (val !== "other") setStatusText("");
        handleStatusChange(val, val === "pull" || val === "set" ? daysAhead : 0, val === "other" ? statusText : "");
    }

    function onDaysChange(e: React.ChangeEvent<HTMLInputElement>) {
        const val = Number(e.target.value);
        setDaysAhead(val);
        handleStatusChange(statusType, val, "");
    }

    function onStatusTextChange(selected: { value: string } | null) {
        const val = selected?.value ?? "";
        setStatusText(val);
        handleStatusChange("other", 0, val);
    }

    const { site, owner, date, status, ...metadata } = camera;

    // adjust date to PST
    const dt = new Date(date);
    const formattedDate = dt.toLocaleDateString("en-CA", {
        timeZone: "America/Los_Angeles",
    });
    const formattedTime = dt.toLocaleTimeString("en-US", {
        timeZone: "America/Los_Angeles",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
        timeZoneName: "short",
    });

    return (
        <div className="flex flex-col p-6 space-y-6 bg-white rounded-xl shadow-[0_0_15px_rgba(103,127,145,0.25)] w-full border border-[#677f91]">
            <h1 className="flex items-center text-4xl font-bold text-[#677f91] gap-2">
                <CameraIcon className="w-8 h-8" />
                {site}
            </h1>

            <div className="flex flex-wrap items-center gap-8">
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Owner</h3>
                    <p className="text-base text-gray-800">{owner}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Date</h3>
                    <p className="text-base text-gray-800">{formattedDate}</p>
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Time</h3>
                    <p className="text-base text-gray-800">{formattedTime}</p>
                </div>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
                <div>
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-1">Status</h3>
                    <div className="flex items-center gap-2 min-w-[280px] max-w-full flex-wrap">
                        <div className="flex-1 min-w-[120px]">
                            <Select
                                options={statusTypeOptions}
                                value={statusTypeOptions.find(opt => opt.value === statusType) || null}
                                onChange={onStatusTypeChange}
                                placeholder="Select status"
                                isSearchable={false}
                                aria-label="Select status type"
                                styles={{
                                    control: (base) => ({
                                        ...base,
                                        borderColor: "#677f91",
                                        boxShadow: "none",
                                        "&:hover": { borderColor: "#677f91" },
                                    }),
                                }}
                            />
                        </div>

                        {(statusType === "pull" || statusType === "set") && (
                            <>
                                <span>in</span>
                                <input
                                    type="number"
                                    min={0}
                                    value={daysAhead}
                                    onChange={onDaysChange}
                                    className="w-20 border rounded px-2 py-1"
                                    aria-label="Number of days ahead"
                                />
                                <span>Days</span>
                            </>
                        )}

                        {statusType === "other" && (
                            <div className="flex-1 min-w-[220px]">
                                <Select
                                    options={detailedStatusOptions}
                                    value={detailedStatusOptions.find(opt => opt.value === statusText) || null}
                                    onChange={onStatusTextChange}
                                    placeholder="Select detailed status"
                                    aria-label="Select detailed status"
                                    styles={{
                                        control: (base) => ({
                                            ...base,
                                            borderColor: "#677f91",
                                            boxShadow: "none",
                                            "&:hover": { borderColor: "#677f91" },
                                        }),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <section>
                <h2 className="text-lg font-semibold text-[#677f91] border-b border-gray-200 pb-2 mb-4">Metadata</h2>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {Object.entries(metadata).map(([key, value]) => (
                        <div key={key}>
                            <dt className="text-sm font-semibold text-gray-600 capitalize">{key}</dt>
                            <dd className="text-gray-800">{value}</dd>
                        </div>
                    ))}
                </dl>
            </section>

            <div className="mt-4">
                <button
                    type="button"
                    onClick={openFile}
                    className="flex justify-center items-center gap-2 w-full px-4 py-3 bg-[#677f91] text-white rounded hover:opacity-90 transition"
                >
                    <Upload className="w-4 h-4" />
                    Upload Photos
                </button>
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    ref={fileInput}
                    onChange={handleFileChange}
                    className="hidden"
                />
            </div>
        </div>
    );
}
