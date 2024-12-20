import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import LibroProfilo from "../component/libroProfiloComponent";


export default function ProfiloPersonale(){
    const libri = [
        { titolo: "Harry potter", dataP: "10/01/2024", dataFP: "20/01/2024"},
        { titolo: "Harry potter2", dataP: "10/01/2024", dataFP: "20/01/2024"},
        { titolo: "Harry potter3", dataP: "10/01/2024", dataFP: "20/01/2024"},
        { titolo: "Harry potter4", dataP: "10/01/2024", dataFP: "20/01/2024"},
      ];
    
    return(
        <>
        <Header />
        <div className="mt-5 flex flex-col justify-center items-center">
            <h1 className="text-5xl font-bold">I TUOI LIBRI</h1>
                <div className="mt-10 grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3 lg:gap-10">
                    {libri.map((libro, index) => (
                        <LibroProfilo key={index} titolo={libro.titolo} dataP={libro.dataP} dataFP={libro.dataFP} />
                    ))}
                </div>
        </div>
        <Footer />
        </>
    )
}