// Processing real environmental data, includes fallback if data is null
export function processEnvironmentalData(data: any): any {
    if (!data) {
      // Fallback to mock data if no real data is provided
      return {
        airQuality: Math.random() * 5,
        floodRisk: Math.random(),
        heatRisk: Math.random(),
      };
    }
    
    return {
      airQuality: data.air_quality_index || Math.random() * 5,
      floodRisk: data.flood_risk || Math.random(),
      heatRisk: data.heat_risk || Math.random(),
    };
  }
  
  // Processing real socioeconomic data, includes fallback if data is null
  export function processSocioeconomicData(data: any): any {
    if (!data) {
      // Fallback to mock data
      return {
        populationDensity: Math.random() * 1000,
        urbanization: Math.random(),
      };
    }
  
    return {
      populationDensity: data.population_density || Math.random() * 1000,
      urbanization: data.urbanization || Math.random(),
    };
  }
  
  // Processing real land use data, includes fallback if data is null
  export function processLandUseData(data: any): any {
    if (!data) {
      // Fallback to mock data
      return {
        agriculturalLand: Math.random(),
        urbanLand: Math.random(),
      };
    }
  
    return {
      agriculturalLand: data.agricultural_land || Math.random(),
      urbanLand: data.urban_land || Math.random(),
    };
  }
  