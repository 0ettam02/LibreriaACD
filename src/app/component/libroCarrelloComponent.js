"use client";
import { GoBook, GoTrash } from "react-icons/go";
import { useState } from "react";
import { useSearchParams } from "next/navigation";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Link from "next/link";

export default function LibroCarrelloComponent() {
    const [numero, setNumero] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);
    
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

    const isCheckoutDisabled = !startDate || !endDate || numero === 0;

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

                {/* Sezione per selezionare le date */}
                <div className="flex flex-col gap-4 items-center lg:items-start">
                    <div className="flex flex-col">
                        <label className="text-gray-600 font-semibold">Data Inizio</label>
                        <DatePicker
                            selected={startDate}
                            onChange={(date) => setStartDate(date)}
                            minDate={new Date()}
                            dateFormat="dd/MM/yyyy"
                            className="border p-2 rounded"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label className="text-gray-600 font-semibold">Data Fine</label>
                        <DatePicker
                            selected={endDate}
                            onChange={(date) => setEndDate(date)}
                            minDate={startDate || new Date()}
                            dateFormat="dd/MM/yyyy"
                            className="border p-2 rounded"
                        />
                    </div>
                </div>

                {/* Tasto Checkout */}
                <Link
                    href={{
                        pathname: "/checkoutPage",
                        query: {
                            titolo: titolo,
                            copie: numero,
                            startDate: startDate ? startDate.toISOString().split("T")[0] : "",
                            endDate: endDate ? endDate.toISOString().split("T")[0] : "",
                        },
                    }}
                >
                    <button
                        className={`mt-4 px-4 py-2 rounded text-white font-bold transition ${
                            isCheckoutDisabled
                                ? "bg-gray-400 cursor-not-allowed"
                                : "bg-red-500 hover:bg-red-700"
                        }`}
                        disabled={isCheckoutDisabled}
                    >
                        Checkout
                    </button>
                </Link>
            </div>
        </div>
    );
}