(function($){
	$.fn.modal = function(data){
		var options = $.extend({
			height : "500",
			width : "800",
			top: "20%",
			left: "30%",
		});


	function add_block_page(){
		var block_page = $('<div class="block_page"></div>');			
		$(block_page).appendTo('body');
	}
	function add_styles(){			
	var pageHeight = $(document).height();
	var pageWidth = $(window).width();
		$('.block_page').css({
			'position':'absolute',
			'top':'0',
			'left':'0',
			'background-color':'rgba(0,0,0,0.6)',
			'height':pageHeight,
			'width':pageWidth,
			'z-index':'10'
		});
		$('.modal_box').css({ 
		'position':'absolute', 
		'left':options.left,
		'top':options.top,
		'height': options.height + 'px',
		'width': options.width + 'px',
		'overflow-y': 'scroll',
		'border':'1px solid #fff',
		'box-shadow': '0px 2px 7px #292929',
		'-moz-box-shadow': '0px 2px 7px #292929',
		'-webkit-box-shadow': '0px 2px 7px #292929',
		'border-radius':'10px',
		'-moz-border-radius':'10px',
		'-webkit-border-radius':'10px',
		'background': '#f2f2f2', 
		'z-index':'50',
	});
	$('.modal_close').css({
		'position':'absolute',
		'right':'0',
		'top':'5px',
		'display':'block',
		'height':'20px',
		'width':'20px'	});
}

	function add_popup_box(){
	 var pop_up = $('<div class="modal_box"><a href="#" class="modal_close">X<div></div></a></div>');
	$(pop_up).appendTo('.block_page');
			 			 
	$('.modal_close').click(function(){
            $('.block_page').fadeOut().remove();		
            $(this).parent().fadeOut().remove();			 
	});
}
	
		return this.click(function(e){
			add_block_page();
			add_popup_box();
			add_styles();
			
			$('.modal').fadeIn();
		});
				 		
		return this;
	};
	
})(jQuery);