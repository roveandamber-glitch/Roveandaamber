const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const BACKEND_URL = API_URL.replace('/api', '');

const DEFAULT_PERFUME_FALLBACK = '/images/perfumes/amber_oud_perfume.jpg';

// Map legacy clothing asset paths to corresponding luxury perfume imagery
const CLOTHING_IMAGE_MAP = {
  'ethinic.png': '/images/perfumes/cat_signature.jpg',
  'western.png': '/images/perfumes/cat_unisex.jpg',
  'casual.png': '/images/perfumes/cat_men.jpg',
  'party.png': '/images/perfumes/cat_women.jpg',
  'brown.png': '/images/perfumes/amber_oud_perfume.jpg',
  'coat.jpg': '/images/perfumes/oud_royale.jpg',
  'blueWestern.png': '/images/perfumes/azure_mist.jpg',
  'Blue.png': '/images/perfumes/azure_mist.jpg',
  'kurthi.png': '/images/perfumes/golden_saffron.jpg',
  'casualWear.png': '/images/perfumes/cat_men.jpg',
  'partywear.jpg': '/images/perfumes/midnight_noir.jpg',
  'greenTop.png': '/images/perfumes/citrus_bloom.jpg',
  'black.png': '/images/perfumes/noir_intense.jpg',
  'c1.jpg': '/images/perfumes/hero_desert_fragrance.jpg',
  'c2.jpg': '/images/perfumes/liquid_gold_perfume.jpg',
  'c3.jpg': '/images/perfumes/amber_oud_perfume.jpg',
  'c4.jpg': '/images/perfumes/signature_collection.jpg',
  'hero-luxury.jpg': '/images/perfumes/hero_desert_fragrance.jpg',
  'hero-bg.png': '/images/perfumes/hero_desert_fragrance.jpg',
  'about-philosophy.jpg': '/images/perfumes/about_atelier.jpg',
  'about-process-silk.jpg': '/images/perfumes/perfume_craft.jpg',
  'atelier-workshop.jpg': '/images/perfumes/about_atelier.jpg',
  'category-coords.jpg': '/images/perfumes/cat_unisex.jpg',
  'category-dresses.jpg': '/images/perfumes/cat_women.jpg',
  'category-tops.jpg': '/images/perfumes/cat_signature.jpg',
};

export const getImageUrl = (imagePath, fallback = DEFAULT_PERFUME_FALLBACK) => {
  if (!imagePath) return fallback;
  if (typeof imagePath === 'object' && imagePath.url) {
    imagePath = imagePath.url;
  }
  if (typeof imagePath !== 'string') return fallback;

  // Intercept old Unsplash fashion model links
  if (imagePath.includes('photo-1515886657613-9f3515b0c78f') || 
      imagePath.includes('photo-1490481651871-ab68de25d43d')) {
    return DEFAULT_PERFUME_FALLBACK;
  }

  // Intercept legacy clothing assets and map them to perfume assets
  for (const [legacyKey, perfumeUrl] of Object.entries(CLOTHING_IMAGE_MAP)) {
    if (imagePath.toLowerCase().includes(legacyKey.toLowerCase())) {
      return perfumeUrl;
    }
  }

  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  if (imagePath.startsWith('/uploads') || imagePath.startsWith('uploads/')) {
    const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `${BACKEND_URL}${cleanPath}`;
  }

  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  return `/${imagePath}`;
};

export default getImageUrl;
