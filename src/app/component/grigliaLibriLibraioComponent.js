"use client";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function GrigliaLibriLibraio() {
  const [righe, setRighe] = useState([]);
  const [titolo, setTitolo] = useState("");
  const [autore, setAutore] = useState("");
  const [genere, setGenere] = useState("");
  const [copieTotali, setCopieTotali] = useState("");
  const [copieDisponibili, setCopieDisponibili] = useState("");

  useEffect(() => {
    const fetchLibri = async () => {
      try {
        const response = await fetch('http://localhost:8083', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.status === "success") {
          setRighe(data.libri);
        } else {
          console.error('Errore nel caricamento dei libri:', data.message);
        }
      } catch (error) {
        console.error('Errore nella richiesta dei libri:', error);
      }
    };

    fetchLibri();
  }, []);

  const aggiungiRiga = async () => {
    if (titolo && autore && genere && copieTotali && copieDisponibili) {
      const libro = { 
        titolo, 
        autore, 
        genere, 
        numLibri: parseInt(copieTotali), 
        prenotati: parseInt(copieDisponibili)
      };

      try {
        const response = await fetch('http://localhost:8082', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(libro),
          mode: 'cors'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.status === "success") {
          const nuovoLibro = {
            titolo,
            autore,
            genere,
            copieTotali: parseInt(copieTotali),
            copieDisponibili: parseInt(copieDisponibili)
          };
          setRighe([...righe, nuovoLibro]);
          setTitolo("");
          setAutore("");
          setGenere("");
          setCopieTotali("");
          setCopieDisponibili("");
        } else {
          alert(data.message);
        }
      } catch (error) {

      }
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
            placeholder="N° Copie Totali"
            value={copieTotali}
            onChange={(e) => setCopieTotali(e.target.value)}
            className="border border-black p-2 mr-2"
          />
          <input
            type="number"
            placeholder="N° Copie Disponibili"
            value={copieDisponibili}
            onChange={(e) => setCopieDisponibili(e.target.value)}
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
                <th className="border border-black p-2">N° Copie Totali</th>
                <th className="border border-black p-2">N° Copie Disponibili</th>
              </tr>
            </thead>
            <tbody>
            
              {righe.map((riga, index) => (
                <tr key={index} className={index % 2 === 0 ? "odd:bg-gray-300" : "even:bg-white"}>
                  <td className="border border-black p-2"><Link href="/grigiaStatistichePrenotazioniPage">{riga.titolo}</Link></td>
                  <td className="border border-black p-2">{riga.autore}</td>
                  <td className="border border-black p-2">{riga.genere}</td>
                  <td className="border border-black p-2">{riga.copieTotali}</td>
                  <td className="border border-black p-2">{riga.copieDisponibili}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}