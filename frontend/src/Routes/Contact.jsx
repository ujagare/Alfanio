import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import * as yup from "yup";
import {
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaTools,
  FaTruck,
  FaIndustry,
  FaPhoneAlt,
} from "react-icons/fa";
import alfanioLogo from "..\assets\Alfanio.png";
import { API_URL, API_ENDPOINTS } from "..\config"; // Ensure API_URL is from environment variables
import CountryCodeSelect from "..\Components\CountryCodeSelect";

const heroImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop";

// Extracted toast styles
const toastStyles = {
  position: "top-right",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
  borderRadius: "10px",
  padding: "16px",
};

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  // Phone number validation and formatting
  const phone = watch("phone");
  const formatPhoneNumber = useCallback(() => {
    if (phone) {
      const formatted = phone.replace(/\D/g, "").slice(0, 10);
      if (formatted !== phone) {
        reset({ phone: formatted });
      }
    }
  }, [phone, reset]);

  useEffect(() => {
    formatPhoneNumber();
  }, [phone, formatPhoneNumber]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      console.log("Submitting contact form with data:", {
        name: data.name,
        email: data.email,
        phone: `${countryCode}${data.phone}`,
        message: data.message,
      });

      const response = await fetch(API_ENDPOINTS.contact, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          phone: `${countryCode}${data.phone}`,
          message: data.message,
          type: "contact",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Server error response:", errorText);
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success) {
        toast.success("Message sent successfully! We will contact you soon.", {
          ...toastStyles,
          background: "#4CAF50",
          color: "white",
        });
        reset();
      } else {
        throw new Error(result.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error(
        error.message || "Failed to send message. Please try again.",
        toastStyles
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen"
    >
      {/* Hero Section */}
      <div className="relative h-[60vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Alfanio Contact"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative h-full flex flex-col items-center justify-center text-center px-4">
          <motion.div className="flex items-center justify-center mb-8">
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              src={alfanioLogo}
              alt="Alfanio Logo"
              className="h-24 md:h-32 object-contain"
            />
          </motion.div>
          <motion.h1
            variants={textVariants}
            initial="hidden"
            animate="visible"
            className="text-4xl md:text-6xl font-bold text-white mb-4"
          >
            Contact Us
          </motion.h1>
          <motion.p
            variants={textVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: 0.2 }}
            className="text-xl text-white/90 max-w-2xl"
          >
            Let's discuss how we can help with your construction equipment needs
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative -mt-20">
        {/* Contact Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FECC00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#FECC00] rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <FaPhoneAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Phone
              </h3>
              <p className="text-gray-600">
                <a
                  href="tel:+917972924631"
                  className="hover:text-[#FECC00] transition-colors"
                >
                  +91 79729 24631
                </a>
              </p>
              <p className="text-gray-600">
                <a
                  href="tel:+919687618558"
                  className="hover:text-[#FECC00] transition-colors"
                >
                  +91 96876 18558
                </a>
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FECC00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#FECC00] rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <FaEnvelope className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Email
              </h3>
              <p className="text-gray-600">sales@alfanio.com</p>
              <p className="text-gray-600">spares@alfanio.com</p>
              <p className="text-gray-600">service@alfanio.com</p>
              <p className="text-gray-600">alfanioindia@gmail.com</p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden group hover:shadow-2xl transition-shadow duration-300"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FECC00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="w-14 h-14 bg-[#FECC00] rounded-full flex items-center justify-center mb-6 transform group-hover:scale-110 transition-transform duration-300">
                <FaMapMarkerAlt className="text-white text-2xl" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Address
              </h3>
              <p className="text-gray-600">Gate No.282, Village Kuruli</p>
              <p className="text-gray-600">Pune 410501, Maharashtra</p>
            </div>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="bg-white rounded-xl shadow-lg p-8 mb-12"
        >
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            HOW CAN WE HELP YOU?
          </h2>
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name *
              </label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <div className="flex">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                  className="flex-shrink-0 w-24"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^\d{10}$/,
                      message: "Please enter a valid 10-digit phone number",
                    },
                  })}
                  className="flex-grow px-4 py-3 border border-gray-300 rounded-r-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base border-l-0"
                  placeholder="Phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message *
              </label>
              <textarea
                {...register("message", {
                  required: "Message is required",
                })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="How can we help you?"
              />
              {errors.message && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full md:w-auto px-8 py-3 text-white font-medium rounded-md transition-all duration-300 ${
                  isSubmitting
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-[#FECC00] hover:bg-[#e3b700] transform hover:-translate-y-1"
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Sending...
                  </div>
                ) : (
                  "Send Message"
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Additional Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          {/* Business Hours */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FECC00]/5 to-transparent" />
            <div className="relative z-10">
              <div className="flex items-center mb-6">
                <FaClock className="text-[#FECC00] text-2xl mr-3" />
                <h3 className="text-2xl font-bold text-gray-900">
                  Business Hours
                </h3>
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Monday - Saturday</span>
                  <span className="text-gray-900 font-semibold">
                    9:00 AM - 6:00 PM
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Sunday</span>
                  <span className="text-gray-900 font-semibold">Closed</span>
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-gray-600">
                    <span className="font-semibold text-[#FECC00]">Note:</span>{" "}
                    Factory visits are by appointment only.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Quick Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="bg-white rounded-xl shadow-lg p-8 relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#FECC00]/5 to-transparent" />
            <div className="relative z-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Quick Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start">
                  <FaTools className="text-[#FECC00] text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Service & Support
                    </h4>
                    <p className="text-gray-600">
                      24/7 technical support available for all our products
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaTruck className="text-[#FECC00] text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Shipping
                    </h4>
                    <p className="text-gray-600">
                      Worldwide shipping with tracking available
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <FaIndustry className="text-[#FECC00] text-xl mt-1 mr-4" />
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">
                      Factory Visit
                    </h4>
                    <p className="text-gray-600">
                      Schedule a visit to our manufacturing facility
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Map Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="bg-white rounded-xl shadow-lg overflow-hidden mb-20"
        >
          <div className="w-full h-[300px] md:h-[450px] relative">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3784.5757333776546!2d73.8681663!3d18.4470421!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2eb7c0b5547d3%3A0x6d8c6c1c0c8b5b5a!2sAlfanio%20Ltd!5e0!3m2!1sen!2sin!4v1625147614853!5m2!1sen!2sin"
              style={{
                border: 0,
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
              }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Alfanio Location"
            ></iframe>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Contact;
