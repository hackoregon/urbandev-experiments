// Neighborhoods Map 

var nbMap = {  
  running: false,
  currentMonth: null,
  monthIndex: 0,
  hslMaxValue : 340, // this should be the max value in dataset
  //dataPath: '/data/zillow_med_val_sqft.json', // specify json data set here
  timeIntervalMs:  100, // time in milliseconds for each year/month
  intervalId: null,
  map: null,
  data: null,
  mapElement: $('#map')[0],
  geoJSONPath : '/data/neighborhoods.json',  // geojson shapefiles (from zillow)
  neighborhoodsArray : [],
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
    fillColor: "#1396d9"
  },
  selectedStyle : {    
    strokeWeight: 1,
    fillColor: "#1396d9"
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

nbMap.createNeighborhoodsDropdown = function (){

  var html = "",
      template = '<option value="{id}">{name}</option>',
      nSelect = $("#neighborhoodSelector"),
      nArray = nbMap.neighborhoodsArray.sort(function(a,b) {return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? - 1 : 0);} );

  for( var i=0; i<nArray.length; i++) {
    var item = nArray[i];
    html+=template.replace("{id}",item.ID).replace("{name}",item.Name)
  }

  nSelect.html(html).select2();
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
      nbMap.neighborhoodsArray.push({
        "Name":e.feature.H.NAME, 
        "ID" : e.feature.H.REGIONID, 
        "Center" : bounds.getCenter() 
      });

      var labelText = e.feature.H.NAME;
      var labelDiv = document.createElement("div");
      labelDiv.innerHTML = labelText;
      labelDiv.setAttribute("class", "shape-label");
      labelDiv.setAttribute("id", "shape-" + e.feature.H.REGIONID);
      labelDiv.setAttribute("style", "color:#444;");

      var boxOptions = {
        content: labelDiv,
        id : e.feature.H.REGIONID,
        boxStyle: {
          border: "none",
          textAlign: "center",
          fontSize: "12px",
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

nbMap.resizeMap = function() {
  var w = $(window);
  w.resize(function() {
    $("#map").width(w.width()-500);
    $("#sidebar").height(w.height()-55);
  });
  w.resize();
};

nbMap.createGraph = function( data ) {
  
    $('#container').highcharts({
        title: {
            text: 'Median Home Value Per Sqft',
            x: -20 //center
        },
        subtitle: {
            text: 'Source: Zillow',
            x: -20
        },
        xAxis: {
            categories: data.Months
        },
        yAxis: {
            title: {
                text: 'Home Value Per Sqft'
            },
            plotLines: [{
                value: 0,
                width: 1,
                color: '#808080'
            }]
        },
        
        series: [{
           
            data: data.Values
        }]
    });
};

nbMap.selectRegion = function( regionID ) {

  var dataPath = "/data/" + regionID + ".json";

  $.ajax({
    dataType: 'json',
    url: dataPath,
    success: function (data) {      
      nbMap.data = data;
      console.log(data);
      nbMap.createGraph(data.Zillow.MedianValue_sqft);
      
      // load blockgroups geojson

      // populate census graphs

      // populate zillow graphs

      //$(".data").text(JSON.stringify(data));
      $("#neighborhoodSelector").val(regionID).trigger("change");

      // pan to element
      nbMap.map.panTo(nbMap.neighborhoodsArray[7].Center);
    },
    error: function (e) {
      console.log("error getting data");
      console.log(e);
    }
  });
};

nbMap.init = function() {

  // Create Map
  nbMap.map = new google.maps.Map(nbMap.mapElement, nbMap.googleMapParams);

  // Create datapoint object for each geojson shape
  google.maps.event.addListener(nbMap.map.data,'addfeature', nbMap.addDataPoint);

  // Load GeoJSON (zillow)
  nbMap.map.data.loadGeoJson(nbMap.geoJSONPath, null, function (features) {
    // Create dropdown after geojson loads (and we have all neighborhood names)
    nbMap.createNeighborhoodsDropdown();
  });

  // Set mouseover event for each feature
  nbMap.map.data.addListener('mouseover', function(event) {
    if( nbMap.running ) {      
      return; // disable mouseover when running
    }
    nbMap.map.data.revertStyle();
    nbMap.map.data.overrideStyle(event.feature, nbMap.hoverStyle);
    $("#neighborhood-hover").text(event.feature.H.NAME);
  });

  nbMap.map.data.addListener('click', function(event) {
    nbMap.selectRegion( event.feature.H.REGIONID );
  });

  // Set Default Style
  nbMap.setFeatureStyle();

  // Resize map and set up autosizing events
  nbMap.resizeMap();

  
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
