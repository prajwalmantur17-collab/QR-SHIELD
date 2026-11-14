import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppLayout from './components/layout/AppLayout';
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
    <Routes>
      {/* 1. Public Marketing Landing Page */}
      <Route
        path="/"
        element={
          <div className="flex flex-col min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary transition-colors duration-150">
            <Navbar />
            <main className="flex-1">
              <LandingPage />
            </main>
            <Footer />
          </div>
        }
      />

      {/* 2. Authentication Pages */}
      <Route
        path="/login"
        element={
          <div className="flex flex-col min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary transition-colors duration-150">
            <Navbar />
            <main className="flex-1">
              <LoginPage />
            </main>
            <Footer />
          </div>
        }
      />
      <Route
        path="/register"
        element={
          <div className="flex flex-col min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary transition-colors duration-150">
            <Navbar />
            <main className="flex-1">
              <RegisterPage />
            </main>
            <Footer />
          </div>
        }
      />

      {/* 3. Core SaaS Workspace Pages with Enterprise Sidebar & Header */}
      <Route
        path="/scan"
        element={
          <AppLayout>
            <ScanPage />
          </AppLayout>
        }
      />
      <Route
        path="/dashboard"
        element={
          <AppLayout>
            <DashboardPage />
          </AppLayout>
        }
      />
      <Route
        path="/awareness"
        element={
          <AppLayout>
            <AwarenessPage />
          </AppLayout>
        }
      />
      <Route
        path="/privacy"
        element={
          <AppLayout>
            <PrivacyCenterPage />
          </AppLayout>
        }
      />
      <Route
        path="/share"
        element={
          <AppLayout>
            <ShareTargetPage />
          </AppLayout>
        }
      />

      {/* Fallback to Home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
