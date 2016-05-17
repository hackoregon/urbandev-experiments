// Neighborhoods Map Object

var nbMap = {
  map: null,
  data: null,
  elems : {
    map : $("#map"),
    sidebar : $("#sidebar"),
    neighborhoodDropdown : $("#neighborhood-dropdown"),
    neighborhoodHover : $("#neighborhood-hover"),
    neighborhoodSummary : $("#neighborhood-summary")
  },
  selectedRegion: null,
  mapElement: $("#map")[0],
  geoJSONPath : "/data/neighborhoods.json",  // geojson shapefiles (from zillow)
  neighborhoodsArray : [],
  neighborhoodsObject : {},
  googleMapParams : {
    zoom: 11,
    panControl: true,
    zoomControl: true,
    center: new google.maps.LatLng(45.52306220000001,-122.67648159999999),
    mapTypeId: google.maps.MapTypeId.ROADMAP,
    styles: [{stylers: [{saturation: -100}]}],
    disableDefaultUI: true
  },
  hoverStyle:{     
    fillOpacity: 0.6, 
    strokeWeight: 2
  },
  disabledStyle : {    
    strokeWeight: 1,
    fillColor: "#1396d9"
  },
  selectedStyle : {    
    strokeWeight: 4,
    fillOpacity: 0.6, 
    fillColor: "#7ec9ac"
  }  
};

nbMap.createNeighborhoodsDropdown = function () {

  var html = "",
      template = '<option value="{id}">{name}</option>',
      nSelect = this.elems.neighborhoodDropdown,
      nArray = nbMap.neighborhoodsArray.sort(function(a,b) {return (a.Name > b.Name) ? 1 : ((b.Name > a.Name) ? - 1 : 0);} );

  for( var i=0; i<nArray.length; i++) {
    var item = nArray[i];
    html+=template.replace("{id}",item.ID).replace("{name}",item.Name)
  }

  nSelect.html(html).select2({
    placeholder: "Select a neighborhood",
    theme: "classic"
  });

  nSelect.on("change", function() {
    nbMap.selectRegion( $(this).val() );
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
        "Center" : bounds.getCenter(),
        "Feature" : e.feature
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
  var w = $(window),
      that = this;
  w.resize(function() {
    that.elems.map.width(w.width()-550);
    that.elems.sidebar.height(w.height()-55);
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
                enabled: false
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

  var regionID = regionID+'',
      that = this,
      dataPath = "/data/" + regionID + ".json";

  var updateView = function(){
    
    that.map.data.forEach(function(ftr) { 
        ftr.setProperty('isSelected', false);
        if( ftr.getProperty('isSelected') ){
          console.log(ftr);
        }
    });

    var feature = that.neighborhoodsObject[regionID].Feature;

    // select the feature
    feature.setProperty('isSelected', true);
    
    // pan to the Feature Region
    that.map.panTo(that.neighborhoodsObject[regionID].Center);

    // update select2 dropdown (without triggering another change event)
    that.elems.neighborhoodDropdown.val(regionID).trigger('change.select2');

    google.maps.event.trigger(map, 'resize');
  }; 

  $.ajax({
    dataType: 'json',
    url: dataPath,
    success: function (data) {      
      nbMap.data = data;
      
      // load blockgroups geojson
      //nbMap.map.data.addGeoJson(data.Blockgroups);

      // populate census graphs

      // populate zillow graphs
      nbMap.createGraph(data.Zillow.MedianValue_sqft);

      // Update Selectors
      updateView();
    },
    error: function (e) {
      console.log("error getting data");
      updateView();
    }
  });
};

nbMap.init = function() {

  var that = this;

  // create map
  this.map = new google.maps.Map(this.elems.map[0], nbMap.googleMapParams);

  // create datapoint object for each geojson shape
  google.maps.event.addListener(nbMap.map.data,'addfeature', nbMap.addDataPoint);

  // load geoJSON (zillow), and create dropdown after it loads
  this.map.data.loadGeoJson(this.geoJSONPath, null, function (features) {
    that.createNeighborhoodsDropdown();
    that.elems.neighborhoodSummary.text(that.neighborhoodsArray.length);
  });

  // set up selected style
  this.map.data.setStyle(function(feature) {
    if (feature.getProperty('isSelected')) {
      return that.selectedStyle;
    }
    return that.disabledStyle;
  });

  // set mouseover event for each feature (neighborhood)
  this.map.data.addListener('mouseover', function(event) {    
    if (!event.feature.getProperty('isSelected')){
      that.map.data.revertStyle();
      that.map.data.overrideStyle(event.feature, that.hoverStyle);  
    }
    that.elems.neighborhoodHover.text(event.feature.H.NAME);
  });

  // set click event for each feature (neighborhood)
  this.map.data.addListener('click', function(event) {
    that.selectRegion( event.feature.H.REGIONID );
  });

  // resize map and set up autosizing events
  this.resizeMap();

};
