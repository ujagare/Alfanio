import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

/**
 * ImageOptimizer Component
 * 
 * A component that optimizes image loading with:
 * - Lazy loading
 * - Responsive image sizes
 * - WebP format support with fallback
 * - Blur-up loading effect
 * 
 * @param {Object} props Component props
 * @param {string} props.src Image source URL
 * @param {string} props.alt Alt text for the image
 * @param {string} props.className CSS classes for the image
 * @param {number} props.width Width of the image
 * @param {number} props.height Height of the image
 * @param {Array} props.sizes Responsive sizes array (e.g. ['(max-width: 768px) 100vw', '50vw'])
 * @param {boolean} props.lazy Whether to lazy load the image (default: true)
 * @param {string} props.objectFit CSS object-fit property (default: 'cover')
 * @param {string} props.placeholderColor Background color while loading (default: '#f0f0f0')
 * @returns {JSX.Element} Optimized image component
 */
const ImageOptimizer = ({
  src,
  alt,
  className = '',
  width,
  height,
  sizes = ['100vw'],
  lazy = true,
  objectFit = 'cover',
  placeholderColor = '#f0f0f0',
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [supportsWebP, setSupportsWebP] = useState(false);

  // Check WebP support on mount
  useEffect(() => {
    const checkWebPSupport = async () => {
      try {
        const webPCheck = new Image();
        webPCheck.onload = () => setSupportsWebP(true);
        webPCheck.onerror = () => setSupportsWebP(false);
        webPCheck.src = 'data:image/webp;base64,UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA==';
      } catch (err) {
        setSupportsWebP(false);
      }
    };

    checkWebPSupport();
  }, []);

  // Generate WebP URL if supported
  const getOptimizedSrc = () => {
    if (!src) return '';

    // If already a WebP image, return as is
    if (src.toLowerCase().endsWith('.webp')) return src;

    // If WebP is supported, try to use WebP version
    if (supportsWebP) {
      // Check if src is a relative path or absolute URL
      const isAbsoluteUrl = src.startsWith('http://') || src.startsWith('https://') || src.startsWith('//');
      
      if (isAbsoluteUrl) {
        // For absolute URLs, we can't reliably modify them
        return src;
      } else {
        // For relative paths, try to find a WebP version
        const basePath = src.substring(0, src.lastIndexOf('.'));
        return `${basePath}.webp`;
      }
    }

    return src;
  };

  // Handle image load event
  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Handle image error event
  const handleError = () => {
    setError(true);
    // If WebP fails, fallback to original format
    if (supportsWebP && getOptimizedSrc() !== src) {
      const img = new Image();
      img.src = src;
      img.onload = handleLoad;
    }
  };

  // Inline styles for the image container
  const containerStyle = {
    position: 'relative',
    width: width ? `${width}px` : '100%',
    height: height ? `${height}px` : 'auto',
    backgroundColor: placeholderColor,
    overflow: 'hidden',
  };

  // Inline styles for the image
  const imageStyle = {
    display: 'block',
    width: '100%',
    height: '100%',
    objectFit,
    opacity: isLoaded ? 1 : 0,
    transition: 'opacity 0.3s ease-in-out',
  };

  return (
    <div style={containerStyle} className={`image-optimizer-container ${className}`}>
      <img
        src={error ? src : getOptimizedSrc()}
        alt={alt}
        width={width}
        height={height}
        loading={lazy ? 'lazy' : 'eager'}
        onLoad={handleLoad}
        onError={handleError}
        style={imageStyle}
        sizes={sizes.join(', ')}
      />
    </div>
  );
};

ImageOptimizer.propTypes = {
  src: PropTypes.string.isRequired,
  alt: PropTypes.string.isRequired,
  className: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  sizes: PropTypes.arrayOf(PropTypes.string),
  lazy: PropTypes.bool,
  objectFit: PropTypes.string,
  placeholderColor: PropTypes.string,
};

export default ImageOptimizer;
