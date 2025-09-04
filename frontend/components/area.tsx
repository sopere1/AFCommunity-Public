import React from "react";
import { MapPin } from "lucide-react";
import { Bar, BarChart, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { GeoArea } from "@/static/types";

export default function GeoAreaSummary({ area }: { area: GeoArea | undefined }) {
    if (!area) return;
    const speciesData = Object.entries(area.speciesDist).map(([name, count]) => ({ name, count }));
    const observerData = Object.entries(area.observerDist).map(([name, count]) => ({ name, count }));
    const hourLabels = [
        "12 AM", "1 AM", "2 AM", "3 AM", "4 AM", "5 AM", "6 AM", "7 AM", "8 AM", "9 AM", "10 AM", "11 AM",
        "12 PM", "1 PM", "2 PM", "3 PM", "4 PM", "5 PM", "6 PM", "7 PM", "8 PM", "9 PM", "10 PM", "11 PM"
    ];
    const hourData = area.hourBins.map((count, i) => ({ hour: hourLabels[i], count }));

    const commonMargin = { top: 5, right: 20, left: -10, bottom: 80 };

    const commonXAxisProps = {
        stroke: "#333",
        fontSize: 12,
        interval: 0,
        angle: -45,
        textAnchor: "end",
    };

    const commonYAxisProps = {
        stroke: "#333",
        tickMargin: 5,
    };

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-[#ffbd3b]">
            <h1 className="flex items-center text-4xl font-bold text-[#ffbd3b] gap-3">
                <MapPin className="w-8 h-8 text-[#ffbd3b]" />
                {area.name}
            </h1>

            <p className="text-lg text-gray-700">{area.description}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center pt-4">
                <div className="bg-[#ffbd3b]/10 p-4 rounded-xl">
                    <p className="text-xl font-bold text-[#ffbd3b]">{area.numCameras}</p>
                    <p className="text-sm text-gray-600">Camera Traps</p>
                </div>
                <div className="bg-[#ffbd3b]/10 p-4 rounded-xl">
                    <p className="text-xl font-bold text-[#ffbd3b]">{area.numSightings}</p>
                    <p className="text-sm text-gray-600">Wildlife Sightings</p>
                </div>
                <div className="bg-[#ffbd3b]/10 p-4 rounded-xl">
                    <p className="text-xl font-bold text-[#ffbd3b]">{area.numSpecies}</p>
                    <p className="text-sm text-gray-600">Recorded Species</p>
                </div>
            </div>

            <div className="flex flex-col gap-8">
                <div>
                    <h2 className="text-lg font-semibold text-[#ffbd3b] mb-2">Species Distribution</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={speciesData} margin={commonMargin}>
                            <XAxis dataKey="name" {...commonXAxisProps} />
                            <YAxis {...commonYAxisProps} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#ffbd3b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div>
                    <h2 className="text-lg font-semibold text-[#ffbd3b] mb-2">Observer Contributions</h2>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={observerData} margin={commonMargin}>
                            <XAxis dataKey="name" {...commonXAxisProps} />
                            <YAxis {...commonYAxisProps} />
                            <Tooltip />
                            <Bar dataKey="count" fill="#ffbd3b" />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div>
                <h2 className="text-lg font-semibold text-[#ffbd3b] mb-2 pt-4">Sightings by Time of Day</h2>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={hourData} margin={commonMargin}>
                        <XAxis
                            dataKey="hour"
                            {...commonXAxisProps}
                            tickFormatter={(label, index) => (index % 3 === 0 ? label : "")}
                        />
                        <YAxis {...commonYAxisProps} />
                        <Tooltip />
                        <Bar dataKey="count" fill="#ffbd3b" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
}
