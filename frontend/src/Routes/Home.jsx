import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import BrochureModal from "../Components/BrochureModal";
import SEO from "../Components/SEO";
import MapPage from "../Components/MapPage";
import ProductRange from "../Components/ProductRange";
import "swiper/css";
import "swiper/css/effect-fade";
import alfanioLogo from "../assets/Alfanio.png";

// Import mixer images
import slide1 from "../assets/alafa-images/97843  (10).webp";
import slide2 from "../assets/alafa-images/White-Pump.webp";
import slide3 from "../assets/alafa-images/97843.webp";
import slide4 from "../assets/alafa-images/97843  (16).webp";
import slide5 from "../assets/alafa-images/97843  (15).webp";
import slide6 from "../assets/alafa-images/(22).jpg";

const slides = [
  {
    bgImage: slide1,
    subtitle: "Innovation in Motion",
    title: "Advanced Mixing Solutions",
    description:
      "Experience unparalleled mixing performance with our state-of-the-art concrete mixers.",
  },
  {
    bgImage: slide2,
    subtitle: "Engineering Excellence",
    title: "Premium Quality",
    description:
      "Built with precision engineering to deliver consistent, high-quality results every time.",
  },
  {
    bgImage: slide3,
    subtitle: "Industrial Power",
    title: "Robust Performance",
    description:
      "Heavy-duty construction equipment designed for maximum durability and efficiency.",
  },
  {
    bgImage: slide4,
    subtitle: "Next Generation",
    title: "Smart Technology",
    description:
      "Incorporating cutting-edge technology for optimal mixing control and operation.",
  },
  {
    bgImage: slide5,
    subtitle: "Versatile Solutions",
    title: "Adaptable Design",
    description:
      "Flexible mixing solutions to meet diverse construction project requirements.",
  },
  {
    bgImage: slide6,
    subtitle: "Manufacturing Precision",
    title: "Expert Craftsmanship",
    description:
      "Each mixer is crafted with meticulous attention to detail, ensuring superior build quality and reliability.",
  },
];

const Home = () => {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    // Handle mobile viewport height
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };

    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  const handleSlideChange = (swiper) => {
    setActiveIndex(swiper.realIndex);
  };

  const handleBrochureClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <SEO
        title="Alfanio LTD - Global Construction Equipment Solutions | Home"
        description="Discover Alfanio's world-class construction equipment solutions. Leading manufacturer of mixers, batch plants, and construction machinery since 1963."
        keywords="construction equipment, mixers, batch plants, construction machinery, Alfanio solutions, global construction"
      />

      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        id="home"
        className="relative h-[calc(100vh-80px)] overflow-hidden"
      >
        <Swiper
          onSwiper={setSwiper}
          modules={[Autoplay, EffectFade]}
          effect="fade"
          speed={1000}
          loop={true}
          autoplay={{
            delay: 5000,
            disableOnInteraction: false,
          }}
          onSlideChange={handleSlideChange}
          className="w-full h-full"
        >
          {slides.map((slide, index) => (
            <SwiperSlide key={index} className="!h-full">
              <div className="relative w-full h-full">
                {/* Background Image with Zoom Effect */}
                <motion.div
                  className="absolute inset-0 w-full h-full"
                  initial={{ scale: 1 }}
                  animate={{
                    scale: index === activeIndex ? 1.1 : 1,
                    opacity: index === activeIndex ? 1 : 0,
                  }}
                  transition={{
                    scale: { duration: 6, ease: "easeOut" },
                    opacity: { duration: 1, ease: "easeInOut" },
                  }}
                >
                  <img
                    src={slide.bgImage}
                    alt={slide.title}
                    className="w-full h-full  object-cover"
                    loading="eager"
                  />
                </motion.div>

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 z-[1]" />

                {/* Content Container */}
                <div className="relative h-full flex flex-col justify-center px-4 sm:px-6 md:px-[10%] z-[2]">
                  <AnimatePresence mode="wait">
                    {activeIndex === index && (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{
                          duration: 0.4,
                          ease: "easeOut",
                        }}
                        className="max-w-[600px] space-y-4 sm:space-y-6"
                      >
                        <h2 className="text-base sm:text-lg md:text-xl text-white uppercase tracking-[2px] sm:tracking-[3px]">
                          {slide.subtitle}
                        </h2>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-[#FECC00]">
                          {slide.title}
                        </h1>
                        <p className="text-sm sm:text-base md:text-lg text-white max-w-full sm:max-w-[90%] md:max-w-[80%]">
                          {slide.description}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation */}
        <div className="absolute bottom-24 sm:bottom-28 md:bottom-32 left-1/2 -translate-x-1/2 z-20 flex gap-1 sm:gap-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => swiper?.slideTo(index)}
              className="relative w-8 sm:w-10 md:w-12 h-1 bg-white/30 overflow-hidden"
            >
              <div
                className={`absolute inset-0 bg-[#FECC00] transition-transform duration-500
                  ${index === activeIndex ? "translate-x-0" : index < activeIndex ? "translate-x-full" : "-translate-x-full"}`}
              />
            </button>
          ))}
        </div>

        {/* Brochure Button */}
        <div className="absolute bottom-0 left-0 right-0 z-20 flex justify-center items-center pb-8">
          <motion.button
            onClick={handleBrochureClick}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="px-6 py-4 bg-[#FECC00] font-semibold uppercase tracking-wider
              hover:bg-[#FECC00] hover:text-black transition-all duration-500 rounded-full
              text-sm sm:text-base whitespace-nowrap shadow-lg hover:shadow-xl
              transform hover:scale-105 active:scale-100"
          >
            Download Brochure
          </motion.button>
        </div>

        <BrochureModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
      </motion.section>

      {/* Map Section */}
      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        id="map"
        className="h-60vh"
      >
        <MapPage />
      </motion.section>

      {/* Product Range Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        id="products"
        className="min-h-[calc(100vh-80px)]"
      >
        <ProductRange />
      </motion.section>
    </>
  );
};

export default Home;
