"use client"
import { GoBook } from "react-icons/go";

export default function LibroProfilo(){
    return(
        <>
        <div className="ml-40 mt-5">
            <h1 className="text-5xl font-bold">I TUOI LIBRI</h1>
            <div className="border border-[#8B0000] w-1/4 rounded-lg flex gap-3">
                <GoBook className="size-40 text-[#8B0000] ml-2"/>
                <div className="flex flex-col justify-center">
                    <p>TITOLO:</p>
                    {/* TO DO!!! QUESTO CODICE É UTILE PER LA PARTE DELLA PRENOTAZIONE, NON DA BUTTARE SUBITO */}
                    {/* <p>DATA PRESTITO: <input type="date"/></p>
                    <p>DATA RESTITUZIONE: <input type="date"/></p> */}
                    <p>DATA PRESTITO: nnnn</p>
                    <p>DATA PRENOTAZIONE: nnnnn</p>
                </div>
            </div>
        </div>
        </>
    )
}