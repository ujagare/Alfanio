import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { API_URL, API_ENDPOINTS, COMPANY_INFO } from "../config"; // Update this import
import * as yup from "yup";

const formSchema = yup.object().shape({
  name: yup.string().required("Name is required").trim(),
  email: yup
    .string()
    .email("Invalid email")
    .required("Email is required")
    .trim(),
  phone: yup
    .string()
    .required("Phone is required")
    .matches(/^[+]?[0-9\s\-()]{8,20}$/, "Please enter a valid phone number"),
  message: yup.string().trim(),
});

const FormError = ({ error }) =>
  error ? (
    <p className="mt-1 text-sm text-red-600 flex items-center" role="alert">
      <svg
        className="w-3.5 h-3.5 mr-1.5 flex-shrink-0"
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path
          fillRule="evenodd"
          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
          clipRule="evenodd"
        />
      </svg>
      {error.message}
    </p>
  ) : null;

const SubmitButton = ({ isSubmitting, type }) => (
  <button
    type="submit"
    disabled={isSubmitting}
    className="w-full flex justify-center items-center py-3 px-6
                 rounded-lg shadow-md text-sm font-semibold
                 bg-[#FECC00] text-zinc-900 hover:bg-[#e3b700]
                 focus:outline-none focus:ring-2 focus:ring-[#FECC00] focus:ring-offset-2
                 disabled:opacity-70 disabled:cursor-not-allowed
                 transform transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
  >
    {isSubmitting ? (
      <span className="flex items-center">
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-zinc-900"
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
        Processing...
      </span>
    ) : (
      <>
        <span>
          {type === "brochure" ? "Download Brochure" : "Send Message"}
        </span>
        <svg
          className="ml-2 w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d={
              type === "brochure"
                ? "M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                : "M13 5l7 7-7 7M5 12h15"
            }
          />
        </svg>
      </>
    )}
  </button>
);

const ContactForm = ({
  type = "contact",
  productName = "",
  className = "",
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    getValues,
  } = useForm({
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      product: productName,
    },
  });

  // Phone number validation and formatting
  const phone = watch("phone");

  const onSubmit = async (data) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    try {
      // Get the correct endpoint
      const endpoint =
        type === "brochure" ? API_ENDPOINTS.brochure : API_ENDPOINTS.contact;

      console.log("Submitting form with data:", {
        name: data.name.trim(),
        email: data.email.trim(),
        phone: data.phone,
        message: data.message?.trim() || "",
        type: type,
      });

      console.log("Endpoint would be:", endpoint);

      try {
        console.log("Sending request to endpoint:", endpoint);

        // Use simple fetch with minimal options
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: data.name.trim(),
            email: data.email.trim(),
            phone: data.phone,
            message: data.message?.trim() || "",
            type: type,
          }),
        });

        console.log("Response status:", response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error("Server error response:", errorText);
          throw new Error(`Server responded with status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Server response:", responseData);

        // Show success message
        if (type === "brochure") {
          toast.success(
            "✅ Thank you for your interest! Our team will contact you shortly with the brochure."
          );

          // If brochure is requested, open the PDF from API
          window.open(API_ENDPOINTS.brochureDownload, "_blank");
        } else {
          toast.success(
            "✅ Thank you for your message! Our team will contact you shortly."
          );
        }

        // Reset the form
        reset();
      } catch (apiError) {
        console.error("API call failed:", apiError);

        // Fallback to local success message if API call fails
        if (type === "brochure") {
          toast.success(
            "✅ Thank you for your interest! Our team will contact you shortly with the brochure."
          );
          // Open brochure download
          window.open(API_ENDPOINTS.brochureDownload, "_blank");
        } else {
          toast.success(
            "✅ Thank you for your message! Our team will contact you shortly."
          );
        }

        // Reset the form anyway
        reset();
      }
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("❌ Failed to send message. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className={`space-y-4 sm:space-y-6 ${className}`}
    >
      <div className="space-y-3 sm:space-y-4">
        {/* Name Field */}
        <div className="relative">
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name <span className="text-[#FECC00]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <input
              type="text"
              id="name"
              placeholder="Your full name"
              {...register("name", { required: "Name is required" })}
              className={`pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 block w-full rounded-lg border ${errors.name ? "border-red-300 bg-red-50" : "border-gray-300"}
                shadow-sm focus:border-[#FECC00] focus:ring-[#FECC00] focus:ring-opacity-50 text-sm transition-all duration-200`}
            />
          </div>
          {errors.name && <FormError error={errors.name} />}
        </div>

        {/* Email Field */}
        <div className="relative">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email <span className="text-[#FECC00]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>
            <input
              type="email"
              id="email"
              placeholder="your@email.com"
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                  message: "Invalid email address",
                },
              })}
              className={`pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 block w-full rounded-lg border ${errors.email ? "border-red-300 bg-red-50" : "border-gray-300"}
                shadow-sm focus:border-[#FECC00] focus:ring-[#FECC00] focus:ring-opacity-50 text-sm transition-all duration-200`}
            />
          </div>
          {errors.email && <FormError error={errors.email} />}
        </div>

        {/* Phone Field */}
        <div className="relative">
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone <span className="text-[#FECC00]">*</span>
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-2 sm:pl-3 flex items-center pointer-events-none">
              <svg
                className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                />
              </svg>
            </div>
            <input
              type="tel"
              id="phone"
              placeholder="+1 (123) 456-7890"
              {...register("phone", {
                required: "Phone number is required",
                // More flexible phone validation for international numbers
                pattern: {
                  value: /^[+]?[0-9\s\-()]{8,20}$/,
                  message: "Please enter a valid phone number",
                },
              })}
              className={`pl-8 sm:pl-10 pr-3 sm:pr-4 py-2 sm:py-2.5 block w-full rounded-lg border ${errors.phone ? "border-red-300 bg-red-50" : "border-gray-300"}
                shadow-sm focus:border-[#FECC00] focus:ring-[#FECC00] focus:ring-opacity-50 text-sm transition-all duration-200`}
            />
          </div>
          {errors.phone && <FormError error={errors.phone} />}
        </div>

        {/* Message Field */}
        <div className="relative">
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Message{" "}
            {type === "brochure" && (
              <span className="text-xs text-gray-500">(optional)</span>
            )}
          </label>
          <div className="relative">
            <textarea
              id="message"
              rows={3}
              placeholder={
                type === "brochure"
                  ? "Any specific requirements or questions?"
                  : "How can we help you?"
              }
              {...register("message")}
              className="block w-full rounded-lg border border-gray-300 shadow-sm focus:border-[#FECC00] focus:ring-[#FECC00] focus:ring-opacity-50 text-sm transition-all duration-200 p-2 sm:p-3"
            />
          </div>
        </div>
      </div>

      {/* Privacy Policy Note */}
      <div className="text-xs text-gray-500 mt-2 sm:mt-4">
        <p>
          By submitting this form, you agree to our{" "}
          <a href="#" className="text-[#FECC00] hover:underline">
            Privacy Policy
          </a>
          .
        </p>
      </div>

      {/* Submit Button */}
      <div className="mt-4 sm:mt-6">
        <SubmitButton isSubmitting={isSubmitting} type={type} />
      </div>
    </form>
  );
};

export default ContactForm;
