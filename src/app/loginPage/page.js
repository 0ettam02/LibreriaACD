import Footer from "../component/footerComponent";
import Header from "../component/headerComponent";
import Login from "../component/logInComponent";
import Link from "next/link";


export default function LoginPage() {
    return (
        <>
            <Header />
            <Login />
            <Footer />
        </>
    );
}