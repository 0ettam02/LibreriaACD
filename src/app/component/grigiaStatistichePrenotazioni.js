"use client";
import { useState, useEffect } from "react";

export default function GrigliaStatistichePrenotazioni() {
  const [righe, setRighe] = useState([]);

  useEffect(() => {
    const fetchPrenotazioni = async () => {
      try {
        const response = await fetch('http://localhost:8086', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Dati ricevuti:', data); // Debug

        if (Array.isArray(data)) {
          setRighe(data); // Imposta i dati ricevuti
        } else {
          console.error('Formato dati non valido:', data);
        }
      } catch (error) {
        console.error('Errore nella richiesta delle prenotazioni:', error);
      }
    };

    fetchPrenotazioni();
  }, []);

  return (
    <>
      <div className="flex flex-col items-center">
        <div>
          <table className="text-2xl mt-5">
            <thead>
              <tr>
                <th className="border border-black p-2">ID Utente</th>
                <th className="border border-black p-2">Data Prestito</th>
                <th className="border border-black p-2">Data Scadenza</th>
                <th className="border border-black p-2">ID Libro</th>
              </tr>
            </thead>
            <tbody>
              {righe.map((riga, index) => (
                <tr key={index} className={index % 2 === 0 ? "odd:bg-gray-300" : "even:bg-white"}>
                  <td className="border border-black p-2">{riga.id_utente}</td>
                  <td className="border border-black p-2">{riga.data_prestito}</td>
                  <td className="border border-black p-2">{riga.data_scadenza}</td>
                  <td className="border border-black p-2">{riga.id_libro}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
