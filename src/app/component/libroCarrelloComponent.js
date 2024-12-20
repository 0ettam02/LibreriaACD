"use client";
import { GoBook } from "react-icons/go";
import { GoTrash } from "react-icons/go";
import { useState } from "react";


export default function libroCarrelloComponent() {
    let [numero, setNumero] = useState(0);

    function handleButtonClickPlus(){
        setNumero(numero + 1);
    }

    function handleButtonClickMinus() {
        if (numero == 0) {
            setNumero(0);
        } else {
            setNumero(numero - 1);
        }
    }


    return (
        <>
            <div className="border rounded-lg border-[#8B0000] bg-white-700 w-96 mt-5">
                <div className="flex flex-row gap-3">
                    <input type="checkbox" className="ml-2" />
                    <GoBook className="size-40 text-[#8B0000]" />
                        <div className="flex flex-col items-center justify-center gap-3">
                            <p className="text-black text-sm">TITOLO:</p>
                            <p className="text-black text-sm">N° COPIE SELEZIONATE:</p>
                            <div className="border rounded-lg border-black flex flex-row gap-5 justify-center items-center ">
                                <button onClick={handleButtonClickMinus}>
                                    <GoTrash className="size-7" />
                                </button>
                                <p>{numero}</p>
                                <button onClick={handleButtonClickPlus}>+</button>
                            </div>
                        </div>         
                </div>
            </div>
        </>
    )
}