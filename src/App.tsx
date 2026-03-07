import { Routes, Route } from "react-router-dom";
import { Suspense, useState, useCallback } from "react";
import SplashScreen from "./components/SplashScreen";
import ProtectedRoute from "./components/ProtectedRoute";

import Home from "./app/page";
import TripPlanning from "./app/trip-planning/page";
import Community from "./app/community/page";
import Chat from "./app/chat/page";
import Explorer from "./app/explorer/page";
import Safety from "./app/safety/page";
import Deals from "./app/deals/page";
import Demo from "./app/demo/page";
import Dashboard from "./app/dashboard/page";
import SignInPage from "./app/sign-in/page";
import SignUpPage from "./app/sign-up/page";
import TripPage from "./app/trip/page";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const handleSplashDone = useCallback(() => setShowSplash(false), []);

  return (
    <>
      {showSplash && <SplashScreen onDone={handleSplashDone} />}
      <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          Loading...
        </div>
      }
    >
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/trip-planning" element={<ProtectedRoute><TripPlanning /></ProtectedRoute>} />
        <Route path="/community" element={<Community />} />
        <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
        <Route path="/explorer" element={<Explorer />} />
        <Route path="/safety" element={<Safety />} />
        <Route path="/deals" element={<Deals />} />
        <Route path="/demo" element={<Demo />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />
        <Route path="/trip/:tripId" element={<ProtectedRoute><TripPage /></ProtectedRoute>} />
      </Routes>
    </Suspense>
    </>
  );
}
