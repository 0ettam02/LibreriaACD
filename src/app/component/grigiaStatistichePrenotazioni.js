"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function GrigliaStatistichePrenotazioni() {
  const [righe, setRighe] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [messaggio, setMessaggio] = useState("");
  const searchParams = useSearchParams();
  const titolo = searchParams.get("titolo");

  useEffect(() => {
    const fetchPrenotazioni = async () => {
      if (titolo) {
        try {
          const response = await fetch(`http://localhost:8086/statistiche?titolo=${encodeURIComponent(titolo)}`, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
            },
          });

          if (!response.ok) {
            throw new Error(`Errore HTTP: ${response.status} - ${response.statusText}`);
          }

          const data = await response.json();
          if (Array.isArray(data)) {
            setRighe(data);
          } else {
            console.error('Formato dati non valido:', data);
          }
        } catch (error) {
          console.error('Errore nella richiesta delle prenotazioni:', error);
        }
      }
    };

    fetchPrenotazioni();
  }, [titolo]);

  const handleSendNotification = async () => {
    if (!messaggio) {
      alert("Il messaggio non può essere vuoto.");
      return;
    }

    const response = await fetch(`http://localhost:8088/notifiche`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id_utente: selectedUserId, messaggio }),
    });

    const data = await response.json();
    alert(data.message);
    setShowModal(false);
    setMessaggio("");
  };

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
                <th className="border border-black p-2">Azione</th>
              </tr>
            </thead>
            <tbody>
              {righe.map((riga, index) => (
                <tr key={index} className={index % 2 === 0 ? "odd:bg-gray-300" : "even:bg-white"}>
                  <td className="border border-black p-2">{riga.id_utente}</td>
                  <td className="border border-black p-2">{riga.data_prestito}</td>
                  <td className="border border-black p-2">{riga.data_scadenza}</td>
                  <td className="border border-black p-2">{riga.id_libro}</td>
                  <td className="border border-black p-2">
                    <button onClick={() => { setSelectedUserId(riga.id_utente); setShowModal(true); }}>
                      Invia Notifica
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg p-6 shadow-lg w-1/3">
              <h2 className="text-lg font-bold mb-4 text-center">Invia Notifica</h2>
              <textarea
                className="w-full border border-gray-300 p-2 rounded mb-4 h-24 resize-none"
                value={messaggio}
                onChange={(e) => setMessaggio(e.target.value)}
                placeholder="Scrivi il tuo messaggio qui..."
              />
              <div className="flex justify-between">
                <button 
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                  onClick={handleSendNotification}
                >
                  Invia
                </button>
                <button 
                  className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                  onClick={() => setShowModal(false)}
                >
                  Annulla
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}