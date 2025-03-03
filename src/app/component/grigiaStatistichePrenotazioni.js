"use client";
import { useState, useEffect } from "react";

export default function GrigliaStatistichePrenotazioni() {
  const [righe, setRighe] = useState([]);

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

  

  return (
    <>
    
      <div className="flex flex-col items-center ">
        <div>
          <table className="text-2xl mt-5">
            <thead>
              <tr>
                <th className="border border-black p-2">Utente</th>
                <th className="border border-black p-2">Inizio Prestito</th>
                <th className="border border-black p-2">Fine Prestito</th>
              </tr>
            </thead>
            <tbody>
            
              {righe.map((riga, index) => (
                <tr key={index} className={index % 2 === 0 ? "odd:bg-gray-300" : "even:bg-white"}>
                  <td className="border border-black p-2">{riga.titolo}</td>
                  <td className="border border-black p-2">{riga.autore}</td>
                  <td className="border border-black p-2">{riga.genere}</td>
                </tr>
              ))}
            </tbody>

          </table>
        </div>
      </div>
    </>
  );
}