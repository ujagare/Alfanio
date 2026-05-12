import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import {
  FaChartLine,
  FaCheckCircle,
  FaCog,
  FaHandshake,
  FaIndustry,
  FaLightbulb,
  FaTools,
  FaTruck,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import heroImage from "../assets/alafa-images/CPH50-3 (16).webp";
import factoryImage from "../assets/alafa-images/97843  (11).webp";
import machineImage1 from "../assets/alafa-images/20211116_114205 (2).webp";
import mixerImage from "../assets/alafa-images/Planetary-Concrete-Mixer.jpg";
import mixerImage2 from "../assets/alafa-images/White-Pump.webp";
import profileAbhijeet from "../assets/Profile/Abhijeet.jpg";
import profileAnand from "../assets/Profile/Anand Sali.jpg";
import profileSachin from "../assets/Profile/Sachin Jagtap.jpg";
import profileSudhakar from "../assets/Profile/Sudhakar WAGGH.jpg";
import profileRavindra from "../assets/Profile/Ravindra Vyas.jpg";
import AlfanioLogo from "../assets/Alfanio.png";

const stats = [
  { key: "projects", value: 125, suffix: "+", label: "Installations" },
  { key: "clients", value: 100, suffix: "+", label: "Worldwide Reach" },
  { key: "experience", value: 25, suffix: "+", label: "Years Experience" },
  { key: "team", value: 35, suffix: "+", label: "Team Members" },
];

const principles = [
  {
    title: "Vision",
    icon: FaLightbulb,
    items: [
      "Offer world-class reliable construction equipment to clients worldwide.",
      "Help customers meet project-specific requirements with customized solutions.",
      "Build Alfanio as a trusted name in construction equipment.",
    ],
  },
  {
    title: "Mission",
    icon: FaIndustry,
    items: [
      "Fulfil customer requirements in quality, delivery, and cost.",
      "Be preferred as a trusted resource for modern construction equipment.",
    ],
  },
  {
    title: "Strategic Goals",
    icon: FaCheckCircle,
    items: [
      "Establish a reliable source for construction equipment and OEM spares.",
      "Make user-friendly equipment aligned with real site requirements.",
      "Build lasting partnerships with customers and vendors.",
    ],
  },
];

const leadership = [
  {
    name: "Anand Sali",
    role: "Managing Director",
    image: profileAnand,
    experience: "35+ Years Experience",
    description:
      "Innovation leader in construction equipment design with deep understanding of concrete technology.",
    expertise: [
      { label: "Equipment Design", icon: FaTools },
      { label: "Innovation", icon: FaLightbulb },
      { label: "Technical Excellence", icon: FaCog },
    ],
  },
  {
    name: "Sudhakar Waggh",
    role: "Director",
    image: profileSudhakar,
    experience: "25+ Years Experience",
    description:
      "Leads production with expertise in concrete pump manufacturing and quality control processes.",
    expertise: [
      { label: "Production Management", icon: FaTools },
      { label: "Technical Support", icon: FaWrench },
      { label: "Process Optimization", icon: FaChartLine },
    ],
  },
  {
    name: "Sachin Jagtap",
    role: "Director",
    image: profileSachin,
    experience: "25+ Years Experience",
    description:
      "Procurement expert focused on supply-chain strength and long-term vendor relationships.",
    expertise: [
      { label: "Strategic Planning", icon: FaLightbulb },
      { label: "Vendor Management", icon: FaHandshake },
      { label: "Supply Chain", icon: FaTruck },
    ],
  },
  {
    name: "Abhijeet Sonawane",
    role: "Director",
    image: profileAbhijeet,
    experience: "25+ Years Experience",
    description:
      "Drives after-sales support and spare parts management with a customer-first approach.",
    expertise: [
      { label: "Technical Support", icon: FaWrench },
      { label: "After Sales", icon: FaCog },
      { label: "Customer Service", icon: FaUsers },
    ],
  },
  {
    name: "Ravindra Vyas",
    role: "Director",
    image: profileRavindra,
    experience: "25+ Years Experience",
    description:
      "Sales leader with strong market development experience and industry relationships.",
    expertise: [
      { label: "Business Development", icon: FaHandshake },
      { label: "Client Relations", icon: FaUsers },
      { label: "Market Growth", icon: FaChartLine },
    ],
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
      "Launched the first concrete pump after focused product development to improve reliability, serviceability, and site performance.",
  },
  {
    year: "2022",
    title: "Mixer Range Expansion",
    description:
      "Introduced twin-shaft and planetary mixers, and began export of concrete pump units to OEM and shotcrete applications.",
  },
  {
    year: "2023",
    title: "Color Dosing System",
    description:
      "Launched pigment dosing solutions and expanded exports across African and Latin American markets.",
  },
  {
    year: "2024",
    title: "Export To USA",
    description:
      "Started exporting customized pumps to the USA and launched high-performance concrete pump solutions with Tier 4 Final emission readiness.",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

const About = () => {
  const [counts, setCounts] = useState({
    projects: 0,
    clients: 0,
    experience: 0,
    team: 0,
  });

  const [statsRef, statsInView] = useInView({
    triggerOnce: true,
    threshold: 0.35,
  });

  useEffect(() => {
    if (!statsInView) return undefined;

    const duration = 1200;
    const startedAt = performance.now();
    let frameId;

    const animate = (time) => {
      const progress = Math.min((time - startedAt) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);

      setCounts(
        stats.reduce((acc, stat) => {
          acc[stat.key] = Math.round(stat.value * eased);
          return acc;
        }, {})
      );

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      }
    };

    frameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameId);
  }, [statsInView]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-white text-gray-900"
    >
      <section className="relative min-h-[calc(100vh-80px)] overflow-hidden bg-black">
        <img
          src={heroImage}
          alt="Alfanio manufacturing equipment"
          className="absolute inset-0 h-full w-full object-cover object-top opacity-70" loading="eager" decoding="async"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/75 to-black/25" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-7xl items-center px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.75 }}
            className="max-w-3xl py-20"
          >
            <img src={AlfanioLogo} alt="Alfanio" className="mb-8 h-16 w-auto" loading="eager" decoding="async" />
            <p className="mb-5 inline-flex border border-[#FECC00]/40 bg-[#FECC00]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[3px] text-[#FECC00]">
              Modern Construction Equipment
            </p>
            <h1 className="text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-7xl">
              Engineering reliable machines for demanding construction sites.
            </h1>
            <p className="mt-6 max-w-2xl text-base leading-8 text-white/75 sm:text-lg">
              Alfanio India Pvt Ltd is a Pune-based manufacturing company built
              by technocrats with decades of experience in construction
              equipment manufacturing and service.
            </p>
          </motion.div>
        </div>
      </section>

      <section ref={statsRef} className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl grid-cols-2 border border-white/10 bg-[#FECC00] shadow-2xl md:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.key}
              className="border-b border-black/10 p-5 text-center md:border-b-0 md:border-r last:border-r-0 sm:p-7"
            >
              <p className="text-3xl font-black text-black sm:text-5xl">
                {counts[stat.key] || 0}
                {stat.suffix}
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[2px] text-black/65">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#FECC00]">
              Who We Are
            </p>
            <h2 className="mt-4 text-3xl font-bold leading-tight text-gray-950 sm:text-5xl">
              Built by technocrats. Focused on site-ready performance.
            </h2>
            <div className="mt-7 space-y-5 text-base leading-8 text-gray-600">
              <p>
                Alfanio India Pvt Ltd is a 100% Indian manufacturing company in
                modern construction equipment. It was created after the founders
                came together with a clear objective: offer better products than
                the equipment commonly available in the market.
              </p>
              <p>
                The directors are technocrats with more than 25 years of
                individual experience in manufacturing and service. That
                perspective helps the company upgrade equipment for reliability,
                easy maintenance, and trouble-free operation.
              </p>
              <p>
                Based in Pune with production at the Chakan industrial township,
                Alfanio manufactures world-class construction equipment,
                special-purpose machines, and customized systems.
              </p>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-4">
            {[factoryImage, machineImage1, mixerImage, mixerImage2].map(
              (image, index) => (
                <motion.img
                  key={image}
                  src={image}
                  alt={`Alfanio facility ${index + 1}`}
                  loading="eager"
                  draggable="false"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.08 }}
                  className={`h-52 w-full object-cover shadow-xl sm:h-64 ${
                    index === 1 || index === 2 ? "mt-8" : ""
                  }`}
                />
              )
            )}
          </div>
        </div>
      </section>

      <section className="bg-gray-950 py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#FECC00]">
              Direction
            </p>
            <h2 className="mt-4 text-3xl font-bold text-white sm:text-5xl">
              Principles that guide every machine we build.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            {principles.map((principle, index) => {
              const Icon = principle.icon;
              return (
                <motion.div
                  key={principle.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.45, delay: index * 0.08 }}
                  className="border border-white/10 bg-white/[0.06] p-6"
                >
                  <div className="mb-6 flex h-12 w-12 items-center justify-center bg-[#FECC00] text-black">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">
                    {principle.title}
                  </h3>
                  <ul className="mt-5 space-y-4">
                    {principle.items.map((item) => (
                      <li key={item} className="flex gap-3 text-sm leading-7 text-white/70">
                        <FaCheckCircle className="mt-1.5 h-4 w-4 flex-shrink-0 text-[#FECC00]" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#FECC00]">
              Leadership
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-950 sm:text-5xl">
              Experience behind the equipment.
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-base leading-8 text-gray-600">
              Our leadership team brings deep domain experience across design,
              production, procurement, service, sales, and customer support.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {leadership.map((member, index) => (
              <motion.article
                key={member.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.06 }}
                className="group overflow-hidden border border-gray-200 bg-white shadow-lg transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl"
              >
                <div className="relative h-[360px] overflow-hidden bg-gray-100">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="h-full w-full object-cover object-top transition-transform duration-700 group-hover:scale-105" loading="lazy" decoding="async"
                  />
                  <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/80 to-transparent" />
                  <span className="absolute right-4 top-4 bg-[#FECC00] px-3 py-2 text-xs font-bold uppercase tracking-wide text-black">
                    {member.experience}
                  </span>
                  <div className="absolute bottom-5 left-5 right-5">
                    <h3 className="text-2xl font-bold text-white">{member.name}</h3>
                    <p className="mt-1 text-sm font-semibold uppercase tracking-[2px] text-[#FECC00]">
                      {member.role}
                    </p>
                  </div>
                </div>

                <div className="p-6">
                  <p className="min-h-[84px] text-sm leading-7 text-gray-600">
                    {member.description}
                  </p>
                  <div className="mt-6 space-y-3">
                    {member.expertise.map((skill) => {
                      const Icon = skill.icon;
                      return (
                        <div key={skill.label} className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center bg-yellow-50 text-[#FECC00]">
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-sm font-semibold text-gray-800">
                            {skill.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20 sm:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="mb-14 text-center">
            <p className="text-sm font-semibold uppercase tracking-[3px] text-[#FECC00]">
              Journey
            </p>
            <h2 className="mt-4 text-3xl font-bold text-gray-950 sm:text-5xl">
              Milestones of growth and innovation.
            </h2>
          </div>

          <div className="relative">
            <div className="absolute left-4 top-0 h-full w-px bg-gradient-to-b from-[#FECC00] via-gray-300 to-transparent md:left-1/2" />
            {milestones.map((milestone, index) => (
              <motion.div
                key={milestone.year}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45 }}
                className={`relative mb-8 flex md:mb-10 ${
                  index % 2 === 0 ? "md:justify-start" : "md:justify-end"
                }`}
              >
                <div className="absolute left-[11px] top-7 h-3 w-3 bg-[#FECC00] shadow md:left-1/2 md:-ml-1.5" />
                <div className="ml-10 w-full border border-gray-200 bg-white p-6 shadow-lg md:ml-0 md:w-[46%]">
                  <span className="text-sm font-black uppercase tracking-[3px] text-[#FECC00]">
                    {milestone.year}
                  </span>
                  <h3 className="mt-3 text-2xl font-bold text-gray-950">
                    {milestone.title}
                  </h3>
                  <p className="mt-3 text-sm leading-7 text-gray-600">
                    {milestone.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </motion.div>
  );
};

export default About;
