"use client";
import { GoBook } from "react-icons/go";

export default function LibroHomepage({ titolo, copie }) {

  return (
    <>
      <div
        className="flex flex-col items-center justify-center w-80 h-70 border-2 border-red-500 rounded-lg bg-white shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-300"
      >

        <div className="flex items-center space-x-2 bg-white-700 text-red-700 p-2 rounded">
          <GoBook className="text-8xl" />
        </div>

        <div className="p-4 grid grid-cols-2 gap-4 items-center justify-center text-sm font-bold text-gray-700">
          <div>
            TITOLO: <br />
            <span className="text-black">{titolo}</span>
          </div>
          <div className="text-right">
            n° copie: <br />
            <span className="text-black">{copie}</span>
          </div>
        </div>


      </div>

    </>
  );
}
