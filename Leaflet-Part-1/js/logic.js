
var earthquakeQueryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

function getColor(d) {

    let color = '';
    if (d < 10) {
      color = '#1a9850';
    } else if (d < 30) {
      color = '#91cf60';
    } else if (d < 50) {
      color = '#d9ef8b';
    } else if (d < 70) {
      color = '#fee08b';
    } else if (d < 90) {
      color = '#fc8d59';
    } else { // magnitude 5+
      color = '#d73027';
    }
    return color
  }

  function getRadius(d) {
    
    return 15000 * d;
    
  }
  
  d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson", function (error,earthquakeData) {
    console.log("Start") 
    if (error) { 
        console.log(error); 
    } else {      
        console.log(earthquakeData);  //raw data
    } 
      createFeatures(earthquakeData.features);
    });

    function createFeatures(earthquakeData) {

        // Create a GeoJSON layer containing the features array on the earthquakeData object
        // Run the pointToLayer function once for each piece of data in the array
        var earthquakes = L.geoJSON(earthquakeData, {
          pointToLayer: function (feature, latlng) {
      
            // depth determines the color
            var color = getColor(feature.geometry.coordinates[2]);
      
            // Add circles to map
            return L.circle(latlng, {
              weight: 1,
              opacity: 0.75,
              fillOpacity: 0.75,
              color: color,
              fillColor: color,
              // Adjust radius
              radius: getRadius(feature.properties.mag)
            }).bindPopup("<h4> Magnitude: " + feature.properties.mag + "<br>Location:  " + feature.properties.place +
              "</h4><hr><p>" + new Date(feature.properties.time) + "</p>");
          } // end pointToLayer
      
        });
      
             
        // Sending our earthquakes layer to the createMap function
        createMap(earthquakes);
      }

      function createMap(earthquakes) {

        var outdoorsMap = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Physical_Map/MapServer/tile/{z}/{y}/{x}', {
          attribution: 'Tiles &copy; Esri &mdash; Source: US National Park Service',
          maxZoom: 18
        });

       
    
    let street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

      
      
        
      // Define a baseMaps object to hold our base layers
      var baseMaps = {
        
        "Outdoors": outdoorsMap,
        "Gray Scale": street
      };
    
      
        // Create overlay object to hold our overlay layer
        var overlayMaps = {
          'Earthquakes': earthquakes
        };
      
        // Create our map, giving it the street and earthquakes layers to display on load
        var myMap = L.map("map", {
          center: [
            37.09, -95.71
          ],
          zoom: 3,
          layers: [street, earthquakes]
        });

         // CONTROL THAT TOGGLES THE MAP VIEWS ( between Street and outdoor view) AND EARTHQUAKE OBJECTS        
         L.control.layers(baseMaps, overlayMaps, {
            collapsed: false
            })
            .addTo(myMap);
      
        var legend = L.control({
          position: 'bottomright'
        });
      
        legend.onAdd = function (map) {
      
          var div = L.DomUtil.create('div', 'info legend');
          var depth = [-10, 10, 30, 50, 70, 90];
          var labels = ['-10-10', '10-30', '30-50', '50-70', '70-90', '90+'];
      
          // loop through our magnitude intervals and generate a label with a colored square for each interval
          for (var i = 0; i < depth.length; i++) {
            div.innerHTML +=
              '<i style="background:' + getColor(depth[i]) + '"></i> ' + labels[i] + '<br>';
          }
          return div;
        }; // end legend.onAdd
      
        legend.addTo(myMap);
      
        
      
        
      }
      
