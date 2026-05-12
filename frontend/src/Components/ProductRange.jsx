import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { FaArrowRight, FaBolt, FaCogs, FaIndustry } from "react-icons/fa";
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
      eyebrow: "High Output Pumping",
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
      eyebrow: "Heavy Duty Mixing",
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
      eyebrow: "Precision Batch Quality",
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
        duration: 0.55,
        ease: "easeOut",
      },
    },
  };

  return (
    <section
      id="product-range"
      className="relative overflow-hidden bg-white py-16 sm:py-20 lg:py-24"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#FECC00]/80 to-transparent" />
      <div className="absolute left-0 top-0 h-72 w-full bg-[radial-gradient(circle_at_top,rgba(254,204,0,0.16),transparent_42%)]" />

      <div className="container relative mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="mx-auto mb-12 max-w-4xl text-center md:mb-16"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#FECC00]/45 bg-[#FECC00]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#b08a00]">
            <FaIndustry className="text-sm" />
            Our Solutions
          </div>
          <h2 className="text-4xl font-bold leading-tight text-[#202024] md:text-5xl lg:text-6xl">
            Products Range
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-gray-600 md:text-lg">
            Discover high-performance concrete equipment engineered for
            reliability, output consistency, and demanding site conditions.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="mx-auto grid max-w-7xl grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 lg:gap-8"
        >
          {products.map((product, index) => (
            <motion.div
              key={product.id}
              variants={cardVariants}
              className="group relative flex min-h-[540px] w-full flex-col overflow-hidden rounded-lg border border-black/10 bg-white shadow-xl shadow-black/10 transition-all duration-500 hover:-translate-y-2 hover:border-[#FECC00]/70 hover:shadow-2xl hover:shadow-black/20"
            >
              <div className="absolute left-0 top-0 z-20 flex h-14 w-14 items-center justify-center rounded-br-lg bg-[#FECC00] text-lg font-black text-[#202024] shadow-lg shadow-black/20">
                {String(index + 1).padStart(2, "0")}
              </div>

              <div className="relative h-[300px] overflow-hidden bg-[#ececea]">
                <div className="absolute inset-x-0 bottom-0 z-10 h-24 bg-gradient-to-t from-black/35 to-transparent opacity-80" />
                <div className="absolute right-4 top-4 z-20 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#202024] shadow-sm">
                  Premium
                </div>
                <div className="relative flex h-full w-full items-center justify-center p-7">
                  <LazyLoadImage
                    src={product.image}
                    alt={product.title}
                    effect="opacity"
                    className="h-full w-full object-contain drop-shadow-2xl transition-transform duration-700 ease-out group-hover:scale-105"
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
              </div>

              <div className="flex flex-1 flex-col p-6">
                <div>
                  <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#b08a00]">
                    <FaCogs />
                    {product.eyebrow}
                  </div>
                  <h3 className="text-2xl font-bold leading-tight text-[#202024] transition-colors group-hover:text-[#b08a00]">
                    {product.title}
                  </h3>

                  <div className="mt-5 space-y-3">
                    {product.description.slice(0, 4).map((spec, index) => (
                      <div
                        key={index}
                        className="flex items-center rounded-md border border-black/5 bg-[#f7f7f4] px-4 py-3"
                      >
                        <span className="mr-3 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-md bg-[#FECC00] text-[#202024]">
                          <FaBolt className="text-xs" />
                        </span>
                        <span
                          className="text-sm font-semibold text-gray-700"
                          dangerouslySetInnerHTML={{ __html: spec }}
                        ></span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-2">
                    <span className="rounded-md border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                      {product.specs.usage}
                    </span>
                    <span className="rounded-md border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                      {product.specs.automation || product.specs.controlSystem}
                    </span>
                    <span className="rounded-md border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                      {product.specs.material}
                    </span>
                    <span className="rounded-md border border-black/5 bg-white px-3 py-2 text-xs font-semibold text-gray-600 shadow-sm">
                      Electric Drive
                    </span>
                  </div>
                </div>

                <motion.button
                  type="button"
                  onClick={() => handleExploreMore(product.id)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="group mt-7 inline-flex w-full items-center justify-center gap-3 rounded-md bg-[#FECC00] px-6 py-3.5 text-sm font-bold uppercase tracking-[0.12em] text-[#202024] shadow-lg shadow-black/15 transition-all duration-300 hover:bg-[#e3b700] focus:outline-none focus:ring-2 focus:ring-[#FECC00] focus:ring-offset-2"
                >
                  <span>View Details</span>
                  <FaArrowRight className="text-xs transition-transform duration-300 group-hover:translate-x-1" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <div className="mx-auto mt-10 grid max-w-7xl grid-cols-1 gap-4 rounded-lg border border-black/10 bg-white p-4 shadow-xl shadow-black/5 sm:grid-cols-3 sm:p-5">
          {[
            ["Engineered", "For demanding concrete applications"],
            ["Automatic", "Reliable operation and consistent output"],
            ["Service Ready", "Support for spares and technical guidance"],
          ].map(([title, text]) => (
            <div key={title} className="border-black/10 px-3 py-2 sm:border-r last:border-r-0">
              <p className="text-sm font-bold uppercase tracking-[0.16em] text-[#b08a00]">
                {title}
              </p>
              <p className="mt-1 text-sm text-gray-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductRange;
