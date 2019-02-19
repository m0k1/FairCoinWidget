if (typeof FairCoinWidgetCounter != 'number')
var FairCoinWidgetCounter = 0;

if (typeof FairCoinWidget != 'object')
var FairCoinWidget = {
	source: 'https://m0k1.pw/widget/'
	, config: []
	, go :function(config) {
		config = FairCoinWidget.validate(config);
		FairCoinWidget.config[FairCoinWidgetCounter] = config;
		FairCoinWidget.loader.jquery();
		document.write('<span data-coinwidget-instance="'+FairCoinWidgetCounter+'" class="FAIRCOINWIDGET_CONTAINER"></span>');
		FairCoinWidgetCounter++;
	}
	, validate: function(config) {
		var $accepted = [];
		$accepted['counters'] = ['count','amount','hide'];
		$accepted['alignment'] = ['al','ac','ar','bl','bc','br'];
		if (!config.counter || !FairCoinWidget.in_array(config.counter,$accepted['counters']))
			config.counter = 'count';
		if (!config.alignment || !FairCoinWidget.in_array(config.alignment,$accepted['alignment']))
			config.alignment = 'bl';
		if (typeof config.qrcode != 'boolean')
			config.qrcode = true;
		if (typeof config.auto_show != 'boolean')
			config.auto_show = false;
		if (!config.wallet_address)
			config.wallet_address = 'My FairCoin wallet_address is missing!';
		if (!config.lbl_button) 
			config.lbl_button = 'Donate';
		if (!config.lbl_address)
			config.lbl_address = 'My FairCoin Address:';
		if (!config.lbl_count)
			config.lbl_count = 'Donation';
		if (!config.lbl_amount)
			config.lbl_amount = 'FAIR';
		if (typeof config.decimals != 'number' || config.decimals < 0 || config.decimals > 10)
			config.decimals = 4;

		return config;
	}
	, init: function(){
		FairCoinWidget.loader.stylesheet();
		$(window).resize(function(){
			FairCoinWidget.window_resize();
		});
		setTimeout(function(){
			/* this delayed start gives the page enough time to 
			   render multiple widgets before pinging for counts.
			*/
			FairCoinWidget.build();
		},800);		
	}
	, build: function(){
		$containers = $("span[data-coinwidget-instance]");
		$containers.each(function(i,v){
			$config = FairCoinWidget.config[$(this).attr('data-coinwidget-instance')];
			$counter = $config.counter == 'hide'?'':('<span><img src="'+FairCoinWidget.source+'icon_loading.gif" width="13" height="13" /></span>');
			$button = '<a class="FAIRCOINWIDGET_BUTTON_FAIRCOIN" href="#"><img src="'+FairCoinWidget.source+'icon_faircoin.png" /><span>'+$config.lbl_button+'</span></a>'+$counter;
			$(this).html($button);
			$(this).find('> a').unbind('click').click(function(e){
				e.preventDefault();
				FairCoinWidget.show(this);
			});
		});
		FairCoinWidget.counters();
	}
	, window_resize: function(){
		$.each(FairCoinWidget.config,function(i,v){
			FairCoinWidget.window_position(i);
		});
	}
	, window_position: function($instance){
		$config = FairCoinWidget.config[$instance];
		coin_window = "#FAIRCOINWIDGET_WINDOW_"+$instance;

			obj = "span[data-coinwidget-instance='"+$instance+"'] > a";
			/* 	to make alignment relative to the full width of the container instead 
			of just the button change this occurence of $(obj) to $(obj).parent(), 
			do the same for the occurences within the switch statement. */
			$pos = $(obj).offset(); 
			switch ($config.alignment) {
				default:
				case 'al': /* above left */
					$top = $pos.top - $(coin_window).outerHeight() - 10;
					$left = $pos.left; 
					break;
				case 'ac': /* above center */
					$top = $pos.top - $(coin_window).outerHeight() - 10;
					$left = $pos.left + ($(obj).outerWidth()/2) - ($(coin_window).outerWidth()/2);
					break;
				case 'ar': /* above right */
					$top = $pos.top - $(coin_window).outerHeight() - 10;
					$left = $pos.left + $(obj).outerWidth() - $(coin_window).outerWidth();
					break;
				case 'bl': /* bottom left */
					$top = $pos.top + $(obj).outerHeight() + 10;
					$left = $pos.left; 
					break;
				case 'bc': /* bottom center */
					$top = $pos.top + $(obj).outerHeight() + 10;
					$left = $pos.left + ($(obj).outerWidth()/2) - ($(coin_window).outerWidth()/2);
					break;
				case 'br': /* bottom right */
					$top = $pos.top + $(obj).outerHeight() + 10;
					$left = $pos.left + $(obj).outerWidth() - $(coin_window).outerWidth();
					break;
			}
		if ($(coin_window).is(':visible')) {
			$(coin_window).stop().animate({'z-index':99999999999,'top':$top,'left':$left},150);
		} else {
			$(coin_window).stop().css({'z-index':99999999998,'top':$top,'left':$left});
		}
	}
	, counter: []
	, counters: function(){
		$addresses = [];
		$.each(FairCoinWidget.config,function(i,v){
			$instance = i;
			$config = v;
			if ($config.counter != 'hide')
				$addresses.push($instance+'_faircoin_'+$config.wallet_address);
			else {
				if ($config.auto_show) 
					$("span[data-coinwidget-instance='"+i+"']").find('> a').click();
			}
		});
		if ($addresses.length) {
			FairCoinWidget.loader.script({
				id: 'FAIRCOINWIDGET_INFO'+Math.random()
				, source: (FairCoinWidget.source+'lookup.php?data='+$addresses.join('|'))
				, callback: function(){
					if (typeof FAIRCOINWIDGET_DATA == 'object') {
						FairCoinWidget.counter = FAIRCOINWIDGET_DATA;
						$.each(FairCoinWidget.counter,function(i,v){
							$config = FairCoinWidget.config[i];
							if (!v.count || v == null) v = {count:0,amount:0};
							$("span[data-coinwidget-instance='"+i+"']").find('> span').html($config.counter=='count'?v.count:(v.amount.toFixed($config.decimals)+' '+$config.lbl_amount));
							if ($config.auto_show) {
								$("span[data-coinwidget-instance='"+i+"']").find('> a').click();
							}
						});
					}
					if ($("span[data-coinwidget-instance] > span img").length > 0) {
						setTimeout(function(){FairCoinWidget.counters();},2500);
					}
				}
			});
		}
	}
	, show: function(obj) {
		$instance = $(obj).parent().attr('data-coinwidget-instance');
		$config = FairCoinWidget.config[$instance];
		coin_window = "#FAIRCOINWIDGET_WINDOW_"+$instance;
		$(".FAIRCOINWIDGET_WINDOW").css({'z-index':99999999998});
		if (!$(coin_window).length) {

			$sel = !navigator.userAgent.match(/iPhone/i)?'onclick="this.select();"':'onclick="prompt(\'Select all and copy:\',\''+$config.wallet_address+'\');"';

			$html = ''
				  + '<label>'+$config.lbl_address+'</label>'
				  + '<input type="text" readonly '+$sel+'  value="'+$config.wallet_address+'" />'
				  + '<a class="FAIRCOINWIDGET_CREDITS" href="https://faircoin.world/" target="_blank">FairCoin.world</a>'
  				  + '<a class="FAIRCOINWIDGET_WALLETURI" href="faircoin:'+$config.wallet_address+'" target="_blank" title="Click here to send this address to your wallet (if your wallet is not compatible you will get an empty page, close the white screen and copy the address by hand)" ><img src="'+FAIRCOINWIDGET.source+'icon_wallet.png" /></a>'
  				  + '<a class="FAIRCOINWIDGET_CLOSER" href="javascript:;" onclick="FairCoinWidget.hide('+$instance+');" title="Close this window">x</a>'
  				  + '<img class="COINWIDGET_INPUT_ICON" src="'+FairCoinWidget.source+'icon_faircoin.png" width="16" height="16" title="This is a FairCoin wallet address." />'
				  ;
			if ($config.counter != 'hide') {
				$html += '<span class="FAIRCOINWIDGET_COUNT">0<small>'+$config.lbl_count+'</small></span>'
				  	  + '<span class="FAIRCOINWIDGET_AMOUNT end">0.00<small>'+$config.lbl_amount+'</small></span>'
				  	  ;				  
			}
			if ($config.qrcode) {
				$html += '<img class="FAIRCOINWIDGET_QRCODE" data-coinwidget-instance="'+$instance+'" src="'+FairCoinWidget.source+'icon_qrcode.png" width="16" height="16" />'
				  	   + '<img class="FAIRCOINWIDGET_QRCODE_LARGE" src="'+FairCoinWidget.source+'icon_qrcode.png" width="111" height="111" />'
				  	   ;
			}
			var $div = $('<div></div>');
			$('body').append($div);
			$div.attr({
				'id': 'FAIRCOINWIDGET_WINDOW_'+$instance
			}).addClass('FAIRCOINWIDGET_WINDOW FAIRCOINWIDGET_WINDOW_FAIRCOIN FAIRCOINWIDGET_WINDOW_'+$config.alignment.toUpperCase()).html($html).unbind('click').bind('click',function(){
				$(".FAIRCOINWIDGET_WINDOW").css({'z-index':99999999998});
				$(this).css({'z-index':99999999999});
			});
			if ($config.qrcode) {
				$(coin_window).find('.FAIRCOINWIDGET_QRCODE').bind('mouseenter click',function(){
					$config = FairCoinWidget.config[$(this).attr('data-coinwidget-instance')];
					$lrg = $(this).parent().find('.FAIRCOINWIDGET_QRCODE_LARGE');
					if ($lrg.is(':visible')) {
						$lrg.hide();
						return;
					}
					$lrg.attr({
						src: FairCoinWidget.source +'qr/?address='+$config.wallet_address
					}).show();
				}).bind('mouseleave',function(){
					$lrg = $(this).parent().find('.FAIRCOINWIDGET_QRCODE_LARGE');
					$lrg.hide();
				});
			}
		} else {
			if ($(coin_window).is(':visible')) {
				FairCoinWidget.hide($instance);
				return;
			}
		}
		FairCoinWidget.window_position($instance);
		$(coin_window).show();
		$pos = $(coin_window).find('input').position();
		$(coin_window).find('img.COINWIDGET_INPUT_ICON').css({'top':$pos.top+3,'left':$pos.left+3});
		$(coin_window).find('.FAIRCOINWIDGET_WALLETURI').css({'top':$pos.top+3,'left':$pos.left+$(coin_window).find('input').outerWidth()+3});
		if ($config.counter != 'hide') {
			$counters = FairCoinWidget.counter[$instance];
			if ($counters == null) {
				$counters = {
					count: 0,
					amount: 0
				};
			}
		 	if ($counters.count == null) $counters.count = 0;
		 	if ($counters.amount == null) $counters.amount = 0;
			$(coin_window).find('.FAIRCOINWIDGET_COUNT').html($counters.count+ '<small>'+$config.lbl_count+'</small>');
			$(coin_window).find('.FAIRCOINWIDGET_AMOUNT').html($counters.amount.toFixed($config.decimals)+ '<small>'+$config.lbl_amount+'</small>');
		}
		if (typeof $config.onShow == 'function') 
			$config.onShow();
	}
	, hide: function($instance) {
		$config = FairCoinWidget.config[$instance];
		coin_window = "#FAIRCOINWIDGET_WINDOW_"+$instance;
		$(coin_window).fadeOut();
		if (typeof $config.onHide == 'function') {
			$config.onHide();
		}
	}
	, in_array: function(needle,haystack) {
		for (i=0;i<haystack.length;i++) {
			if (haystack[i] == needle) { 
				return true;
			}
		}
		return false;
	}
	, loader: {
		loading_jquery: false,
		script: function(obj){
			if (!document.getElementById(obj.id)) {
				var x = document.createElement('script');
				x.onreadystatechange = function(){
					switch (this.readyState) {
						case 'complete':
						case 'loaded':
							obj.callback();
							break;
					}
				};
				x.onload = function(){
					obj.callback();
				};
				x.src = obj.source;
				x.id  = obj.id;
				document.lastChild.firstChild.appendChild(x);
			}
		}
		, stylesheet_loaded: false
		, stylesheet: function(){
			if (!FairCoinWidget.loader.stylesheet_loaded) {
				FairCoinWidget.loader.stylesheet_loaded = true;
				var $link = $('<link/>');
				$("head").append($link);
				$link.attr({
					id 		: 'FAIRCOINWIDGET_STYLESHEET'
					, rel 	: 'stylesheet'
					, type 	: 'text/css'
					, href 	: FairCoinWidget.source+'coin.css'
				});
			}
		}
		, jquery: function(){
			if (!window.jQuery && !FairCoinWidget.loader.loading_jquery) {
				$prefix = window.location.protocol=='file:'?'https:':'';
				FairCoinWidget.loader.script({
					id			: 'FAIRCOINWIDGET_JQUERY'
					, source 	: $prefix + '//ajax.googleapis.com/ajax/libs/jquery/1.7.1/jquery.min.js'
					, callback  : function(){
						FairCoinWidget.init();
					}
				});
				return;
			}
			FairCoinWidget.init();
		}
	}
};
