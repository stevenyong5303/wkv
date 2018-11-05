var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var app = new Framework7({
			  root: '#app',
			  id: 'com.wkv.manage',
			  name: 'WKV',
			  theme: 'md',
			  version: "1.0.23",
			  rtl: false,
			  language: "en-US"
		  });

$(document).ready(function(){
	var monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG' , 'SEP' , 'OCT', 'NOV', 'DEC'];
	var calendarInline = app.calendar.create({
			containerEl: '#wkv-calendar',
			value:  [new Date()],
					weekHeader: false,
					renderToolbar: function () {
						return  '<div class="toolbar calendar-custom-toolbar no-shadow">' +
								'<div class="toolbar-inner">' +
								'<div class="left">' +
								'<a href="#" class="link icon-only"><i class="icon icon-back ' + (app.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
								'</div>' +
								'<div class="center"></div>' +
								'<div class="right">' +
								'<a href="#" class="link icon-only"><i class="icon icon-forward ' + (app.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
								'</div>' +
								'</div>' +
								'</div>';
					},
					on: {
						init: function (c) {
							$$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] +', ' + c.currentYear);
							$$('.calendar-custom-toolbar .left .link').on('click', function () {
								calendarInline.prevMonth();
							});
							$$('.calendar-custom-toolbar .right .link').on('click', function () {
								calendarInline.nextMonth();
							});
						},
						monthYearChangeStart: function (c) {
							$$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] +', ' + c.currentYear);
						}
					}
		});
	
	var usr = STORAGE.getItem('usr'),
		pwd = STORAGE.getItem('pwd');
	
	var DATA = {
			'usr' : usr,
			'pwd' : pwd
		};
	var post_data = "ACT=" + encodeURIComponent('ssn_chk')
				  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
	
	$.ajax({
		type: 'POST',
		url: 'http://app.wkvmusicstore.com/',
		data: post_data,
		success: function(str){
			sys.getLocation();
			setTimeout(function(){
				sys.loading(0);
				if(str!=='200 OK'){
					app.loginScreen.open('#lgn');
				}
			}, 2500);
		}
	});
	
	
	$('#lgn #lgn_sgn').on('click', function(){
		usr = $('#lgn input[name="lgn_usr"]').val();
		pwd = $('#lgn input[name="lgn_pwd"]').val();
		
		if(!sys.isEmpty(usr) && !sys.isEmpty(pwd)){
			DATA = {
				'usr' : usr,
				'pwd' : pwd
			};
			post_data = "ACT=" + encodeURIComponent('lgn_chk')
					  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					  
			$.ajax({
				type: 'POST',
				url: 'http://app.wkvmusicstore.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.getLocation();
					setTimeout(function(){
						sys.loading(0);
						if(str==='200 OK'){
							STORAGE.setItem('usr', usr);
							STORAGE.setItem('pwd', pwd);
							
							app.loginScreen.close('#lgn');
						}
						$('#lgn input[name="lgn_usr"]').val('');
						$('#lgn input[name="lgn_pwd"]').val('');
					}, 2000);
				}
			});
		}
	});
	
	$('#wkv-calendar .calendar-day').on('click', function(){
		if($(this).hasClass('calendar-day-selected')){
			var tmp = new Date(calendarInline.getValue()[0]);
			
			if(!sys.isEmpty(tmp)){
				DATA = {
					'date' : tmp.toDateString().substr(4)
				};
				post_data = "ACT=" + encodeURIComponent('cal_get')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
				$.ajax({
					type: 'POST',
					url: 'http://app.wkvmusicstore.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						sys.loading(0);
						
						if(str==='204 No Response'){
							$('.popup-event .event_list').text('No data found.');
						}else{
							var x = '<thead><tr><th class="label-cell"></th><th class="label-cell">PIC</th><th class="tablet-only">Time</th><th class="label-cell" style="width:300px;">Venue</th><th class="tablet-only">Desc.</th><th class="tablet-only">Mixer</th><th class="tablet-only">W/L</th><th class="tablet-only">Speaker</th><th class="tablet-only">Band</th><th class="label-cell">Crew</th><th class="label-cell">IN</th><th class="label-cell">OUT</th><th class="tablet-only">B/G</th></tr></thead><tbody>',
								row = [],
								inf = JSON.parse(str);
							
							for(var i=0; i<inf.length; i++){
								x += '<tr name="el'+(i+1)+'"><td class="label-cell"><span name="el'+(i+1)+'">'+(i+1)+'</span></td>';
								x += '<td class="label-cell">'+inf[i].pic+'</td>';
								x += '<td class="tablet-only">'+((inf[i].luncheon_dinner==null) ? '-' : inf[i].luncheon_dinner)+'</td>';
								x += '<td class="label-cell">'+((inf[i].venue==null) ? '-' : inf[i].venue)+'</td>';
								x += '<td class="tablet-only">'+((inf[i].description==null) ? '-' : inf[i].description)+'</td>';
								x += '<td class="tablet-only">'+((inf[i].mixer==null) ? '-' : inf[i].mixer)+'</td>';
								x += '<td class="tablet-only">'+((inf[i].wireless_mic==null) ? '-' : inf[i].wireless_mic)+'</td>';
								x += '<td class="tablet-only">'+((inf[i].speaker==null) ? '-' : inf[i].speaker)+'</td>';
								x += '<td class="tablet-only">'+((inf[i].band==null) ? '-' : inf[i].band)+'</td>';
								x += '<td class="label-cell">'+((inf[i].crew==null) ? '-' : inf[i].crew)+'</td>';
								x += '<td class="label-cell">'+((inf[i].car_in==null) ? '-' : inf[i].car_in)+'</td>';
								x += '<td class="label-cell">'+((inf[i].car_out==null) ? '-' : inf[i].car_out)+'</td>';
								x += '<td class="tablet-only">'+((inf[i].bride_groom==null) ? '-' : inf[i].bride_groom)+'</td>';
								x += '</tr>';
							}
							x += '<tbody>';
							$('.popup-event .event_list').html(x);
							
							for(var i=0; i<inf.length; i++){
								$('tr[name="el'+(i+1)+'"]').data('info', inf[i]);
							}
						}
						$('.popup-event .event_date').text(tmp.toDateString().substr(4));
						app.popup.open('.popup-event');
						
						$('.event_list span').on('click', function(){
							var x = '';
							var inf = $('tr[name="' + $(this).attr('name') + '"]').data('info');
							
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap">' + ((inf.luncheon_dinner==null) ? '-' : inf.luncheon_dinner) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap">' + ((inf.venue==null) ? '-' : inf.venue) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap">' + ((inf.description==null) ? '-' : inf.description) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Mixer</div><div class="item-input-wrap">' + ((inf.mixer==null) ? '-' : inf.mixer) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Wireless Microphonw</div><div class="item-input-wrap">' + ((inf.wireless_mic==null) ? '-' : inf.wireless_mic) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Speaker</div><div class="item-input-wrap">' + ((inf.speaker==null) ? '-' : inf.speaker) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap">' + ((inf.band==null) ? '-' : inf.band) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap">' + ((inf.crew==null) ? '-' : inf.crew) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap">' + ((inf.car_in==null) ? '-' : inf.car_in) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap">' + ((inf.car_out==null) ? '-' : inf.car_out) + '</div></div></div></li>';
							x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Client, Bride/Groom</div><div class="item-input-wrap">' + ((inf.bride_groom==null) ? '-' : inf.bride_groom) + '</div></div></div></li>';
							
							x = x.replace(/(?:\r\n|\r|\n)/g, '<br>');
							$('.details-popover ul').html(x);
							app.popover.open('.details-popover');
						});
					}
				});
			}
		}
	});
	
	$('input#ltcl_nme').on('keyup', function(){
		var tmp = ($(this).val()).toLowerCase();
		
		if(tmp.includes('beam')){
			$('#ltcl_ads').val('16')
		}else if(tmp.includes('par can') || tmp.includes('pcc') || tmp.includes('pcw')){
			$('#ltcl_ads').val('8')
		}else if(tmp.includes('city')){
			$('#ltcl_ads').val('3')
		}else if(tmp.includes('wash') || tmp.includes('zoom')){
			$('#ltcl_ads').val('16')
		}
	});
	
	$('button#ltcl_add').on('click', function(){
		var name = $('#ltcl_nme').val(),
			addr = parseInt($('#ltcl_ads').val()),
			qnty = parseInt($('#ltcl_qty').val());
		
		if(!sys.isEmpty(name) && $.isNumeric(addr) && $.isNumeric(qnty)){
			var tmp = '', tmp_add = parseInt($('#ltcl_spc').data('dmx'));
		
			for(var x=0; x<qnty; x++){
				var dmx = ('000' + tmp_add).slice(-3);
				
				tmp += '<span class="badge">' + name + '<br/>[ ' + dmx + ' ]</span> ';
				tmp_add += addr;
				$('#ltcl_spc').data('dmx', tmp_add);
			}
			
			$('#ltcl_spc').append(tmp);
			
			$('#ltcl_nme').val('');
			$('#ltcl_ads').val('');
			$('#ltcl_qty').val('');
		}
	});
	
	$('button#ltcl_clr').on('click', function(){
		$('#ltcl_spc').data('dmx', 1);
		$('#ltcl_nme').val('');
		$('#ltcl_ads').val('');
		$('#ltcl_qty').val('');
		$('#ltcl_spc').text('');
	});
	
	$('input#stcl_row, input#stcl_col').on('keyup', function(){
		var row = parseInt($('input#stcl_row').val()), col = parseInt($('input#stcl_col').val()), tmp = 0;
		
		if($.isNumeric(row) && $.isNumeric(col) && row!=0 && col!=0){
			$('#stcl_size').html((col*4)+' ft&emsp;x&emsp;'+(row*4)+' ft');
			
			tmp = row * col;
			$('#stcl_board').text(tmp);
			
			tmp = (((row+1)*col)+((col+1)*row));
			$('#stcl_side').text(tmp);
			
			tmp = ((row+1)*(col+1));
			$('#stcl_leg').text(tmp);
			$('#stcl_shoe').text(tmp);
		}else{
			$('#stcl_board').text(0);
			$('#stcl_side').text(0);
			$('#stcl_leg').text(0);
			$('#stcl_shoe').text(0);
			$('#stcl_size').html('0 ft&emsp;x&emsp;0 ft');
		}
	});
});

sys = {
	'loading' : function(show){
		if(show===1){
			$('#loading-overlay').css('z-index', '100');
			$('#app').css('z-index', '-100');
			$('#loading-overlay').css('opacity', '1');
			$('#app').css('opacity', '0');
		}else{
			$('#loading-overlay').css('z-index', '-100');
			$('#app').css('z-index', '100');
			$('#loading-overlay').css('opacity', '0');
			$('#app').css('opacity', '1');
		}
	},
	'isEmpty' : function(myVar){
		if(myVar === ''){
			return true;
		}else if(myVar === null){
			return true;
		}else if(myVar === undefined){
			return true;
		}else if(myVar == ''){
			return true;
		}
		return false;
	},
	'serialize' : function(mixed_value){
		var val, key, okey, ktype = '', vals = '', count = 0,
			_utf8Size = function(str){
				var size = 0, i = 0, l = str.length, code = '';
				
				for(i = 0; i < l; i++){
					code = str.charCodeAt(i);
					if(code < 0x0080){
						size += 1;
					}else if(code < 0x0800) {
						size += 2;
					}else{
						size += 3;
					}
				}
				return size;
			},
			_getType = function(inp){
				var match, key, cons, types, type = typeof inp;

				if(type === 'object' && !inp){
					return 'null';
				}

				if(type === 'object'){
					if(!inp.constructor){
						return 'object';
					}
					
					cons = inp.constructor.toString();
					match = cons.match(/(\w+)\(/);
					
					if(match){
						cons = match[1].toLowerCase();
					}
					types = ['boolean', 'number', 'string', 'array'];
					for(key in types){
						if(cons === types[key]){
							type = types[key];
							break;
						}
					}
				}
				return type;
			},
			type = _getType(mixed_value);

		switch(type){
			case 'function':
				val = '';
				break;
			case 'boolean':
				val = 'b:' + (mixed_value ? '1' : '0');
				break;
			case 'number':
				val = (Math.round(mixed_value) === mixed_value ? 'i' : 'd') + ':' + mixed_value;
				break;
			case 'string':
				val = 's:' + _utf8Size(mixed_value) + ':"' + mixed_value + '"';
				break;
			case 'array':
			case 'object':
				val = 'a';
				for(key in mixed_value){
					if(mixed_value.hasOwnProperty(key)){
						ktype = _getType(mixed_value[key]);
						if (ktype === 'function'){
							continue;
						}
						okey = (key.match(/^[0-9]+$/) ? parseInt(key, 10) : key);
						vals += this.serialize(okey) + this.serialize(mixed_value[key]);
						count++;
					}
				}
				val += ':' + count + ':{' + vals + '}';
				break;
			case 'undefined':
			default:
				val = 'N';
				break;
		}
		
		if(type !== 'object' && type !== 'array'){
			val += ';';
		}
		return val;
	},
	'getLocation' : function(){
		navigator.geolocation.watchPosition(function(position){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'lon' : position.coords.longitude,
				'lat' : position.coords.latitude
			};
			var post_data = "ACT=" + encodeURIComponent('loc_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'http://app.wkvmusicstore.com/',
				data: post_data,
				success: function(str){
					console.log(str);
				}
			});
		}, function(error){
			console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		}, { enableHighAccuracy: true });
	}
}