import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';

interface LayerData {
  tile_matrix_sets: string[];
  formats: string[];
}

interface Layers {
  [key: string]: LayerData;
}

export const fetchLayerCompatibilityData = async () => {
  const capabilitiesUrl = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetCapabilities";
  try {
    const response = await axios.get(capabilitiesUrl);
    const parser = new XMLParser();
    const parsedData = parser.parse(response.data);
    
    const layers: Layers = {};
    
    parsedData.Capabilities.Contents.Layer.forEach((layer: any) => {
      const layerIdentifier = layer['ows:Identifier'];
      const tile_matrix_sets = Array.isArray(layer.TileMatrixSetLink) 
        ? layer.TileMatrixSetLink.map((tms: any) => tms.TileMatrixSet)
        : [layer.TileMatrixSetLink.TileMatrixSet];
      const formats = Array.isArray(layer.Format) ? layer.Format : [layer.Format];
      
      layers[layerIdentifier] = {
        tile_matrix_sets,
        formats,
      };
    });
    
    localStorage.setItem('layerData', JSON.stringify(layers));
    console.log("Layer data fetched and stored:", layers); // Log 11
  } catch (error) {
    console.error("Error fetching layer compatibility data:", error);
  }
};