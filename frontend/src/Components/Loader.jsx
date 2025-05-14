import React from 'react';
import { motion } from 'framer-motion';
import alfanioLogo from '../assets/Alfanio.png';
import '../styles/fonts.css';

const Loader = ({ onAnimationComplete }) => {
  const letters = "ALFANIO".split("");

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[9999]"
      initial={{ backgroundColor: '#27272A' }}
      animate={{ backgroundColor: 'rgba(39, 39, 42, 0)' }}
      transition={{ duration: 0.8, delay: 3 }}
    >
      <div className="flex flex-col items-center">
        <motion.div
          className="w-48 h-48"
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2.5,
            ease: [0.4, 0, 0.2, 1],
          }}
          onAnimationComplete={onAnimationComplete}
        >
          <img 
            src={alfanioLogo} 
            alt=""
            className="w-full h-full object-contain"
          />
        </motion.div>
        <div className="mt-6 flex">
          {letters.map((letter, index) => (
            <motion.span
              key={index}
              className="text-white text-6xl tracking-[0.15em] uppercase"
              style={{
                fontFamily: 'Cocon-Bold, sans-serif',
                letterSpacing: '0.15em',
                WebkitTextStroke: '1px #ffffff',
                filter: 'drop-shadow(0 0 2px rgba(255, 255, 255, 0.3))'
              }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ 
                opacity: 1, 
                y: 0,
                rotateY: [0, 360],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 1,
                delay: index * 0.15,
                ease: "easeOut",
                rotateY: {
                  duration: 1.2,
                  delay: index * 0.15,
                  ease: "easeInOut"
                },
                scale: {
                  duration: 1,
                  delay: index * 0.15,
                  ease: "easeInOut"
                }
              }}
            >
              {letter}
            </motion.span>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Loader;
