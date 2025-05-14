import React, { useState, useEffect } from "react";
import axios from "axios";
import { API_URL, API_ENDPOINTS } from "..\config";

// Country codes list
const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+91", country: "India" },
  { code: "+61", country: "Australia" },
  { code: "+49", country: "Germany" },
  { code: "+33", country: "France" },
  { code: "+86", country: "China" },
  { code: "+81", country: "Japan" },
  { code: "+7", country: "Russia" },
  { code: "+55", country: "Brazil" },
  { code: "+27", country: "South Africa" },
  { code: "+971", country: "UAE" },
  { code: "+966", country: "Saudi Arabia" },
  { code: "+65", country: "Singapore" },
  { code: "+60", country: "Malaysia" },
  { code: "+64", country: "New Zealand" },
  { code: "+34", country: "Spain" },
  { code: "+39", country: "Italy" },
  { code: "+31", country: "Netherlands" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+41", country: "Switzerland" },
  { code: "+43", country: "Austria" },
  { code: "+32", country: "Belgium" },
  { code: "+351", country: "Portugal" },
  { code: "+353", country: "Ireland" },
  { code: "+30", country: "Greece" },
  { code: "+48", country: "Poland" },
  { code: "+36", country: "Hungary" },
  { code: "+420", country: "Czech Republic" },
  { code: "+90", country: "Turkey" },
  { code: "+972", country: "Israel" },
  { code: "+20", country: "Egypt" },
  { code: "+234", country: "Nigeria" },
  { code: "+254", country: "Kenya" },
  { code: "+62", country: "Indonesia" },
  { code: "+63", country: "Philippines" },
  { code: "+66", country: "Thailand" },
  { code: "+84", country: "Vietnam" },
  { code: "+52", country: "Mexico" },
  { code: "+54", country: "Argentina" },
  { code: "+56", country: "Chile" },
  { code: "+57", country: "Colombia" },
  { code: "+58", country: "Venezuela" },
  { code: "+92", country: "Pakistan" },
  { code: "+880", country: "Bangladesh" },
  { code: "+94", country: "Sri Lanka" },
  { code: "+977", country: "Nepal" },
  { code: "+95", country: "Myanmar" },
];

const BrochureModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91", // Default to India
    message: "",
    type: "brochure",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
    }
  }, [isOpen]);

  const handleClose = () => {
    setShowModal(false);
    setTimeout(() => {
      onClose();
    }, 300); // Delay to allow animation to complete
  };

  if (!isOpen) return null;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleCountryCodeSelect = (code) => {
    setFormData((prevData) => ({
      ...prevData,
      countryCode: code,
    }));
    setShowCountryDropdown(false);
    setSearchTerm("");
  };

  const filteredCountryCodes = searchTerm
    ? countryCodes.filter(
        (item) =>
          item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.code.includes(searchTerm)
      )
    : countryCodes;

  const downloadBrochure = () => {
    // Simple direct download approach
    try {
      // Create a link to download the brochure
      const link = document.createElement("a");
      link.href = `${API_URL}/api/brochure/download`;
      link.setAttribute("download", "Alfanio-Brochure.pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Error downloading brochure:", error);
      alert("Failed to download brochure. Please try again.");
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);

    // Combine country code and phone number
    const fullPhoneNumber = formData.countryCode + formData.phone;

    // Create form data object with full phone number
    const formDataToSubmit = {
      ...formData,
      phone: fullPhoneNumber,
    };

    // Always proceed with submission attempt, regardless of online status
    console.log("Proceeding with form submission");

    try {
      // Use simple fetch API for better compatibility
      const response = await fetch(`${API_URL}/api/contact/brochure`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formDataToSubmit),
      });

      if (!response.ok) {
        throw new Error(
          `Server returned ${response.status}: ${response.statusText}`
        );
      }

      const data = await response.json();
      console.log("Success:", data);

      setIsSuccess(true);

      // Download the brochure after successful form submission
      downloadBrochure();

      // Close the modal after a delay
      setTimeout(() => {
        handleClose();
        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+91",
          message: "",
          type: "brochure",
        });
        setIsSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("Error submitting form:", error);

      // Always download brochure even if form submission fails
      setIsSuccess(true);
      downloadBrochure();

      // Close the modal after a delay
      setTimeout(() => {
        handleClose();
        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+91",
          message: "",
          type: "brochure",
        });
        setIsSuccess(false);
      }, 3000);

      // Show a simple error message
      alert(
        "We'll process your request later. You can download the brochure now."
      );
    }

    setIsSubmitting(false);
  };

  return (
    <div
      className={`fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-2 sm:p-4 transition-opacity duration-300 ${showModal ? "opacity-100" : "opacity-0"}`}
    >
      <div
        className={`bg-white rounded-lg shadow-2xl max-w-md w-full p-4 sm:p-6 relative transition-transform duration-300 max-h-[90vh] overflow-auto ${showModal ? "scale-100" : "scale-95"}`}
      >
        {/* Header with Alfanio branding */}
        <div className="bg-[#FECC00] absolute top-0 left-0 right-0 h-12 sm:h-16 rounded-t-lg flex items-center justify-center">
          <h2 className="text-lg sm:text-2xl font-bold text-black">
            Download Our Brochure
          </h2>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-black hover:text-gray-700 z-10 bg-white rounded-full w-7 h-7 sm:w-8 sm:h-8 flex items-center justify-center shadow-md"
        >
          ✕
        </button>

        <div className="mt-14 sm:mt-16 pt-2">
          {isSuccess ? (
            <div className="text-center py-6 sm:py-8 bg-white rounded-lg">
              <div className="text-[#FECC00] text-5xl sm:text-6xl mb-3 sm:mb-4">
                ✓
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-2">
                Thank You!
              </h3>
              <p className="text-gray-600">Your brochure is downloading now.</p>
              <div className="mt-4 sm:mt-6 animate-pulse">
                <svg
                  className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-[#FECC00]"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FECC00] text-sm"
                  placeholder="Your name"
                />
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FECC00] text-sm"
                  placeholder="Your email"
                />
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Phone <span className="text-red-500">*</span>
                </label>
                <div className="flex rounded-md shadow-sm">
                  <div className="relative">
                    <button
                      type="button"
                      className="inline-flex items-center px-2 sm:px-3 py-1.5 sm:py-2 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-700 text-xs sm:text-sm hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#FECC00]"
                      onClick={() =>
                        setShowCountryDropdown(!showCountryDropdown)
                      }
                    >
                      <span>{formData.countryCode}</span>
                      <svg
                        className="ml-1 h-3 w-3 sm:h-4 sm:w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {showCountryDropdown && (
                      <div className="absolute z-10 mt-1 w-full sm:w-60 left-0 bg-white shadow-lg max-h-36 sm:max-h-48 rounded-md py-1 text-xs sm:text-sm ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none">
                        <div className="sticky top-0 z-10 bg-white">
                          <input
                            type="text"
                            className="block w-full px-2 sm:px-3 py-1 sm:py-1.5 border-0 border-b border-gray-200 focus:outline-none focus:ring-0 focus:border-[#FECC00] text-xs"
                            placeholder="Search country or code..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>
                        <div className="max-h-28 sm:max-h-36 overflow-y-auto">
                          {filteredCountryCodes.map((item) => (
                            <button
                              key={item.code}
                              type="button"
                              className="w-full text-left px-2 sm:px-3 py-1 sm:py-1.5 hover:bg-gray-100 flex justify-between items-center text-xs"
                              onClick={() => handleCountryCodeSelect(item.code)}
                            >
                              <span className="truncate mr-1">
                                {item.country}
                              </span>
                              <span className="text-gray-500 flex-shrink-0">
                                {item.code}
                              </span>
                            </button>
                          ))}
                          {filteredCountryCodes.length === 0 && (
                            <div className="px-2 sm:px-3 py-1 sm:py-1.5 text-gray-500 text-xs">
                              No results found
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow numbers
                      const numbersOnly = value.replace(/[^0-9]/g, "");
                      setFormData({
                        ...formData,
                        phone: numbersOnly,
                      });
                    }}
                    className="flex-1 min-w-0 block w-full px-2 sm:px-3 py-1.5 sm:py-2 rounded-none rounded-r-md focus:outline-none focus:ring-2 focus:ring-[#FECC00] border border-gray-300 text-sm"
                    placeholder="Your phone number"
                    maxLength="15"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Select country code followed by your phone number
                </p>
              </div>

              <div>
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Message (Optional)
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows="2"
                  className="w-full px-2 sm:px-3 py-1.5 sm:py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FECC00] text-sm"
                  placeholder="Any specific requirements or questions?"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#FECC00] text-black font-semibold py-2 sm:py-3 px-3 sm:px-4 rounded-md hover:bg-[#e6b800] transition-colors duration-300 disabled:opacity-50 shadow-md transform hover:scale-[1.02] active:scale-[0.98] text-sm sm:text-base"
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 sm:h-5 sm:w-5 text-black"
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
                    Submitting...
                  </div>
                ) : (
                  "Download Brochure"
                )}
              </button>

              <div className="flex items-center mt-3 sm:mt-4 border-t border-gray-200 pt-3 sm:pt-4">
                <div className="bg-[#FECC00] rounded-full p-1.5 sm:p-2 mr-2 sm:mr-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 sm:h-5 sm:w-5 text-black"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <p className="text-xs text-gray-500">
                  By submitting this form, you agree to receive our brochure and
                  occasional updates about our products.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrochureModal;
