'use client';

import { useState, useEffect } from "react";
import { getUserContext } from "@/auth/context";
import RequireAuth from "@/auth/redirect";
import NavigationBar from "@/components/navbar";
import SidebarMenu from "@/components/sidebar";
import type { User, Community } from "@/static/types";

function MyCommunities({
    communities,
    setCommunities,
    setSidebarMode,
}: {
    communities: Community[];
    setCommunities: React.Dispatch<React.SetStateAction<Community[]>>
    setSidebarMode: (mode: string) => void;
}) {

    const { user } = getUserContext();
    const [code, setCode] = useState("");

    async function submitJoin() {
        try {
            const formData = new FormData();
            formData.append("uid", user!.uid);

            const response = await fetch(`http://localhost:5010/join-community/${code}`, {
                headers: {
                    Authorization: `Bearer ${user?.idToken}`,
                },
                method: "POST",
                body: formData
            });

            if (!response.ok) throw new Error(`Server responded with ${response.status}`);
            const result = await response.json();
            if (!result.success) throw new Error(`Server responded with ${result.status}`);
            if (result.community) setCommunities(prev => [...prev, result.community])
        } catch (error) {
            console.error("An unexpected server error occurred while adding the marker.", error);
        }
    }

    return (
        <div className="flex flex-col items-center space-y-10 p-6 min-h-full w-full">
            <h1 className="text-5xl font-extrabold text-[#d66221] drop-shadow-sm">
                My Communities
            </h1>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 w-full max-w-5xl">
                {communities.map((community) => (
                    <div
                        key={community.code}
                        className="bg-cover bg-center rounded-lg shadow-md cursor-pointer h-40 flex items-end p-4 text-white text-xl font-bold transition-transform hover:scale-[1.03]"
                        style={{
                            backgroundImage: `url(${community.imageUrl || "/default-community.jpg"})`,
                            backgroundColor: '#677f91',
                        }}
                        onClick={() => setSidebarMode(`Community-${community.code}`)}
                    >
                        {community.name}
                    </div>
                ))}
            </div>

            <div className="w-full max-w-lg bg-white rounded-lg p-6 shadow-md space-y-4 border border-gray-200">
                <div className="flex flex-row gap-2 w-full">
                    <input
                        type="text"
                        placeholder="Enter join code"
                        value={code}
                        onChange={(e) => (setCode(e.target.value))}
                        className="border border-gray-300 p-2 rounded flex-1 h-10"
                    />
                    <button onClick={submitJoin} className="bg-[#ffbd3b] hover:bg-[#f9a500] text-white font-semibold px-4 py-2 rounded h-10 whitespace-nowrap">
                        Join a Community
                    </button>
                </div>

                <button
                    onClick={() => setSidebarMode("Create Community")}
                    className="bg-[#d66221] hover:bg-[#c04f15] text-white font-semibold w-full py-2 rounded transition-all"
                >
                    + Create a Community
                </button>
            </div>
        </div>
    );
}

function CommunityContainer({ user }: { user: User }) {
    const [sidebarMode, setSidebarMode] = useState<string | null>(null);
    const [communities, setCommunities] = useState<Community[]>([]);

    useEffect(() => {
        const getCommunities = async () => {
            const formData = new FormData();
            formData.append("uid", user!.uid);

            const response = await fetch("http://localhost:5010/get-communities", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user?.idToken}`,
                },
                body: formData
            });
            const data = await response.json();
            if (data.communities) setCommunities(data.communities);
        };

        getCommunities();
    }, [user]);

    return (
        <div className="relative flex flex-1 bg-gradient-to-b from-[#fffaf2] to-[#ffe7cc]">
            <div className="absolute h-full z-50">
                <SidebarMenu mode={sidebarMode} setSidebarMode={setSidebarMode} communities={communities} setCommunities={setCommunities} />
            </div>

            <div className="flex-1 overflow-y-auto">
                <MyCommunities
                    communities={communities}
                    setSidebarMode={setSidebarMode}
                    setCommunities={setCommunities}
                />
            </div>
        </div>
    );
}

export default function CommunityPage() {
    const { user } = getUserContext();

    return (
        <RequireAuth>
            <div className="flex flex-col h-screen">
                <NavigationBar />
                <CommunityContainer user={user} />
            </div>
        </RequireAuth>
    );
}
