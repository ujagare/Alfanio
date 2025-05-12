import React from "react";
import { Link } from "react-router-dom";
import {
  FaTwitter,
  FaInstagram,
  FaYoutube,
  FaLinkedin,
  FaMapMarkerAlt,
  FaPhone,
  FaPhoneAlt,
  FaEnvelope,
  FaFacebook,
  FaWhatsapp,
} from "react-icons/fa";
import Logo from "../assets/Logo.png";

const Footer = () => {
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

  return (
    <footer className="bg-[#27272A] text-white py-8" aria-label="Footer">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-6">
          {/* Logo and Description */}
          <div className="lg:col-span-3 space-y-3">
            <Link
              to="/"
              className="block w-36 focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded"
            >
              <img src={Logo} alt="Alfanio Logo" className="h-10 w-auto" />
            </Link>
            <div className="flex flex-col items-center lg:items-start">
              <p className="text-gray-400 text-sm leading-relaxed text-center lg:text-left max-w-xs">
                Alfanio caters to a wide range of customers for an extensive
                range of applications. We Are partnering with clients all over
                the worldwide.
              </p>
              <div className="grid grid-cols-2 gap-1 text-xs text-gray-400 mt-2 w-full">
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  South Korea
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  South Africa
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  India
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  USA
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  Nepal
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  Kenya
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  Tanzania
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  Somalia
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  Bangladesh
                </span>
                <span className="flex items-center">
                  <span className="w-1.5 h-1.5 bg-[#FECC00] rounded-full mr-1.5"></span>
                  Congo
                </span>
              </div>
              <div className="hidden md:flex items-center space-x-4 mt-3">
                {socialMedias.map((social, index) => (
                  <a
                    key={index}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`text-[#FECC00] ${social.hoverColor} transition-colors duration-200`}
                    aria-label={social.name}
                  >
                    <social.Icon className="text-3xl" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="lg:col-span-2 space-y-3" aria-label="Quick Links">
            <h3 className="text-[15px] font-semibold text-[#FECC00]">
              Quick Links
            </h3>
            <ul className="flex flex-col space-y-1.5">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-[#FECC00] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-[#FECC00] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5"
                >
                  About
                </Link>
              </li>
              <li>
                <Link
                  to="/gallery"
                  className="text-gray-400 hover:text-[#FECC00] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5"
                >
                  Gallery
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-[#FECC00] transition-colors text-sm focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </nav>

          {/* Contact Information */}
          <div className="lg:col-span-4 space-y-3">
            <div>
              <h3 className="text-[15px] font-semibold text-[#FECC00] mb-3">
                Factory Address
              </h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-2 text-gray-400 group">
                  <FaMapMarkerAlt className="text-[#FECC00] mt-1 flex-shrink-0 text-sm" />
                  <span className="text-sm leading-relaxed group-hover:text-[#FECC00] transition-colors">
                    Gate No.282 Opp. ICEAge Cold Storage Village Kuruli, Pune
                    410501
                  </span>
                </div>

                <div className="space-y-2">
                  <a
                    href="mailto:alfanioindia@gmail.com"
                    className="flex items-center space-x-2 text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5 group"
                  >
                    <FaEnvelope className="text-[#FECC00] flex-shrink-0 text-sm group-hover:animate-bounce" />
                    <span className="text-sm">sales@alfanio.com</span>
                  </a>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <a
                      href="mailto:spares@alfanio.com"
                      className="flex items-center space-x-2 text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5 group"
                    >
                      <FaEnvelope className="text-[#FECC00] flex-shrink-0 text-sm group-hover:animate-bounce" />
                      <span className="text-sm">spares@alfanio.com</span>
                    </a>
                    <a
                      href="tel:+919687618558"
                      className="flex items-center space-x-2 text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5 group"
                    >
                      <FaPhoneAlt className="text-[#FECC00] flex-shrink-0 text-sm group-hover:rotate-12 transition-transform" />
                      <span className="text-sm">+91 96876 18558</span>
                    </a>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <a
                      href="mailto:sales@alfanio.com"
                      className="flex items-center space-x-2 text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5 group"
                    >
                      <FaEnvelope className="text-[#FECC00] flex-shrink-0 text-sm group-hover:animate-bounce" />
                      <span className="text-sm">alfanioindia@gmail.com</span>
                    </a>
                    <a
                      href="tel:+917972924637"
                      className="flex items-center space-x-2 text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5 group"
                    >
                      <FaPhoneAlt className="text-[#FECC00] flex-shrink-0 text-sm group-hover:rotate-12 transition-transform" />
                      <span className="text-sm">+91 79729 24631</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-[15px] font-semibold text-[#FECC00] mb-2">
                Head Office
              </h3>
              <div className="flex items-start space-x-2 text-gray-400 group">
                <FaMapMarkerAlt className="text-[#FECC00] mt-1 flex-shrink-0 text-sm" />
                <span className="text-sm leading-relaxed group-hover:text-[#FECC00] transition-colors">
                  Flat no 207-208, Orient Plaza, SRPF Road, Hadapsar, Pune
                  411013
                </span>
              </div>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3">
            <h3 className="text-[15px] font-semibold text-[#FECC00] mb-3">
              Location
            </h3>
            <div className="rounded-lg overflow-hidden h-48 md:h-40 shadow-lg hover:shadow-xl transition-shadow duration-300 relative bg-gray-800">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3780.8787288647506!2d73.91641187496726!3d18.63333166697036!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bc2c6918c3e61a1%3A0xa11e1e6eefde6c46!2sAlfanio%20India%20Pvt%20Ltd!5e0!3m2!1sen!2sin!4v1688470902664!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg w-full h-full"
                title="Alfanio India Pvt Ltd Location"
                onError={(e) => {
                  const fallback = e.target.nextSibling;
                  if (fallback) {
                    e.target.style.display = "none";
                    fallback.style.display = "flex";
                  }
                }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center text-center p-4"
                style={{ display: "none" }}
              >
                <div className="space-y-2">
                  <FaMapMarkerAlt className="text-[#FECC00] text-3xl mx-auto" />
                  <p className="text-sm text-gray-300">
                    Map loading failed. Visit us at:
                    <br />
                    Gate No.282 Opp. ICEAge Cold Storage Village Kuruli, Pune
                    410501
                  </p>
                  <a
                    href="https://goo.gl/maps/YhPLZF9T7kGgvtLb7"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#FECC00] hover:underline text-sm inline-block"
                  >
                    Open in Google Maps
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="lg:col-span-12">
            <div className="mt-8 pt-6 border-t border-gray-700/50">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <p className="text-sm text-gray-400 text-center md:text-left">
                  &copy; {new Date().getFullYear()} Alfanio India Pvt Ltd. All
                  rights reserved.
                </p>
                <div className="flex items-center space-x-6">
                  <Link
                    to="/privacy"
                    className="text-sm text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5"
                  >
                    Privacy Policy
                  </Link>
                  <Link
                    to="/terms"
                    className="text-sm text-gray-400 hover:text-[#FECC00] transition-colors focus:outline-none focus:ring-2 focus:ring-[#FECC00] rounded px-2 py-0.5"
                  >
                    Terms of Service
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
