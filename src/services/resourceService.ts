import L from 'leaflet';
import { fetchEnvironmentalData, fetchSocioeconomicData, fetchLandUseData } from './nasaDataService';

interface ResourceScore {
  urban: number;
  population: number;
  infrastructure: number;
  environmental: number;
}

interface ResourceDistance {
  urban: number;
  population: number;
  infrastructure: number;
  environmental: number;
}

const calculateResourceScore = async (
  userLocation: L.LatLng
): Promise<{ score: ResourceScore; distance: ResourceDistance }> => {
  try {
    console.log("Fetching data for location:", userLocation);
    const [environmentalData, socioeconomicData, landUseData] = await Promise.all([
      fetchEnvironmentalData(userLocation.lat, userLocation.lng),
      fetchSocioeconomicData(userLocation.lat, userLocation.lng),
      fetchLandUseData(userLocation.lat, userLocation.lng)
    ]);

    console.log("Fetched data:", { environmentalData, socioeconomicData, landUseData });

    // Provide default values if data is null
    const urbanScore = landUseData?.urbanLand ?? 0.5;
    const populationScore = Math.min((socioeconomicData?.populationDensity ?? 500) / 1000, 1);
    const infrastructureScore = socioeconomicData?.urbanization ?? 0.5;
    const environmentalScore = (5 - (environmentalData?.airQuality ?? 2.5)) / 5; // Normalize to 0-1 scale

    // Calculate distances in urku steps (1 urku = 6263 meters)
    const urbanDistance = (1 - urbanScore) * 10; // Assume max distance is 10 urkus
    const populationDistance = (1 - populationScore) * 10;
    const infrastructureDistance = (1 - infrastructureScore) * 10;
    const environmentalDistance = environmentalScore * 10; // Higher score means further from ideal environmental conditions

    console.log("Calculated scores and distances!");
    return {
      score: { urban: urbanScore, population: populationScore, infrastructure: infrastructureScore, environmental: environmentalScore },
      distance: { urban: urbanDistance, population: populationDistance, infrastructure: infrastructureDistance, environmental: environmentalDistance }
    };
  } catch (error) {
    console.error("Error in calculateResourceScore:", error);
    throw error;
  }
};

const careerResourceMapping = {
  'technology': { urban: 0.8, population: 0.6, infrastructure: 0.7, environmental: 0.5 },
  'healthcare': { urban: 0.7, population: 0.9, infrastructure: 0.8, environmental: 0.7 },
  'agriculture': { urban: 0.3, population: 0.4, infrastructure: 0.5, environmental: 0.9 },
};

export const calculateCareerResourceDisparity = async (
  userLocation: L.LatLng,
  career: string
): Promise<{ disparityScore: number; urkuSteps: number }> => {
  try {
    console.log("Calculating disparity for career:", career);
    const { score, distance } = await calculateResourceScore(userLocation);
    const careerRequirements = careerResourceMapping[career as keyof typeof careerResourceMapping];

    if (!careerRequirements) {
      throw new Error('Career not found in mapping');
    }

    const disparities = Object.keys(careerRequirements).map(key => {
      const requirement = careerRequirements[key as keyof typeof careerRequirements];
      const actual = score[key as keyof ResourceScore];
      return Math.abs(requirement - actual);
    });

    const disparityScore = disparities.reduce((sum, val) => sum + val, 0) / disparities.length;

    const urkuSteps = Object.keys(careerRequirements).reduce((sum, key) => {
      return sum + distance[key as keyof ResourceDistance] * careerRequirements[key as keyof typeof careerRequirements];
    }, 0) / Object.keys(careerRequirements).length;

    console.log("Calculated disparity:", { disparityScore, urkuSteps });
    return { disparityScore, urkuSteps };
  } catch (error) {
    console.error("Error in calculateCareerResourceDisparity:", error);
    throw error;
  }
};

export const calculateStepsInUrkus = (
  start: L.LatLng,
  end: L.LatLng
): number => {
  const distanceInMeters = start.distanceTo(end);
  const distanceInUrkus = distanceInMeters / 6263;
  return Number(distanceInUrkus.toFixed(2)); // Round to 2 decimal places
};

export const getResourceData = async (bounds: L.LatLngBounds): Promise<{
  environmentalData: any;
  socioeconomicData: any;
  landUseData: any;
}> => {
  const center = bounds.getCenter();
  const [environmentalData, socioeconomicData, landUseData] = await Promise.all([
    fetchEnvironmentalData(center.lat, center.lng),
    fetchSocioeconomicData(center.lat, center.lng),
    fetchLandUseData(center.lat, center.lng)
  ]);

  return {
    environmentalData,
    socioeconomicData,
    landUseData
  };
};