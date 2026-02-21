"use client";

import { ReactNode } from "react";
import { ConvexReactClient } from "convex/react";
import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function Providers({ children }: { children: ReactNode }) {
    return (
        <ClerkProvider
            publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY!}
            appearance={{
                variables: {
                    colorPrimary: "#6366f1",
                    colorBackground: "#0f0f23",
                    colorInputBackground: "#1a1a2e",
                    colorInputText: "#e2e8f0",
                    colorText: "#e2e8f0",
                    borderRadius: "0.75rem",
                },
                elements: {
                    card: "bg-[#1a1a2e] border border-slate-700",
                    headerTitle: "text-slate-100",
                    headerSubtitle: "text-slate-400",
                    socialButtonsBlockButton:
                        "bg-slate-800 border border-slate-600 text-slate-100 hover:bg-slate-700",
                    formFieldLabel: "text-slate-300",
                    formFieldInput:
                        "bg-[#0f0f23] border-slate-600 text-slate-100 focus:border-indigo-500",
                    footerActionLink: "text-indigo-400 hover:text-indigo-300",
                    formButtonPrimary:
                        "bg-indigo-600 hover:bg-indigo-500 text-white",
                    dividerLine: "bg-slate-700",
                    dividerText: "text-slate-500",
                },
            }}
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
