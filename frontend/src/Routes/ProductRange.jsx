import React from "react";
import { motion } from "framer-motion";
import { Helmet } from "react-helmet-async";
import ProductRange from "../Components/ProductRange";

const ProductRangePage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Helmet>
        <title>Our Products - Alfanio LTD</title>
        <meta
          name="description"
          content="Explore our range of high-quality construction equipment including concrete pumps, mixers, and more."
        />
      </Helmet>

      {/* Hero Section */}
      <section className="relative h-[40vh] bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50" />
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#FECC00] mb-4">
              Our Product Range
            </h1>
            <p className="text-lg md:text-xl text-white/90 max-w-2xl">
              Discover our comprehensive range of construction equipment
              engineered for excellence and reliability.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Product Range Component */}
      <ProductRange />
    </div>
  );
};

export default ProductRangePage;
