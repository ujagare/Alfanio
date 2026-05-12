import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiMenu, FiX } from "react-icons/fi";
import {
  FaFacebook,
  FaInstagram,
  FaWhatsapp,
  FaPhoneAlt,
} from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import Logo from "../assets/logo.png";

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

  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#202024]/95 shadow-[0_18px_45px_rgba(0,0,0,0.25)] backdrop-blur-xl">
      <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#FECC00]/60 to-transparent" />
      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-5">
          {/* Logo */}
          <Link
            to="/"
            className="group flex items-center gap-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FECC00]"
            aria-label="Alfanio home"
          >
            <span className="flex h-14 w-44 items-center justify-center rounded-lg border border-[#FECC00]/25 bg-[#27272A] px-4 shadow-lg shadow-black/20 transition-transform duration-300 group-hover:-translate-y-0.5">
              <img src={Logo} alt="Alfanio" className="h-11 w-auto" loading="eager" decoding="async" />
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden xl:flex items-center rounded-lg border border-white/10 bg-white/[0.04] p-1 shadow-inner shadow-black/20">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`relative rounded-md px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  isActive(item.path)
                    ? "bg-[#FECC00] text-[#202024] shadow-md shadow-[#FECC00]/20"
                    : "text-zinc-200 hover:bg-white/[0.06] hover:text-[#FECC00]"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </div>

          <div className="hidden xl:flex items-center gap-3">
            <a
              href="tel:+919687618558"
              className="hidden 2xl:flex items-center gap-3 rounded-lg border border-[#FECC00]/25 bg-[#FECC00]/10 px-4 py-2.5 text-sm font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-[#FECC00] hover:bg-[#FECC00] hover:text-[#202024] focus:outline-none focus:ring-2 focus:ring-[#FECC00]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-md bg-[#FECC00] text-[#202024]">
                <FaPhoneAlt className="text-xs" />
              </span>
              <span className="leading-tight">
                <span className="block text-[10px] uppercase tracking-[0.18em] opacity-70">
                  Call Sales
                </span>
                +91 96876 18558
              </span>
            </a>

            <div className="flex items-center gap-2 border-l border-white/10 pl-3">
              {socialMedias.map((social, index) => (
                <a
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-[#FECC00] transition-all duration-300 hover:-translate-y-0.5 hover:border-transparent hover:bg-white ${social.hoverColor} focus:outline-none focus:ring-2 focus:ring-[#FECC00]`}
                  aria-label={social.name}
                >
                  <social.Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Compact Desktop Social Media Links */}
          <div className="hidden md:flex xl:hidden items-center gap-3">
            {socialMedias.slice(0, 2).map((social, index) => (
              <a
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex h-10 w-10 items-center justify-center rounded-md border border-[#FECC00]/20 bg-[#FECC00]/10 text-[#FECC00] transition-all duration-300 ${social.hoverColor}`}
                aria-label={social.name}
              >
                <social.Icon className="h-4 w-4" />
              </a>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMenuOpen(!isMenuOpen)}
            className="xl:hidden flex h-11 w-11 items-center justify-center rounded-md border border-[#FECC00]/30 bg-[#FECC00]/10 text-2xl text-[#FECC00] transition-all duration-200 hover:bg-[#FECC00] hover:text-[#202024] focus:outline-none focus:ring-2 focus:ring-[#FECC00]"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMenuOpen}
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
            className="absolute left-0 right-0 top-full z-[60] max-h-[calc(100vh-5rem)] overflow-auto border-t border-[#FECC00]/20 bg-black/95 shadow-2xl shadow-black/40 backdrop-blur-lg xl:hidden"
          >
            <div className="flex flex-col">
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
                              <span className="text-[#FECC00]">*</span>
                            ) : (
                              <span className="text-gray-500">&gt;</span>
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
