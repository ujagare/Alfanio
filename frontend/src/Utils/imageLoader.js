const loadImageChunk = async (moduleLoader) => {
  try {
    const module = await moduleLoader();
    return {
      src: module.default,
      alt: module.default.split('/').pop().split('.')[0].replace(/-/g, ' ')
    };
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

export const loadImages = async (imagesContext, page, perPage) => {
  const allImages = Object.entries(imagesContext);
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const currentChunk = allImages.slice(startIndex, endIndex);

  const loadedImages = await Promise.all(
    currentChunk.map(([path, loader]) => loadImageChunk(loader))
  );

  return loadedImages.filter(Boolean);
};

const productImages = {
  'concrete-pump': {
    directory: 'pumps',
    images: [
      'concrete-pump-1.webp',
      'concrete-pump-2.webp',
      'concrete-pump-3.webp'
    ]
  },
  'twin-shaft-mixer': {
    directory: 'mixers',
    images: [
      'twin-shaft-1.jpg',
      'twin-shaft-2.webp',
      'twin-shaft-3.webp'
    ]
  },
  'planetary-mixer': {
    directory: 'mixers',
    images: [
      'planetary-1.jpg',
      'planetary-2.jpg',
      'planetary-3.jpg'
    ]
  }
};

export default productImages;