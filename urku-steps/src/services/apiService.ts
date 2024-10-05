import axios from 'axios';

const BASE_URL = 'http://localhost:5001'; // URL of the Flask backend

export const generateMap = async (latitude: number, longitude: number) => {
  try {
    const response = await axios.post(`${BASE_URL}/generate-map`, {
      latitude,
      longitude,
    });
    return response.data;
  } catch (error) {
    console.error('Error generating map:', error);
    throw error;
  }
};
