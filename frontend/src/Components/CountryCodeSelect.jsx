import React from 'react';

// List of common country codes
const countryCodes = [
  { code: '+1', country: 'US/CA' },
  { code: '+44', country: 'UK' },
  { code: '+91', country: 'IN' },
  { code: '+61', country: 'AU' },
  { code: '+64', country: 'NZ' },
  { code: '+49', country: 'DE' },
  { code: '+33', country: 'FR' },
  { code: '+86', country: 'CN' },
  { code: '+81', country: 'JP' },
  { code: '+82', country: 'KR' },
  { code: '+7', country: 'RU' },
  { code: '+971', country: 'UAE' },
  { code: '+966', country: 'SA' },
  { code: '+65', country: 'SG' },
  { code: '+60', country: 'MY' },
  { code: '+66', country: 'TH' },
  { code: '+84', country: 'VN' },
  { code: '+62', country: 'ID' },
  { code: '+63', country: 'PH' },
  { code: '+27', country: 'ZA' },
  { code: '+234', country: 'NG' },
  { code: '+20', country: 'EG' },
  { code: '+55', country: 'BR' },
  { code: '+52', country: 'MX' },
  { code: '+54', country: 'AR' },
  { code: '+56', country: 'CL' },
  { code: '+57', country: 'CO' },
  { code: '+58', country: 'VE' },
  { code: '+39', country: 'IT' },
  { code: '+34', country: 'ES' },
  { code: '+31', country: 'NL' },
  { code: '+32', country: 'BE' },
  { code: '+41', country: 'CH' },
  { code: '+43', country: 'AT' },
  { code: '+46', country: 'SE' },
  { code: '+47', country: 'NO' },
  { code: '+45', country: 'DK' },
  { code: '+358', country: 'FI' },
  { code: '+48', country: 'PL' },
  { code: '+36', country: 'HU' },
  { code: '+420', country: 'CZ' },
];

const CountryCodeSelect = ({ value, onChange, className }) => {
  return (
    <select
      value={value || '+91'} // Default to India's code
      onChange={(e) => onChange(e.target.value)}
      className={`${className} appearance-none bg-gray-50 border border-gray-300 text-gray-700 py-2 px-2 pr-8 rounded-l-md focus:outline-none focus:ring-2 focus:ring-[#FECC00] focus:border-transparent text-sm`}
      aria-label="Country code"
    >
      {countryCodes.map((country) => (
        <option key={country.code} value={country.code}>
          {country.code} {country.country}
        </option>
      ))}
    </select>
  );
};

export default CountryCodeSelect;
