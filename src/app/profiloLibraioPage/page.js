import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import GrigliaLibriLibraio from "../component/grigliaLibriLibraioComponent";

export default function ProfiloLibraio() {
  return(
    <>
    <Header />
    <div className="flex justify-center">
      <GrigliaLibriLibraio />
    </div>
    <Footer />
    </>
  )
}
