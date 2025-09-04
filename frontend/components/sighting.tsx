import React from "react";
import { PawPrint, Camera } from "lucide-react";
import { Sighting } from "@/static/types";

export default function WildlifeSighting({
    sighting,
}: {
    sighting: Sighting | undefined;
}) {
    console.log(sighting)
    if (!sighting) return null;

    const dt = new Date(sighting.date);
    const formattedDate = dt.toLocaleString("en-US", {
        timeZone: "America/Los_Angeles",
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-[#7f8953]">
            <h1 className="flex items-center text-4xl font-bold text-[#7f8953] gap-2">
                <PawPrint className="w-8 h-8 text-[#7f8953]" />
                {sighting.title}
            </h1>

            <p className="text-lg text-gray-700">
                <span className="font-semibold">Posted by:</span> {sighting.owner} |{" "}
                <span className="font-semibold">Observed by:</span> {sighting.observer}
                <br /> on {formattedDate}
            </p>

            <div className="space-y-2 text-center">
                <div className="inline-flex items-center gap-2 text-[#7f8953] font-medium">
                    <Camera className="w-5 h-5" />
                    <span>Observation Image</span>
                </div>
                <img
                    src={sighting.url}
                    alt={`Photo of ${sighting.species}`}
                    className="w-full max-w-md mx-auto max-h-96 object-cover rounded-lg shadow-md border border-[#7f8953]/30"
                />
            </div>

            <div className="text-xl text-gray-800 leading-relaxed space-y-2">
                <p>
                    At {sighting.crds}, {parseInt(sighting.number)}{" "}
                    {sighting.species.toLowerCase()}{" "}
                    {parseInt(sighting.number) === 1 ? "was" : "were"} spotted.
                </p>
                <p className="text-gray-600">
                    {sighting.owner} reported that{" "}
                    {sighting.observer === "Me" ? "they" : sighting.observer.toLowerCase()}{" "}
                    {sighting.type.toLowerCase()}
                </p>
            </div>

            <div className="pt-4 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-[#7f8953] mb-2">Comments</h2>
                <p className="text-gray-800">{sighting.comments}</p>
            </div>
        </div>
    )
};
