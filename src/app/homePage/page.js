import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import LibroHomepage from "../component/LibroHomepageComponent";

export default function Homepage() {



    return (
        <>
            <Header />

            <div className="p-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 w-full max-w-screen">
                <LibroHomepage titolo="Il Signore degli Anelli vaginali" copie={5} />

                <LibroHomepage titolo="Harry Fotter" copie={3} />

                <LibroHomepage titolo="Il Grande Bossetti" copie={9} />

                <LibroHomepage titolo="69 sfumature di filippo turetta" copie={23} />

                <LibroHomepage titolo="Quasi nemici" copie={5} />

                <LibroHomepage titolo="Ciro Esposito" copie={9} />

                <LibroHomepage titolo="Gianni Celeste: dios10" copie={4} />

                <LibroHomepage titolo="Il Grande Gatsby" copie={11} />

                <LibroHomepage titolo="massimo gay" copie={9} />

                <LibroHomepage titolo="Trovo solo 2007" copie={4} />

                <LibroHomepage titolo="Tommaso non matcha su tinder" copie={8} />



            </div>

            <Footer />
        </>
    );

}