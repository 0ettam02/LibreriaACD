import Header from "../component/headerComponent";
import Footer from "../component/footerComponent";
import LibroCarrelloComponent from "../component/libroCarrelloComponent";

export default function CarrelloPage() {
    return (
        <>
            <Header />
            <div className="w-full">
                <LibroCarrelloComponent />
            </div>
            <Footer />
        </>
    );
}