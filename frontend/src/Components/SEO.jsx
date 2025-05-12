import React from "react";
import { Helmet } from "react-helmet-async";
import { useLocation } from "react-router-dom";

const SEO = ({ title, description, keywords, image }) => {
  const location = useLocation();
  const defaultTitle = "Alfanio LTD - Global Construction Equipment Solutions";
  const defaultDescription =
    "Since 1963, Alfanio continues a storied history of designing, manufacturing and supplying high-quality mixers, batch plants, and equipment solutions for the global construction marketplace.";
  const defaultKeywords =
    "construction equipment, mixers, batch plants, global construction, Alfanio, manufacturing equipment";
  const defaultImage = "/assets/Alfanio.png";
  const siteUrl = "https://alfanio.com";

  // Construct canonical URL
  const canonicalUrl = `${siteUrl}${location.pathname}`;

  return (
    <Helmet>
      <title>{title || defaultTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || defaultKeywords} />

      {/* Canonical URL */}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:title" content={title || defaultTitle} />
      <meta
        property="og:description"
        content={description || defaultDescription}
      />
      <meta
        property="og:image"
        content={`${siteUrl}${image || defaultImage}`}
      />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={canonicalUrl} />
      <meta name="twitter:title" content={title || defaultTitle} />
      <meta
        name="twitter:description"
        content={description || defaultDescription}
      />
      <meta
        name="twitter:image"
        content={`${siteUrl}${image || defaultImage}`}
      />

      {/* Additional SEO tags */}
      <meta name="robots" content="index, follow" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta name="author" content="Alfanio LTD" />

      {/* Structured data for better SEO */}
      <script type="application/ld+json">
        {`
          {
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "Alfanio LTD",
            "url": "${siteUrl}",
            "logo": "${siteUrl}${defaultImage}",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+91 79729 24631",
              "contactType": "customer service"
            },
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Gate No.282, Village Kuruli",
              "addressLocality": "Pune",
              "postalCode": "410501",
              "addressCountry": "IN"
            }
          }
        `}
      </script>
    </Helmet>
  );
};

export default SEO;
