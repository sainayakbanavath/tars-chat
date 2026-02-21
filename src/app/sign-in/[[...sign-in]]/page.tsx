import { SignIn } from "@clerk/nextjs";
import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign In — Tars Chat",
    description: "Sign in to your Tars Chat account",
};

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#080818] relative overflow-hidden">
            {/* Background gradient orbs */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-900/20 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10 flex flex-col items-center gap-8">
                {/* Logo */}
                <div className="text-center">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-2xl shadow-indigo-600/30">
                        <svg
                            width="32"
                            height="32"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold gradient-text">Tars Chat</h1>
                    <p className="text-slate-500 text-sm mt-1">
                        Real-time messaging, redefined.
                    </p>
                </div>

                <SignIn
                    routing="hash"
                    signUpUrl="/sign-up"
                    afterSignInUrl="/"
                />
            </div>
        </div>
    );
}
