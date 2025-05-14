import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaYoutube,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import { COMPANY_INFO } from "..\config.js";
import Logo from "..\assets\logo.png";

const Navbar = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  const navItems = [
    { path: "/", name: "Home" },
    { path: "/about", name: "About" },
    { path: "/#products", name: "Products" },
    { path: "/gallery", name: "Gallery" },
    { path: "/news", name: "News" },
    { path: "/contact", name: "Contact" },
  ];

  const socialMedias = [
    {
      Icon: FaFacebook,
      url: "https://www.facebook.com/profile.php?id=100068675622644&locale=it_IT",
      name: "Facebook",
      hoverColor: "hover:text-[#1877F2]",
    },
    {
      Icon: FaInstagram,
      url: "https://www.instagram.com/alfanio_india",
      name: "Instagram",
      hoverColor: "hover:text-[#E4405F]",
    },
    {
      Icon: FaWhatsapp,
      url: "https://wa.me/918956529812",
      name: "WhatsApp",
      hoverColor: "hover:text-[#25D366]",
    },
  ];

  const isActive = (path) => {
    // For the product range hash link
    if (
      path === "/#products" &&
      (location.hash === "#products" || location.pathname === "/products")
    ) {
      return true;
    }
    // For regular paths
    if (path === "/" && location.pathname === "/" && location.hash === "")
      return true;
    if (
      path !== "/" &&
      path !== "/#products" &&
      location.pathname.startsWith(path)
    )
      return true;
    return false;
  };

  const menuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    open: {
      opacity: 1,
      height: "auto",
      transition: { duration: 0.4, ease: "easeInOut" },
    },
  };

  const contactInfo = {
    phones: [
      { number: "+91 96876 18558", label: "Sales" },
      { number: "+91 79729 24637", label: "Support" },
    ],
    emails: [
      { address: "sales@alfanio.com", label: "Sales" },
      { address: "alfanioindia@gmail.com", label: "General" },
      { address: "spares@alfanio.com", label: "Spares" },
    ],
  };

  return (
    <nav className="fixed w-full z-50 bg-[#27272A] shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img src={Logo} alt="Alfanio" className="h-12" />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-lg font-medium transition-colors duration-200 relative group ${
                  isActive(item.path)
                    ? "text-[#FECC00]"
                    : "text-gray-200 hover:text-[#FECC00]"
                }`}
              >
                {item.name}
                <span
                  className={`absolute -bottom-1 left-0 w-full h-0.5 bg-[#FECC00] transform origin-left transition-transform duration-200 ${
                    isActive(item.path)
                      ? "scale-x-100"
                      : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </Link>
            ))}
          </div>

          {/* Social Media Links */}
          <div className="hidden md:flex items-center gap-6">
            {socialMedias.map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-[#FECC00] transition-all duration-300 transform hover:-translate-y-1 ${social.hoverColor}`}
                aria-label={social.name}
              >
                <social.Icon className="w-5 h-5" />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="md:hidden text-[#FECC00] text-2xl focus:outline-none hover:text-[#FECC00] transition-colors duration-200"
          >
            {isMenuOpen ? <FiX /> : <FiMenu />}
          </button>
        </div>
      </div>

      {/* Enhanced Professional Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 top-20 bg-black/95 backdrop-blur-lg z-50 overflow-auto"
          >
            <div className="max-h-[calc(100vh-5rem)] overflow-auto flex flex-col">
              {/* Navigation Links Section */}
              <div className="flex-1 py-3">
                <div className="container mx-auto px-6">
                  {/* Navigation Links */}
                  <div className="space-y-2 mt-2">
                    {navItems.map((item, index) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 * index, duration: 0.3 }}
                        key={item.path}
                      >
                        <Link
                          to={item.path}
                          onClick={() => setMenuOpen(false)}
                          className={`flex items-center justify-between py-2 border-b border-gray-800 transition-all duration-300 ${
                            isActive(item.path)
                              ? "text-[#FECC00] border-[#FECC00]"
                              : "text-white hover:text-[#FECC00] hover:border-[#FECC00]/50"
                          }`}
                        >
                          <span className="text-base font-medium">
                            {item.name}
                          </span>
                          <motion.span
                            animate={{ x: isActive(item.path) ? 0 : 5 }}
                            transition={{ duration: 0.3 }}
                          >
                            {isActive(item.path) ? (
                              <span className="text-[#FECC00]">•</span>
                            ) : (
                              <span className="text-gray-500">›</span>
                            )}
                          </motion.span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="bg-zinc-900 py-3">
                <div className="container mx-auto px-6">
                  {/* Social Media */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-[#FECC00] text-xs uppercase tracking-wider font-semibold mb-2">
                      Connect With Us
                    </h3>
                    <div className="flex gap-3">
                      {socialMedias.map((social, index) => (
                        <a
                          key={index}
                          href={social.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group"
                        >
                          <div className="w-8 h-8 rounded-full bg-[#FECC00]/10 flex items-center justify-center transition-all duration-300 group-hover:bg-[#FECC00] border border-[#FECC00]/30">
                            <social.Icon className="w-3 h-3 text-[#FECC00] group-hover:text-black transition-colors duration-300" />
                          </div>
                        </a>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
