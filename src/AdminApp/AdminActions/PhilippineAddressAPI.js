// --- API FUNCTIONS (from ../AdminActions/PhilippineAddressAPI) ---
const BASE_URL = 'https://psgc.gitlab.io/api';

/**
 * Fetch all regions
 */
export const fetchRegions = async () => {
  try {
    const response = await fetch(`${BASE_URL}/regions/`);
    if (!response.ok) throw new Error('Failed to fetch regions');
    const data = await response.json();
    return data.map(region => ({
      code: region.code,
      name: region.name,
      regionName: region.regionName || region.name
    }));
  } catch (error) {
    console.error('Error fetching regions:', error);
    return [];
  }
};

/**
 * Fetch all provinces in a specific region
 */
export const fetchProvinces = async (regionCode) => {
  if (!regionCode) return [];
  
  try {
    const response = await fetch(`${BASE_URL}/regions/${regionCode}/provinces/`);
    if (!response.ok) throw new Error('Failed to fetch provinces');
    const data = await response.json();
    return data.map(province => ({
      code: province.code,
      name: province.name
    }));
  } catch (error) {
    console.error('Error fetching provinces:', error);
    return [];
  }
};

/**
 * Fetch all cities/municipalities in a specific province
 */
export const fetchCities = async (provinceCode) => {
  if (!provinceCode) return [];
  
  try {
    const response = await fetch(`${BASE_URL}/provinces/${provinceCode}/cities-municipalities/`);
    if (!response.ok) throw new Error('Failed to fetch cities');
    const data = await response.json();
    return data.map(city => ({
      code: city.code,
      name: city.name
    }));
  } catch (error) {
    console.error('Error fetching cities:', error);
    return [];
  }
};

/**
 * Fetch all cities/municipalities in the NCR region
 */
/**
 * Fetch all cities/municipalities under NCR dynamically
 */
export const fetchCitiesForNCR = async () => {
  try {
    // Fetch ALL cities/municipalities first
    const response = await fetch(`${BASE_URL}/cities-municipalities/`);
    if (!response.ok) throw new Error("Failed to fetch cities");

    const data = await response.json();

    // Filter only those belonging to the NCR region
    const ncrCities = data.filter(city => city.regionCode === "130000000");

    return ncrCities.map(city => ({
      code: city.code,
      name: city.name
    }));
  } catch (error) {
    console.error("Error fetching NCR cities:", error);
    return [];
  }
};


/**
 * Fetch all barangays in a specific city/municipality
 */
export const fetchBarangays = async (cityCode) => {
  if (!cityCode) return [];
  
  try {
    const response = await fetch(`${BASE_URL}/cities-municipalities/${cityCode}/barangays/`);
    if (!response.ok) throw new Error('Failed to fetch barangays');
    const data = await response.json();
    return data.map(barangay => ({
      code: barangay.code,
      name: barangay.name
    }));
  } catch (error) {
    console.error('Error fetching barangays:', error);
    return [];
  }
};