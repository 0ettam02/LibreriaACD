"use client"
import { GoBook, GoTrash } from "react-icons/go";

export default function LibroProfilo({ titolo, dataP, dataFP, onDelete }) {
    return (
        <div className="border border-[#8B0000] w-80 lg:w-96 rounded-lg flex gap-3">
            <GoBook className="size-40 text-[#8B0000] ml-2" />
            <div className="flex flex-col justify-center">
                <p>TITOLO: {titolo}</p>
                <p>DATA PRESTITO: {dataP}</p>
                <p>DATA FINE PRESTITO: {dataFP}</p>
                <button onClick={onDelete} className="text-red-500">
                     Restituisci
                </button>
            </div>
        </div>
    );
}