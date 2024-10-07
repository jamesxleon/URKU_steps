import countriesData from '../data/countries.json';

type CountryData = [string, [number, number, number, number]];

interface CountriesData {
  [countryCode: string]: CountryData;
}

export interface Country {
  code: string;
  name: string;
  bounds: [number, number, number, number];
}

function isCountriesData(data: any): data is CountriesData {
  return Object.entries(data).every(([_, value]) => 
    Array.isArray(value) && 
    value.length === 2 && 
    typeof value[0] === 'string' && 
    Array.isArray(value[1]) && 
    value[1].length === 4 && 
    value[1].every(n => typeof n === 'number')
  );
}

if (!isCountriesData(countriesData)) {
  throw new Error('Invalid country data structure');
}

const rawCountries: CountriesData = countriesData;

export const getCountries = (): Country[] => {
  return Object.entries(rawCountries).map(([code, [name, bounds]]) => ({
    code,
    name,
    bounds,
  }));
};

export const getRandomCoordinates = (countryCode: string): [number, number] => {
  const country = rawCountries[countryCode];
  if (!country) {
    throw new Error('Country not found');
  }

  const [, [west, south, east, north]] = country;
  const lat = south + Math.random() * (north - south);
  const lng = west + Math.random() * (east - west);

  return [lat, lng];
};
