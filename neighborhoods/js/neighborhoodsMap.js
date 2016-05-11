// Neighborhoods Map 

var nbMap = {  
  running: false,
  currentMonth: null,
  monthIndex: 0,
  hslMaxValue : 2.0, // this should be the max value in dataset
  dataPath: '/data/zillow_zri.json', // specify json data set here
  timeIntervalMs:  200, // time in milliseconds for each year/month
  intervalId: null,
  map: null,
  data: null,
  mapElement: $('#map')[0],
  monthYearSelector: $('.year'),
  geoJSONPath : '/data/neighborhoods.json',  // geojson shapefiles (from zillow)
  monthsArray : [],
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
    strokeWeight: 4
  },
  disabledStyle : {    
    strokeWeight: 1,
    fillColor: "transparent"
  }
};

nbMap.getFileName = function(path){
  return path.replace(/^.*[\\\/]/, '')
}

nbMap.value2HSL = function(value){
  var val = (1.0 - (value/this.hslMaxValue)) * 240;
  return "hsl(" + val + ", 100%, 50%)";
}

nbMap.loadData = function (callback) {

  $.ajax({
    dataType: 'json',
    url: nbMap.dataPath,
    success: function (data) {      
      nbMap.data = data;      
      callback();
    },
    error: function (e) {
      console.log("error getting data");
      console.log(e);
    }
  });
};

nbMap.addDataPoint = function(e) {
  if(e.feature.getGeometry().getType()==='Polygon'){
      
      // Create bounds rectangle to place datapoint properly
      var bounds=new google.maps.LatLngBounds();
      e.feature.getGeometry().getArray().forEach(function(path){              
         path.getArray().forEach(function(latLng){bounds.extend(latLng);});
      });
      e.feature.setProperty('bounds',bounds);
      
      // Default to RegionID, use datapoint if available        
      var labelText = '';
      try {
        var arr = nbMap.data[nbMap.currentMonth];
        var id = e.feature.H.REGIONID
        for( var i=0;i<arr.length;i++) {
          if( arr[i].RegionID == id) {
            labelText = roundVal( arr[i].Value );
            break;
          }
        } 
      }catch(e) {}

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
        var arr = nbMap.data[nbMap.currentMonth];
        var id = feature.H.REGIONID;
        var datapoint;
        for( var i=0;i<arr.length;i++) {
          if( arr[i].RegionID == id) {
            datapoint = roundVal( arr[i].Value );
            break;
          }
        }
        if( datapoint ) {
           return {
            fillColor: nbMap.value2HSL(datapoint),
            strokeWeight: 1
          }; 
        }
        else {
          return nbMap.disabledStyle;
        }
    }
    catch(e) {
     return nbMap.disabledStyle;
    }
  });
};

nbMap.init = function() {

  nbMap.loadData(function(){

    // Create months array
    nbMap.months = Object.keys(nbMap.data).sort();
    nbMap.currentMonth = nbMap.months[0];
    $('.year').text(nbMap.currentMonth);
    $(".source").text(nbMap.getFileName(nbMap.dataPath));

    // Create Map
    nbMap.map = new google.maps.Map(nbMap.mapElement, nbMap.googleMapParams);

    // Create datapoint object for each geojson shape
    google.maps.event.addListener(nbMap.map.data,'addfeature', nbMap.addDataPoint);

    // Load GeoJSON (zillow)
    nbMap.map.data.loadGeoJson(nbMap.geoJSONPath);

    // Set mouseover event for each feature
    nbMap.map.data.addListener('mouseover', function(event) {
      if( nbMap.running ) {      
        return; // disable mouseover when running
      }
      nbMap.map.data.revertStyle();
      nbMap.map.data.overrideStyle(event.feature, nbMap.hoverStyle);
      $(".region").text(event.feature.H.NAME);
    });

    // Set Default Style
    nbMap.setFeatureStyle();

  });
};

nbMap.updateInfobox = function( feature) {
  
  var id = feature.H.REGIONID;
  try {
    var datapoint;
    var arr = nbMap.data[nbMap.currentMonth];
    var id = feature.H.REGIONID
    for( var i=0;i<arr.length;i++) {
      if( arr[i].RegionID == id) {
        datapoint = roundVal( arr[i].Value );
        break;
      }
    }
    $("#shape-" + id ).text(datapoint);
  } catch(e) {}
};

nbMap.start = function() {
  if( this.running ) return;
  this.running = true;
  nbMap.intervalId = setInterval(nbMap.nextMonth, nbMap.timeIntervalMs);
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

  if (!nbMap.months[nbMap.monthIndex] || nbMap.monthIndex >= nbMap.months.length - 1 ) {    
    nbMap.stop();
    return;
  }

  // Loop through all features, update shape styles and datapoints
  nbMap.map.data.forEach(function(feature) {
      nbMap.setFeatureStyle(feature);
      nbMap.updateInfobox(feature);
  });

  nbMap.monthIndex++;
  nbMap.currentMonth = nbMap.months[nbMap.monthIndex];      
  $('.year').text(nbMap.currentMonth);
};
