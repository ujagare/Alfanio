import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import {
  FaArrowRight,
  FaBolt,
  FaCheckCircle,
  FaClock,
  FaEnvelope,
  FaHeadset,
  FaIndustry,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaTruck,
  FaWhatsapp,
} from "react-icons/fa";
import alfanioLogo from "../assets/Alfanio.png";
import { API_ENDPOINTS } from "../config";
import CountryCodeSelect from "../Components/CountryCodeSelect";

const heroImage =
  "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=2070&auto=format&fit=crop";

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

const contactCards = [
  {
    icon: FaPhoneAlt,
    title: "Call Sales",
    eyebrow: "Direct assistance",
    lines: [
      { label: "+91 79729 24631", href: "tel:+917972924631" },
      { label: "+91 96876 18558", href: "tel:+919687618558" },
    ],
  },
  {
    icon: FaEnvelope,
    title: "Email Team",
    eyebrow: "Sales, service & spares",
    lines: [
      { label: "sales@alfanio.com", href: "mailto:sales@alfanio.com" },
      { label: "spares@alfanio.com", href: "mailto:spares@alfanio.com" },
      { label: "service@alfanio.com", href: "mailto:service@alfanio.com" },
      { label: "alfanioindia@gmail.com", href: "mailto:alfanioindia@gmail.com" },
    ],
  },
  {
    icon: FaMapMarkerAlt,
    title: "Visit Factory",
    eyebrow: "Manufacturing address",
    lines: [
      { label: "Gate No.282, Village Kuruli" },
      { label: "Pune 410501, Maharashtra" },
    ],
  },
];

const quickActions = [
  { icon: FaHeadset, title: "Technical Support", text: "24/7 assistance for commissioned equipment." },
  { icon: FaTruck, title: "Dispatch Updates", text: "Coordinated shipping and delivery tracking." },
  { icon: FaIndustry, title: "Factory Visit", text: "Plan a guided visit to the manufacturing facility." },
];

const fieldClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-[#FECC00] focus:ring-4 focus:ring-[#FECC00]/20";

const labelClass = "mb-2 block text-sm font-semibold text-zinc-800";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [countryCode, setCountryCode] = useState("+91");
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
    },
  });

  const phone = watch("phone");
  const formatPhoneNumber = useCallback(() => {
    if (phone) {
      const formatted = phone.replace(/\D/g, "").slice(0, 10);
      if (formatted !== phone) {
        setValue("phone", formatted, {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    }
  }, [phone, setValue]);

  useEffect(() => {
    formatPhoneNumber();
  }, [phone, formatPhoneNumber]);

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
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
        let errorMessage = `Server responded with status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch {
          await response.text();
        }
        throw new Error(errorMessage);
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
      toast.error(
        error.message || "Failed to send message. Please try again.",
        toastStyles
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const textVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.75,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.main
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative min-h-screen overflow-hidden bg-[#f6f4ef]"
    >
      <section className="relative min-h-[78vh] overflow-hidden bg-zinc-950">
        <img
          src={heroImage}
          alt="Alfanio construction equipment support"
          className="absolute inset-0 h-full w-full object-cover"
          loading="eager"
          decoding="async"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(9,9,11,0.9)_0%,rgba(24,24,27,0.68)_48%,rgba(24,24,27,0.32)_100%)]" />
        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#f6f4ef] to-transparent" />

        <div className="relative mx-auto flex min-h-[78vh] max-w-7xl items-center px-4 pb-24 pt-32 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="mb-8 flex w-fit items-center gap-4 rounded-full border border-white/15 bg-white/10 px-5 py-3 backdrop-blur"
            >
              <img
                src={alfanioLogo}
                alt="Alfanio Logo"
                className="h-10 w-auto object-contain"
              />
              <span className="h-8 w-px bg-white/20" />
              <span className="text-sm font-semibold uppercase tracking-[0.22em] text-[#FECC00]">
                Contact Desk
              </span>
            </motion.div>

            <motion.h1
              variants={textVariants}
              initial="hidden"
              animate="visible"
              className="max-w-2xl text-4xl font-black leading-tight text-white sm:text-5xl lg:text-7xl"
            >
              Connect with Alfanio&apos;s equipment experts.
            </motion.h1>
            <motion.p
              variants={textVariants}
              initial="hidden"
              animate="visible"
              transition={{ delay: 0.15 }}
              className="mt-6 max-w-2xl text-base leading-8 text-zinc-100 sm:text-lg"
            >
              From product selection to service support, our team helps you move
              faster with reliable construction equipment guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="mt-9 flex flex-col gap-4 sm:flex-row"
            >
              <a
                href="tel:+917972924631"
                className="inline-flex items-center justify-center gap-3 rounded-lg bg-[#FECC00] px-6 py-3.5 text-sm font-bold text-zinc-950 shadow-xl shadow-[#FECC00]/20 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#f1be00]"
              >
                <FaPhoneAlt className="h-4 w-4" />
                Call Now
              </a>
              <a
                href="https://wa.me/917972924631"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-3 rounded-lg border border-white/25 bg-white/10 px-6 py-3.5 text-sm font-bold text-white backdrop-blur transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/15"
              >
                <FaWhatsapp className="h-4 w-4" />
                WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="relative z-10 mx-auto -mt-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
          {contactCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <motion.article
                key={card.title}
                initial={{ y: 24, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.18 + index * 0.08 }}
                className="group relative overflow-hidden rounded-lg border border-white/70 bg-white p-6 shadow-2xl shadow-zinc-900/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[#FECC00]/20"
              >
                <div className="absolute inset-x-0 top-0 h-1 bg-[#FECC00]" />
                <div className="mb-6 flex items-center justify-between gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-zinc-950 text-[#FECC00] shadow-lg shadow-zinc-900/15 transition-transform duration-300 group-hover:scale-105">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="rounded-full bg-[#FECC00]/15 px-3 py-1 text-xs font-bold uppercase tracking-wider text-zinc-800">
                    {card.eyebrow}
                  </span>
                </div>
                <h2 className="text-xl font-black text-zinc-950">
                  {card.title}
                </h2>
                <div className="mt-4 space-y-2">
                  {card.lines.map((line) =>
                    line.href ? (
                      <a
                        key={line.label}
                        href={line.href}
                        className="block break-words text-sm font-semibold text-zinc-600 transition-colors hover:text-[#c99d00]"
                      >
                        {line.label}
                      </a>
                    ) : (
                      <p key={line.label} className="text-sm font-semibold text-zinc-600">
                        {line.label}
                      </p>
                    )
                  )}
                </div>
              </motion.article>
            );
          })}
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[0.92fr_1.08fr] lg:px-8">
        <motion.aside
          initial={{ opacity: 0, x: -24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="relative overflow-hidden rounded-lg bg-zinc-950 p-7 text-white shadow-2xl shadow-zinc-900/15 sm:p-9"
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-bl-full bg-[#FECC00]/15" />
          <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[#FECC00]">
            <FaBolt className="h-3.5 w-3.5" />
            Priority Response
          </span>
          <h2 className="mt-7 text-3xl font-black leading-tight sm:text-4xl">
            Share your requirement. We&apos;ll route it to the right expert.
          </h2>
          <p className="mt-5 text-sm leading-7 text-zinc-300">
            Send machine type, capacity, project location, or service needs.
            The more detail you add, the faster our team can respond.
          </p>

          <div className="mt-8 space-y-4">
            {["Product selection guidance", "Spares and service support", "Factory visit coordination"].map(
              (item) => (
                <div key={item} className="flex items-center gap-3 text-sm font-semibold text-zinc-100">
                  <FaCheckCircle className="h-4 w-4 flex-shrink-0 text-[#FECC00]" />
                  {item}
                </div>
              )
            )}
          </div>

          <div className="mt-9 rounded-lg border border-white/10 bg-white/5 p-5">
            <div className="flex items-center gap-3">
              <FaClock className="h-5 w-5 text-[#FECC00]" />
              <h3 className="font-bold">Business Hours</h3>
            </div>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-300">Monday - Saturday</span>
                <span className="font-bold text-white">9:00 AM - 6:00 PM</span>
              </div>
              <div className="flex items-center justify-between gap-4">
                <span className="text-zinc-300">Sunday</span>
                <span className="font-bold text-white">Closed</span>
              </div>
            </div>
          </div>
        </motion.aside>

        <motion.div
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.42 }}
          className="rounded-lg border border-zinc-200 bg-white p-5 shadow-2xl shadow-zinc-900/10 sm:p-8"
        >
          <div className="mb-8 flex flex-col justify-between gap-4 border-b border-zinc-100 pb-6 sm:flex-row sm:items-end">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#c99d00]">
                Inquiry Form
              </span>
              <h2 className="mt-3 text-3xl font-black text-zinc-950">
                How can we help you?
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-zinc-500">
              Usually replied to within one business day.
            </p>
          </div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="grid grid-cols-1 gap-5 md:grid-cols-2"
          >
            <div>
              <label className={labelClass}>Name *</label>
              <input
                type="text"
                {...register("name", { required: "Name is required" })}
                className={fieldClass}
                placeholder="Your name"
              />
              {errors.name && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label className={labelClass}>Email *</label>
              <input
                type="email"
                {...register("email", {
                  required: "Email is required",
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: "Invalid email address",
                  },
                })}
                className={fieldClass}
                placeholder="your@email.com"
              />
              {errors.email && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Phone *</label>
              <div className="flex">
                <CountryCodeSelect
                  value={countryCode}
                  onChange={setCountryCode}
                  className="w-28 flex-shrink-0 rounded-l-lg border-zinc-200 bg-zinc-50 py-3"
                />
                <input
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  {...register("phone", {
                    required: "Phone number is required",
                    pattern: {
                      value: /^[+]?[0-9\s\-()]{8,20}$/,
                      message: "Please enter a valid phone number",
                    },
                  })}
                  className="w-full rounded-r-lg border border-l-0 border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-900 shadow-sm outline-none transition-all duration-200 placeholder:text-zinc-400 focus:border-[#FECC00] focus:ring-4 focus:ring-[#FECC00]/20"
                  placeholder="Phone number"
                />
              </div>
              {errors.phone && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Message *</label>
              <textarea
                {...register("message", {
                  required: "Message is required",
                })}
                rows={5}
                className={`${fieldClass} resize-none`}
                placeholder="Tell us about machine type, capacity, location, or support requirement"
              />
              {errors.message && (
                <p className="mt-2 text-sm font-medium text-red-600">
                  {errors.message.message}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`inline-flex w-full items-center justify-center gap-3 rounded-lg px-8 py-4 text-sm font-black shadow-xl transition-all duration-300 sm:w-auto ${
                  isSubmitting
                    ? "cursor-not-allowed bg-zinc-300 text-zinc-600"
                    : "bg-[#FECC00] text-zinc-950 shadow-[#FECC00]/25 hover:-translate-y-0.5 hover:bg-[#f1be00]"
                }`}
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
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
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <FaArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </section>

      <section className="mx-auto grid max-w-7xl grid-cols-1 gap-5 px-4 pb-14 sm:px-6 md:grid-cols-3 lg:px-8">
        {quickActions.map((item, index) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 + index * 0.08 }}
              className="rounded-lg border border-zinc-200 bg-white p-6 shadow-lg shadow-zinc-900/5"
            >
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-lg bg-[#FECC00]/20 text-zinc-950">
                <Icon className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-black text-zinc-950">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-zinc-600">{item.text}</p>
            </motion.div>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.72 }}
          className="overflow-hidden rounded-lg border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/10"
        >
          <div className="flex flex-col justify-between gap-4 border-b border-zinc-100 p-6 sm:flex-row sm:items-center">
            <div>
              <span className="text-xs font-black uppercase tracking-[0.22em] text-[#c99d00]">
                Location
              </span>
              <h2 className="mt-2 text-2xl font-black text-zinc-950">
                Alfanio Manufacturing Facility
              </h2>
            </div>
            <p className="max-w-md text-sm leading-6 text-zinc-500">
              Gate No.282, Village Kuruli, Pune 410501, Maharashtra
            </p>
          </div>
          <div className="relative h-[320px] w-full md:h-[460px]">
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
            />
          </div>
        </motion.div>
      </section>
    </motion.main>
  );
};

export default Contact;
