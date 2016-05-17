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
  neighborhoodsObject : {},
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
    fillColor: "grey", 
    strokeWeight: 2
  },
  disabledStyle : {    
    strokeWeight: 1,
    fillColor: "#1396d9"
  },
  selectedStyle : {    
    strokeWeight: 4,
    fillColor: "#7ec9ac"
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

nbMap.createNeighborhoodsDropdown = function () {

  var html = "",
      template = '<option value="{id}">{name}</option>',
      nSelect = $("#neighborhoodSelector"),
      nArray = nbMap.neighborhoodsArray.sort(function(a,b) {return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? - 1 : 0);} );

  for( var i=0; i<nArray.length; i++) {
    var item = nArray[i];
    html+=template.replace("{id}",item.ID).replace("{name}",item.Name)
  }

  nSelect.html(html).select2({
    placeholder: "Select a neighborhood"
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
      
      // Push data object with feature data to array and object
      var dataObject = {
        "Name":e.feature.H.NAME, 
        "ID" : e.feature.H.REGIONID, 
        "Center" : bounds.getCenter()
      };
      nbMap.neighborhoodsArray.push(dataObject);
      nbMap.neighborhoodsObject[e.feature.H.REGIONID] = dataObject;

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
      //var ib = new InfoBox(boxOptions);              
      //ib.open(nbMap.map);
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

nbMap.setFeatureStyle2 = function(feature, style) {
  nbMap.map.data.setStyle(function(feature) {                    
    return style;
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
  
    $('#graph-home-value').highcharts({
        chart: {
            backgroundColor: '#F5F5F5',
            type: 'line'
        },
        title: {
            text: 'Median Home Value Per Sqft',
            x: -20 //center
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
      nbMap.map.panTo(nbMap.neighborhoodsObject[regionID].Center);
    },
    error: function (e) {
      console.log("error getting data");
      console.log(e);
    //$(".data").text(JSON.stringify(data));
      $("#neighborhoodSelector").val(regionID).trigger("change");

      // pan to element
      nbMap.map.panTo(nbMap.neighborhoodsObject[regionID].Center);      
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
    $("#summaryCount").text(nbMap.neighborhoodsArray.length);
  });

  // Set mouseover event for each feature (neighborhood)
  nbMap.map.data.addListener('mouseover', function(event) {
    nbMap.map.data.revertStyle();
    nbMap.map.data.overrideStyle(event.feature, nbMap.hoverStyle);
    $("#neighborhood-hover").text(event.feature.H.NAME);
  });

  nbMap.map.data.setStyle(function(feature) {
    if (feature.getProperty('isSelected')) {
      return nbMap.selectedStyle;
    }
    return nbMap.disabledStyle;
  });

  // Set click event for each feature (neighborhood)
  nbMap.map.data.addListener('click', function(event) {
    nbMap.map.data.forEach(function(feature) { 
        feature.setProperty('isSelected', false);
    });
    event.feature.setProperty('isSelected', true);
    nbMap.selectRegion( event.feature.H.REGIONID );
    nbMap.map.data.overrideStyle(event.feature, nbMap.selectedStyle);
  });

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