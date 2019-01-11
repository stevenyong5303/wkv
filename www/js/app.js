var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var app = new Framework7({
			  root: '#app',
			  id: 'com.wkv.manage',
			  name: 'WKV',
			  theme: 'md',
			  version: "1.0.55",
			  rtl: false,
			  language: "en-US"
		  });
var geoToken = true, geoCount = 60;
		  
$(document).ready(function(){
	var usr = STORAGE.getItem('usr'),
		pwd = STORAGE.getItem('pwd');
	
	var DATA = '', post_data = '';
	
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
							sys.dayClick(usr);
							sys.eventCheck(usr, c.currentMonth, c.currentYear);
						}
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
					inf = JSON.parse(str);
					sys.getLocation();
					
					if(inf['clocked']=='1'){
						sys.clockToggle('in');
					}else{
						sys.clockToggle('out');
					}
					
					setTimeout(function(){
						sys.loading(0);
						if(inf['reply']==='200 OK'){
							STORAGE.setItem('usr', usr);
							STORAGE.setItem('pwd', pwd);
							
							$('div.views').css('opacity', '1');
							
							$('#lgn input[name="lgn_usr"]').val('');
							$('#lgn input[name="lgn_pwd"]').val('');
							
							app.loginScreen.close('#lgn');
						}else{
							var failed_toast = app.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'ID or password invalid',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}
					}, 2000);
				}
			});
		}else{
			var failed_toast = app.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Error, field is empty',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}
	});
	
	sys.dayClick = function(user){
		$('#wkv-calendar .calendar-month-current .calendar-day').on('click', function(){
			if($(this).hasClass('calendar-day-selected')){
				var tmp = new Date(calendarInline.getValue()[0]);
				
				if(!sys.isEmpty(tmp)){
					DATA = {
						'usr' : user,
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
								$('.popup-event .event_list').html('<p style="margin-left:10px;">No event found.</p>');
							}else{
								var x = '<thead><tr><th class="label-cell"></th>'
									  + '<th class="label-cell">&emsp;PIC&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
									  + '<th class="label-cell">L/D</th>'
									  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Venue&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
									  + '<th class="tablet-only">Desc.</th>'
									  + '<th class="tablet-only">Mixer</th>'
									  + '<th class="tablet-only">W/L</th>'
									  + '<th class="tablet-only">Speaker</th>'
									  + '<th class="tablet-only">Band</th>'
									  + '<th class="label-cell">Crew&emsp;&emsp;</th>'
									  + '<th class="label-cell">IN&emsp;&emsp;</th>'
									  + '<th class="label-cell">OUT&emsp;&emsp;</th>'
									  + '<th class="tablet-only">B/G</th></tr></thead><tbody>',
									inf = JSON.parse(str);
								
								for(var i=0; i<inf.length; i++){
									x += '<tr name="el'+(i+1)+'"><td class="label-cell"><span class="button button-fill" name="el'+(i+1)+'">'+(i+1)+'</span></td>';
									x += '<td class="label-cell">'+inf[i].pic+'</td>';
									x += '<td class="label-cell">'+((inf[i].luncheon_dinner==null) ? '-' : ((inf[i].luncheon_dinner=='Lunch') ? 'L' : 'D'))+'</td>';
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
	};
	sys.dayClick(usr);
	sys.eventCheck(usr, (new Date().getMonth()), new Date().getYear()+1900);
	
	$('input#ltcl_nme').on('keyup', function(){
		var tmp = ($(this).val()).toLowerCase();
		
	if(tmp.includes('beam') || tmp.includes('moving') || tmp.includes('wash') || tmp.includes('zoom')){
			$('#ltcl_ads').val('16')
		}else if(tmp.includes('par') || tmp.includes('pcc') || tmp.includes('pcw') || tmp.includes('small')){
			$('#ltcl_ads').val('8')
		}else if(tmp.includes('city')){
			$('#ltcl_ads').val('3')
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
		}else{
			var failed_toast = app.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Error, field is empty',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
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
	
	$('.popup-convr input[type=radio][name=convr-radio][value=fttom]').prop("checked", true);
	$('.popup-convr input[type=radio][name=convr-radio]').change(function() {
		if(this.value == 'fttom') {
			$('.convr-u1').html('Foot (ft)');
			$('.convr-u2').html('Metre (m)');
			$('#convr2').attr('placeholder', '0.3048');
		}else if(this.value == 'intomm') {
			$('.convr-u1').html('Inch (in)');
			$('.convr-u2').html('Millimetre (mm)');
			$('#convr2').attr('placeholder', '25.4');
		}else if(this.value == 'ft2tom2') {
			$('.convr-u1').html('Square Foot (ft<sup>2</sup>)');
			$('.convr-u2').html('Square Metre (m<sup>2</sup>)');
			$('#convr2').attr('placeholder', '0.092903');
		}else if(this.value == 'mtopx') {
			$('.convr-u1').html('Metre (m)');
			$('.convr-u2').html('Pixel (px)');
			$('#convr2').attr('placeholder', '256');
		}else if(this.value == 'wtoA') {
			$('.convr-u1').html('Watt (w)');
			$('.convr-u2').html('Ampere (A)');
			$('#convr2').attr('placeholder', '240');
		}
		$('#convr1').val('');
		$('#convr2').val('');
	});
	
	$('input#convr1').on('keyup', function(){
		switch($('.popup-convr input[type=radio][name=convr-radio]:checked').val()){
			case 'fttom':
				$('#convr2').val(parseFloat(this.value)*0.3048);
				break;
			case 'intomm':
				$('#convr2').val(parseFloat(this.value)*25.4);
				break;
			case 'ft2tom2':
				$('#convr2').val(parseFloat(this.value)*0.092903);
				break;
			case 'mtopx':
				$('#convr2').val(parseFloat(this.value)*256);
				break;
			case 'wtoA':
				$('#convr2').val(parseFloat(this.value)/240);
				break;
		}
	});
	
	$('input#convr2').on('keyup', function(){
		switch($('.popup-convr input[type=radio][name=convr-radio]:checked').val()){
			case 'fttom':
				$('#convr1').val(parseFloat(this.value)/0.3048);
				break;
			case 'intomm':
				$('#convr1').val(parseFloat(this.value)/25.4);
				break;
			case 'ft2tom2':
				$('#convr1').val(parseFloat(this.value)/0.092903);
				break;
			case 'mtopx':
				$('#convr1').val(parseFloat(this.value)/256);
				break;
			case 'wtoA':
				$('#convr1').val(parseFloat(this.value)*240);
				break;
		}
	});
	
	$('a#loc_refresh').on('click', function(){
		var loc = $('iframe#gmap').data('loc');
		
		$('iframe#gmap').attr('src', ('https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center='+loc+'&zoom=17'));
		sys.getTime();
	})
	
	$$('button.clock-check').on('click', function () {
		app.dialog.confirm('Clock to this location?', 'Confirmation', function(){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('clk_add')
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
					if(str=='200 OK'){
						var clockcheck_toast = app.toast.create({
												icon: '<i class="material-icons">alarm_add</i>',
												text: 'Clocked',
												position: 'center',
												closeTimeout: 2000
											});
						clockcheck_toast.open();
					}else{
						var failed_toast = app.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Oooppss, error',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
					}
				}
			});
		});
	});
	
	$$('button.clock-in').on('click', function () {
		app.dialog.confirm('Clock in to this location?', 'Confirmation', function(){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('clk_in')
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
					if(str=='200 OK'){
						STORAGE.setItem('clock_in', Date.now());
						
						var clockin_toast = app.toast.create({
												icon: '<i class="material-icons">alarm_on</i>',
												text: 'Clocked In',
												position: 'center',
												closeTimeout: 2000
											});
						sys.clockToggle('in');
						clockin_toast.open();
					}else{
						var failed_toast = app.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Oooppss, error',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
					}
				}
			});
		});
	});
	
	$$('button.clock-out').on('click', function () {
		app.dialog.confirm('Clock out from this location?', 'Confirmation', function(){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('clk_out')
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
					if(str=='200 OK'){
						STORAGE.removeItem('clock_in');
						
						var clockout_toast = app.toast.create({
												icon: '<i class="material-icons">alarm_off</i>',
												text: 'Clocked Out',
												position: 'center',
												closeTimeout: 2000
											});
						sys.clockToggle('out');
						clockout_toast.open();
					}else{
						var failed_toast = app.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Oooppss, error',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
					}
				}
			});
		});
	});
	
	$('a#btn-stlo').on('click', function(){
		app.dialog.confirm('Confirm logout?', function (){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('log_out')
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
					if(str=='200 OK'){
						STORAGE.removeItem('usr');
						STORAGE.removeItem('pwd');
						
						app.loginScreen.open('#lgn');
						
						var logout_toast = app.toast.create({
												icon: '<i class="material-icons">screen_lock_portrait</i>',
												text: 'Logged Out',
												position: 'center',
												closeTimeout: 2000
											});
						logout_toast.open();
					}else{
						var failed_toast = app.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Oooppss, error',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
					}
				}
			});
		});
	});
	
	$('button#rspw_chg').on('click', function(){
		var oldpwd = $('#rspw_old').val(),
			newpwd = $('#rspw_new').val(),
			conpwd = $('#rspw_cfn').val();
		
		if(sys.isEmpty(oldpwd) || sys.isEmpty(newpwd) || sys.isEmpty(conpwd)){
			var failed_toast = app.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Error, field is empty',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}else if(newpwd != conpwd){
			var failed_toast = app.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Passwords does not match',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}else{
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'old' : oldpwd,
				'new' : newpwd
			};
			var post_data = "ACT=" + encodeURIComponent('rst_pwd')
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
					
					if(str==='200 OK'){
						var success_toast = app.toast.create({
											   icon: '<i class="material-icons">lock_open</i>',
											   text: 'Password Successfully Reset',
											   position: 'center',
											   closeTimeout: 2000
										   });
						success_toast.open();
						
						$('#rspw_old').val('');
						$('#rspw_new').val('');
						$('#rspw_cfn').val('');
					}else{
						var failed_toast = app.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Current Password Invalid',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
						
						navigator.vibrate(100);
					}
				}
			});
		}
	});
	
	$('div.popup-staa .block img').on('click', function(){
		window.open("market://details?id=com.wkv.manage", "_system");
	});
	
	DATA = {
			'usr' : usr,
			'pwd' : pwd
		};
	post_data = "ACT=" + encodeURIComponent('ssn_chk')
			  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
	
	$.ajax({
		type: 'POST',
		url: 'http://app.wkvmusicstore.com/',
		data: post_data,
		timeout: 10000,
		error: function(){
			sys.loading(0);
			app.loginScreen.open('#error');
		},
		success: function(str){
			inf = JSON.parse(str);
			sys.getLocation();
			
			if(inf['clocked']=='1'){
				sys.clockToggle('in');
			}else{
				sys.clockToggle('out');
			}
			
			if(inf['reply']!=='200 OK'){
				app.loginScreen.open('#lgn');
			}else{
				$('div.views').css('opacity', '1');
			}
			
			sys.getTime();
			sys.startClock();
			sys.loading(0);
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
	'eventCheck' : function(user, month, year){
		var DATA = {
			'usr' : user,
			'month' : month,
			'year' : year
		};
		var post_data = "ACT=" + encodeURIComponent('evt_chk')
					  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
		
		$.ajax({
			type: 'POST',
			url: 'http://app.wkvmusicstore.com/',
			data: post_data,
			beforeSend: function(){
				sys.loading(1);
			},
			success: function(str){
				if(str!=='204 No Response'){
					var inf = JSON.parse(str);
					
					for(var i=1; i<=31; i++){
						var tmpDay = ''+(i < 10 ? ('0'+i) : (i));
						if(inf[tmpDay]){
							var tmpClass = (inf[tmpDay] > 15 ? 'hl16' : ('hl'+inf[tmpDay]));
							$('#wkv-calendar .calendar-month-current .calendar-day:not(.calendar-day-next):not(.calendar-day-prev):eq('+(i-1)+')').addClass(tmpClass);
						}
					}
				}
				
				sys.loading(0);
			}
		});
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
			if(geoToken){
				$.ajax({
					type: 'POST',
					url: 'http://app.wkvmusicstore.com/',
					data: post_data,
					success: function(str){
						$('iframe#gmap').data('loc', (position.coords.latitude+','+position.coords.longitude));
					}
				});
				
				geoToken = false;
			}else{
				$('iframe#gmap').data('loc', (position.coords.latitude+','+position.coords.longitude));
			}
		}, function(error){
			console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		}, { enableHighAccuracy: true });
	},
	'pad' : function(d){
		return (d < 10) ? '0' + d.toString() : d.toString();
	},
	'getTime' : function(){
		var post_data = "ACT=" + encodeURIComponent('tme_chk');
	
		$.ajax({
			type: 'POST',
			url: 'http://app.wkvmusicstore.com/',
			data: post_data,
			success: function(str){
				$('#app-time').data('time', new Date(str));
				$('#app-time').text(new Date(str).toString().substr(4,20));
			}
		});
	},
	'startClock' : function(){
		var time = $('#app-time').data('time'), ntime;
		var workTime = STORAGE.getItem('clock_in');
		
		if(sys.isEmpty(time)){
			time = new Date();
		}
		ntime = new Date(time.getTime()+1000);
		
		$('#app-time').data('time', ntime);
		$('#app-time').text(ntime.toString().substr(4,20));
		
		if(geoCount==0){
			geoToken = true;
			geoCount = 60;
		}else{
			geoCount--;
		}
		
		if(workTime){
			var work = (Date.now() - workTime)/1000;
			
			$('.workClock .s').text(sys.pad(parseInt(work % 60)));
			$('.workClock .m').text(sys.pad(parseInt(work / 60)));
			$('.workClock .h').text(sys.pad(parseInt(work / 3600)));
		}else{
			$('.workClock .h').text('00');
			$('.workClock .m').text('00');
			$('.workClock .s').text('00');
		}
		setTimeout(sys.startClock, 1000);
	},
	'clockToggle' : function(str){
		if(str=='out'){
			$('.popup-clock button.clock-in').removeClass('disabled');
			$('.popup-clock button.clock-out').addClass('disabled');
		}else if(str=='in'){
			$('.popup-clock button.clock-in').addClass('disabled');
			$('.popup-clock button.clock-out').removeClass('disabled');
		}
	}
}