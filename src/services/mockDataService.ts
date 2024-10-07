export type Career = 'agriculture' | 'healthcare' | 'technology' | 'astronomy';

interface ResourceData {
  disparityScore: number;
  urkuSteps: number;
}

const careerRanking: { [key in Career]: number } = {
  'agriculture': 0,
  'healthcare': 1,
  'technology': 2,
  'astronomy': 3
};

export const getMockResourceData = (isDeviceLocation: boolean, career: Career): ResourceData => {
  const careerFactor = careerRanking[career] / 3; // Normalize to 0-1 range

  if (isDeviceLocation) {
    // Ensure the order of urkuSteps is always from least to greatest for device location (favorable situation)
    const urkuSteps = 0.25 + (careerFactor * (1.25 - 0.25)); // 0.25 to 1.25 range, increasing with careerFactor
    
    return {
      disparityScore: (Math.random() * 0.2 + 0.1) * (1 + careerFactor), // 0.1-0.3 base, adjusted by career
      urkuSteps: urkuSteps, // Fixed order: agriculture < healthcare < technology < astronomy
    };
  } else {
    // Random order for country picker (disparate situation)
    const urkuSteps = 1.25 + Math.random() * (5 - 1.25); // Random 1.25 to 5 Urkus
    
    return {
      disparityScore: (Math.random() * 0.3 + 0.7) * (1 - careerFactor / 2), // 0.7-1.0 base, slightly adjusted by career
      urkuSteps: urkuSteps, // Random order for the disparate situation
    };
  }
};
