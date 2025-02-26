"use client";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import Link from "next/link";

export default function Header({ searchText, setSearchText }) { 
    const [isLibraio, setIsLibraio] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        if (email && email.includes("@libraio")) {
            setIsLibraio(true);
        }
    }, []);

    const handleSearchChange = (event) => {
        setSearchText(event.target.value); 
    };

    return (
        <div className="text-white flex justify-between items-center bg-[#8B0000] p-3">
            <Link href="/homePage" className="text-sm lg:text-2xl ml-3">LibreriaACD</Link>
            <div className="relative">
                <input
                    type="text"
                    value={searchText} 
                    onChange={handleSearchChange} 
                    className="text-black p-2 border border-black border-2 rounded w-[10em] lg:w-[22em] pl-10"
                    placeholder="Harry Potter e la pietra filosofale"
                />
                <IoSearch className="absolute top-1/2 left-3 transform -translate-y-1/2 text-gray-500" />
            </div>
            <Link href={isLibraio ? "/profiloLibraioPage" : "/profiloPersonalePage"}>
                <IoPersonCircleOutline className="w-7 h-7 lg:w-10 lg:h-10 lg:mr-3" />
            </Link>
        </div>
    );
}
