"use client";
import { useState } from "react";
import Link from "next/link";

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:8081', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    email,
                    password
                })
            });

            if (!response.ok) {
                throw new Error('Errore nella risposta del server');
            }

            const data = await response.json();
            if (data.status === "success") {
                localStorage.setItem('userEmail', email);
                localStorage.setItem('userId', data.userId);
                window.location.href = "/homePage";
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Errore durante il login:', error);
            alert('Errore durante il login: ' + error.message);
        }
    };
    return (
        <>
        <div className="flex items-center justify-center h-screen bg-gray-100">
            <form
                onSubmit={handleLogin}
                className="bg-white p-8 rounded shadow-md w-full max-w-md"
            >
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                    Log into your account
                </h2>
                <p className="text-sm text-center text-gray-600 mb-6">
                    Enter your email and password below to login
                </p>

                <div className="mb-4">
                    <input
                        type="email"
                        placeholder="name@example.com"
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
                        Log In
                    </button>
                </div>

                <div className="text-center mt-10">
                    If you don't have an account yet, create one <Link href="/registrazionePage" className="font-bold">here</Link>
                </div>
            </form>
        </div>
        </>
    );
}