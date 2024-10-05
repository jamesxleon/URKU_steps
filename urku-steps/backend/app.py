from flask import Flask, request, jsonify
from flask import send_from_directory
from data_processing.gis_data_handler import render_interactive_map

app = Flask(__name__)

@app.route('/interactive_map.html', methods=['GET'])
def get_generated_map():
    return send_from_directory('.', 'interactive_map.html')

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
    app.run(debug=True, host='0.0.0.0', port=5001)
