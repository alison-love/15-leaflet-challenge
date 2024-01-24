// Create the map baselayers
var satelliteMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/satellite-v9',
    accessToken: 'pk.eyJ1IjoiYWxpc29ubG92ZSIsImEiOiJjbHJyeDU4MHUwMHN0MnFxZHAyM2U0NzdlIn0._C88FG_uGBRHoDS-frHQ1Q' // Replace with your Mapbox access token
});

var grayscaleMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/light-v10',
    accessToken: 'pk.eyJ1IjoiYWxpc29ubG92ZSIsImEiOiJjbHJyeDU4MHUwMHN0MnFxZHAyM2U0NzdlIn0._C88FG_uGBRHoDS-frHQ1Q' // Replace with your Mapbox access token
});

var outdoorsMap = L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
                 'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox/outdoors-v11',
    accessToken: 'pk.eyJ1IjoiYWxpc29ubG92ZSIsImEiOiJjbHJyeDU4MHUwMHN0MnFxZHAyM2U0NzdlIn0._C88FG_uGBRHoDS-frHQ1Q' // Replace with your Mapbox access token
});


// Create an object to hold the base maps
var baseMaps = {
    "Satellite": satelliteMap,
    "Grayscale": grayscaleMap,
    "Outdoors": outdoorsMap
};


// Create the map with satellite map as the default layer.
var myMap = L.map("map", {
    center: [37.09, -95.71], // Center of the map (USA)
    zoom: 5, // Initial zoom level
    layers: [satelliteMap]
});

// Create an overlay object to hold the earthquake layer.
var overlayMaps = {
    Earthquakes: new L.LayerGroup()
};

// Load and add the earthquake data.
d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson").then(function(data) {
    // Loop through the data features (each earthquake)
    data.features.forEach(function(earthquake) {
        // Extract the coordinates and properties
        var location = earthquake.geometry.coordinates;
        var properties = earthquake.properties;

        // Create a circle marker for each earthquake
        var earthquakeMarker = L.circleMarker([location[1], location[0]], { // Note the order of coordinates
            fillOpacity: 0.75,
            color: "white",
            fillColor: getFillColor(location[2]), // Color based on depth
            radius: getRadius(properties.mag)      // Radius based on magnitude
        })
        .bindPopup("<h3>" + properties.place +
                   "</h3><hr><p>" + new Date(properties.time) + "</p>"); // Popup with info

        // Add the marker to the Earthquake layer
        earthquakeMarker.addTo(overlayMaps.Earthquakes);
    });

    // Add the Earthquake layer to the map
    overlayMaps.Earthquakes.addTo(myMap);
});

// Functions to determine the color and radius of earthquake markers
function getFillColor(depth) {
    if (depth > 90) return "#ea2c2c";
    else if (depth > 70) return "#ea822c";
    else if (depth > 50) return "#ee9c00";
    else if (depth > 30) return "#eecc00";
    else if (depth > 10) return "#d4ee00";
    else return "#98ee00";
}

function getRadius(magnitude) {
    if (magnitude === 0) return 1; // Ensure zero magnitude is still visible
    return magnitude * 4; // Scale factor for visibility
}

// Load and add the tectonic plates data.
var tectonicPlates = new L.LayerGroup();
d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json").then(function(plateData) {
    L.geoJson(plateData, {
        color: "orange",
        weight: 2
    }).addTo(tectonicPlates);
});
tectonicPlates.addTo(myMap);
overlayMaps["Tectonic Plates"] = tectonicPlates;


// Add the layer control to the map.
L.control.layers(baseMaps, overlayMaps, {
}).addTo(myMap);


// Add a legend to the map
var legend = L.control({ position: "bottomright" });

legend.onAdd = function(map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depthRanges = [-10, 10, 30, 50, 70, 90],
        labels = [],
        from, to;

    // Loop through the depth intervals and generate a label with a colored square for each interval
    for (var i = 0; i < depthRanges.length; i++) {
        from = depthRanges[i];
        to = depthRanges[i + 1];

        labels.push(
            '<i style="background:' + getFillColor(from + 1) + '"></i> ' +
            from + (to ? '&ndash;' + to : '+'));
    }

    div.innerHTML = labels.join('<br>');
    return div;
};
legend.addTo(myMap);
