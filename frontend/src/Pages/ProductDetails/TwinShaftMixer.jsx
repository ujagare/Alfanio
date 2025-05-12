import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheck, FaPhone, FaEnvelope, FaArrowRight, FaDownload, FaShieldAlt } from 'react-icons/fa';
import mixerImage from '../../assets/product Reang/Planetary-Concrete-Mixer/APM-Series-Planetary-Concrete-Mixer.jpg';

const TwinShaftMixer = () => {
  const [activeTab, setActiveTab] = useState('description');

  const specifications = {
    type: 'Twin Shaft Concrete Mixer',
    controlSystem: 'PLC Control',
    material: 'High-Grade Steel',
    coolingSystem: 'Hydraulic Oil Cooling',
    voltage: '420 Volt (v)',
    computerized: 'Yes',
    automatic: 'Yes',
    color: 'Yellow/Custom',
    warranty: 'Yes'
  };

  const tradeInfo = {
    minOrderQuantity: '1 Piece',
    supplyAbility: '10 Pieces Per Month',
    deliveryTime: '7-10 Days',
    mainMarket: 'All India',
    paymentTerms: 'Cash in Advance (CID)'
  };

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-yellow-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <div className="bg-[#FECC00] h-2 w-full"></div>
          <div className="p-6 md:p-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Twin Shaft Concrete Mixer</h1>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="relative group">
                  <img 
                    src={mixerImage}
                    alt="Twin Shaft Concrete Mixer" 
                    className="w-full rounded-xl shadow-lg object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[mixerImage, mixerImage, mixerImage].map((img, idx) => (
                    <img 
                      key={idx}
                      src={img} 
                      alt={`Product view ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg cursor-pointer hover:ring-2 ring-[#FECC00] transition-all"
                    />
                  ))}
                </div>
              </div>
              
              <div className="space-y-6">
                <div className="bg-yellow-50 p-6 rounded-xl border-2 border-[#FECC00]">
                  <h3 className="text-2xl font-semibold text-gray-900 mb-4">Key Features</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="mr-3 text-[#FECC00]" /> Advanced PLC Control System
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="mr-3 text-[#FECC00]" /> High-Grade Steel Construction
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="mr-3 text-[#FECC00]" /> Efficient Hydraulic Cooling
                    </li>
                    <li className="flex items-center text-gray-700">
                      <FaCheck className="mr-3 text-[#FECC00]" /> Automated Operation System
                    </li>
                  </ul>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="flex-1 flex items-center justify-center px-6 py-4 bg-[#FECC00] text-gray-900 rounded-xl hover:bg-[#FFD700] transition-colors font-semibold shadow-lg hover:shadow-xl">
                    <FaPhone className="mr-2" /> Request Callback
                  </button>
                  <button className="flex-1 flex items-center justify-center px-6 py-4 border-2 border-[#FECC00] text-gray-900 rounded-xl hover:bg-yellow-50 transition-colors font-semibold">
                    <FaDownload className="mr-2" /> Download Brochure
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  <div className="flex items-center p-4 bg-white rounded-xl border border-gray-200">
                    <FaShieldAlt className="text-[#FECC00] text-2xl mr-3" />
                    <div>
                      <h4 className="font-semibold">Warranty</h4>
                      <p className="text-sm text-gray-600">1 Year Coverage</p>
                    </div>
                  </div>
                  <div className="flex items-center p-4 bg-white rounded-xl border border-gray-200">
                    <FaPhone className="text-[#FECC00] text-2xl mr-3" />
                    <div>
                      <h4 className="font-semibold">24/7 Support</h4>
                      <p className="text-sm text-gray-600">Expert Assistance</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Tabs Section */}
        <div className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex">
              {['description', 'specifications', 'trade'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`${
                    activeTab === tab
                      ? 'border-[#FECC00] text-gray-900 bg-yellow-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } flex-1 py-4 px-6 border-b-2 font-medium text-sm sm:text-base capitalize transition-colors`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6 md:p-8">
            {activeTab === 'description' && (
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
                className="prose max-w-none"
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Product Description</h2>
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <p className="text-gray-600 leading-relaxed">
                      The Twin Shaft Concrete Mixer represents the pinnacle of mixing technology, 
                      designed for optimal performance in demanding industrial environments. Its 
                      innovative twin-shaft design ensures thorough and uniform mixing of materials.
                    </p>
                    <div className="bg-yellow-50 p-6 rounded-xl border border-[#FECC00]">
                      <h3 className="text-xl font-semibold mb-4">Key Benefits</h3>
                      <ul className="space-y-3">
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-[#FECC00] rounded-full mr-2 mt-2"></span>
                          <span>Superior mixing quality and consistency</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-[#FECC00] rounded-full mr-2 mt-2"></span>
                          <span>Reduced mixing time and energy consumption</span>
                        </li>
                        <li className="flex items-start">
                          <span className="w-2 h-2 bg-[#FECC00] rounded-full mr-2 mt-2"></span>
                          <span>Easy maintenance and cleaning</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="bg-gray-50 p-6 rounded-xl">
                      <h3 className="text-xl font-semibold mb-4">Applications</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-900">Construction</h4>
                          <p className="text-sm text-gray-600">Commercial & Residential</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-900">Infrastructure</h4>
                          <p className="text-sm text-gray-600">Roads & Bridges</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-900">Industrial</h4>
                          <p className="text-sm text-gray-600">Manufacturing Plants</p>
                        </div>
                        <div className="p-4 bg-white rounded-lg shadow-sm">
                          <h4 className="font-medium text-gray-900">Precast</h4>
                          <p className="text-sm text-gray-600">Concrete Products</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'specifications' && (
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Technical Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(specifications).map(([key, value]) => (
                    <div key={key} className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-3 h-3 bg-[#FECC00] rounded-full mr-4"></div>
                      <div>
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="ml-2 text-gray-900">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'trade' && (
              <motion.div
                initial={fadeInUp.initial}
                animate={fadeInUp.animate}
                transition={fadeInUp.transition}
              >
                <h2 className="text-2xl font-bold mb-6 text-gray-900">Trade Information</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(tradeInfo).map(([key, value]) => (
                    <div key={key} className="flex items-center p-4 bg-gray-50 rounded-xl">
                      <div className="w-3 h-3 bg-[#FECC00] rounded-full mr-4"></div>
                      <div>
                        <span className="font-medium text-gray-700 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}:
                        </span>
                        <span className="ml-2 text-gray-900">{value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Contact Section */}
        <motion.div 
          className="mt-8 bg-white rounded-2xl shadow-xl overflow-hidden"
          initial={fadeInUp.initial}
          animate={fadeInUp.animate}
          transition={fadeInUp.transition}
        >
          <div className="bg-[#FECC00] h-2 w-full"></div>
          <div className="p-6 md:p-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-900">Get in Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <p className="text-gray-600">
                  Interested in our Twin Shaft Concrete Mixer? Contact us for more information or to request a quote.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4 text-gray-700">
                    <FaPhone className="text-[#FECC00] text-xl" />
                    <span>+91 7317186266</span>
                  </div>
                  <div className="flex items-center space-x-4 text-gray-700">
                    <FaEnvelope className="text-[#FECC00] text-xl" />
                    <span>info@alfanioindia.com</span>
                  </div>
                </div>
                <div className="p-6 bg-yellow-50 rounded-xl border border-[#FECC00]">
                  <h3 className="text-xl font-semibold mb-4">Why Choose Us?</h3>
                  <ul className="space-y-3">
                    <li className="flex items-center">
                      <FaCheck className="text-[#FECC00] mr-3" />
                      <span>Industry-leading warranty</span>
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-[#FECC00] mr-3" />
                      <span>24/7 technical support</span>
                    </li>
                    <li className="flex items-center">
                      <FaCheck className="text-[#FECC00] mr-3" />
                      <span>Pan India service network</span>
                    </li>
                  </ul>
                </div>
              </div>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FECC00] focus:border-transparent"
                />
                <input
                  type="email"
                  placeholder="Your Email"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FECC00] focus:border-transparent"
                />
                <input
                  type="tel"
                  placeholder="Your Phone"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FECC00] focus:border-transparent"
                />
                <textarea
                  placeholder="Your Message"
                  rows="4"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#FECC00] focus:border-transparent"
                ></textarea>
                <button className="w-full px-6 py-4 bg-[#FECC00] text-gray-900 rounded-xl hover:bg-[#FFD700] transition-colors font-semibold shadow-lg hover:shadow-xl flex items-center justify-center">
                  Send Message <FaArrowRight className="ml-2" />
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TwinShaftMixer;
