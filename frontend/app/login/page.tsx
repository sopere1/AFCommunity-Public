'use client';

import { useState } from "react";
import Image from "next/image";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { auth } from "@/auth/config";

// Register new users in the database
async function registerUser(name: string, email: string, uid: string) {
    const formData = new FormData();

    formData.append("name", name)
    formData.append("email", email)
    formData.append("uid", uid)

    try {
        const response = await fetch("http://localhost:5010/add-user", {
            method: "POST",
            body: formData
        });
        const result = await response.json()
        const success = result.success
        if (success) {
            console.log("User added successfully.")
        } else {
            throw new Error("A fatal server-side error occurred.")
        }
    } catch (error) {
        console.error("An exception occurred while trying to add the user: ", error);
    }
}

const palette = {
    primary: "#53694d",
    accent: "#7f8953",
    highlight: "#ffbd3b",
    danger: "#d66221",
};

const inputClass = `px-4 py-2 rounded border focus:outline-none focus:ring-2 w-full`;
const shadow = `shadow-[0_0_15px_rgba(127,137,83,0.3)]`;

export default function LoginForm() {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let userCredential;

        if (mode === "login") {
            try {
                // upon completion, this immediately triggers onAuthStateChanged
                userCredential = await signInWithEmailAndPassword(auth, email, password);
            } catch (error) {
                setError("No account was found with the provided email and password.")
                setLoading(false)
                return;
            }
        }
        else {
            try {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
            } catch (error) {
                if (error instanceof FirebaseError) {
                    switch (error.code) {
                        case "auth/email-already-in-use":
                            setError("An account already exists with this email.");
                            break;
                        case "auth/invalid-email":
                            setError("Please enter a valid email address.");
                            break;
                        case "auth/weak-password":
                            setError("Password should be at least 6 characters.");
                            break;
                        default:
                            setError("An unexpected error occurred. Please try again.");
                    }
                } else {
                    setError("Something went wrong. Try again.");
                }

                setLoading(false);
                return;
            }
        }

        const user = userCredential.user;
        if (mode === "register") await registerUser(name, email, user.uid);
    }

    return (
        <div className={`min-h-screen flex items-center justify-center bg-[#f5f5f0]`}>
            <form
                onSubmit={handleSubmit}
                className={`bg-white p-8 rounded-xl w-96 space-y-5 ${shadow}`}
            >
                <div className="flex justify-center">
                    <Image
                        src="/placeholder_logo.png"
                        alt="AFCommunity logo"
                        width={200}
                        height={200}
                        className="mb-4"
                        priority
                    />
                </div>

                <h2 className="text-xl font-bold text-center" style={{ color: palette.primary }}>
                    {mode === 'login' ? 'Welcome to AFCommunity 👋' : 'Join AFCommunity 🌱'}
                </h2>

                {mode === 'register' && (
                    <div className="flex flex-col">
                        <label className="mb-1 font-medium" style={{ color: palette.primary }}>Name</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={inputClass}
                            style={{ borderColor: palette.accent }}
                        />
                    </div>
                )}

                <div className="flex flex-col">
                    <label className="mb-1 font-medium" style={{ color: palette.primary }}>Email</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={inputClass}
                        style={{ borderColor: palette.accent }}
                    />
                </div>

                <div className="flex flex-col">
                    <label className="mb-1 font-medium" style={{ color: palette.primary }}>Password</label>
                    <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className={inputClass}
                        style={{ borderColor: palette.accent }}
                    />
                </div>

                {error && (
                    <p className="text-red-600 text-sm text-center">{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-2 rounded text-white font-semibold transition-all duration-150 hover:brightness-110 cursor-pointer"
                    style={{ backgroundColor: palette.primary }}
                >
                    {loading ? 'Please wait...' : mode === 'login' ? 'Log In' : 'Register'}
                </button>

                <div className="text-md text-center" style={{ color: palette.primary }}>
                    {mode === 'login' ? (
                        <>
                            New here?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('register');
                                    setError(null);
                                }}
                                className="underline hover:text-[#7f8953] cursor-pointer"
                            >
                                Create an account
                            </button>
                        </>
                    ) : (
                        <>
                            Already have an account?{' '}
                            <button
                                type="button"
                                onClick={() => {
                                    setMode('login');
                                    setError(null);
                                }}
                                className="underline hover:text-[#7f8953] cursor-pointer"
                            >
                                Log in
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
