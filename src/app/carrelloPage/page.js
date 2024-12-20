import Header from "../component/headerComponent";
import Footer from "../component/footerComponent";
import LibroCarrelloComponent from "../component/libroCarrelloComponent";

export default function CarrelloPage() {

    return (
        <>
        <Header />

        <div className="flex flex-col gap-4 ml-20">
            <LibroCarrelloComponent />

        </div>

        <Footer />
        
        </>
    ) 

}