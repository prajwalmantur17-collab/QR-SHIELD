import React, { lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import AppLayout from './components/layout/AppLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import NotFoundPage from './pages/NotFoundPage';

// Workspace pages are code-split: charts (recharts), the QR camera library and the media analyzers
// are only downloaded when the user actually opens those pages, instead of one 1.4 MB bundle.
// <AppLayout> provides the <Suspense> boundary for them.
const ScanPage = lazy(() => import('./pages/ScanPage'));
const ShareTargetPage = lazy(() => import('./pages/ShareTargetPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const PrivacyCenterPage = lazy(() => import('./pages/PrivacyCenterPage'));
const AwarenessPage = lazy(() => import('./pages/AwarenessPage'));
const MediaAnalyzerPage = lazy(() => import('./pages/MediaAnalyzerPage'));

export default function App() {
  return (
    <Routes>
      {/* 1. Public Marketing Landing Page */}
      <Route
        path="/"
        element={
          <div className="flex flex-col min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary transition-colors duration-150">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-brand-teal focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg focus:outline-none">Skip to main content</a>
            <Navbar />
            <main id="main-content" tabIndex="-1" className="flex-1 focus:outline-none">
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
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-brand-teal focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg focus:outline-none">Skip to main content</a>
            <Navbar />
            <main id="main-content" tabIndex="-1" className="flex-1 focus:outline-none">
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
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-brand-teal focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg focus:outline-none">Skip to main content</a>
            <Navbar />
            <main id="main-content" tabIndex="-1" className="flex-1 focus:outline-none">
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
      <Route
        path="/media"
        element={
          <AppLayout>
            <MediaAnalyzerPage />
          </AppLayout>
        }
      />

      {/* 404 Not Found in public layout */}
      <Route
        path="*"
        element={
          <div className="flex flex-col min-h-screen bg-canvas dark:bg-dark-bg text-content-primary dark:text-dark-primary transition-colors duration-150">
            <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:px-3 focus:py-1.5 focus:rounded-lg focus:bg-brand-teal focus:text-white focus:text-xs focus:font-semibold focus:shadow-lg focus:outline-none">Skip to main content</a>
            <Navbar />
            <main id="main-content" tabIndex="-1" className="flex-1 focus:outline-none">
              <NotFoundPage />
            </main>
            <Footer />
          </div>
        }
      />
    </Routes>
  );
}
