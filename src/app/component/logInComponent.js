"use client";
import Link from "next/link";
export default function Login() {
    return (
        <>

            <div className="flex items-center justify-center h-screen bg-gray-100">
                <form
                   // onSubmit={handleLogin}
                    className="bg-white p-8 rounded shadow-md w-full max-w-md"
                >
                    <h2 className="text-2xl font-bold text-center text-gray-800 mb-4">
                        Log into your account
                    </h2>
                    <p className="text-sm text-center text-gray-600 mb-6">
                        Enter your email and password below to login
                    </p>

                    {/* Input Email */}
                    <div className="mb-4">
                        <input
                            type="email"
                            placeholder="name@example.com"
                           // value={email}
                            //onChange={(e) => setEmail(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    {/* Input Password */}
                    <div className="mb-6">
                        <input
                            type="password"
                            placeholder="password"
                            //value={password}
                            //onChange={(e) => setPassword(e.target.value)}
                            className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
                            required
                        />
                    </div>

                    {/* Login Button */}
                    <div className=" flex justify-center items-center">
                    <Link href="/profiloLibraioPage"
                        
                        className=" w-full max-w-xs p-3 border border-red bg-[#8B0000] text-white rounded focus:outline-none focus:ring-2 focus:ring-red-500 text-center"
                    >
                        Log In
                    </Link>
                    </div>
                </form>
            </div>


        </>
    );
}
