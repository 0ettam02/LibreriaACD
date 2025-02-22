"use client";
import { GoBook } from "react-icons/go";
import { GoTrash } from "react-icons/go";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function LibroCarrelloComponent() {
    const [numero, setNumero] = useState(0);
    const searchParams = useSearchParams();
    const titolo = searchParams.get("titolo");
    const copieDisponibili = searchParams.get("copie");

    function handleButtonClickPlus() {
        if (numero < parseInt(copieDisponibili)) {
            setNumero(numero + 1);
        }
    }

    function handleButtonClickMinus() {
        if (numero > 0) {
            setNumero(numero - 1);
        }
    }

    return (
        <div className="flex flex-col lg:flex-row justify-center items-center lg:items-start gap-8 lg:gap-20 mt-10 px-4 lg:px-0">
            <div className="flex flex-col items-center">
                <GoBook className="text-[#8B0000] w-48 h-48 md:w-72 md:h-72 lg:w-96 lg:h-96" />
                <div className="mt-5 border rounded-lg border-black flex flex-row gap-5 justify-center items-center p-2 w-full max-w-[200px]">
                    <button onClick={handleButtonClickMinus}>
                        <GoTrash className="w-5 h-5 lg:w-7 lg:h-7" />
                    </button>
                    <p className="text-lg lg:text-xl">{numero}</p>
                    <button onClick={handleButtonClickPlus} className="text-lg lg:text-xl">+</button>
                </div>
            </div>
            
            <div className="flex flex-col gap-6 lg:gap-10 mt-0 lg:mt-10 text-center lg:text-left">
                <div>
                    <h2 className="text-gray-500 text-xl lg:text-2xl">TITOLO:</h2>
                    <p className="text-2xl lg:text-3xl font-bold">{titolo}</p>
                </div>
                <div>
                    <h2 className="text-gray-500 text-xl lg:text-2xl">COPIE DISPONIBILI:</h2>
                    <p className="text-2xl lg:text-3xl font-bold">{copieDisponibili}</p>
                </div>
            </div>
        </div>
    );
}