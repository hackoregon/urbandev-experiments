// Neighborhoods Map Config Object
var nbMap = {  
  running: false,
  currentMonth: null,
  monthIndex: 0,
  hslMaxValue : 360,
  intervalId: null,
  map: null,
  data: null,
  mapElement: $('#map')[0],
  monthYearSelector: $('.year'),
  geoJSONPath : '/data/neighborhoods.json',
  googleMapParams : {
    zoom: 12,
    panControl: true,
    zoomControl: true,
    center: new google.maps.LatLng(45.52306220000001,-122.67648159999999),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [{stylers: [{saturation: -100}]}],
    disableDefaultUI: true
  },
  hoverStyle:{        
    strokeWeight: 4, 
    fillColor: 'green'
  },
  disabledStyle : {    
    strokeWeight: 1,
    fillColor: "#ccc"
  }
};

nbMap.value2HSL = function(value){
  var val = (1.0 - (value/this.hslMaxValue)) * 240;
  return "hsl(" + val + ", 100%, 50%)";
}

nbMap.addDataPoint = function(e) {
  if(e.feature.getGeometry().getType()==='Polygon'){
      
      // Create bounds rectangle to place datapoint properly
      var bounds=new google.maps.LatLngBounds();
      e.feature.getGeometry().getArray().forEach(function(path){              
         path.getArray().forEach(function(latLng){bounds.extend(latLng);});              
      });
      e.feature.setProperty('bounds',bounds);
      
      // Default to RegionID, use datapoint if available        
      var labelText = e.feature.H.REGIONID;
      try {
        labelText = z_data[e.feature.H.REGIONID][nbMap.currentMonth];  
      }catch(e) {
        labelText = '';
      }

      var labelDiv = document.createElement("div");
      labelDiv.innerHTML = labelText;
      labelDiv.setAttribute("class", "shape-label");
      labelDiv.setAttribute("id", "shape-" + e.feature.H.REGIONID);
      labelDiv.setAttribute("style", "color:#000;font-weight:bold;");

      var boxOptions = {
        content: labelDiv,
        id : e.feature.H.REGIONID,
        boxStyle: {
          border: "none",
          textAlign: "center",
          fontSize: "16px",
          width: "50px"
        },
        disableAutoPan: true,
        pixelOffset: new google.maps.Size(-25, 0),
        position: bounds.getCenter(), // method to find center of bounding rectangle
        closeBoxURL: "",
        isHidden: false,
        pane: "mapPane",
        enableEventPropagation: true
      };
      var ib = new InfoBox(boxOptions);              
      ib.open(nbMap.map);
    }
};

nbMap.setFeatureStyle = function(feature) {
  nbMap.map.data.setStyle(function(feature) {                    
    try {
      var month = months[nbMap.monthIndex];
      var datapoint = z_data[feature.H.REGIONID][month];
      return {
        fillColor: nbMap.value2HSL(datapoint),
        strokeWeight: 1
      };          
    }
    catch(e) {
     return nbMap.disabledStyle;
    }
  });
};

nbMap.init = function() {

  this.currentMonth = months[this.monthIndex];
  this.monthYearSelector.text(this.currentMonth);

  this.data = new google.maps.MVCArray();      
  this.map = new google.maps.Map(this.mapElement, this.googleMapParams);

  // Create datapoint object for each geojson shape
  google.maps.event.addListener(this.map.data,'addfeature', this.addDataPoint);

  // Load GeoJSON (zillow)
  this.map.data.loadGeoJson(this.geoJSONPath);

  // Set mouseover event for each feature
  this.map.data.addListener('mouseover', function(event) {
    if( nbMap.running ) {      
      return; // disable mouseover when running
    }
    this.map.data.revertStyle();
    this.map.data.overrideStyle(event.feature, nbMap.hoverStyle);
    $(".region").text(event.feature.H.NAME);
  });

  // Set Default Style
  nbMap.setFeatureStyle();
};

nbMap.updateInfobox = function( feature) {
  
  var id = feature.H.REGIONID;
  try {
    var datapoint = z_data[feature.H.REGIONID][this.currentMonth];  
    $("#shape-" + id ).text(datapoint);
  } catch(e) {}
};

nbMap.start = function() {
  if( this.running ) return;
  this.running = true;
  nbMap.intervalId = setInterval(nbMap.nextMonth, 100);
  $(".start-button").addClass("disabled");
  $(".stop-button").removeClass("disabled");
};

nbMap.stop = function() {
  if( !this.running ) return;
  this.running = false;
  clearInterval(nbMap.intervalId);
  $(".stop-button").addClass("disabled");
  $(".start-button").removeClass("disabled");  
};

nbMap.nextMonth = function() {

  if (!months[nbMap.monthIndex] || nbMap.monthIndex >= months.length - 1 ) {    
    nbMap.stop();
    return;
  }

  // Loop through all features, update shape styles and datapoints
  nbMap.map.data.forEach(function(feature) {
      nbMap.setFeatureStyle(feature);
      nbMap.updateInfobox(feature);
  });

  nbMap.monthIndex++;
  nbMap.currentMonth = months[nbMap.monthIndex];      
  nbMap.monthYearSelector.text(nbMap.currentMonth);
};

// main
jQuery(document).ready(function($) {

  nbMap.init();

});