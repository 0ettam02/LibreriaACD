"use client";
import { useEffect, useState } from "react";
import { IoSearch } from "react-icons/io5";
import { IoPersonCircleOutline } from "react-icons/io5";
import { IoNotificationsOutline } from "react-icons/io5"; 
import Link from "next/link";

export default function Header({ searchText, setSearchText }) { 
    const [isLibraio, setIsLibraio] = useState(false);
    const [hasNotifications, setHasNotifications] = useState(false);
    const [notifiche, setNotifiche] = useState([]);
    const [showNotifiche, setShowNotifiche] = useState(false);

    useEffect(() => {
        const email = localStorage.getItem("userEmail");
        const userId = localStorage.getItem("userId");
        
        if (email && email.includes("@libraio")) {
            setIsLibraio(true);
        }

        // Controlla le notifiche
        const checkNotifiche = async () => {
            try {
                const response = await fetch(`http://localhost:8089/check-notifiche?userId=${userId}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                });

                const data = await response.json();
                setHasNotifications(data.hasNotifications);
                if (data.notifiche) {
                    setNotifiche(data.notifiche);
                }
            } catch (error) {
                console.error('Errore nel controllo delle notifiche:', error);
            }
        };

        if (userId) {
            checkNotifiche();
            // Controlla le notifiche ogni minuto
            const interval = setInterval(checkNotifiche, 60000);
            return () => clearInterval(interval);
        }
    }, []);

    const handleSearchChange = (event) => {
        setSearchText(event.target.value); 
    };

    const toggleNotifiche = () => {
        setShowNotifiche(!showNotifiche);
    };

    return (
        <div className="text-white flex justify-between items-center bg-[#8B0000] p-3 relative">
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
            <div className="flex items-center gap-4">
                <div className="relative">
                    <button onClick={toggleNotifiche}>
                        <IoNotificationsOutline 
                            className={`w-7 h-7 lg:w-10 lg:h-10 ${hasNotifications ? 'text-red-500' : 'text-white'}`} 
                        />
                    </button>
                    {showNotifiche && notifiche.length > 0 && (
                        <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-xl z-50">
                            <div className="p-4">
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">Notifiche</h3>
                                <div className="space-y-2">
                                    {notifiche.map((notifica, index) => (
                                        <div key={index} className="text-sm text-gray-600 p-2 border-b">
                                            {notifica.messaggio}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <Link href={isLibraio ? "/profiloLibraioPage" : "/profiloPersonalePage"}>
                    <IoPersonCircleOutline className="w-7 h-7 lg:w-10 lg:h-10 lg:mr-3" />
                </Link>
            </div>
        </div>
    );
}
