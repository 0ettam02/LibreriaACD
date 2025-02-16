"use client";
import { useState } from "react";
import Link from "next/link";

export default function Registrazione() {
    const [username, setUsername] = useState("");
    const [nome, setNome] = useState("");
    const [cognome, setCognome] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:8080', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    username,
                    nome,
                    cognome,
                    email,
                    password
                })
            });

            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }

            const data = await response.json();
            if (data.status === "success") {
                window.location.href = "/homePage";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Errore durante la registrazione:', error);
            alert('Errore durante la registrazione: ' + error.message);
        }
    };

    return (
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form 
                onSubmit={handleSubmit}
                className="bg-white p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Crea il tuo account
                </h2>
                <p className="text-sm text-center text-gray-600 mb-6">
                    Inserisci i tuoi dati per registrarti
                </p>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Nome"
                        value={nome}
                        onChange={(e) => setNome(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Cognome"
                        value={cognome}
                        onChange={(e) => setCognome(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>

                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>

                <div className="mb-6">
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                        required
                    />
                </div>

                <div className="flex justify-center items-center">
                    <button
                        type="submit"
                        className="w-full max-w-xs p-3 border border-red bg-[#8B0000] text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                    >
                        Registrati
                    </button>
                </div>

                <div className="text-center mt-10">
                    Hai già un account? Accedi <Link href="/" className="font-bold">qui</Link>
                </div>
            </form>
        </div>
    );
}