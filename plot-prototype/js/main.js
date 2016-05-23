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

function openModal(type){
  
}

function toggle(){
  if (isModalOpen()){
    $('.block_page').remove();
  } else {
    var block_page = $('<div class="block_page"></div>');     
    $(block_page).appendTo('body');
  }  
}

function isModalOpen(){
  return $('.block_page');
}

function registerNavModals(){
    $('.nav-item').modal();

  var navItems = $('.nav-item');
  navItems.each(function(index, item){
    var type = item.innerHTML;
    $(item).on('click', function($){
      openModal(type)
    });
  });
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
  registerNavModals();
});

