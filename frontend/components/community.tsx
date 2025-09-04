import React, { useEffect, useState } from "react";
import { Users, Search } from "lucide-react";
import type { Community } from "@/static/types";

type Member = {
    name: string;
    email?: string;
};

export default function CommunityInfo({ community }: { community: Community | undefined }) {
    if (!community) return;

    const [members, setMembers] = useState<Member[]>([]);
    const [filtered, setFiltered] = useState<Member[]>([]);
    const [search, setSearch] = useState("");

    useEffect(() => {
        async function fetchMembers() {
            try {
                const res = await fetch(`http://localhost:5010/get-members/${community!.code}`);
                const data = await res.json();
                setMembers(data.members || []);
                setFiltered(data.members || []);
            } catch (err) {
                console.error("Failed to fetch members: ", err);
            }
        }
        fetchMembers();
    }, [community.code]);

    useEffect(() => {
        const lower = search.toLowerCase();
        setFiltered(members.filter(m => m.name.toLowerCase().includes(lower)));
    }, [search, members]);

    return (
        <div className="bg-white rounded-xl shadow-lg p-6 space-y-6 border border-[#c2753d] w-full">
            <div>
                <h1 className="flex items-center text-4xl font-bold text-[#c2753d] gap-3">
                    <Users className="w-8 h-8 text-[#c2753d]" />
                    {community.name}
                </h1>
                <p className="mt-2 inline-block bg-[#c2753d]/10 text-[#c2753d] text-sm font-mono px-3 py-1 rounded-full border border-[#c2753d]/40">
                    Join Code: <span className="font-semibold">{community.code}</span>
                </p>
            </div>

            <p className="text-lg text-gray-700">{community.description}</p>

            <div className="flex items-center gap-3 border border-[#c2753d] rounded px-3 py-2 max-w-md">
                <Search className="w-4 h-4 text-[#c2753d]" />
                <input
                    type="text"
                    placeholder="Search members..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="flex-1 outline-none"
                />
            </div>

            <div className="flex flex-wrap gap-4 pt-4">
                {filtered.map((member, idx) => (
                    <div
                        key={idx}
                        className="bg-[#c2753d]/10 border border-[#c2753d]/30 rounded-xl p-4 min-w-[200px] max-w-full break-words"
                    >
                        <p className="text-lg font-medium text-[#c2753d]">{member.name}</p>
                        {member.email && (
                            <p className="text-sm text-gray-600 break-all">{member.email}</p>
                        )}
                    </div>
                ))}
                {filtered.length === 0 && (
                    <p className="text-gray-500">No members found.</p>
                )}
            </div>
        </div>
    );
}
