"use client";
import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import LibroHomepage from "../component/LibroHomepageComponent";
import { useState, useEffect } from "react";

export default function Homepage() {
  const [libri, setLibri] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchLibri = async () => {
      try {
        const response = await fetch('http://localhost:8084', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        if (data.status === "success") {
          setLibri(data.libri);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error('Errore nel caricamento dei libri:', error);
        setError('Errore nel caricamento dei libri');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibri();
  }, []);

  if (isLoading) {
    return (
      <>
        <Header />
        <div className="p-10 text-center">
          <p>Caricamento in corso...</p>
        </div>
        <Footer />
      </>
    );
  }

  if (error) {
    return (
      <>
        <Header />
        <div className="p-10 text-center text-red-600">
          <p>{error}</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-screen">
        {libri.map((libro, index) => (
          <LibroHomepage key={index} titolo={libro.titolo} copie={libro.copie} />
        ))}
      </div>
      <Footer />
    </>
  );
}