"use client"
import { GoBook } from "react-icons/go";

export default function LibroProfilo({ titolo, dataP, dataFP }){
    return(
        <>
            <div className="border border-[#8B0000] w-80 lg:w-96 rounded-lg flex gap-3">
                <GoBook className="size-40 text-[#8B0000] ml-2"/>
                <div className="flex flex-col justify-center">
                    <p>TITOLO:{titolo}</p>
                    {/* TO DO!!! QUESTO CODICE É UTILE PER LA PARTE DELLA PRENOTAZIONE, NON DA BUTTARE SUBITO */}
                    {/* <p>DATA PRESTITO: <input type="date"/></p>
                    <p>DATA RESTITUZIONE: <input type="date"/></p> */}
                    <p>DATA PRESTITO: {dataP}</p>
                    <p>DATA FINE PRESTITO: {dataFP}</p>
                </div>
            </div>
        </>
    )
}