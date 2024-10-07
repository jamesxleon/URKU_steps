import axios from 'axios';
import { PNG } from 'pngjs';

const EARTHDATA_TOKEN = 'number'; // Earthdata login token
const GIBS_API_URL = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best';
const FIXED_DATE = '2020-07-01'; // July 1, 2020

interface LayerData {
  formats: string[];
  tile_matrix_sets: string[];
}

interface ProcessedData {
  [key: string]: number;
}

let layerCompatibilityData: { [category: string]: { [layerName: string]: LayerData } } | null = null;

async function loadLayerCompatibilityData() {
  if (!layerCompatibilityData) {
    try {
      const response = await axios.get('/layer_compatibility_data.json');
      layerCompatibilityData = response.data;
    } catch (error) {
      console.error('Error loading layer compatibility data:', error);
      throw error;
    }
  }
  return layerCompatibilityData;
}

async function findValidLayer(category: string, lat: number, lon: number): Promise<string | null> {
  if (!layerCompatibilityData || !layerCompatibilityData[category]) {
    return null;
  }

  for (const layer of Object.keys(layerCompatibilityData[category])) {
    try {
      const response = await axios.get(
        `${GIBS_API_URL}/${layer}/default/${FIXED_DATE}/250m/4/${lat}/${lon}.png`,
        {
          headers: { Authorization: `Bearer ${EARTHDATA_TOKEN}` },
          responseType: 'arraybuffer',
        }
      );
      if (response.status === 200) {
        return layer;
      }
    } catch (error) {
      console.warn(`Layer ${layer} not available for the given location.`);
    }
  }
  return null;
}

async function getCachedOrFetchData(key: string, fetchFunction: () => Promise<any>) {
  const cachedData = localStorage.getItem(key);
  if (cachedData) {
    return JSON.parse(cachedData);
  }
  const data = await fetchFunction();
  localStorage.setItem(key, JSON.stringify(data));
  return data;
}

async function fetchData(category: string, lat: number, lon: number): Promise<ProcessedData> {
  await loadLayerCompatibilityData();
  const cacheKey = `${category}_${lat}_${lon}_${FIXED_DATE}`;

  return getCachedOrFetchData(cacheKey, async () => {
    const layer = await findValidLayer(category, lat, lon);
    if (!layer) {
      console.warn(`No valid ${category} layer available. Using fallback data.`);
      return getFallbackData(category);
    }

    try {
      const response = await axios.get(
        `${GIBS_API_URL}/${layer}/default/${FIXED_DATE}/250m/4/${lat}/${lon}.png`,
        {
          headers: { Authorization: `Bearer ${EARTHDATA_TOKEN}` },
          responseType: 'arraybuffer',
        }
      );
      return processData(category, response.data);
    } catch (error) {
      console.error(`Failed to fetch ${category} data:`, error);
      return getFallbackData(category);
    }
  });
}

function processData(category: string, data: ArrayBuffer): ProcessedData {
  const png = PNG.sync.read(Buffer.from(data));
  const pixelData = new Uint8Array(png.data);
  
  const avgRed = pixelData.filter((_, i) => i % 4 === 0).reduce((sum, val) => sum + val, 0) / (pixelData.length / 4);
  const avgGreen = pixelData.filter((_, i) => i % 4 === 1).reduce((sum, val) => sum + val, 0) / (pixelData.length / 4);
  const avgBlue = pixelData.filter((_, i) => i % 4 === 2).reduce((sum, val) => sum + val, 0) / (pixelData.length / 4);

  switch (category) {
    case 'environmental':
      return {
        airQuality: (255 - avgRed) / 255 * 5,
        floodRisk: avgBlue / 255,
        heatRisk: avgRed / 255,
      };
    case 'socioeconomic':
      return {
        populationDensity: avgRed * 39.22,
        urbanization: avgGreen / 255,
        economicActivity: avgBlue / 255,
      };
    case 'land-use':
      return {
        agriculturalLand: avgGreen / 255,
        urbanLand: avgRed / 255,
        naturalLand: avgBlue / 255,
      };
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

function getFallbackData(category: string): ProcessedData {
  switch (category) {
    case 'environmental':
      return {
        airQuality: 2.5,
        floodRisk: 0.5,
        heatRisk: 0.5,
      };
    case 'socioeconomic':
      return {
        populationDensity: 5000,
        urbanization: 0.5,
        economicActivity: 0.5,
      };
    case 'land-use':
      return {
        agriculturalLand: 0.33,
        urbanLand: 0.33,
        naturalLand: 0.34,
      };
    default:
      throw new Error(`Unknown category: ${category}`);
  }
}

export async function fetchEnvironmentalData(lat: number, lon: number): Promise<ProcessedData> {
  return fetchData('environmental', lat, lon);
}

export async function fetchSocioeconomicData(lat: number, lon: number): Promise<ProcessedData> {
  return fetchData('socioeconomic', lat, lon);
}

export async function fetchLandUseData(lat: number, lon: number): Promise<ProcessedData> {
  return fetchData('land-use', lat, lon);
}

export async function getRelevantLayers(career: string, lat: number, lon: number): Promise<string[]> {
  const relevantCategories = {
    'technology': ['environmental', 'socioeconomic'],
    'healthcare': ['environmental', 'socioeconomic'],
    'agriculture': ['environmental', 'land-use'],
  };

  const careerCategories = relevantCategories[career as keyof typeof relevantCategories] || [];
  const layers: string[] = [];

  for (const category of careerCategories) {
    const layer = await findValidLayer(category, lat, lon);
    if (layer) {
      layers.push(layer);
    }
  }

  return layers;
}