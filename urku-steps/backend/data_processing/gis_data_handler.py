import os
import json
import requests
from xml.etree import ElementTree as ET
from owslib.wmts import WebMapTileService
import matplotlib.pyplot as plt
from PIL import Image
from io import BytesIO
import folium
from flask import Flask, request, jsonify
from flask import send_from_directory



# Step 1: Function to Fetch and Save Layer Compatibility Data
def fetch_layer_compatibility_data():
    capabilities_url = "https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi?SERVICE=WMTS&REQUEST=GetCapabilities"
    response = requests.get(capabilities_url)

    layer_data = {}

    if response.status_code == 200:
        # Parse the XML response
        root = ET.fromstring(response.content)
        
        # Find available tile matrix sets and formats for each layer
        for layer in root.findall(".//{http://www.opengis.net/wmts/1.0}Layer"):
            layer_identifier = layer.find("{http://www.opengis.net/ows/1.1}Identifier").text
            tile_matrix_sets = []
            for tms in layer.findall(".//{http://www.opengis.net/wmts/1.0}TileMatrixSet"):
                tms_identifier = tms.text
                tile_matrix_sets.append(tms_identifier)

            # Find supported formats
            formats = []
            for format_elem in layer.findall(".//{http://www.opengis.net/wmts/1.0}Format"):
                formats.append(format_elem.text)

            layer_data[layer_identifier] = {
                "tile_matrix_sets": tile_matrix_sets,
                "formats": formats
            }

        # Save the compatibility data to a local JSON file
        with open("layer_compatibility_data.json", "w") as outfile:
            json.dump(layer_data, outfile, indent=4)

        print("Layer compatibility data saved to 'layer_compatibility_data.json'.")
    else:
        print("Failed to fetch GetCapabilities document.")

# Step 2: Function to Load Layer Compatibility Data
def load_layer_compatibility_data():
    if os.path.exists("layer_compatibility_data.json"):
        with open("layer_compatibility_data.json", "r") as infile:
            return json.load(infile)
    else:
        print("Layer compatibility data not found. Please run the fetch function first.")
        return {}

# Step 3: Function to Render Interactive Map with User Input Coordinates
def render_interactive_map(user_coordinates):
    wmts_url = 'https://gibs.earthdata.nasa.gov/wmts/epsg4326/best/wmts.cgi'
    wmts = WebMapTileService(wmts_url)

    # Load layer compatibility data
    layer_data = load_layer_compatibility_data()

    # List of layers to render
    layers = [
        'Reference_Labels_15m',
        'Reference_Features_15m',
        'Coastlines_15m',
        'GRUMP_Settlements',
        'Probabilities_of_Urban_Expansion_2000-2030',
        'Landsat_Human_Built-up_And_Settlement_Extent',
        'Last_of_the_Wild_1995-2004',
        'GPW_Population_Density_2020'
    ]

    # Define user coordinates
    latitude, longitude = user_coordinates

    # Create a Folium map centered on user coordinates
    m = folium.Map(location=[latitude, longitude], zoom_start=5)

    tile_matrix = '3'  # Zoom level (adjust as per requirement)
    tile_row = '1'
    tile_col = '1'

    # Loop through each layer and add the images to the map if tile matrix set and format are available
    for layer in layers:
        if layer in layer_data:
            tile_matrix_sets = layer_data[layer].get("tile_matrix_sets", [])
            formats = layer_data[layer].get("formats", [])

            # Use the first valid tile matrix set and format for simplicity
            if tile_matrix_sets and 'image/png' in formats:
                tile_matrix_set = tile_matrix_sets[0]  # Select the first available tile matrix set

                try:
                    # Get tile URL from the WMTS service for each layer
                    tile_response = wmts.gettile(layer=layer,
                                                 tilematrixset=tile_matrix_set,
                                                 tilematrix=tile_matrix,
                                                 row=tile_row,
                                                 column=tile_col,
                                                 format='image/png')

                    # Extract the URL as a string
                    tile_url = tile_response.geturl()

                    # Request the tile
                    response = requests.get(tile_url)
                    if response.status_code == 200:
                        image = Image.open(BytesIO(response.content))
                        # Save the tile image locally
                        image_path = f'temp_tiles/{layer}.png'
                        os.makedirs('temp_tiles', exist_ok=True)
                        image.save(image_path)

                        # Use ImageOverlay to overlay the saved image onto the map
                        bounds = [[latitude - 1, longitude - 1], [latitude + 1, longitude + 1]]  # Define bounds for overlay (modify as needed)
                        folium.raster_layers.ImageOverlay(
                            name=layer,
                            image=image_path,
                            bounds=bounds,
                            opacity=0.5,
                            interactive=True
                        ).add_to(m)
                    else:
                        print(f"Failed to fetch the tile for layer: {layer}. Status code: {response.status_code}")
                except Exception as e:
                    print(f"Error fetching layer {layer}: {e}")
            else:
                print(f"Layer {layer} does not support 'image/png' format or has no valid tile matrix set.")

    # Add layer control to toggle layers on and off
    folium.LayerControl().add_to(m)

    # Save the map to an HTML file
    m.save('interactive_map.html')
    print("Interactive map saved to 'interactive_map.html'.")

# Step 4: Flask API to Handle User Location Requests
app = Flask(__name__)

@app.route('/generate-map', methods=['POST'])
def generate_map():
    data = request.json
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if latitude is None or longitude is None:
        return jsonify({"error": "Latitude and longitude are required."}), 400

    # Render the map based on user coordinates
    render_interactive_map((latitude, longitude))
    return jsonify({"message": "Interactive map generated successfully.", "map_url": "/interactive_map.html"})

if __name__ == "__main__":
    # Fetch and save layer compatibility data (Run once in a while to update compatibility info)
    # fetch_layer_compatibility_data()

    # Run the Flask app
    app.run(debug=True, host='0.0.0.0', port=5000)