"use client";
import { useState } from "react";

export default function GrigliaLibriLibraio() {
  const [righe, setRighe] = useState([
    {
      titolo: "aaaaaaaa",
      autore: "Autore 1",
      genere: "Genere 1",
      numLibri: "5",
      prenotati: "2",
    },
    {
      titolo: "bbbbbb",
      autore: "Autore 2",
      genere: "Genere 2",
      numLibri: "4",
      prenotati: "1",
    },
  ]);

  const [titolo, setTitolo] = useState("");
  const [autore, setAutore] = useState("");
  const [genere, setGenere] = useState("");
  const [numLibri, setNumLibri] = useState("");
  const [prenotati, setPrenotati] = useState("");

  const aggiungiRiga = () => {
    if (titolo && autore && genere && numLibri && prenotati) {
      setRighe([...righe, { titolo, autore, genere, numLibri, prenotati }]);
      setTitolo("");
      setAutore("");
      setGenere("");
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
            placeholder="Titolo del libro"
            value={titolo}
            onChange={(e) => setTitolo(e.target.value)}
            className="border border-black p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Autore"
            value={autore}
            onChange={(e) => setAutore(e.target.value)}
            className="border border-black p-2 mr-2"
          />
          <input
            type="text"
            placeholder="Genere"
            value={genere}
            onChange={(e) => setGenere(e.target.value)}
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
                <th className="border border-black p-2">Titolo</th>
                <th className="border border-black p-2">Autore</th>
                <th className="border border-black p-2">Genere</th>
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
                  <td className="border border-black p-2">{riga.titolo}</td>
                  <td className="border border-black p-2">{riga.autore}</td>
                  <td className="border border-black p-2">{riga.genere}</td>
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