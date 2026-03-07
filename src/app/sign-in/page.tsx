import { SignIn } from "@clerk/react";

export default function SignInPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <SignIn />
        </div>
    );
}
