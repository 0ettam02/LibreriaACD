import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import LibroHomepage from "../component/LibroHomepageComponent";

export default function Homepage() {
  const libri = [
    { titolo: "Il Signore degli Anelli vaginali", copie: 5 },
    { titolo: "Harry Fotter", copie: 3 },
    { titolo: "Il Grande Bossetti", copie: 9 },
    { titolo: "69 sfumature di filippo turetta", copie: 23 },
    { titolo: "Quasi nemici", copie: 5 },
    { titolo: "Ciro Esposito", copie: 9 },
    { titolo: "Gianni Celeste: dios10", copie: 4 },
    { titolo: "Il Grande Gatsby", copie: 11 },
    { titolo: "massimo gay", copie: 9 },
    { titolo: "Trovo solo 2007", copie: 4 },
    { titolo: "Tommaso non matcha su tinder", copie: 8 },
    { titolo: "Tommaso non matcha su badoo", copie: 8 },

  ];

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
