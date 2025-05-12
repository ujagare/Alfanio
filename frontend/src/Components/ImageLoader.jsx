import React, { useState, useEffect, useRef } from 'react';
import { getOptimizedImageUrl, generateSrcSet, getImageSizes, supportsWebP } from '../utils/imageUtils';

const useIntersectionObserver = (ref, options) => {
  const [isIntersecting, setIntersecting] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setIntersecting(entry.isIntersecting);
    }, options);

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [ref, options]);

  return isIntersecting;
};

export const ImageLoader = ({ 
  src, 
  alt, 
  className = "", 
  priority = false,
  sizes = getImageSizes()
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(false);
  const [supportsWebp, setSupportsWebp] = useState(true);
  const imageRef = useRef();
  const isVisible = useIntersectionObserver(imageRef, {
    threshold: 0.1,
    rootMargin: '50px'
  });

  useEffect(() => {
    supportsWebP().then(setSupportsWebp);
  }, []);

  const format = supportsWebp ? 'webp' : 'jpg';
  const mainSrc = getOptimizedImageUrl(src, 'xl', format);
  const thumbSrc = getOptimizedImageUrl(src, 'xs', format);
  const srcSet = generateSrcSet(src, format);

  return (
    <div 
      ref={imageRef} 
      className={`relative overflow-hidden ${className}`}
    >
      {/* Thumbnail/Blur image */}
      {!isLoaded && (
        <img
          src={thumbSrc}
          alt={alt}
          className="w-full h-full object-cover blur-up absolute inset-0"
          aria-hidden="true"
        />
      )}

      {/* Main image */}
      {(isVisible || priority) && (
        <picture>
          {supportsWebp && (
            <source
              type="image/webp"
              srcSet={generateSrcSet(src, 'webp')}
              sizes={sizes}
            />
          )}
          <source
            type="image/jpeg"
            srcSet={generateSrcSet(src, 'jpg')}
            sizes={sizes}
          />
          <img
            src={mainSrc}
            alt={alt}
            srcSet={srcSet}
            sizes={sizes}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              isLoaded ? 'opacity-100' : 'opacity-0'
            }`}
            onLoad={() => setIsLoaded(true)}
            onError={() => setError(true)}
            loading={priority ? "eager" : "lazy"}
          />
        </picture>
      )}

      {/* Loading state */}
      {!isLoaded && !error && (
        <div className="absolute inset-0 bg-gray-100 animate-pulse" />
      )}

      {/* Error state */}
      {error && (
        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
          <span className="text-gray-500">Failed to load image</span>
        </div>
      )}
    </div>
  );
};

export default ImageLoader;
