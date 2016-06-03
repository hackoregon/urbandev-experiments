// Main

// Utility Functions
function roundVal(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

function sortByName(a, b){
  var aName = a.Name.toLowerCase();
  var bName = b.Name.toLowerCase(); 
  return ((aName < bName) ? -1 : ((aName > bName) ? 1 : 0));
}

function registerNavModals(){
  var navItems = $('.nav-item');
  navItems.each(function(index, item){
    var type = item.innerHTML,
    template = './templates/' + type + '.html';
    $(item).modal(template);
  });
}
function toTitleCase(str){
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}


// Highcharts General Options
Highcharts.setOptions({
   global: {
      useUTC: true
   },
   credits: false,
   chart: {
      style: {
         fontFamily: 'Dosis',
         backgroundColor: '#343434'
      }
   },
   colors: [
      '#7ec9ac',
      '#e06d5e',
      "#9d7ec9",
      "#fcead5",
      '#66A1B7',
      '#4FA3DB',
      '#2373a9',
      '#16486a'
   ]
});

jQuery(document).ready(function($) {
  neighborhoods.init();	
  registerNavModals();

  // For testing only
  /*setTimeout(function(){
    neighborhoods.selectRegion(274797);
  }, 1200);*/

});

