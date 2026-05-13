import React, { useState, useEffect } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { HelmetProvider } from "react-helmet-async";
import { initializeErrorTracking, ErrorBoundary } from "./Utils/errorTracking";
import Navbar from "./Components/Navbar";
import Footer from "./Components/Footer";
import Home from "./Routes/Home";
import About from "./Routes/About";
import Contact from "./Routes/Contact";
import News from "./Routes/News";
import Gallery from "./Routes/Gallery";
import ProductGallery from "./Routes/ProductGallery";
import ProductRangePage from "./Routes/ProductRange";
import TwinShaftMixer from "./Pages/ProductDetails/TwinShaftMixer";
import Loader from "./Components/Loader";
import ScrollToTop from "./Components/ScrollToTop";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useAnalytics } from "./hooks/useAnalytics";
import SmoothScroll from "./Components/SmoothScroll";

const isProduction = import.meta.env.PROD;
const isDevelopment = import.meta.env.DEV;

const AppContent = () => {
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const { trackEvent } = useAnalytics();

  const handleLoaderComplete = () => {
    setTimeout(() => {
      setLoading(false);
    }, 500);
  };

  useEffect(() => {
    // Initialize error tracking only in production
    if (isProduction) {
      initializeErrorTracking();

      // Track any errors
      window.addEventListener("error", (event) => {
        trackEvent({
          action: "error",
          category: "Error",
          label: event.message,
        });
      });
    }

    // Disable service worker caching so production deploys and form endpoints
    // are never held back by stale cached JavaScript.
    if ("serviceWorker" in navigator && isProduction) {
      window.addEventListener("load", () => {
        navigator.serviceWorker.getRegistrations()
          .then((registrations) =>
            Promise.all(registrations.map((registration) => registration.unregister()))
          )
          .then(() => ("caches" in window ? caches.keys() : []))
          .then((cacheNames) =>
            Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
          )
          .catch((error) => {
            trackEvent({
              action: "error",
              category: "ServiceWorker",
              label: error.message,
            });
          });
      });
    }
  }, [trackEvent]);

  return (
    <>
      {loading && <Loader onAnimationComplete={handleLoaderComplete} />}
      <div className="relative bg-white min-h-screen flex flex-col">
        <ScrollToTop />
        <SmoothScroll /> {/* Make sure this is before Navbar */}
        <Navbar />
        <AnimatePresence mode="wait">
          <main className="flex-grow pt-20">
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/news" element={<News />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route
                path="/product-range"
                element={<Navigate to="/#products" replace={true} />}
              />
              <Route path="/products" element={<ProductRangePage />} />
              <Route path="/product/:productId" element={<ProductGallery />} />
              {/* Removed redundant route */}
            </Routes>
          </main>
        </AnimatePresence>
        <Footer />
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="colored"
          style={{
            fontSize: "16px",
            fontWeight: "500",
            borderRadius: "10px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
          }}
          toastStyle={{
            borderRadius: "8px",
            marginBottom: "1rem",
          }}
        />
      </div>
    </>
  );
};

const ErrorFallback = ({ error }) => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-center p-8 bg-white rounded-lg shadow-xl max-w-lg">
      <h1 className="text-2xl font-bold text-red-600 mb-4">
        Oops! Something went wrong
      </h1>
      <p className="text-gray-600 mb-4">
        We're sorry for the inconvenience. Our team has been notified.
      </p>
      {isDevelopment && (
        <div className="text-left bg-gray-100 p-4 rounded mb-4 overflow-auto">
          <p className="text-sm font-mono text-gray-700">{error?.message}</p>
        </div>
      )}
      <div className="space-x-4">
        <button
          onClick={() => window.location.reload()}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
        >
          Refresh Page
        </button>
        <button
          onClick={() => (window.location.href = "/")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors"
        >
          Go Home
        </button>
      </div>
    </div>
  </div>
);

const App = () => {
  useAnalytics(); // This initializes GA and tracks page views

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <HelmetProvider>
        <AppContent />
      </HelmetProvider>
    </ErrorBoundary>
  );
};

export default App;
