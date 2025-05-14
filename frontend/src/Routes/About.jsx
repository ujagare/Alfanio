import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaCertificate,
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaEnvelope,
  FaHandshake,
  FaIndustry,
  FaLightbulb,
  FaLinkedin,
  FaQuoteLeft,
  FaTools,
  FaTruck,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import heroImage from "..\assets\alafa-images\CPH50-3 (16).webp";
import factoryImage from "..\assets\alafa-images\97843  (11).webp";
import machineImage1 from "..\assets\alafa-images\20211116_114205 (2).webp";
import pumpImage1 from "..\assets\alafa-images\97843  (10).webp";
import pumpImage2 from "..\assets\alafa-images\Twin-Shaft-Concrete-Mixer.jpg";
import mixerImage from "..\assets\alafa-images\Planetary-Concrete-Mixer.jpg";
import mixerImage2 from "..\assets\alafa-images\White-Pump.webp";
import profileAbhijeet from "..\assets\Profile\Abhijeet.jpg";
import profileAnand from "..\assets\Profile\Anand Sali.jpg";
import profileSachin from "..\assets\Profile\Sachin Jagtap.jpg";
import profileSudhakar from "..\assets\Profile\Sudhakar WAGGH.jpg";
import profileRavindra from "..\assets\Profile\Ravindra Vyas.jpg";
import AlfanioLogo from "..\assets\Alfanio.png";

const About = () => {
  const [projectCount, setProjectCount] = useState(0);
  const [clientCount, setClientCount] = useState(0);
  const [experienceCount, setExperienceCount] = useState(0);
  const [employeeCount, setEmployeeCount] = useState(0);

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.5,
  });

  useEffect(() => {
    let projectInterval;
    let clientInterval;
    let experienceInterval;
    let employeeInterval;

    if (statsInView) {
      projectInterval = setInterval(() => {
        setProjectCount((prev) => (prev < 125 ? prev + 1 : 125));
      }, 20);

      clientInterval = setInterval(() => {
        setClientCount((prev) => (prev < 100 ? prev + 1 : 100));
      }, 20);

      experienceInterval = setInterval(() => {
        setExperienceCount((prev) => (prev < 25 ? prev + 1 : 25));
      }, 100);

      employeeInterval = setInterval(() => {
        setEmployeeCount((prev) => (prev < 35 ? prev + 1 : 35));
      }, 100);
    }

    return () => {
      clearInterval(projectInterval);
      clearInterval(clientInterval);
      clearInterval(experienceInterval);
      clearInterval(employeeInterval);
    };
  }, [statsInView]);

  const team = [
    {
      name: "Ravindra Vyas",
      role: "Sales",
      image: profileRavindra,
    },
    {
      name: "Sudhakar Waggh",
      role: "Production",
      image: profileSudhakar,
    },
    {
      name: "Abhijeet Sonawane",
      role: "Service & Spares",
      image: profileAbhijeet,
    },
    {
      name: "Sachin Jagtap",
      role: "Procurement",
      image: profileSachin,
    },
    {
      name: "Anand Sali",
      role: "Design & Development",
      image: profileAnand,
    },
  ];

  const milestones = [
    {
      year: "2020",
      title: "Foundation",
      description:
        "Established in Pune as a modern construction equipment manufacturer.",
    },
    {
      year: "2021",
      title: "Concrete Pump Launch",
      description:
        "We launched our latest concrete pump in 2021, we took some time to launch our first pump as we wanted to present to our customer a product as we wanted to implement some things to improve our products from the already available products in the market.",
    },
    {
      year: "2022",
      title: "Launched Twin-Shaft And Planetary Mixers",
      description:
        "In 2022, we strengthened our presence in the vibrant construction landscape with the launch of our new twin shaft and planetary range of concrete mixers. These locally-focused solutions are designed to address the specific demands and challenges faced by construction professionals due to the harsh conditions prevailing in India. Furthermore, we started exports of concrete pump units to major OEM in construction equipment from South Korea and customized shotcrete pumps to Australia.",
    },
    {
      year: "2023",
      title: "Launch Of Color Dosing System & Expansion Of Exports",
      description:
        "In 2023, we marked a significant milestone with the launch of our innovative Color (pigment) Dosing System. This was natural as a forward integration of products inline with our concrete mixers. We also exported our pumps to African countries viz Ghana, Tanzania, Somalia, Kenya etc. and expanded our reach to Latin American countries.",
    },
    {
      year: "2024",
      title: "Export To USA",
      description:
        "Alfanio started exporting customized concrete pumps to USA. We are the first company from India to manufacture and sell concrete pumps with Tier 4 (Final) emission norms. This is suitable to be operated in the USA under the EPA standards. We also launched our latest addition to our range of concrete pumps with the CPH 70 HRX model, this pump can pump concrete to a height of 200m.  ALFANIO is the first to launch this pump with a Cummins diesel engine. This is line with our commitment to offer customer a better product than the present ones available in the market. This pump is very efficient and thus helps in fuel savings, the pump is quieter and also helps to keep the pump compact and easy for towing.",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white"
    >
      {/* Hero Section with Parallax */}
      <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Alfanio Manufacturing Facility"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <img
                src={AlfanioLogo}
                alt="Alfanio Logo"
                className="h-28 md:h-32 w-auto relative lg:left-[40%] lg:top-5 top-5 left-6"
              />
            </motion.div>

            <h1 className="text-5xl md:text-6xl tracking-tighter font-bold text-[#FECC00] mb-6 w-full">
              Leading Innovation In Construction Equipment
            </h1>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <section ref={statsRef} className="bg-[#FECC00] py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {projectCount}+
              </h3>
              <p className="text-gray-600">Installation</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {clientCount}+
              </h3>
              <p className="text-gray-600">Worldwide</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {experienceCount}+
              </h3>
              <p className="text-gray-600">Years Experience In This Field</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-lg">
              <h3 className="text-4xl font-bold text-gray-900 mb-2">
                {employeeCount}+
              </h3>
              <p className="text-gray-600">Team Members</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Overview with Vision, Mission, Goals */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                WHO WE ARE
              </h2>
              <p className="text-gray-600 mb-6">
                Alfanio India Pvt Ltd. is a 100% Indian manufacturing company in
                the field of Modern Construction Equipment. It was
                conceptualized and born after the founders came together and
                thought of offering better products to customers than the
                presently available ones in the Indian market. <br />
                All the five directors of Alfanio are technocrats and
                individually having experience of more than 25 years in the
                field of construction equipment manufacturing and service giving
                them a unique perspective to upgrade the equipment to make them
                trouble free and reliable.
              </p>
              <p className="text-gray-600 mb-6">
                We are based in Pune, the second most industrialized city of
                Maharashtra next to Mumbai. The Company's production facility is
                located at industrial township of Chakan, Pune. <br />
                Alfanio is engaged in manufacturing of various world class
                construction equipment including special purpose construction
                machines and customized systems to satisfy customer
                requirements.
              </p>

              <div className="space-y-8 mt-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Vision
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Offer world class reliable construction equipment to
                        our clients worldwide.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Help customers meet their requirements with customized
                        solutions at reasonable prices. .
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Make Alfanio, a trusted name in the field of
                        construction equipment. .
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Mission
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ To fulfil customers' requirements in terms of quality,
                        delivery and cost.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ To be preferred as one of the most trusted resource in
                        manufacturing of modern construction equipment.
                      </span>
                    </li>
                  </ul>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    Strategic Goals
                  </h3>
                  <p className="text-gray-600 mb-3">We are determined to—</p>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ To establish Alfanio as a sustainable and reliable
                        source of construction equipment and OEM spare parts.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Make user-friendly construction equipment in line with
                        operational requirements on site.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Offer fair competitive pricing to our customers with
                        the most trusted products.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Achieve customer satisfaction through prompt response,
                        quality performance and adherence to customer
                        expectations.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="text-gray-600">
                        ❖ Build long lasting partnership with customers and
                        vendors.
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-4">
              <img
                src={factoryImage}
                alt="Factory"
                className="rounded-lg shadow-2xl w-full h-64 object-cover object-center"
                loading="eager"
                draggable="false"
              />
              <img
                src={machineImage1}
                alt="Machine"
                className="rounded-lg shadow-2xl w-full h-64 object-cover object-center"
                loading="eager"
                draggable="false"
              />
              <img
                src={mixerImage}
                alt="Machine"
                className="rounded-lg shadow-2xl w-full h-64 object-cover object-center"
                loading="eager"
                draggable="false"
              />
              <img
                src={mixerImage2}
                alt="Mixer"
                className="rounded-lg shadow-2xl w-full h-64 object-cover object-center"
                loading="eager"
                draggable="false"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="py-24 bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Leadership Team
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our expert team brings over 100 years of combined experience in
              construction equipment manufacturing, driving innovation and
              excellence in concrete machinery solutions across India and global
              markets.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Leadership Card - Anand Sali */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[400px] overflow-hidden ">
                <img
                  src={profileAnand}
                  alt="Mr. Anand Sali"
                  className="w-full h-full object-cover  object-top transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Experience Tag */}
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FECC00] text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                    35+ Years Experience
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FECC00] transition-colors duration-300">
                    Anand Sali
                  </h3>
                  <p className="text-lg font-semibold text-[#FECC00] uppercase tracking-wider">
                    Managing Director
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  Innovation leader in construction equipment design with deep
                  understanding of concrete technology.
                </p>

                {/* Expertise Areas */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaTools className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Equipment Design
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaLightbulb className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Innovation
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaCog className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Technical Excellence
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
            {/* Leadership Card - Sudhakar Waggh */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[400px] overflow-hidden">
                <img
                  src={profileSudhakar}
                  alt="Mr. Sudhakar Waggh"
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Experience Tag */}
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FECC00] text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                    25+ Years Experience
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FECC00] transition-colors duration-300">
                    Sudhakar Waggh
                  </h3>
                  <p className="text-lg font-semibold text-[#FECC00] uppercase tracking-wider">
                    Director
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  Leading our production team with expertise in concrete pump
                  manufacturing and quality control processes.
                </p>

                {/* Expertise Areas */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaTools className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Production Management
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaWrench className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Technical Support
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaChartLine className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Process Optimization
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Leadership Card - Sachin Jagtap */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[400px] overflow-hidden">
                <img
                  src={profileSachin}
                  alt="Mr. Sachin Jagtap"
                  className="w-full h-full object-cover object-center transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Experience Tag */}
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FECC00] text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                    25+ Years Experience
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FECC00] transition-colors duration-300">
                    Sachin Jagtap
                  </h3>
                  <p className="text-lg font-semibold text-[#FECC00] uppercase tracking-wider">
                    Director
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  Strategic procurement expert specializing in supply chain
                  optimization and vendor relationship management.
                </p>

                {/* Expertise Areas */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaLightbulb className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Strategic Planning
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaHandshake className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Vendor Management
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaTruck className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Supply Chain Management
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Leadership Card - Abhijeet Sonawane */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[400px] overflow-hidden">
                <img
                  src={profileAbhijeet}
                  alt="Mr. Abhijeet Sonawane"
                  className="w-full h-full object-cover  object-top transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Experience Tag */}
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FECC00] text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                    25+ Years Experience
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FECC00] transition-colors duration-300">
                    Abhijeet Sonawane
                  </h3>
                  <p className="text-lg font-semibold text-[#FECC00] uppercase tracking-wider">
                    Director
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  Leading after-sales support and spare parts management with
                  dedication to customer satisfaction.
                </p>

                {/* Expertise Areas */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaWrench className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Technical Support
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaCog className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      After Sales Support
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaUsers className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Customer Service
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Leadership Card - Ravindra Vyas */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              viewport={{ once: true }}
              className="group relative bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
            >
              <div className="relative h-[400px] overflow-hidden">
                <img
                  src={profileRavindra}
                  alt="Mr. Ravindra Vyas"
                  className="w-full h-full object-cover  object-top transform group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                {/* Experience Tag */}
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FECC00] text-black text-sm font-semibold py-2 px-4 rounded-full shadow-lg">
                    25+ Years Experience
                  </span>
                </div>
              </div>

              <div className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-[#FECC00] transition-colors duration-300">
                    Ravindra Vyas
                  </h3>
                  <p className="text-lg font-semibold text-[#FECC00] uppercase tracking-wider">
                    {" "}
                    Director
                  </p>
                </div>

                <p className="text-gray-600 leading-relaxed mb-6">
                  Strategic sales leader with expertise in market development
                  and industry connections.
                </p>

                {/* Expertise Areas */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaHandshake className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Business Development
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaUsers className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Client Relations
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center">
                      <FaChartLine className="w-5 h-5 text-[#FECC00]" />
                    </div>
                    <span className="text-gray-700 font-medium">
                      Market Growth
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Timeline with Visual Elements */}
      <div className="py-20">
        <div className="container mx-auto px-4 relative">
          <h2 className="text-3xl font-bold text-gray-900 mb-12 text-center">
            Our Journey
          </h2>
          <div className="relative">
            {/* Timeline line with gradient - hidden on mobile */}
            <div className="absolute left-1/2 transform -translate-x-1/2 h-full hidden md:block">
              <div className="w-1 h-full bg-gradient-to-b from-[#FECC00] via-[#FECC00] to-[#FECC00]/20"></div>
            </div>
            {milestones.map((milestone, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className={`flex flex-col md:flex-row items-center mb-16 relative ${
                  index % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Mobile timeline line */}
                <div className="absolute left-4 top-0 h-full w-1 bg-gradient-to-b from-[#FECC00] via-[#FECC00] to-[#FECC00]/20 md:hidden"></div>

                {/* Timeline dot - mobile */}
                <div className="absolute left-[14px] top-8 md:hidden">
                  <div className="w-3 h-3 bg-[#FECC00] rounded-full shadow-lg"></div>
                </div>

                <div className="md:w-1/2 p-6 pl-10 md:pl-6 relative z-10 w-full">
                  <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                    <span className="text-[#FECC00] font-bold text-xl block mb-3">
                      {milestone.year}
                    </span>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {milestone.title}
                    </h3>
                    <p className="text-gray-600">{milestone.description}</p>
                  </div>
                </div>

                {/* Timeline dot - desktop */}
                <div className="hidden md:flex w-16 items-center justify-center relative z-20">
                  <div className="w-4 h-4 bg-[#FECC00] rounded-full shadow-lg relative">
                    <div className="absolute inset-0 bg-[#FECC00] rounded-full animate-ping opacity-25"></div>
                  </div>
                </div>

                <div className="md:w-1/2" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default About;
