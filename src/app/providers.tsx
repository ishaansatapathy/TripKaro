import { ClerkProvider, useAuth } from "@clerk/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";
import { useNavigate } from "react-router-dom";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

export function Providers({ children }: { children: React.ReactNode }) {
    const navigate = useNavigate();

    return (
        <ClerkProvider
            publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
            routerPush={(to: string) => navigate(to)}
            routerReplace={(to: string) => navigate(to, { replace: true })}
            signInUrl="/sign-in"
            signUpUrl="/sign-up"
            signInFallbackRedirectUrl="/"
            signUpFallbackRedirectUrl="/"
        >
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                {children}
            </ConvexProviderWithClerk>
        </ClerkProvider>
    );
}
