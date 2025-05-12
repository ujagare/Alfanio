import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
// Import images using relative paths that will be resolved at runtime
// instead of build time
import { Route, Routes } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import About from "../Routes/About";

// Define image paths that will be resolved at runtime
const Logo = new URL("../assets/Alfanio.png", import.meta.url).href;
const MapImage = new URL("../assets/map.png", import.meta.url).href;

const CountingNumber = ({ endNumber, duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const countRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (countRef.current) {
      observer.observe(countRef.current);
    }

    return () => {
      if (countRef.current) {
        observer.unobserve(countRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    let startNumber = 0;
    const endNum = parseInt(endNumber.replace(/\D/g, ""));
    const increment = endNum / (duration / 16);
    const startTime = Date.now();

    const updateCount = () => {
      const currentTime = Date.now();
      const elapsedTime = currentTime - startTime;

      if (elapsedTime < duration) {
        startNumber = Math.min(
          Math.floor((increment * elapsedTime) / 16),
          endNum
        );
        setCount(startNumber);
        requestAnimationFrame(updateCount);
      } else {
        setCount(endNum);
      }
    };

    requestAnimationFrame(updateCount);
  }, [isVisible, endNumber, duration]);

  return (
    <div ref={countRef} className="font-bold text-3xl">
      {count}
      {endNumber.includes("+") ? "+" : ""}
    </div>
  );
};

const MapLocation = ({ country, x, y, index }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: index * 0.2 }}
      className="absolute group cursor-pointer"
      style={{ left: x, top: y }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Multiple pulsing rings */}
      <motion.div
        className="w-4 h-4 sm:w-6 sm:h-6 bg-[#FECC00] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.2, 0.1, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="w-3 h-3 sm:w-5 sm:h-5 bg-[#FECC00] rounded-full absolute -translate-x-1/2 -translate-y-1/2"
        animate={{
          scale: [1, 2, 1],
          opacity: [0.5, 0.2, 0.5],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.5,
        }}
      />
      {/* Center dot with glow */}
      <div className="w-2 h-2 sm:w-3 sm:h-3 bg-[#FECC00] rounded-full relative shadow-[0_0_10px_#FECC00] z-10" />

      {/* Country name tooltip - visible on all devices */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{
          opacity: isHovered ? 1 : 0,
          y: isHovered ? -20 : -10,
        }}
        className="absolute bg-[#FECC00] text-black px-2 py-1 rounded text-[10px] sm:text-xs whitespace-nowrap -translate-x-1/2 block z-[10] shadow-lg"
        style={{
          maxWidth: "80px",
          overflow: "hidden",
          textOverflow: "ellipsis",
          textAlign: "center",
        }}
      >
        {country}
      </motion.div>

      {/* Mobile tooltip that shows on tap */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        whileTap={{
          opacity: 1,
          scale: 1,
          transition: { duration: 0.2 },
        }}
        className="absolute bg-[#FECC00] text-black px-2 py-1 rounded text-[10px] whitespace-nowrap -translate-x-1/2 -translate-y-10 block sm:hidden z-[10] shadow-lg"
      >
        {country}
      </motion.div>
    </motion.div>
  );
};

const StatCircle = ({ stat, index }) => (
  <motion.div
    initial={{ scale: 0, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ delay: index * 0.2 }}
    className="flex flex-col items-center"
  >
    <motion.div
      whileHover={{ scale: 1.05 }}
      className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 bg-[#FECC00] rounded-full flex items-center justify-center shadow-lg relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ y: "100%" }}
        whileHover={{ y: 0 }}
        transition={{ type: "tween" }}
        style={{ opacity: 0.1 }}
      />
      <div className="text-xl sm:text-2xl md:text-3xl font-bold">
        <CountingNumber endNumber={stat.number} duration={2000} />
      </div>
    </motion.div>
    <motion.h2
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.2 + 0.3 }}
      className="text-[#FECC00] text-sm sm:text-base md:text-lg font-semibold mt-2 sm:mt-3 text-center px-2"
    >
      {stat.text}
    </motion.h2>
  </motion.div>
);

const MapPage = () => {
  const locations = [
    { country: "South Korea", x: "82%", y: "35%" },
    { country: "South Africa", x: "52%", y: "73%" },
    { country: "India", x: "70%", y: "46%" },
    { country: "USA", x: "17%", y: "32%" },
    { country: "Nepal", x: "70%", y: "43%" },
    { country: "Kenya", x: "57%", y: "60%" },
    { country: "Tanzania", x: "56%", y: "65%" },
    { country: "Somalia", x: "58%", y: "57%" },
    { country: "Bangladesh", x: "72%", y: "44%" },
    { country: "Congo", x: "53%", y: "63%" },
  ];

  const stats = [
    { number: "25", text: "Years of Experience" },
    { number: "35+", text: "Manpower Strength" },
    { number: "12+", text: "Countries" },
    { number: "125+", text: "Equipment Supplied" },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="w-full min-h-[60vh] lg:h-[50vh] bg-[#27272A] flex items-center py-8 lg:py-0 relative"
    >
      <div className="w-full h-full flex flex-col lg:flex-row overflow-hidden">
        {/* Logo and Welcome Section */}
        <motion.div
          initial={{ x: -50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:w-[25%] flex items-center justify-center flex-col px-4 py-6 lg:py-0"
        >
          <motion.img
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="w-[40%] sm:w-[50%] lg:w-[30%] h-fit object-cover  mb-28"
            src={Logo}
            alt="Alfanio Logo"
          />
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white text-5xl sm:text-3xl lg:text-5xl tracking-wider  ml-10 mt-24 lg:mt-8 text-center lg:top-[48%] absolute  uppercase mr-10 "
            style={{
              fontFamily: "Cocon-Bold, sans-serif",
              WebkitTextStroke: "1px #ffffff",
            }}
          >
            Alfanio
          </motion.h1>
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="text-white text-2xl sm:text-3xl lg:text-4xl font-semibold mb-10 ml-10 mt-0 lg:top-[15%] text-center absolute top-[1%] uppercase mr-10 "
          >
            Welcome To
          </motion.h1>
        </motion.div>

        {/* Map Section */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="w-full lg:w-[45%] flex items-center justify-center px-4 py-8 lg:py-0 lg:ml-10 relative"
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.7 }}
            className="w-full h-auto object-contain"
            src={MapImage}
            alt="World Map"
          />
          {locations.map((loc, index) => (
            <MapLocation key={index} {...loc} index={index} />
          ))}
        </motion.div>

        {/* Stats Section */}
        <motion.div
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full lg:w-[30%] flex flex-col items-center justify-center gap-6 lg:gap-8 py-8 lg:py-0"
        >
          <div className="grid grid-cols-2 gap-4 sm:gap-6 lg:gap-8 px-4">
            {stats.map((stat, index) => (
              <StatCircle key={index} stat={stat} index={index} />
            ))}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default MapPage;
