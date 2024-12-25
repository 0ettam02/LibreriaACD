"use client";
import { useState } from "react";

export default function GrigliaLibriLibraio() {
  const [righe, setRighe] = useState([
    {
      libro: "aaaaaaaa",
      numLibri: "5",
      prenotati: "2",
    },
    {
      libro: "bbbbbb",
      numLibri: "4",
      prenotati: "1",
    },
  ]);

  const [libro, setLibro] = useState("");
  const [numLibri, setNumLibri] = useState("");
  const [prenotati, setPrenotati] = useState("");

  const aggiungiRiga = () => {
    if (libro && numLibri && prenotati) {
      setRighe([...righe, { libro, numLibri, prenotati }]);
      setLibro("");
      setNumLibri("");
      setPrenotati("");
    }
  };

  return (
    <>
      <div className="flex flex-col items-center">
        <div className="mt-5">
          <input
            type="text"
            placeholder="Nome del libro"
            value={libro}
            onChange={(e) => setLibro(e.target.value)}
            className="border border-black p-2 mr-2"
          />
          <input
            type="number"
            placeholder="N° Libri"
            value={numLibri}
            onChange={(e) => setNumLibri(e.target.value)}
            className="border border-black p-2 mr-2"
          />
          <input
            type="number"
            placeholder="N° Libri prenotati"
            value={prenotati}
            onChange={(e) => setPrenotati(e.target.value)}
            className="border border-black p-2 mr-2"
          />
          <button
            onClick={aggiungiRiga}
            className="px-4 py-2 bg-[#8B0000] text-white rounded"
          >
            Aggiungi +
          </button>
        </div>
        <div>
          <table className="text-2xl mt-5">
            <thead>
              <tr>
                <th className="border border-black p-2">Libro</th>
                <th className="border border-black p-2">N° Libri</th>
                <th className="border border-black p-2">N° Libri prenotati</th>
              </tr>
            </thead>
            <tbody>
              {righe.map((riga, index) => (
                <tr
                  key={index}
                  className={
                    index % 2 === 0 ? "odd:bg-gray-300" : "even:bg-white"
                  }
                >
                  <td className="border border-black p-2">{riga.libro}</td>
                  <td className="border border-black p-2">{riga.numLibri}</td>
                  <td className="border border-black p-2">{riga.prenotati}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
