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

// Highcharts General Options
Highcharts.setOptions({
   global: {
      useUTC: true
   },
   credits: false,
   chart: {
      style: {
         fontFamily: 'Lato',
         backgroundColor: '#FCFFC5'
      }
   },
   colors: [
      '#7ec9ac',
      '#c9aa7e',
      '#1d9fd3',
      '#e06d5e',
      "#9d7ec9",
      "#fcead5",
      '#66A1B7',
      '#FFCC89',
      '#FFC189',
      '#683E81',
      '#357573',
      '#C18657',
      '#C1C057',
      '#2C9D6C'
   ]
});

jQuery(document).ready(function($) {
  neighborhoods.init();	
});

