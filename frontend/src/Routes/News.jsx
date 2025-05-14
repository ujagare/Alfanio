import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Helmet } from "react-helmet-async";
import {
  FaPlay,
  FaPause,
  FaCalendar,
  FaChevronRight,
  FaChevronLeft,
  FaShare,
  FaFacebook,
  FaTwitter,
} from "react-icons/fa";
import { FiClock, FiTag, FiExternalLink } from "react-icons/fi";
import { newsData } from "..\Data\newsData";
import heroImage from "..\assets\alafa-images\(10).webp";
import Logo from "..\assets\Alfanio.png";

const News = () => {
  const [playingVideo, setPlayingVideo] = useState(null);
  const [activeNewsIndex, setActiveNewsIndex] = useState(0);
  const videoRefs = useRef({});
  const newsContainerRef = useRef(null);

  // Function to handle video playback
  const toggleVideo = (id) => {
    if (playingVideo === id) {
      videoRefs.current[id].pause();
      setPlayingVideo(null);
    } else {
      if (playingVideo) {
        videoRefs.current[playingVideo].pause();
      }
      videoRefs.current[id].play();
      setPlayingVideo(id);
    }
  };

  // Function to scroll to a specific news section
  const scrollToNews = (index) => {
    setActiveNewsIndex(index);
    const newsElements = document.querySelectorAll(".news-section");
    if (newsElements[index]) {
      newsElements[index].scrollIntoView({ behavior: "smooth" });
    }
  };

  // Update active news index based on scroll position
  useEffect(() => {
    const handleScroll = () => {
      const newsElements = document.querySelectorAll(".news-section");
      const scrollPosition = window.scrollY + window.innerHeight / 2;

      newsElements.forEach((element, index) => {
        const top = element.offsetTop;
        const bottom = top + element.offsetHeight;

        if (scrollPosition >= top && scrollPosition <= bottom) {
          setActiveNewsIndex(index);
        }
      });
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <Helmet>
        <title>News & Events - Alfanio LTD</title>
        <meta
          name="description"
          content="Stay updated with the latest news and events from Alfanio LTD"
        />
      </Helmet>

      {/* Enhanced Hero Section with Modern Design */}
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
            alt="Construction Equipment"
            className="w-full h-full object-cover object-top transform origin-center"
            style={{
              imageRendering: "crisp-edges",
              WebkitBackfaceVisibility: "hidden",
              backfaceVisibility: "hidden",
            }}
            loading="eager"
          />
          <motion.div
            className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/70 to-black/30"
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
              >
                <span className="inline-block px-4 py-1.5 bg-[#FECC00]/20 text-[#FECC00] text-sm font-semibold rounded-full border border-[#FECC00]/30">
                  Latest News & Events
                </span>
              </motion.div>

              {/* Logo */}
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="mb-8"
              >
                <img
                  src={Logo}
                  alt="Alfanio Logo"
                  className="w-32 h-32 md:w-40 md:h-40 object-contain mx-auto"
                  style={{
                    filter: "drop-shadow(0 0 20px rgba(254, 204, 0, 0.3))",
                  }}
                />
              </motion.div>

              {/* Headline */}
              <motion.h1
                className="text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-bold mb-4 sm:mb-6 leading-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="text-[#FECC00]">Latest </span>
                <span className="text-[#FECC00]">News & Updates</span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                className="text-base sm:text-xl md:text-2xl text-gray-300 mb-8 sm:mb-12 max-w-3xl mx-auto px-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Stay updated with our latest innovations, events, and
                achievements in the construction equipment industry
              </motion.p>

              {/* Scroll indicator */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.9 }}
                className="absolute bottom-12 left-1/2 transform -translate-x-1/2"
              ></motion.div>
            </motion.div>
          </div>
        </div>

        {/* News navigation dots */}
        <div className="absolute right-6 top-1/2 transform -translate-y-1/2 z-30 hidden lg:block">
          <div className="flex flex-col space-y-4">
            {newsData.map((news, index) => (
              <button
                key={news.id}
                onClick={() => scrollToNews(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${activeNewsIndex === index ? "bg-[#FECC00] scale-125" : "bg-white/50 hover:bg-white/80"}`}
                aria-label={`Go to ${news.title}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* News Sections */}
      <div ref={newsContainerRef} className="relative">
        {newsData.map((news, index) => (
          <section
            key={news.id}
            className={`py-12 sm:py-16 md:py-24 news-section ${index % 2 === 0 ? "bg-white" : "bg-gray-50/80"}`}
            id={`news-${news.id}`}
          >
            <div className="container mx-auto px-4">
              {/* Section header with decorative elements */}
              <div className="mb-8 sm:mb-12 md:mb-16 relative">
                <div className="absolute -top-12 -left-4 w-24 h-24 bg-[#FECC00]/5 rounded-full blur-2xl"></div>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  viewport={{ once: true, margin: "-100px" }}
                  className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6"
                >
                  <div>
                    <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                      <span className="w-6 sm:w-8 h-0.5 bg-[#FECC00]"></span>
                      <span className="text-xs sm:text-sm font-semibold text-[#FECC00] uppercase tracking-wider">
                        {news.category}
                      </span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-[#FECC00]">
                      {news.title}
                    </h2>
                  </div>
                  <div className="flex items-center gap-3 mt-3 md:mt-0">
                    <time className="flex items-center text-xs sm:text-sm text-gray-600 gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border border-gray-100">
                      <FiClock className="text-[#FECC00]" />
                      {news.date || "Recent"}
                    </time>
                    <div className="flex md:hidden gap-2">
                      <button className="w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center rounded-full bg-white shadow-sm border border-gray-100 text-gray-600 hover:text-[#FECC00] transition-colors">
                        <FaShare className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </div>

              <motion.div
                className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 md:gap-12 lg:gap-16 items-start"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Media Content - Now on the left for better visual hierarchy */}
                <div className="lg:col-span-7 space-y-4 sm:space-y-6 md:space-y-8 order-1">
                  {news.video ? (
                    /* Video Player */
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-xl group">
                      <div className="relative w-full pt-[56.25%]">
                        <video
                          ref={(el) => (videoRefs.current[news.id] = el)}
                          src={news.video}
                          className="absolute top-0 left-0 w-full h-full object-cover"
                          playsInline
                        />
                        <button
                          onClick={() => toggleVideo(news.id)}
                          className="absolute inset-0 w-full h-full flex items-center justify-center group"
                          aria-label="Play/Pause video"
                        >
                          <div
                            className={`w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center rounded-full bg-[#FECC00] transform transition-transform duration-200 ${playingVideo === news.id ? "scale-0" : "scale-100 group-hover:scale-110"}`}
                          >
                            {playingVideo === news.id ? (
                              <FaPause className="w-4 h-4 sm:w-6 sm:h-6 text-black" />
                            ) : (
                              <FaPlay className="w-4 h-4 sm:w-6 sm:h-6 text-black translate-x-0.5" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* Enhanced Hero Image */
                    <div className="relative rounded-lg sm:rounded-xl overflow-hidden shadow-md sm:shadow-xl group">
                      <img
                        src={news.images.hero}
                        alt={news.title}
                        className="w-full aspect-video object-cover transform transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <h3 className="text-white text-sm sm:text-base font-medium">
                          {news.title}
                        </h3>
                      </div>
                    </div>
                  )}

                  {/* Enhanced Image Gallery */}
                  <div className="grid grid-cols-2 gap-2 sm:gap-4">
                    {news.images.gallery.map((img, index) => (
                      <motion.div
                        key={index}
                        className="relative rounded-md sm:rounded-lg overflow-hidden shadow-md sm:shadow-lg group"
                        whileHover={{ scale: 1.03, y: -5 }}
                        transition={{ duration: 0.3 }}
                      >
                        <img
                          src={img}
                          alt={`${news.title} - ${index + 1}`}
                          className="w-full h-32 sm:h-48 object-cover transform transition-transform duration-500 group-hover:scale-110"
                        />
                        <div
                          className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0
                                      group-hover:opacity-100 transition-opacity duration-300"
                        />
                        <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                          <span className="text-white text-xs sm:text-sm font-medium">
                            {news.title} - Image {index + 1}
                          </span>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Text Content - Now on the right */}
                <div className="lg:col-span-5 space-y-4 sm:space-y-6 order-2 mt-4 lg:mt-0">
                  <div className="bg-white p-4 sm:p-6 rounded-lg sm:rounded-xl shadow-sm border border-gray-100">
                    <div className="prose prose-sm sm:prose-base md:prose-lg max-w-none">
                      <p className="text-gray-700 text-sm sm:text-base leading-relaxed mb-4 sm:mb-6">
                        {news.content}
                      </p>

                      {/* Additional metadata */}
                      <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-8">
                        <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full">
                          <FiTag className="mr-1 sm:mr-1.5 text-[#FECC00]" />
                          {news.category}
                        </span>
                        {news.excerpt && (
                          <span className="inline-flex items-center px-2 sm:px-3 py-1 bg-gray-100 text-gray-700 text-xs sm:text-sm rounded-full">
                            <FiExternalLink className="mr-1 sm:mr-1.5 text-[#FECC00]" />
                            Press Release
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Navigation between news items */}
              {index < newsData.length - 1 && (
                <div className="mt-8 sm:mt-12 md:mt-16 pt-4 sm:pt-6 md:pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    {index > 0 && (
                      <button
                        onClick={() => scrollToNews(index - 1)}
                        className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-gray-600 hover:text-[#FECC00] transition-colors py-2 px-3 sm:px-4 rounded-full hover:bg-gray-100"
                      >
                        <FaChevronLeft className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                        <span>Previous</span>
                      </button>
                    )}
                    <div className="flex-1"></div>
                    <button
                      onClick={() => scrollToNews(index + 1)}
                      className="flex items-center gap-1 sm:gap-2 text-sm sm:text-base text-gray-600 hover:text-[#FECC00] transition-colors py-2 px-3 sm:px-4 rounded-full hover:bg-gray-100"
                    >
                      <span>Next</span>
                      <FaChevronRight className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        ))}
      </div>
    </>
  );
};

export default News;
