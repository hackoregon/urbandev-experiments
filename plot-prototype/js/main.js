// Main
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

function roundVal(num) {    
    return +(Math.round(num + "e+2")  + "e-2");
}

jQuery(document).ready(function($) {
  nbMap.init();	
});

