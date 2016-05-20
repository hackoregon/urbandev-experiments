var neighborhoods = {
  map: null,
  data: null,
  elems : {
    map : $("#map"),
    sidebar : $("#sidebar"),
    neighborhoodDropdown : $("#neighborhood-dropdown"),
    neighborhoodHover : $("#neighborhood-hover"),
    neighborhoodSummary : $("#neighborhood-summary")
  },
  geoJSONPath : "/data/neighborhoods.json",  // geojson shapefiles (from zillow)
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
    fillOpacity: 0.6, 
    strokeWeight: 2
  },
  disabledStyle : {    
    strokeWeight: 1,
    fillOpacity: 0.6, 
    fillColor: "#1396d9",
    zIndex: 2
  },
  selectedStyle : {    
    strokeWeight: 4,
    fillOpacity: 0.8, 
    fillColor: "#7ec9ac",
    zIndex: 3
  },
  blockgroupStyle : {    
    strokeWeight: 0.5,
    fillOpacity: 0.7, 
    fillColor: "red",
    zIndex: 1
  } 
};

neighborhoods.createNeighborhoodsDropdown = function () {

  var html = "",
      that = this,
      template = '<option value="{id}">{name}</option>',
      nSelect = this.elems.neighborhoodDropdown,
      nArray = this.neighborhoodsArray.sort(sortByName)

  for( var i=0; i<nArray.length; i++) {
    var item = nArray[i];
    html+=template.replace("{id}",item.ID).replace("{name}",item.Name)
  }

  nSelect.html(html).select2({
    placeholder: "Select a neighborhood",
    theme: "classic"
  });

  nSelect.on("change", function() {
    that.selectRegion( $(this).val() );
  });

  // blank default selection
  nSelect.val(0).trigger('change.select2');
};

neighborhoods.addDataPoint = function(e) {

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

      neighborhoods.neighborhoodsArray.push(dataObject);
      neighborhoods.neighborhoodsObject[e.feature.H.REGIONID] = dataObject;

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
      //ib.open(this.map);
    }
};

neighborhoods.resizeMap = function() {
  var w = $(window),
      that = this;
  w.resize(function() {
    that.elems.map.width(w.width()-550);
    that.elems.sidebar.height(w.height()-55);
  });
  w.resize();
};

neighborhoods.createGraph = function( data ) {
    
    if(!data) {
      data = {"Values":null,"Months":null};
    }

    $('#graph-home-value').highcharts({
        chart: {
            backgroundColor: '#F5F5F5',
            type: 'line'
        },
        title: {
            text: '',
            x: -20
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
            name: 'Median Home Value per sqft',         
            data: data.Values
        }],
        lang: {
            noData: "No Data",
            y: -50
        },
        noData: {
          position: {y: -30},
            style: {
                fontWeight: 'bold',
                fontSize: '15px',
                color: '#303030'
            }
        }        
    });

    $('#container-one').highcharts({

        chart: {
            polar: true,
            type: 'line'
        },

        title: {
            text: 'Budget vs spending',
            x: -80
        },

        pane: {
            size: '80%'
        },

        xAxis: {
            categories: ['Population', '% Home Owners', '% Renters', 'Crime', 'Income'],
            tickmarkPlacement: 'on',
            lineWidth: 0
        },

        yAxis: {
            gridLineInterpolation: 'polygon',
            lineWidth: 0,
            min: 0
        },

        tooltip: {
            shared: true,
            pointFormat: '<span style="color:{series.color}">{series.name}: <b>${point.y:,.0f}</b><br/>'
        },

        series: [{
            name: 'Allocated Budget',
            data: [43000, 19000, 60000, 35000],
            pointPlacement: 'on'
        }]

    });    
};

neighborhoods.selectRegion = function( regionID ) { 

  var regionID = regionID + '', // make sure this is a string
      that = this,
      dataPath = "/data/" + regionID + ".json";

  var updateView = function(d){
    
    that.map.data.forEach(function(ftr) { 
        ftr.setProperty('isSelected', false);
        if( ftr.getProperty('isSelected') ){
          console.log(ftr);
        }
    });

    // select the feature
    that.neighborhoodsObject[regionID].Feature.setProperty('isSelected', true);
    
    // pan to the Feature Region
    that.map.panTo(that.neighborhoodsObject[regionID].Center);

    // update select2 dropdown (without triggering another change event)
    that.elems.neighborhoodDropdown.val(regionID).trigger('change.select2');

    // trigger resize (to make sure map updates) ????
    google.maps.event.trigger(map, 'resize');

    // populate zillow graph
    that.createGraph(d);

    // populate census graphs?

    that.map.data.forEach(function(feature) {
        //If you want, check here for some constraints.
        if( typeof feature.getProperty('NAMELSAD10') != 'undefined' ) {
          that.map.data.remove(feature);
        }
    });

  };

  $.ajax({
    dataType: 'json',
    url: dataPath,
    success: function (data) {
      
      // load blockgroups geojson
      // console.log( data.Blockgroups );
      // all features loaded after zillow are blockgroups
      //that.map.data.setStyle(function(feature) {
      //  return that.blockgroupStyle;
      //});

      updateView(data.Zillow.MedianValue_sqft);
      that.map.data.addGeoJson(data.Blockgroups[0]);
    },
    error: function (e) {
      console.log("error getting data");
      updateView(null);
    }
  });
};

neighborhoods.init = function() {

  var that = this;

  // create map
  this.map = new google.maps.Map(this.elems.map[0], this.googleMapParams);

  // create datapoint object for each geojson shape
  google.maps.event.addListener(this.map.data,'addfeature', this.addDataPoint);

  // load geoJSON (zillow), and create dropdown after it loads
  this.map.data.loadGeoJson(this.geoJSONPath, null, function (features) {
    that.createNeighborhoodsDropdown();
    that.elems.neighborhoodSummary.text(that.neighborhoodsArray.length);
  });

  // set up selected style
  this.map.data.setStyle(function(feature) {
    if( typeof feature.getProperty('NAMELSAD10') != 'undefined' ) {
      return that.blockgroupStyle;
    }
    else if (feature.getProperty('isSelected')) {
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
    
    if( typeof event.feature.getProperty('NAMELSAD10') != 'undefined' ) {
      console.log(event.feature);
      event.feature.setProperty('isBlockgroup', true);
    } 
    else {
      that.selectRegion( event.feature.H.REGIONID );  
    } 
  });

  // resize map and set up autosizing events
  this.resizeMap();

};
