import React, { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { motion } from "framer-motion";
import { FaArrowLeft } from "react-icons/fa";
// Import product data
import products from "..\Data\products";
import { fadeInUp } from "..\Animation\animation";
import "../styles/ProductGallery.css";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import ContactForm from "..\Components\ContactForm";

// Import product images
import twinShaftMixer from "..\assets\product Reang\Twine shaft Mixer\Twin-Shaft-Concrete-Mixer.jpg";
import planetaryMixer from "..\assets\product Reang\Planetary-Concrete-Mixer\APM-Series-Planetary-Concrete-Mixer.jpg";
import apmImg1 from "..\assets\product Reang\Planetary-Concrete-Mixer\extra-08920027.jpg";
import apmImg2 from "..\assets\product Reang\Planetary-Concrete-Mixer\extra-08920028.jpg";
import apmImg3 from "..\assets\product Reang\Planetary-Concrete-Mixer\extra-08920029.jpg";
import twinShaftMixer2 from "..\assets\product Reang\Twine shaft Mixer\Twin-Shaft-Concrete-Mixer.jpg";
import pumpImg1 from "..\assets\alafa-images\IMG_20211119_115836 (8).webp";
import pumpImg2 from "..\assets\alafa-images\20211116_114205 (2) - Copy.webp";
import pumpImg3 from "..\assets\alafa-images\IMG_20211119_115836 (3).webp";
import twinShaftImg1 from "..\assets\alafa-images\Twin-Shaft-Concrete-Mixer.jpg";
import twinShaftImg2 from "..\assets\alafa-images\20211127_151512 (7).webp";
import twinShaftImg3 from "..\assets\alafa-images\20211127_151512 (12).webp";
import concreteMixer1 from "..\assets\concret-mixer\1.jpg";
import concreteMixer2 from "..\assets\concret-mixer\2.jpg";
import concreteMixer3 from "..\assets\concret-mixer\3.jpg";
import concreteMixer4 from "..\assets\concret-mixer\4.jpg";
import concreteMixer5 from "..\assets\concret-mixer\5.jpg";

const productImages = {
  "concrete-pump": [
    { src: pumpImg1, alt: "Concrete Pump View 1" },
    { src: pumpImg2, alt: "Concrete Pump View 2" },
    { src: pumpImg3, alt: "Concrete Pump View 3" },
  ],
  "_twin-shaft-mixer": [
    { src: twinShaftImg1, alt: "Twin Shaft Mixer Main View" },
    { src: twinShaftImg2, alt: "Twin Shaft Mixer View 2" },
    { src: twinShaftImg3, alt: "Twin Shaft Mixer View 3" },
  ],
  get "twin-shaft-mixer"() {
    return this["_twin-shaft-mixer"];
  },
  set "twin-shaft-mixer"(value) {
    this["_twin-shaft-mixer"] = value;
  },
  "apm-series-planetary-mixer": [
    { src: apmImg1, alt: "APM Series View 1" },
    { src: apmImg2, alt: "APM Series View 2" },
    { src: apmImg3, alt: "APM Series View 3" },
  ],
  "concrete-mixer": [
    { src: concreteMixer1, alt: "Concrete Mixer View 1" },
    { src: concreteMixer2, alt: "Concrete Mixer View 2" },
    { src: concreteMixer3, alt: "Concrete Mixer View 3" },
    { src: concreteMixer4, alt: "Concrete Mixer View 4" },
    { src: concreteMixer5, alt: "Concrete Mixer View 5" },
  ],
};

const pumpDescriptions = {
  "concrete-pump": {
    intro: `The CPH series concrete pumps, include:`,
    features: [
      `❖	CPH50 – compact pump for output up to 50m3 per hour and 100m vertical.`,
      `❖	CPH70 – compact pump for output of up to 70m3 per hour and 150m vertical.`,
      `❖	CPH 70 HRX – very compact pump for output up to 70m3 per hour and 200m vertical.`,
    ],
    description: `All pumps are manufactured to handle harsh working conditions and can also be supplied with specialize wear parts for longer life in the regions where there is a history of high wear and tear.
These pumps have been performing non-stop for the past 4 years all over the world and proven their reliability globally.
`,
  },

  "concrete-pump-cph50": `The CPH50 Concrete Pump is a high-performance concrete pumping solution designed for demanding construction projects.

Key Features:
- High-output: Delivers up to 50 cubic meters of concrete per hour
- Precise control: Features a PLC control system and computerized monitoring
- Durable construction: Made from high-quality steel with hydraulic oil cooling system
- Efficient operation: Cement mixer type with 420V power
- Professional yellow design for high visibility
- Comprehensive warranty coverage

Technical Advantages:
- Advanced PLC control system
- Real-time computerized monitoring
- Hydraulic oil cooling for consistent performance
- Heavy-duty steel construction
- Easy maintenance design`,

  "concrete-pump-cph70": `The CPH70 Concrete Pump is our premium concrete pumping solution, engineered for superior performance and reliability in demanding environments.

Key Features:
- High Performance: 420V motor with advanced hydraulic pressure system
- Reliable Operation:
  • Premium steel construction
  • Advanced PLC control system
  • Efficient hydraulic oil cooling
- Computerized Control:
  • Precise monitoring and adjustment
  • Real-time performance data
  • Automated safety features

Applications:
- Concrete pumping
- Cement processing
- Construction material handling

Technical Advantages:
- Long service life design
- Comprehensive warranty coverage
- Easy maintenance access
- Professional support
- Spare parts availability`,

  "twin-shaft-mixer": {
    intro:
      "The ATM series of Twin Shaft Concrete Mixer is a high-performance mixer engineered for superior mixing performance across diverse applications. Built with premium grade steel, it features advanced twin shaft technology for optimal mixing efficiency.",
    features: [
      "Perfect choice for any grade of concrete requirement",
      "Ideal for lightweight, heavy-duty, and high-strength concrete",
      "Suitable for pre-cast, pre-stressed, and reinforced concrete",
      "High-speed rotating twin shafts for fast and efficient mixing",
      "Advanced computerized control system for precise monitoring",
      "Hydraulic oil cooling system for consistent performance",
      "Manual and automatic control options for flexible operation",
    ],
    keyFeatures: [
      "Dual shaft technology for superior mixing",
      "High mixing efficiency with optimal blade design",
      "Premium grade steel construction",
      "Easy maintenance and cleaning access",
      "Advanced control systems for precise operation",
      "Reliable performance in demanding conditions",
    ],
    description:
      "Our Twin Shaft Mixer excels in delivering consistent, high-quality mixing results across various concrete applications. The innovative design combines durability with efficiency, making it the preferred choice for construction projects requiring precise concrete mixing. The mixer's versatility and reliability make it an essential asset for both small-scale and large commercial operations.",
  },

  "planetary-concrete-mixer": {
    intro:
      "The APM Series Planetary Concrete Mixer is an advanced and reliable concrete mixer designed for construction and industrial applications. This mixer is designed to provide superior performance and reliability for a wide range of applications.",
    features: [
      "Ideal for small concrete batching plants up to 30m3",
      "Easy to clean and maintain with unique tank design allowing easy access",
      "Popular choice for Paver block and precast pipes manufacturing plants",
      "Preferred by OEMs for extensive mixing capability even with low water content (30%) in concrete",
      "420 Volt voltage system with hydraulic oil cooling",
      "PLC control system with computerized operation",
      "Advanced steaming method",
      "High-quality steel construction",
    ],
    keyFeatures: [
      "Efficient and reliable operation in any environment",
      "Easy maintenance design with accessible tank",
      "Long-term durability with premium construction",
      "Superior mixing performance even with low water content",
      "Consistent mix quality",
    ],
    description:
      "The APM Series Planetary Concrete Mixer is perfect for demanding applications where consistent mix quality and reliability are essential. Its unique design makes it particularly suitable for precast manufacturing and specialized concrete applications where precise control over water content is crucial.",
  },
};

const ProductGallery = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [activeTab, setActiveTab] = useState("specifications");
  const [swiper, setSwiper] = useState(null);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showContactForm, setShowContactForm] = useState(false);
  const [showBrochureForm, setShowBrochureForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = productImages[productId] || [];
  const allImages =
    productId === "concrete-pump"
      ? [...images, ...productImages["concrete-mixer"]]
      : images;

  const handleBackClick = () => {
    navigate("/#product-range");
  };

  const openModal = (index) => {
    setSelectedImage(allImages[index]);
    setCurrentImageIndex(index);
    document.body.style.overflow = "hidden";
  };

  const closeModal = () => {
    setSelectedImage(null);
    document.body.style.overflow = "unset";
  };

  const nextImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex((prev) => (prev + 1) % allImages.length);
    setSelectedImage(allImages[(currentImageIndex + 1) % allImages.length]);
  };

  const prevImage = (e) => {
    e?.stopPropagation();
    setCurrentImageIndex(
      (prev) => (prev - 1 + allImages.length) % allImages.length
    );
    setSelectedImage(
      allImages[(currentImageIndex - 1 + allImages.length) % allImages.length]
    );
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (!selectedImage) return;
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
    },
    [selectedImage, currentImageIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [handleKeyDown]);

  useEffect(() => {
    const foundProduct = products.find((p) => p.id === productId);
    if (!foundProduct) {
      navigate("/#product-range");
      return;
    }
    setProduct(foundProduct);
  }, [productId, navigate]);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            Loading product...
          </h2>
          <p className="text-gray-600 mt-2">
            Please wait while we fetch the product details.
          </p>
        </div>
      </div>
    );
  }

  const description = pumpDescriptions[productId] || product.description;

  const getMetaDescription = () => {
    if (typeof description === "string") {
      return description;
    } else if (description && description.intro) {
      return `${description.intro} ${description.features.join(" ")} ${description.description}`;
    }
    return "";
  };

  const renderDescription = () => {
    if (typeof description === "string") {
      return description.split("\n").map(
        (paragraph, index) =>
          paragraph.trim() && (
            <p key={index} className="mb-4">
              {paragraph}
            </p>
          )
      );
    } else if (description && description.intro) {
      return (
        <>
          <p className="mb-4">{description.intro}</p>
          {description.features && (
            <div className="mb-4">
              {description.features
                .slice(0, showFullDescription ? description.features.length : 3)
                .map((feature, index) => (
                  <p key={index} className="mb-2">
                    • {feature}
                  </p>
                ))}
            </div>
          )}
          {description.keyFeatures && (
            <div className={`mb-4 ${!showFullDescription ? "hidden" : ""}`}>
              <h3 className="text-xl font-semibold mb-2">Key Features:</h3>
              {description.keyFeatures.map((feature, index) => (
                <p key={index} className="mb-2">
                  • {feature}
                </p>
              ))}
            </div>
          )}
          {description.description && (
            <p
              className={`mt-4 mb-4 ${!showFullDescription ? "line-clamp-2" : ""}`}
            >
              {description.description}
            </p>
          )}
          {(description.features?.length > 3 || description.keyFeatures) && (
            <button
              onClick={() => setShowFullDescription(!showFullDescription)}
              className="text-blue-600 hover:text-blue-800 font-medium mt-2 focus:outline-none"
            >
              {showFullDescription ? "Show Less" : "Read More"}
            </button>
          )}
        </>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen">
      <Helmet>
        <title>{product.name} - Alfanio LTD</title>
        <meta name="description" content={getMetaDescription()} />
      </Helmet>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Back Button - Shows only arrow on mobile, full text on desktop */}
        <button
          onClick={handleBackClick}
          className="fixed top-24 left-4 z-50 bg-[#FECC00] hover:bg-[#e3b700] text-black px-4 py-2 rounded-full shadow-lg transition-all duration-300 flex items-center gap-2 group"
        >
          <FaArrowLeft className="transition-transform group-hover:-translate-x-1" />
          <span className="hidden md:inline">Back to Products</span>
        </button>

        {/* Product Header */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Image Gallery Section */}
          <div className="lg:w-1/2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="sticky top-24"
            >
              <Swiper
                modules={[Navigation, Pagination, Autoplay]}
                spaceBetween={0}
                slidesPerView={1}
                navigation
                pagination={{ clickable: true }}
                autoplay={{
                  delay: 5000,
                  disableOnInteraction: false,
                }}
                loop={true}
                className="product-gallery-swiper rounded-lg overflow-hidden shadow-lg"
              >
                {images.map((image, index) => (
                  <SwiperSlide key={index}>
                    <div className="aspect-w-4 aspect-h-3">
                      <img
                        src={image.src}
                        alt={image.alt}
                        className="w-full h-full object-contain bg-white"
                        loading={index === 0 ? "eager" : "lazy"}
                      />
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </motion.div>
          </div>

          <div className="lg:w-1/2">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {product.name}
            </h1>
            <div className="prose max-w-none text-gray-700">
              {renderDescription()}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button
                onClick={() => setShowContactForm(true)}
                className="flex-1 bg-[#FECC00] text-black px-6 py-3 rounded-lg hover:bg-yellow-500 transition-colors duration-200 font-semibold"
              >
                Contact Us
              </button>
              <button
                onClick={() => setShowBrochureForm(true)}
                className="flex-1 bg-white text-[#FECC00] border-2 border-[#FECC00] px-6 py-3 rounded-lg hover:bg-yellow-50 transition-colors duration-200 font-semibold"
              >
                Request Brochure
              </button>
            </div>
          </div>
        </div>
        {/* Gallery Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Product Gallery
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {allImages.map((image, index) => (
              <div
                key={index}
                className="relative group cursor-pointer overflow-hidden rounded-lg shadow-md hover:shadow-xl transition-all duration-300"
                onClick={() => openModal(index)}
              >
                <img
                  src={image.src}
                  alt={image.alt}
                  className="w-full h-80 md:h-96 object-contain transform hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300">
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="text-white text-xl">Click to view</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Image Modal */}
          {selectedImage && (
            <div
              className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
              onClick={closeModal}
            >
              <div className="relative max-w-[90vw] w-full h-full flex items-center justify-center">
                <button
                  className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white text-5xl hover:text-yellow-400 transition-colors focus:outline-none"
                  onClick={prevImage}
                >
                  ‹
                </button>
                <div
                  className="relative w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.alt}
                    className="max-h-[90vh] w-auto max-w-[85vw] object-contain rounded-lg"
                    style={{ minHeight: "70vh" }}
                  />
                  <p className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-white text-center w-full">
                    {selectedImage.alt}
                  </p>
                </div>
                <button
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white text-5xl hover:text-yellow-400 transition-colors focus:outline-none"
                  onClick={nextImage}
                >
                  ›
                </button>
                <button
                  className="absolute top-4 right-4 text-white text-3xl hover:text-yellow-400 transition-colors focus:outline-none"
                  onClick={closeModal}
                >
                  ×
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Specifications Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            Specifications
          </h2>

          {/* Model Specifications Table */}
          <div className="bg-white rounded-lg shadow-md overflow-hidden mb-12">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr className="bg-[#FECC00]/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                      MODEL
                    </th>
                    {Object.keys(product.modelSpecs[0]?.values || {}).map(
                      (model) => (
                        <th
                          key={model}
                          className="px-6 py-4 text-center text-sm font-semibold text-gray-900"
                        >
                          {model}
                        </th>
                      )
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {product.modelSpecs?.map((spec, index) => (
                    <tr
                      key={index}
                      className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 flex items-center gap-2">
                        {spec.name}
                        {spec.unit && (
                          <span className="text-gray-500">({spec.unit})</span>
                        )}
                      </td>
                      {Object.values(spec.values).map((value, i) => (
                        <td
                          key={i}
                          className="px-6 py-4 whitespace-nowrap text-sm text-center text-gray-500"
                        >
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {product.id === "concrete-pump" && (
              <div className="p-4 bg-gray-50 text-sm text-gray-600 border-t border-gray-200">
                <p className="italic">
                  Note: Specifications above are theoretical and can vary as per
                  site conditions & Concrete Pumpability
                </p>
              </div>
            )}
          </div>

          {/* Concrete Mixer Gallery Section */}
          {productId === "concrete-mixer" && (
            <div className="mt-12">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Concrete Mixer Gallery
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {productImages["concrete-mixer"].map((image, index) => (
                  <div
                    key={index}
                    className="bg-white p-4 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="w-full h-auto object-contain rounded-lg"
                      style={{ maxHeight: "400px" }}
                    />
                    <p className="text-center mt-2 text-gray-600">
                      {image.alt}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              {/* Yellow accent bar at top */}
              <div className="h-1.5 w-full bg-[#FECC00]"></div>

              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FECC00]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FECC00]/5 rounded-full blur-3xl"></div>

              <div className="p-4 sm:p-8 relative">
                {/* Close button */}
                <button
                  onClick={() => setShowContactForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[#FECC00] hover:text-white transition-all duration-300 shadow-sm"
                  aria-label="Close form"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Header with icon */}
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FECC00]/20 flex items-center justify-center mr-3 sm:mr-4 shadow-sm">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#FECC00]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Contact Us About
                    </h2>
                    <p className="text-[#FECC00] font-semibold text-sm sm:text-base">
                      {product.name}
                    </p>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-gray-600 mb-3 sm:mb-6 border-l-2 border-[#FECC00] pl-2 sm:pl-3 italic text-sm sm:text-base">
                  Fill out the form below and our team will get back to you as
                  soon as possible.
                </p>

                {/* Form */}
                <ContactForm
                  type="contact"
                  productName={product.name}
                  className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100"
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Brochure Form Modal */}
        {showBrochureForm && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 transition-all duration-300">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-xl relative shadow-2xl overflow-hidden"
            >
              {/* Yellow accent bar at top */}
              <div className="h-1.5 w-full bg-[#FECC00]"></div>

              {/* Decorative elements */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#FECC00]/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FECC00]/5 rounded-full blur-3xl"></div>

              <div className="p-4 sm:p-8 relative">
                {/* Close button */}
                <button
                  onClick={() => setShowBrochureForm(false)}
                  className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-[#FECC00] hover:text-white transition-all duration-300 shadow-sm"
                  aria-label="Close form"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>

                {/* Header with icon */}
                <div className="flex items-center mb-4 sm:mb-6">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-[#FECC00]/20 flex items-center justify-center mr-3 sm:mr-4 shadow-sm">
                    <svg
                      className="w-5 h-5 sm:w-6 sm:h-6 text-[#FECC00]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                      Request Brochure
                    </h2>
                    <p className="text-[#FECC00] font-semibold text-sm sm:text-base">
                      {product.name}
                    </p>
                  </div>
                </div>

                {/* Subtitle */}
                <p className="text-gray-600 mb-3 sm:mb-6 border-l-2 border-[#FECC00] pl-2 sm:pl-3 italic text-sm sm:text-base">
                  Complete this form to receive our detailed product brochure
                  with specifications and features.
                </p>

                {/* Form */}
                <ContactForm
                  type="brochure"
                  productName={product.name}
                  className="bg-white p-3 sm:p-6 rounded-xl shadow-sm border border-gray-100"
                />
              </div>
            </motion.div>
          </div>
        )}

        {/* Lightbox Modal */}
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={selectedImage.src}
                alt={product.name}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
              <button
                className="absolute top-4 right-4 bg-[#FECC00] text-black w-10 h-10 rounded-full flex items-center justify-center text-xl font-bold hover:bg-yellow-500 transition-colors"
                onClick={() => setSelectedImage(null)}
              >
                ×
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
