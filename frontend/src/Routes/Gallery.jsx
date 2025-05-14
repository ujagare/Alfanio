import React, { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import Masonry from "react-masonry-css";
import alfanioPng from "..\assets\Alfanio.png";
import Loader from "..\components\Loader";
import heroImage from "..\assets\alafa-images\20211116_114205 (2).webp";
import { FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

const galleryImages = import.meta.glob(
  "../assets/alafa-images/*.(webp|jpg|jpeg|png)",
  { eager: true }
);

const Gallery = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const imagesPerPage = 12; // Reduced to ensure the Load More button is visible

  useEffect(() => {
    const loadImages = async () => {
      try {
        setIsLoading(true);

        // Get all images
        const allImages = Object.entries(galleryImages).map(
          ([path, module]) => ({
            src: module.default,
            alt: path.split("/").pop().split(".")[0].replace(/-/g, " "),
            path: path, // Keep the original path for filtering
          })
        );

        // Only filter out exact duplicates with "Copy" in the name
        // This is a more conservative approach to ensure we don't lose images
        const filteredImages = allImages.filter((image) => {
          // Skip files with "Copy" in the name
          return !image.path.includes("Copy");
        });

        // Sort images to ensure consistent order
        filteredImages.sort((a, b) => {
          // Extract base names (without numbers in parentheses)
          const aBase = a.alt.replace(/\s*\(\d+\)\s*$/, "");
          const bBase = b.alt.replace(/\s*\(\d+\)\s*$/, "");

          if (aBase === bBase) {
            // If base names are the same, sort by number in parentheses (if any)
            const aMatch = a.alt.match(/\((\d+)\)/);
            const bMatch = b.alt.match(/\((\d+)\)/);
            const aNum = aMatch ? parseInt(aMatch[1]) : 0;
            const bNum = bMatch ? parseInt(bMatch[1]) : 0;
            return bNum - aNum; // Higher numbers first
          }

          // Otherwise sort alphabetically
          return aBase.localeCompare(bBase);
        });

        console.log(
          `Loaded ${filteredImages.length} images (removed ${allImages.length - filteredImages.length} duplicates)`
        );
        setLoadedImages(filteredImages);
      } catch (error) {
        console.error("Error loading images:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadImages();
  }, []);

  const breakpoints = {
    default: 4,
    1100: 3,
    700: 2,
    500: 1,
  };

  const openLightbox = (image, index) => {
    setSelectedImage(image);
    setSelectedIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeLightbox = () => {
    setSelectedImage(null);
    setSelectedIndex(null);
    document.body.style.overflow = "unset";
  };

  const handlePrevImage = (e) => {
    e?.stopPropagation();
    const prevIndex =
      (selectedIndex - 1 + visibleImages.length) % visibleImages.length;
    setSelectedIndex(prevIndex);
    setSelectedImage(visibleImages[prevIndex]);
  };

  const handleNextImage = (e) => {
    e?.stopPropagation();
    const nextIndex = (selectedIndex + 1) % visibleImages.length;
    setSelectedIndex(nextIndex);
    setSelectedImage(visibleImages[nextIndex]);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!selectedImage) return;

      if (e.key === "ArrowLeft") {
        handlePrevImage();
      } else if (e.key === "ArrowRight") {
        handleNextImage();
      } else if (e.key === "Escape") {
        closeLightbox();
      }
    },
    [selectedImage, selectedIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const visibleImages = loadedImages.slice(0, currentPage * imagesPerPage);

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Gallery - Alfanio Limited</title>
        <meta
          name="description"
          content="Explore our gallery of industrial pumps, projects, and technical components."
        />
      </Helmet>

      {/* Enhanced Hero Section with Modern Design - Matching News.jsx */}
      <section className="relative h-screen overflow-hidden">
        {/* Background with parallax effect */}
        <motion.div
          className="absolute inset-0 w-full h-full"
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.05, 1.02] }}
          transition={{
            duration: 15,
            times: [0, 0.5, 1],
            repeat: Infinity,
            repeatType: "reverse",
            ease: "easeInOut",
          }}
        >
          <img
            src={heroImage}
            alt="Alfanio Industrial Equipment"
            className="w-full h-full object-cover object-top"
            style={{
              imageRendering: "crisp-edges",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            loading="eager"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30 "
            initial={{ opacity: 0.6 }}
            animate={{ opacity: 0.85 }}
            transition={{ duration: 1.5 }}
          />

          {/* Decorative elements */}
          <div className="absolute inset-0 bg-[#FECC00]/5 mix-blend-multiply"></div>
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-[#FECC00]/10 blur-3xl"></div>
            <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] rounded-full bg-[#FECC00]/5 blur-3xl"></div>
          </div>
        </motion.div>

        {/* Content */}
        <div className="relative z-20 h-full flex flex-col justify-center">
          <div className="container mx-auto px-4">
            <motion.div
              className="max-w-5xl mx-auto text-center text-white"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.5 }}
            >
              {/* Category badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="mb-6"
              ></motion.div>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <img
                  src={alfanioPng}
                  alt="Alfanio Logo"
                  className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto "
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(254, 204, 0, 0.3))",
                  }}
                />
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-white">Project </span>
                <span className="text-[#FECC00]">Gallery</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-xl md:text-2xl text-gray-300 mb-12 max-w-3xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Explore our comprehensive collection of industrial solutions and
                innovative products with cutting-edge technologies
              </motion.p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <div className="relative min-h-screen bg-white">
        <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white"></div>
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-16">
            {/* Gallery Introduction */}
            <div className="max-w-3xl mx-auto text-center mb-12">
              <h2 className="text-3xl font-bold text-zinc-800 mb-4">
                Our Project Showcase
              </h2>
              <div className="w-16 h-1 bg-[#FECC00] mx-auto mb-6"></div>
              <p className="text-gray-600 text-lg">
                Browse through our collection of projects, equipment
                installations, and manufacturing facilities.
              </p>
            </div>

            {/* Gallery Content */}
            {isLoading ? (
              <div className="flex justify-center items-center min-h-[50vh]">
                <div className="relative">
                  <Loader />
                  <p className="mt-8 text-gray-500 text-center">
                    Loading gallery images...
                  </p>
                </div>
              </div>
            ) : loadedImages.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100 max-w-lg mx-auto">
                <div className="p-6">
                  <svg
                    className="w-16 h-16 text-gray-300 mx-auto mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                    No images found
                  </h2>
                  <p className="text-gray-600">
                    Please check back later for updates to our gallery.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Masonry Grid */}
                <Masonry
                  breakpointCols={breakpoints}
                  className="flex w-auto"
                  columnClassName="pl-4 bg-clip-padding"
                >
                  {visibleImages.map((image, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.05 }}
                      className="mb-6 group relative overflow-hidden rounded-xl shadow-md hover:shadow-xl transition-all duration-300 border border-[#FECC00]/10 hover:border-[#FECC00]/30"
                      onClick={() => openLightbox(image, index)}
                    >
                      <div className="aspect-w-4 aspect-h-3 bg-gray-50">
                        <img
                          src={image.src}
                          alt={image.alt}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500 ease-out"
                          loading={index < 12 ? "eager" : "lazy"}
                        />
                        {/* Yellow accent corner */}
                        <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-[#FECC00] to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                        {/* Image info */}
                        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <div className="flex items-center">
                            <div className="w-1 h-8 bg-[#FECC00] rounded-full mr-2"></div>
                            <div>
                              <h3 className="text-white font-medium text-sm truncate">
                                {image.alt.replace(/\s*\(\d+\)\s*$/, "")}
                              </h3>
                              <p className="text-white/70 text-xs">
                                Alfanio Project
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* View icon */}
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-50 group-hover:scale-100">
                          <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border border-white/30">
                            <svg
                              className="w-5 h-5 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </Masonry>

                {/* Load More Button */}
                {loadedImages.length > 0 && (
                  <motion.div
                    className="text-center mt-16 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <div className="relative inline-block">
                      {/* Decorative elements */}
                      <div className="absolute -top-6 -left-6 w-12 h-12 border-t-2 border-l-2 border-[#FECC00]/30 rounded-tl-lg"></div>
                      <div className="absolute -bottom-6 -right-6 w-12 h-12 border-b-2 border-r-2 border-[#FECC00]/30 rounded-br-lg"></div>

                      {currentPage * imagesPerPage < loadedImages.length ? (
                        <button
                          onClick={() => setCurrentPage((prev) => prev + 1)}
                          className="bg-zinc-800 hover:bg-[#FECC00] hover:text-zinc-900 text-white font-semibold py-3 px-8 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg flex items-center gap-3 mx-auto transform hover:-translate-y-1 active:translate-y-0"
                        >
                          <span>Load More Images</span>
                          <span className="relative w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 14l-7 7m0 0l-7-7m7 7V3"
                              />
                            </svg>
                          </span>
                        </button>
                      ) : (
                        <button
                          className="bg-[#FECC00] text-zinc-900 font-semibold py-3 px-8 rounded-lg shadow-md flex items-center gap-3 mx-auto cursor-default"
                          disabled
                        >
                          <span>All Images Loaded</span>
                          <span className="relative w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </span>
                        </button>
                      )}

                      {/* Image count indicator */}
                      <div className="mt-4 text-sm text-gray-500">
                        Showing {visibleImages.length} of {loadedImages.length}{" "}
                        images
                      </div>
                    </div>
                  </motion.div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 flex items-center justify-center"
          >
            {/* Semi-transparent overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 backdrop-blur-md bg-black/90"
              onClick={closeLightbox}
            />

            {/* Image container */}
            <motion.div
              className="relative z-10 w-[95vw] max-w-6xl h-[95vh] bg-gradient-to-b from-zinc-900 to-black rounded-xl shadow-2xl overflow-hidden border border-zinc-700/50"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              {/* Yellow accent line */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FECC00]"></div>

              {/* Top bar */}
              <div className="absolute top-0 left-0 right-0 h-16 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between px-6 border-b border-zinc-700/30 z-20">
                <div className="flex items-center">
                  <div className="w-2 h-8 bg-[#FECC00] rounded-full mr-3"></div>
                  <div>
                    <h3 className="text-lg font-semibold text-white truncate max-w-lg">
                      {selectedImage.alt.replace(/\s*\(\d+\)\s*$/, "")}
                    </h3>
                    <p className="text-xs text-zinc-400">
                      Alfanio Project Gallery
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-zinc-400 bg-zinc-800/50 py-1 px-3 rounded-full">
                    {selectedIndex + 1} of {visibleImages.length}
                  </span>
                  <button
                    onClick={closeLightbox}
                    className="w-10 h-10 rounded-full flex items-center justify-center bg-zinc-800/50 hover:bg-[#FECC00] text-zinc-400 hover:text-black transition-all duration-300"
                    aria-label="Close lightbox"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Main image area */}
              <div className="h-full pt-16 pb-12 px-6 flex items-center justify-center">
                <div className="relative max-w-full max-h-full">
                  <motion.img
                    key={selectedImage.src}
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-h-[calc(95vh-7rem)] max-w-full object-contain rounded-lg shadow-2xl border border-zinc-700/20"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  />

                  {/* Image decorative elements */}
                  <div className="absolute -top-4 -right-4 w-16 h-16 border-t-2 border-r-2 border-[#FECC00]/30 rounded-tr-xl opacity-70"></div>
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 border-b-2 border-l-2 border-[#FECC00]/30 rounded-bl-xl opacity-70"></div>
                </div>

                {/* Navigation buttons */}
                <button
                  className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-800/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-[#FECC00] text-white hover:text-black transition-all duration-300 z-10 border border-zinc-700/30"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                >
                  <FiChevronLeft className="w-6 h-6 md:w-7 md:h-7" />
                </button>

                <button
                  className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 w-12 h-12 md:w-14 md:h-14 rounded-full bg-zinc-800/70 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-[#FECC00] text-white hover:text-black transition-all duration-300 z-10 border border-zinc-700/30"
                  onClick={handleNextImage}
                  aria-label="Next image"
                >
                  <FiChevronRight className="w-6 h-6 md:w-7 md:h-7" />
                </button>
              </div>

              {/* Bottom info bar */}
              <div className="absolute bottom-0 left-0 right-0 h-12 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-between px-6 z-20 border-t border-zinc-700/30">
                <div className="text-xs text-zinc-400 flex items-center">
                  <div className="w-1 h-1 bg-[#FECC00] rounded-full mr-2"></div>
                  <span>Use arrow keys to navigate</span>
                </div>
                <div className="text-xs text-zinc-400 flex items-center">
                  <span>Press ESC to close</span>
                  <div className="w-1 h-1 bg-[#FECC00] rounded-full ml-2"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Loading Overlay */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <Loader />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Gallery;
