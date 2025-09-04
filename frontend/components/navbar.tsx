import Link from 'next/link';

function MobileMenu() {
    return (
        <div className="sm:hidden ml-4">
            <button className="text-green-700 focus:outline-none">
                ☰
            </button>
        </div>
    );
}

export default function NavigationBar() {
    const navStyle = "text-[#e7e4dc] hover:text-gray-900 font-bold"
    return (
        <nav className="sticky top-0 flex items-center justify-between p-4 bg-[#53694d]">
            {/* logo */}
            <img src="/placeholder_logo.png" className="h-12 w-auto" />

            {/* navigation links */}
            <div className="hidden sm:flex flex-grow space-x-10 ml-10">
                <a href="#" className={navStyle}>
                    AFCommunity
                </a>
                <Link href="/communities" className={navStyle}>
                    My Communities
                </Link>
                <Link href="/" className={navStyle}>
                    Explore Data
                </Link>
                <a href="#" className={navStyle}>
                    View Feed
                </a>
            </div>

            {/* profile */}
            <div className="bg-white rounded-full overflow-hidden h-10 w-10 flex-shrink-0">
                <img src="/placeholder_logo.png" className="h-full w-full object-cover" alt="Profile" />
            </div>
            <MobileMenu />
        </nav>
    );
}
