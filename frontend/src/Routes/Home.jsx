import React, { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import BrochureModal from "../Components/BrochureModal";
import SEO from "../Components/SEO";
import MapPage from "../Components/MapPage";
import ProductRange from "../Components/ProductRange";
import { FaArrowRight, FaChevronDown, FaHeadset } from "react-icons/fa";
import "swiper/css";
import "swiper/css/effect-fade";

// Import mixer images
import slide1 from "../assets/alafa-images/97843  (10).webp";
import slide2 from "../assets/alafa-images/White-Pump.webp";
import slide3 from "../assets/alafa-images/97843.webp";
import slide4 from "../assets/alafa-images/97843  (16).webp";
import slide5 from "../assets/alafa-images/97843  (15).webp";
import slide6 from "../assets/alafa-images/(22).jpg";

// Import mobile images
import mobileSlide1 from "../assets/mobile/Yellow.png";
import mobileSlide2 from "../assets/mobile/Second.png";
import mobileSlide3 from "../assets/mobile/third.png";
import mobileSlide4 from "../assets/mobile/fourth.png";
import mobileSlide5 from "../assets/mobile/Fifth.png";
import mobileSlide6 from "../assets/mobile/Six.png";

const slides = [
  {
    bgImage: slide1,
    mobileImage: mobileSlide1,
    subtitle: "Innovation in Motion",
    title: "Advanced Mixing Solutions",
    description:
      "Experience unparalleled mixing performance with our state-of-the-art concrete mixers.",
  },
  {
    bgImage: slide2,
    mobileImage: mobileSlide2,
    subtitle: "Engineering Excellence",
    title: "Premium Quality",
    description:
      "Built with precision engineering to deliver consistent, high-quality results every time.",
  },
  {
    bgImage: slide3,
    mobileImage: mobileSlide3,
    subtitle: "Industrial Power",
    title: "Robust Performance",
    description:
      "Heavy-duty construction equipment designed for maximum durability and efficiency.",
  },
  {
    bgImage: slide4,
    mobileImage: mobileSlide4,
    subtitle: "Next Generation",
    title: "Smart Technology",
    description:
      "Incorporating cutting-edge technology for optimal mixing control and operation.",
  },
  {
    bgImage: slide5,
    mobileImage: mobileSlide5,
    subtitle: "Versatile Solutions",
    title: "Adaptable Design",
    description:
      "Flexible mixing solutions to meet diverse construction project requirements.",
  },
  {
    bgImage: slide6,
    mobileImage: mobileSlide6,
    subtitle: "Manufacturing Precision",
    title: "Expert Craftsmanship",
    description:
      "Each mixer is crafted with meticulous attention to detail, ensuring superior build quality and reliability.",
  },
];

const faqs = [
  {
    question: "What types of construction equipment does Alfanio manufacture?",
    answer:
      "Alfanio manufactures concrete pumps, concrete mixers, batching plant solutions, twin shaft mixers, planetary mixers, and related construction equipment for domestic and export markets.",
  },
  {
    question: "Do you provide support after installation?",
    answer:
      "Yes. The team provides technical guidance, service support, spare parts assistance, and product-specific help after installation.",
  },
  {
    question: "Can I request a brochure before speaking with sales?",
    answer:
      "Yes. You can download the brochure from the home page. Submitting the form helps the team understand your requirement and follow up with relevant details.",
  },
  {
    question: "Do you export equipment outside India?",
    answer:
      "Yes. Alfanio supports international requirements and has experience with export markets including high-performance concrete pumping applications.",
  },
  {
    question: "How can I choose the right machine for my project?",
    answer:
      "Share your project type, output requirement, site conditions, and preferred application. The Alfanio team can recommend a suitable model based on your work needs.",
  },
];

const Home = () => {
  const [swiper, setSwiper] = useState(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(0);

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
        className="relative h-[calc(82vh-80px)] sm:h-[calc(100vh-80px)] overflow-hidden"
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
                    className="hidden md:block w-full h-full object-cover"
                    loading="eager"
                  />
                  <img
                    src={slide.mobileImage}
                    alt={slide.title}
                    className="md:hidden w-full h-full object-cover"
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

      {/* FAQ Section */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        id="faq"
        className="relative overflow-hidden bg-[#111111] py-16 sm:py-24"
      >
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FECC00]/70 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(254,204,0,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_38%)]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[0.9fr_1.4fr] gap-10 lg:gap-14 items-start">
            <div className="lg:sticky lg:top-28">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#FECC00]/30 bg-[#FECC00]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[3px] text-[#FECC00]">
                <FaHeadset className="h-3.5 w-3.5" />
                FAQ
              </div>
              <h2 className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight text-white">
                Answers before your next machine decision.
              </h2>
              <p className="mt-5 text-base leading-8 text-white/70">
                Quick clarity on product selection, support, exports, and brochure
                requests so your team can move faster.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-3">
                <div className="border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-2xl font-bold text-[#FECC00]">24/7</p>
                  <p className="mt-1 text-xs uppercase tracking-[2px] text-white/55">
                    Support Focus
                  </p>
                </div>
                <div className="border border-white/10 bg-white/[0.06] p-4">
                  <p className="text-2xl font-bold text-[#FECC00]">Global</p>
                  <p className="mt-1 text-xs uppercase tracking-[2px] text-white/55">
                    Export Ready
                  </p>
                </div>
              </div>

              <a
                href="/contact"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#FECC00] px-6 py-3 text-sm font-bold uppercase tracking-wider text-black transition-transform duration-300 hover:scale-[1.03]"
              >
                Talk To Expert
                <FaArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openFaqIndex === index;

                return (
                  <div
                    key={faq.question}
                    className={`border transition-all duration-300 ${
                      isOpen
                        ? "border-[#FECC00]/55 bg-white text-gray-900 shadow-2xl shadow-black/25"
                        : "border-white/10 bg-white/[0.06] text-white hover:border-[#FECC00]/35 hover:bg-white/[0.09]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? -1 : index)}
                      className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-5 sm:py-6 text-left"
                      aria-expanded={isOpen}
                    >
                      <span className="flex items-start gap-4">
                        <span
                          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center border text-xs font-bold ${
                            isOpen
                              ? "border-black/10 bg-[#FECC00] text-black"
                              : "border-[#FECC00]/30 bg-[#FECC00]/10 text-[#FECC00]"
                          }`}
                        >
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <span className="text-base sm:text-lg font-semibold leading-7">
                          {faq.question}
                        </span>
                      </span>
                      <span
                        className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full transition-colors duration-300 ${
                          isOpen ? "bg-black text-[#FECC00]" : "bg-white/10 text-[#FECC00]"
                        }`}
                      >
                        <FaChevronDown
                          className={`h-4 w-4 transition-transform duration-300 ${
                            isOpen ? "rotate-180" : ""
                          }`}
                        />
                      </span>
                    </button>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 sm:px-7 pb-6 sm:pb-7">
                            <div className="ml-12 border-l-2 border-[#FECC00] pl-5">
                              <p className="text-sm sm:text-base leading-7 text-gray-600">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </motion.section>
    </>
  );
};

export default Home;
