import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import ConcretePump from "../assets/alafa-images/(16).webp";
import TwinShaftMixer from "../assets/product Reang/Twine shaft Mixer/Twin-Shaft-Concrete-Mixer.jpg";
import PlanetaryMixer from "../assets/product Reang/Planetary-Concrete-Mixer/APM-Series-Planetary-Concrete-Mixer.jpg";

const ProductRange = () => {
  const navigate = useNavigate();
  const products = [
    {
      id: "concrete-pump",
      title: "Concrete Pumps",
      image: ConcretePump,
      description: ["Range : 40m<sup>3</sup> to 90m<sup>3</sup>"],
      specs: {
        usage: "Industrial",
        material: "Steel",
        automation: "Automatic",
        powerSource: "Electric",
      },
    },
    {
      id: "twin-shaft-mixer",
      title: "Twin Shaft Concrete Mixers",
      image: TwinShaftMixer,
      description: ["Range : 0.5m<sup>3</sup> to 4.5m<sup>3</sup>"],
      specs: {
        usage: "Industrial",
        material: "Steel",
        automation: "Automatic",
        powerSource: "Electric",
      },
    },
    {
      id: "apm-series-planetary-mixer",
      title: "Planetary Concrete Mixers",
      image: PlanetaryMixer,
      description: ["Range : 0.5m<sup>3</sup> to 2m<sup>3</sup>"],
      specs: {
        usage: "Industrial",
        material: "Steel",
        controlSystem: "PLC Control",
        powerSource: "Electric IN Space Of voltage",
      },
    },
  ];

  const handleExploreMore = (productId) => {
    navigate(`/product/${productId}`);
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="product-range"
      className="min-h-[calc(100vh-80px)] bg-gradient-to-b from-gray-50 to-white flex items-center py-16"
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 md:mb-20"
        >
          <div className="inline-block mb-3">
            <span className="bg-[#FECC00]/20 text-[#FECC00] text-sm font-semibold py-1 px-3 rounded-full">
              Our Solutions
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold mb-5 text-zinc-800">
            Products Range
          </h2>
          <div className="w-24 h-1 bg-[#FECC00] mx-auto mb-6"></div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our range of high-quality concrete equipment, <br />
            engineered for superior performance and reliability.
          </p>
        </motion.div>
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {products.map((product) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="group relative bg-white rounded-xl overflow-hidden transform hover:-translate-y-2 hover:shadow-xl hover:shadow-[#FECC00]/10 transition-all duration-300 flex flex-col w-full h-[500px] border-2 border-[#FECC00]"
              style={{
                boxShadow: "0 10px 30px rgba(0, 0, 0, 0.05)",
              }}
            >
              {/* Image Container with improved styling */}
              <div className="relative h-[280px] overflow-hidden bg-gray-50">
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
                <div className="relative w-full h-full p-6 flex items-center justify-center">
                  <LazyLoadImage
                    src={product.image}
                    alt={product.title}
                    effect="opacity"
                    className="w-full h-full object-contain transform group-hover:scale-105 transition-transform duration-500 ease-out"
                    wrapperClassName="w-full h-full"
                    placeholderSrc={product.image}
                    threshold={100}
                    style={{
                      objectFit: "contain",
                      width: "100%",
                      height: "100%",
                    }}
                  />
                </div>

                {/* Product Badge with improved styling */}
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3 py-1.5 bg-white/95 backdrop-blur-sm rounded-full text-xs font-medium text-[#FECC00] shadow-sm border border-gray-100">
                    {product.specs.model || product.title}
                  </span>
                </div>

                {/* New feature tag */}
                <div className="absolute top-4 right-4 z-20">
                  <span className="px-3 py-1 bg-[#FECC00] text-zinc-900 text-xs font-semibold rounded-full shadow-sm">
                    Premium
                  </span>
                </div>
              </div>

              {/* Content with improved styling */}
              <div className="p-6 flex-grow flex flex-col justify-between bg-white border-t border-gray-100">
                {/* Product Title with improved styling */}
                <div>
                  <h3 className="text-lg sm:text-xl font-bold mb-3 text-[#FECC00]  group-hover:text-[#FECC00] transition-colors">
                    {product.title}
                  </h3>

                  {/* Specs with improved styling */}
                  <div className="mb-6">
                    {product.description.slice(0, 4).map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center py-1.5 border-b border-gray-100 last:border-0"
                      >
                        <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-3 flex-shrink-0"></span>
                        <span
                          className="text-sm text-gray-600"
                          dangerouslySetInnerHTML={{ __html: spec }}
                        ></span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Button with improved styling */}
                <motion.button
                  onClick={() => handleExploreMore(product.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full bg-[#FECC00] px-6 py-3.5 rounded-lg text-sm font-semibold
                    hover:bg-[#FECC00] hover:text-zinc-900 transition-all duration-300 mt-auto flex items-center justify-center space-x-2 group shadow-sm"
                >
                  <span>View Details</span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 transform group-hover:translate-x-1 transition-transform"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default ProductRange;
