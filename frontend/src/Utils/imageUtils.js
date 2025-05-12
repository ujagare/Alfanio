/**
 * Get the optimized image URL with proper format and size
 * @param {string} imagePath - Original image path
 * @param {string} size - Size variant (xl, lg, md, sm, xs)
 * @param {string} format - Image format (webp, jpg)
 * @returns {string} Optimized image URL
 */
export const getOptimizedImageUrl = (imagePath, size = 'xl', format = 'webp') => {
  if (!imagePath) return '';

  const basePath = '/images/';
  const filename = imagePath.split('/').pop().split('.')[0];
  const suffix = size === 'xl' ? '' : `-${size}`;
  
  return `${basePath}${filename}${suffix}.${format}`;
};

/**
 * Generate srcSet for responsive images
 * @param {string} imagePath - Original image path
 * @param {string} format - Image format (webp, jpg)
 * @returns {string} srcSet string
 */
export const generateSrcSet = (imagePath, format = 'webp') => {
  const sizes = {
    xl: 1920,
    lg: 1200,
    md: 800,
    sm: 400,
    xs: 200
  };

  return Object.entries(sizes)
    .map(([size, width]) => `${getOptimizedImageUrl(imagePath, size, format)} ${width}w`)
    .join(', ');
};

/**
 * Get image sizes attribute for responsive images
 * @returns {string} sizes attribute string
 */
export const getImageSizes = () => {
  return '(max-width: 400px) 400px, ' +
         '(max-width: 800px) 800px, ' +
         '(max-width: 1200px) 1200px, ' +
         '1920px';
};

/**
 * Check if WebP is supported by the browser
 * @returns {Promise<boolean>}
 */
export const supportsWebP = async () => {
  if (!window.createImageBitmap) return false;

  const webpData = 'data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=';
  const blob = await fetch(webpData).then(r => r.blob());

  return createImageBitmap(blob).then(() => true, () => false);
};
