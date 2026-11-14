import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import LandingPage from './pages/LandingPage';
import ScanPage from './pages/ScanPage';
import ShareTargetPage from './pages/ShareTargetPage';
import DashboardPage from './pages/DashboardPage';
import PrivacyCenterPage from './pages/PrivacyCenterPage';
import AwarenessPage from './pages/AwarenessPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary transition-colors duration-150">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/scan" element={<ScanPage />} />
          <Route path="/share" element={<ShareTargetPage />} />
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/privacy" element={<PrivacyCenterPage />} />
          <Route path="/awareness" element={<AwarenessPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
