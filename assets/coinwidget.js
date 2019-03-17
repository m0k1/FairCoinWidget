$(function(){
	setTimeout(function(){
		$("#social2").html($("#social1").html());
	},1000);	
	$("body").css({'overflow-y':'scroll'});
	$("body > section").css({'margin-top':($("body > header").outerHeight()+20)});
	$(window).resize(function(){
		$("body > section").css({'margin-top':($("body > header").outerHeight()+20)});
	});
	setTimeout(function(){
		$("body > section").animate({'margin-top':($("body > header").outerHeight()+20)});
	},850);
	$("body > img.gear").delay(2000).fadeIn(1200);
	$("body > header").show('slide',{direction:'up'},650);
	$("body > section > article, body > section > small").hide();
	setTimeout(function(){
		$("body > section > article, body > section > small").each(function(i){
			switch (i) {
				case 4:
				case 0: dir = 'up'; break;
				case 5:
				case 1: dir = 'left'; break;
				case 2: dir = 'down'; break;
				case 3: dir = 'right'; break;
			}
			$(this).delay(i*250).fadeIn(550);
		});
	},500);

	$("#preview").delay(650).fadeIn();
});

var wizard = {
	init: function(){
		wizard.restart();
		wizard.sidebar.init();
		wizard.alignment.init();
		wizard.counter.init();
		wizard.text.init();
		wizard.qrcode.init();
		wizard.autoshow.init();
	}
	, defaults: {
		 counter: 	'count'
		, alignment: 	'bl'
		, qrcode: 	true
	}
};

$(function(){
	wizard.init();
});

wizard.preview = function(){
	$button_id = "#wizard > article .COINWIDGETCOM_CONTAINER > a";
	$button = $($button_id);
	$instance = $button.parent().attr('data-coinwidget-instance');
	$win = $("#COINWIDGETCOM_WINDOW_"+$instance);
	$ext = $button.parent().find('> span');

	$counter = $("#wizard li[data-page='counter'] > b").text().toLowerCase();
	$alignment = $("#wizard li[data-page='alignment'] > b").text().toLowerCase();
	$qrcode = $("#wizard li[data-page='qrcode'] > b").text().toLowerCase();
	$auto_show = $("#wizard li[data-page='autoshow'] > b").text().toLowerCase();
	
	$wallet = $("#wizard input[name=wallet_address]").val();
	$lbl_button = $("#wizard input[name='button']").val();
	$lbl_address = $("#wizard input[name='address']").val();
	$lbl_count = $("#wizard input[name='count']").val();
	$lbl_amount = $("#wizard input[name='amount']").val();
	$button.find('span').html($lbl_button);
	$win.find('label').html($lbl_address);

	$counters = {count:123,amount:999.999};
	$win.find('> span.COINWIDGETCOM_COUNT').html($counters.count+'<small>'+$lbl_count+'</small>');
	$win.find('> span.COINWIDGETCOM_AMOUNT').html($counters.amount.toFixed(4)+'<small>'+$lbl_amount+'</small>');
	$counter_html = '';
	$right = 'auto';
	switch ($counter) {
		default:
		case 'transaction count': 	$counter_val = 'count'; $counter_html = $counters.count; $nudge_right = 37; break;
		case 'amount received': 	$counter_val = 'amount'; $counter_html = $counters.amount.toFixed(4); $nudge_right = 10;break;
		case 'hidden': 				$counter_val = 'hide'; $counter_html = ''; $nudge_right=72;break;
	}

	$margin_left = 0;
	switch ($alignment) {
		default:
		case 'below, left': 	$alignment = 'bl'; $top = 50; $left = 50; break;
		case 'below, center': 	$alignment = 'bc'; $top = 50; $left = '50%'; $margin_left = Math.ceil($button.outerWidth()/2*-1)-10; break;
		case 'below, right': 	$alignment = 'br'; $top = 50; $left = 'auto'; $right = $nudge_right; break;
		case 'above, left': 	$alignment = 'al'; $top = !$counter_html?168:207; $left = 50; break;
		case 'above, center': 	$alignment = 'ac'; $top = !$counter_html?168:207; $left = '50%'; $margin_left = Math.ceil($button.outerWidth()/2*-1)-10; break;
		case 'above, right': 	$alignment = 'ar'; $top = !$counter_html?168:207; $left = 'auto'; $right = $nudge_right; break;
	}

	if (CoinWidgetCom.config[$instance]) {
		CoinWidgetCom.config[$instance]['alignment'] = $alignment;
		$win.removeClass("COINWIDGETCOM_WINDOW_BL COINWIDGETCOM_WINDOW_BC COINWIDGETCOM_WINDOW_BR COINWIDGETCOM_WINDOW_AL COINWIDGETCOM_WINDOW_AC COINWIDGETCOM_WINDOW_AR");
		$win.addClass("COINWIDGETCOM_WINDOW_"+$alignment.toUpperCase());
	}
	$button.parent().parent().css({'top':$top,'left':$left,'right':$right,'margin-left':$margin_left});
	
	$qrcode = ($qrcode == 'on')?true:false;
	if ($qrcode) {
		$win.find('.COINWIDGETCOM_QRCODE').show();
	} else {
		$win.find('.COINWIDGETCOM_QRCODE').hide();
	}

	$auto_show = ($auto_show == 'on')?true:false;

	if ($counter_html) {
		$ext.html($counter_html).show();
		$win.find('> span').show();
	} else {
		$ext.hide();
		$win.find('> span').hide();
	}

	$button.find('img').attr('src',CoinWidgetCom.source+'icon_faircoin.png');
	$win.find('.COINWIDGET_INPUT_ICON').attr('src',CoinWidgetCom.source+'icon_faircoin.png');

	$wallet_val = $wallet;
	if (!$wallet)
	{
		$wallet = CoinWidgetCom.config[0].wallet_address;
	} 
	if (CoinWidgetCom.config[$instance])
		CoinWidgetCom.config[$instance]['wallet_address'] = $wallet;
	$uri = ':'+$wallet;
	$win.find('input').val($wallet);
	$win.find('.COINWIDGETCOM_WALLETURI').attr('href',$uri);

	wizard.code.generate({
		wallet_address: $wallet_val?$wallet_val:"ENTER-YOUR-FAIRCOIN-WALLET-ADDRESS"
		, counter: $counter_val
		, alignment: $alignment
		, qrcode: $qrcode
		, auto_show: $auto_show 
		, lbl_button: $lbl_button 
		, lbl_address: $lbl_address
		, lbl_count: $lbl_count 
		, lbl_amount: $lbl_amount
	});
};
wizard.code = {
	current: null
	, strip: function(txt) {
		return txt.replace(/\"/g,'&quot;');
	}
	, generate: function(options){
		$code = [];
		$code.push('<script src="https://widget.m0k1.pw/coin.js"></script>');
		$code.push('<script>');
		$code.push('CoinWidgetCom.go({');
		$code.push("\t"+'wallet_address: "'+wizard.code.strip(options.wallet_address)+'"');
		$code.push("\t"+', counter: "'+wizard.code.strip(options.counter)+'"');
		$code.push("\t"+', alignment: "'+wizard.code.strip(options.alignment)+'"');
		$code.push("\t"+', qrcode: '+options.qrcode);
		$code.push("\t"+', auto_show: '+options.auto_show);
		$code.push("\t"+', lbl_button: "'+wizard.code.strip(options.lbl_button)+'"');
		$code.push("\t"+', lbl_address: "'+wizard.code.strip(options.lbl_address)+'"');
		$code.push("\t"+', lbl_count: "'+wizard.code.strip(options.lbl_count)+'"');
		$code.push("\t"+', lbl_amount: "'+wizard.code.strip(options.lbl_amount)+'"');
		$code.push("});");
		$code.push('</script>');
		$code = $code.join("\n");
		$("#code textarea").val($code);
	}
	, close: function(){
		$("#code").hide('drop',{direction:'down'},function(){
			$("#wizard").show('drop',{direction:'down'}, function(){
				$("#wizard .COINWIDGETCOM_CONTAINER > a").click();
			});	
		});	
	}
	, close_all: function(){
		$("#code").hide();
		wizard.close();
	}
};
wizard.get_code = function(){
	$("#wizard").hide('drop',{direction:'down'},function(){
		$("#code").show('drop',{direction:'down'});	
	});
	$(".COINWIDGETCOM_WINDOW").remove();
};



wizard.counter = {
	buttons: "#wizard div[data-page='counter'] button[data-counter]"
	, init: function(){
		$(wizard.counter.buttons).unbind('click').on('click',function(){
			wizard.counter.select(this);
		});
	}
	, select: function(obj) {
		$(wizard.counter.buttons).addClass('grey');
		$(obj).removeClass('grey');
		$("li[data-page='counter'] > b").html($(obj).attr('data-sidebar'));
		wizard.preview();
	}
};


wizard.qrcode = {
	buttons: "#wizard div[data-page='qrcode'] button[data-qrcode]"
	, init: function(){
		$(wizard.qrcode.buttons).unbind('click').on('click',function(){
			wizard.qrcode.select(this);
		});
	}
	, select: function(obj) {
		$(wizard.qrcode.buttons).addClass('grey');
		$(obj).removeClass('grey');
		$("li[data-page='qrcode'] > b").html($(obj).attr('data-sidebar'));
		wizard.preview();
	}
};

wizard.autoshow = {
	buttons: "#wizard div[data-page='autoshow'] button[data-autoshow]"
	, init: function(){
		$(wizard.autoshow.buttons).unbind('click').on('click',function(){
			wizard.autoshow.select(this);
		});
	}
	, select: function(obj) {
		$(wizard.autoshow.buttons).addClass('grey');
		$(obj).removeClass('grey');
		$("li[data-page='autoshow'] > b").html($(obj).attr('data-sidebar'));
		wizard.preview();
	}
};

wizard.start = function(){
	wizard.restart();
	$(".COINWIDGETCOM_WINDOW").each(function(i,v){
		$instance = $(this).attr('id').replace('COINWIDGETCOM_WINDOW_','');
		CoinWidgetCom.hide($instance);
	});
	$("#fade").show('slide',{direction:'down'},650,function(){
		$("#wizard").fadeIn(function(){
			$("#wizard div.loading").delay(500).hide('drop',{direction:'down'},500,function(){
				$("#wizard article").fadeIn(300, function(){
					$("#wizard article .COINWIDGETCOM_CONTAINER a").click();
					wizard.preview();
				});
			});
		});
		$("body").css({'overflow':'hidden'});
		$("#header").css({'box-shadow':'none'});
		$("#header > section").animate({'height':90},function(){
			$("body > section").animate({'margin-top':($("body > header").outerHeight()+20)},200);
		});
	}).unbind('click').on('click',function(){
		if(confirm('Are you sure you want to close the wizard?')) {
			wizard.close();
		}
	});
};

wizard.close = function(){
	$(".COINWIDGETCOM_WINDOW").remove();
	$("body").css({'overflow':'visible'});
	$("#COINWIDGET_WINDOW:visible .COINWIDGET_WINDOW_CLOSER").click();
	$("#header").css({'box-shadow':'0px 10px 20px rgba(0,0,0,0.3)'});
	$("#code:visible,#wizard").fadeOut(function(){
		$("#header > section").animate({'height':140},function(){
			$("body > section").animate({'margin-top':($("body > header").outerHeight()+20)},200);
		});
		wizard.restart();
	});
	$("#fade").hide('drop',{direction:'up'});
};

wizard.restart = function(){
	$("#wizard aside [data-page='currency']").click();
	$("#wizard div.loading").show();
	$("#wizard article").hide();
	$("#wizard div[data-page='currency'] button[data-currency='btc']").click();
	$("#wizard div[data-page='counter'] button[data-counter='count']").click();
	wizard.text.update();
	$("table#alignment td[data-point='bl']").click();
	$("#wizard div[data-page='qrcode'] button[data-qrcode='on']").click();
	$("#wizard div[data-page='autoshow'] button[data-autoshow='off']").click();
	$("#wizard div[data-page='currency'] input[name='wallet_address']").val('');
};

wizard.sidebar = {
	init : function(){
		$("#wizard aside li").unbind('click').on('click',function(){
			wizard.sidebar.select(this);
		});
	}
	, select: function(obj){
		$("#wizard aside li").removeClass('sel');
		$(obj).addClass('sel');
		$("#wizard .step [data-page]").hide();
		$("#wizard .step [data-page='"+$(obj).attr('data-page')+"']").show();
	}
};

wizard.alignment = {
	init : function(){
		$("table#alignment td.point").unbind('click').on('click',function(){
			wizard.alignment.select(this);
		});
	}
	, select : function(obj){
		$point = $(obj).attr('data-point');
		switch ($point) {
			case 'al': $label = 'Above, Left'; break;
			case 'ac': $label = 'Above, Center'; break;
			case 'ar': $label = 'Above, Right'; break;
			case 'bl': $label = 'Below, Left'; break;
			case 'bc': $label = 'Below, Center'; break;
			case 'br': $label = 'Below, Right'; break;
		}
		$("table#alignment td.point").removeClass('sel');
		$(obj).addClass('sel');
		$("table#alignment td.mid_point span").html($label);	
		$("#wizard li[data-page='alignment'] b").html($label);
		wizard.preview();
	}
};

wizard.text = {
	defaults : {
		bitcoin: {
			button: 	'Donate'
			, address: 	'My Bitcoin Address:'
			, count:	'donations'
			, amount: 	'BTC'
		}
		, litecoin: {
			button: 	'Donate'
			, address: 	'My Litecoin Address:'
			, count:	'donations'
			, amount: 	'LTC'
		}
		, faircoin: {
			button: 	'Donate'
			, address: 	'My FairCoin Address:'
			, count:	'donations'
			, amount: 	'FAIR'
		}
	}
	, init: function(){
		$("#wizard div[data-page='text'] input[type='text'],#wizard div[data-page='currency'] input[type='text']").unbind('input').on('input keyup',function(){
			wizard.text.update();
		});
		$("#wizard div[data-page='text'] a#text_restore").unbind('click').on('click',function(e){
			e.preventDefault();
			$coin = $("#wizard li[data-page='currency'] b").text().toLowerCase();
			$def = wizard.text.defaults[$coin];	
			wizard.text.set($def);
			wizard.text.update();
		});
	}
	, update: function(){
		$coin = $("#wizard li[data-page='currency'] b").text().toLowerCase();
		$def = wizard.text.defaults[$coin];
		$inp_button = $("#wizard input[name='button']").val();
		$inp_address = $("#wizard input[name='address']").val();
		$inp_count = $("#wizard input[name='count']").val();
		$inp_amount = $("#wizard input[name='amount']").val();
		$is_custom = ($inp_button == $def['button']
					  &&  $inp_address == $def['address']
					  &&  $inp_count == $def['count']
					  &&  $inp_amount == $def['amount'])?false:true;
		$("#wizard li[data-page='text'] b").html($is_custom?'Custom':'Default');
		if ($is_custom) {
			$("#wizard div[data-page='text'] a#text_restore").fadeIn();
		} else {
			$("#wizard div[data-page='text'] a#text_restore").fadeOut();
		}
		wizard.preview();
	}
	, set: function(txt) {
		$("#wizard input[name='button']").val(txt.button);
		$("#wizard input[name='address']").val(txt.address);
		$("#wizard input[name='count']").val(txt.count);
		$("#wizard input[name='amount']").val(txt.amount);
	}
};

