"use client";
import { useState, useEffect } from "react";
import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import LibroProfilo from "../component/libroProfiloComponent";

export default function ProfiloPersonale() {
  const [libriPrenotati, setLibriPrenotati] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const userId = localStorage.getItem('userId'); 
    const fetchLibriPrenotati = async () => {
      try {
        const response = await fetch(`http://localhost:8083/profilo?userId=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Errore nella richiesta al server');
        }

        const data = await response.json();
        if (data.status === "success") {
          console.log(data.libriPrenotati); 
          setLibriPrenotati(data.libriPrenotati);
        } else {
          setError(data.message || 'Errore nel caricamento dei libri');
        }
      } catch (error) {
        console.error('Errore nella richiesta dei libri:', error);
        setError('Errore nel caricamento dei libri');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibriPrenotati();
  }, []);

  const handleDelete = async (titolo) => {
    const userId = localStorage.getItem('userId');
    try {
      const response = await fetch(`http://localhost:8086/eliminaLibro?userId=${userId}&titolo=${encodeURIComponent(titolo)}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.status === "success") {
        setLibriPrenotati(libriPrenotati.filter(libro => libro.titolo !== titolo));
      } else {
        alert(data.message);
      }
    } catch (error) {
      console.error('Errore durante l\'eliminazione del libro:', error);
      alert('Errore durante l\'eliminazione del libro');
    }
  };

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="mt-5 flex flex-col justify-center items-center min-h-screen">
          <p className="text-2xl">Caricamento in corso...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="mt-5 flex flex-col justify-center items-center min-h-screen">
          <p className="text-2xl text-red-600">{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="mt-5 flex flex-col justify-center items-center">
        <h1 className="text-5xl font-bold">I TUOI LIBRI</h1>
        <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
          {libriPrenotati.length === 0 ? (
            <p className="text-2xl text-gray-500 col-span-full text-center">
              Non hai ancora prenotato nessun libro
            </p>
          ) : (
            libriPrenotati.map((libro, index) => (
              <LibroProfilo
                key={index}
                titolo={libro.titolo}
                dataP={libro.dataPrenotazione}
                dataFP={libro.dataScadenza}
                onDelete={() => handleDelete(libro.titolo)}
              />
            ))
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}