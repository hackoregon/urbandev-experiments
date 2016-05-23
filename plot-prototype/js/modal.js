(function($){
	$.fn.modal = function(template){
		var options = $.extend({
			height : "100%",
			width : "100%",
			top: "55px",
			left: "0",
			fade: 500
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
		'height': options.height,
		'width': options.width,
		'overflow-y': 'scroll',
		'box-shadow': '0px 2px 7px #292929',
		'-moz-box-shadow': '0px 2px 7px #292929',
		'-webkit-box-shadow': '0px 2px 7px #292929',
		'background': '#000000', 
		'z-index':'500000',
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
		var pop_up = $('<div class="modal_box"><a href="#" class="modal_close">&#x2573</a><div class="modal_content"</div></div>');
			$(pop_up).hide().appendTo('.block_page').fadeIn(options.fade);
			$('.modal_content').load(template);

			 			 
	$('.modal_close').click(function(){
            $('.block_page').fadeOut(options.fade, function(){
            	$(this).remove()
            });		
            $(this).parent().fadeOut(options.fade, function(){
            	$(this).remove()
            });		 
	});
}
		return this.click(function(e){
			var modalOpen = $('.modal_box');
			if (modalOpen){
				$('.block_page').fadeOut(options.fade, function(){
            		$(this).remove()
            	});		 		
            	$('.modal_box').fadeOut(options.fade, function(){
            		$(this).remove()
            	});	
            }	 

			add_block_page();
			add_popup_box();
			add_styles();
			
			$('.modal').fadeIn(options.fade);
		}); 
				 		
		return this;
	};
	
})(jQuery);