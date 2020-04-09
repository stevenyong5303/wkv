var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var apps = new Framework7({
			  root: '#app',
			  id: 'com.wkv.manage',
			  name: 'WKV',
			  theme: 'md',
			  version: "1.0.251",
			  rtl: false,
			  language: "en-US"
		  });
var geoToken = true, geoCount = 60, APP_VERSION = 10251, tmpCalendar = '', fileObject, tapHold = 0, tapHoldStr = '';

var app = {
    initialize: function() {
        this.bindEvents();
    },
	
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function(){
        app.receivedEvent('deviceready');
		
		var notificationOpenedCallback = function(jsonData){
			if(!sys.isEmpty(jsonData['notification']['payload']['additionalData']['feedback'])){
				var act = jsonData['notification']['payload']['additionalData']['feedback'].substr(0,3),
					aid = jsonData['notification']['payload']['additionalData']['feedback'].substr(4);
					
				$(document).ready(function(){
					switch(act){
						case 'tsk':
						case 'evd':
							setTimeout(function reaction() {
								if($('#loading-overlay').css('opacity')=='0'){
									$('.tsk'+aid)[0].click();
								}else{
									setTimeout(reaction, 500);
								}
							}, 500);
							break;
							
						case 'lrq':
							setTimeout(function reaction() {
								if($('#loading-overlay').css('opacity')=='0'){
									$('#alrl-btn')[0].click();
								}else{
									setTimeout(reaction, 500);
								}
							}, 500);
							break;
							
						case 'lrs':
							setTimeout(function reaction() {
								if($('#loading-overlay').css('opacity')=='0'){
									$('#lvapv-btn')[0].click();
								}else{
									setTimeout(reaction, 500);
								}
							}, 500);
							break;
					}
				});
			}
		};

		window.plugins.OneSignal
		.startInit("1e0f19a6-8d77-404f-9006-c9d9f381fe59")
		.handleNotificationOpened(notificationOpenedCallback)
		.endInit();
		
		window.plugins.OneSignal.sendTags({
			'uid': STORAGE.getItem('usr'),
			'level': STORAGE.getItem('level')
		});
		
		window.open = cordova.InAppBrowser.open;
		document.addEventListener("backbutton", sys.onBackKeyDown, false);
    },
	
    receivedEvent: function(id){
        console.log('Received Event: ' + id);
    }
};

$(document).ready(function(){
	var usr = STORAGE.getItem('usr'),
		pwd = STORAGE.getItem('pwd');
	
	var DATA = '', post_data = '';
	
	var monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG' , 'SEP' , 'OCT', 'NOV', 'DEC'];
	var calendarInline = apps.calendar.create({
			containerEl: '#wkv-calendar',
			value:  [new Date()],
			weekHeader: true,
			renderToolbar: function () {
				return  '<div class="toolbar calendar-custom-toolbar no-shadow">' +
						'<div class="toolbar-inner">' +
						'<div class="left">' +
						'<a href="#" class="link icon-only"><i class="icon icon-back ' + (apps.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
						'</div>' +
						'<div class="center"></div>' +
						'<div class="right">' +
						'<a href="#" class="link icon-only"><i class="icon icon-forward ' + (apps.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
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
		}), dlCalendarInline = '';
	
	$('#lgn #lgn_sgn').on('click', function(){
		usr = $('#lgn input[name="lgn_usr"]').val();
		pwd = $('#lgn input[name="lgn_pwd"]').val();
		
		if(!sys.isEmpty(usr) && !sys.isEmpty(pwd)){
			DATA = {
				'usr' : usr,
				'pwd' : pwd,
				'version' : APP_VERSION
			};
			post_data = "ACT=" + encodeURIComponent('lgn_chk')
					  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
					
					if(inf['reply']==='200 OK'){
						STORAGE.setItem('usr', inf['uid']);
						STORAGE.setItem('pwd', inf['pwd']);
						STORAGE.setItem('level', inf['level']);
						STORAGE.setItem('reset', 'FALSE');
						
						location.reload();
					}else if(inf['reply']==='205 Reset Content'){
						STORAGE.setItem('usr', inf['uid']);
						STORAGE.setItem('pwd', inf['pwd']);
						STORAGE.setItem('level', inf['level']);
						STORAGE.setItem('reset', 'TRUE');
						
						location.reload();
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Invalid ID or password',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
						
						navigator.vibrate(100);
					}
				}
			});
		}else{
			var failed_toast = apps.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Error, field is empty',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}
	});
	
	$('#lgn_sgu').on('click', function(){
		apps.loginScreen.open('#sgu');
		apps.loginScreen.close('#lgn');
	});
	
	$('#sgu_bck').on('click', function(){
		apps.loginScreen.open('#lgn');
		apps.loginScreen.close('#sgu');
	});

	$('#lgn_fgp').on('click', function(){
		var tmp = Math.random().toString(36).substring(2, 15);
		$('#fgp_rdm').text(tmp.substring(0,8));
		$('#fgp_rdm').data('verify', tmp.substring(0,8));
		
		apps.loginScreen.open('#fgp');
		apps.loginScreen.close('#lgn');
	});
	
	$('#fgp_gnr').on('click', function(){
		sys.loading(1);
		
		setTimeout(function(){
			var tmp = Math.random().toString(36).substring(2, 15);
			$('#fgp_rdm').text(tmp.substring(0,8));
			$('#fgp_rdm').data('verify', tmp.substring(0,8));
			
			sys.loading(0);
		}, 1500);
	});
	
	$('#fgp_bck').on('click', function(){
		apps.loginScreen.open('#lgn');
		apps.loginScreen.close('#fgp');
	});
	
	$('#fgp_rpw').on('click', function(){
		var con = $('#fgp input[name="fgp_con"]').val(),
			ver = $('#fgp input[name="fgp_ver"]').val();
		
		if($('#fgp_rdm').data('verify') == ver){
			var pattern = new RegExp(/^[0-9]*$/);
			
			if((con.substr(0,2) == '01' && pattern.test(con)) && ((con.length == 10 && con.substr(2,1) != '1') || (con.length == 11 && con.substr(2,1) == '1'))){
				DATA = {
					'contact' : con
				};
				
				post_data = "ACT=" + encodeURIComponent('fgp_rpw')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						if(str==='200 OK'){
							sys.loading(0);
							var success_toast = apps.toast.create({
												   icon: '<i class="material-icons">speaker_phone</i>',
												   text: ('Password will be sms to +6' + con + ' in a minute'),
												   position: 'center',
												   closeTimeout: 20000
											   });
							success_toast.open();
							
							apps.loginScreen.open('#lgn');
							apps.loginScreen.close('#fgp');
							
							$('#fgp input[name="fgp_con"]').val('');
							$('#fgp input[name="fgp_ver"]').val('');
						}else if(str==='401 Unauthorized'){
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">screen_lock_portrait</i>',
												   text: 'Contact number is not registered',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}else{
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}
					}
				});
			}else{
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Invalid contact number',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
				
				navigator.vibrate(100);
			}
		}else{
			var failed_toast = apps.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Invalid verification code',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}
	});
	
	$('#rpw_sve').on('click', function(){
		var pw1 = $('#rpw input[name="rpw_pw1"]').val(),
			pw2 = $('#rpw input[name="rpw_pw2"]').val();
			
		if(!sys.isEmpty(pw1)){
			if(pw1 == pw2){
				DATA = {
					'usr' : $('#rpw input[name="rpw_pw1"]').data('uid'),
					'pwd' : pw1
				};
				
				post_data = "ACT=" + encodeURIComponent('rpw_udt')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						if(str==='200 OK'){
							STORAGE.setItem('usr', usr);
							STORAGE.setItem('pwd', pw1);
							STORAGE.removeItem('reset');
							
							location.reload();
						}else{
							sys.loading(0);
							
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
					}
				});
			}else{
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Password does not match.',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
				
				navigator.vibrate(100);
			}
		}else{
			var failed_toast = apps.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Password cannot be left empty.',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}
	});

	$('#sgu_rpw').on('click', function(){
		var con = $('#sgu input[name="sgu_con"]').val();
		
		if(!sys.isEmpty(con)){
			var pattern = new RegExp(/^[0-9]*$/);
			
			if((con.substr(0,2) == '01' && pattern.test(con)) && ((con.length == 10 && con.substr(2,1) != '1') || (con.length == 11 && con.substr(2,1) == '1'))){
				DATA = {
					'contact' : con
				};
				
				post_data = "ACT=" + encodeURIComponent('sgu_rpw')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						if(str==='200 OK'){
							var DATA = {
								'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
								'include_player_ids': ['d01c1bb0-5de1-4a4a-819f-66e3bacdd8ff'],
								'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
								'headings' : { 'en' : 'New dealer registered.'},
								'contents' : { 'en' : ('Contact number : +6' + con)},
								'data' : { 'sender' : con, 'system' : 'sgu_rpw' }
							};
									  
							$.ajax({
								type: 'POST',
								url: 'https://onesignal.com/api/v1/notifications',
								data: JSON.stringify(DATA),
								contentType: "application/json; charset=utf-8",
								dataType: "json",
								success: function(inf){
									if(!sys.isEmpty(inf['id'])){
										sys.loading(0);
										var success_toast = apps.toast.create({
															   icon: '<i class="material-icons">speaker_phone</i>',
															   text: ('Password will be sms to +6' + con + ' in a minute'),
															   position: 'center',
															   closeTimeout: 20000
														   });
										success_toast.open();
										
										apps.loginScreen.open('#lgn');
										apps.loginScreen.close('#sgu');
										$('#sgu input[name="sgu_con"]').val('');
									}else{
										sys.loading(0);
										var failed_toast = apps.toast.create({
															   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
															   text: 'Oooppss, error',
															   position: 'center',
															   closeTimeout: 2000
														   });
										failed_toast.open();
									}
								}
							});
						}else if(str==='401 Unauthorized'){
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">screen_lock_portrait</i>',
												   text: 'Contact number already registered',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}else{
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}
					}
				});
			}else{
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Invalid contact number',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
				
				navigator.vibrate(100);
			}
		}else{
			var failed_toast = apps.toast.create({
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
		if(sys.isEmpty(user)){
			user = STORAGE.getItem('usr');
		}
		
		if(!sys.isEmpty(user)){
			if(sys.isDealer()){
				sys.dateClick = function(tmp){
					if(!sys.isEmpty(tmp)){
						DATA = {
							'usr' : user,
							'date' : tmp.toDateString().substr(4)
						};
						
						if(!sys.isEmpty(STORAGE.getItem('comp'))){
							DATA = {
								'usr' : user,
								'comp' : STORAGE.getItem('comp'),
								'date' : tmp.toDateString().substr(4)
							};
						}
						
						post_data = "ACT=" + encodeURIComponent('cal_get_DL')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
								  
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								$('.popup-DLevent .event_list').data('date', tmp.toDateString().substr(4));
								
								if(str==='204 No Response'){
									$('.popup-DLevent .event_list').html('<p style="margin-left:10px;">No event found.</p>');
								}else{
									var x = '<thead><tr><th class="label-cell"></th>'
										  + '<th class="label-cell">&emsp;L/D&emsp;</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Venue&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Desc.&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
										  + '<th class="label-cell">&nbsp;Time&emsp;</th>'
										  + '<th class="label-cell">&emsp;Bride & Groom / Company&emsp;</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;Band Details&emsp;&emsp;&emsp;</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;Price&emsp;&emsp;</th></tr></thead><tbody>',
										inf = JSON.parse(str);
									
									for(var i=0; i<inf.length; i++){
										x += '<tr name="el'+(i+1)+'"><td class="label-cell"><span class="button button-fill" name="el'+(i+1)+'">'+(i+1)+'</span></td>';
										x += '<td class="tb-ld label-cell ' + (((sys.ldToShort(inf[i].luncheon_dinner)!='ST') && (sys.ldToShort(inf[i].luncheon_dinner)!='RH') && (sys.ldToShort(inf[i].luncheon_dinner)!='XX')) ? (inf[i].paid=='1' ? 'tb-paid' : 'tb-not-paid') : '') + '">'+(sys.ldToShort(inf[i].luncheon_dinner))+'</td>';
										x += '<td class="tb-venue label-cell" data-pid="' + inf[i].venue + '">'+((inf[i].venue==null) ? '-' : (inf[i].venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf[i].venue).loc_name : inf[i].venue))+'</td>';
										x += '<td class="tb-desc label-cell">'+((inf[i].description==null) ? '-' : sys.shorten(inf[i].description))+'</td>';
										x += '<td class="tb-time label-cell">'+((inf[i].time==null) ? '-' : inf[i].time)+'</td>';
										x += '<td class="tb-bng label-cell">'+((inf[i].bride_groom==null) ? '-' : inf[i].bride_groom)+'</td>';
										x += '<td class="tb-band label-cell">'+((inf[i].band==null) ? '-' : inf[i].band)+'</td>';
										x += '<td class="tb-price label-cell">'+((inf[i].price==0 || inf[i].price==null) ? '-' : ('RM ' + parseFloat(inf[i].price).toFixed(2)))+'</td>';
										x += '</tr>';
									}
									x += '</tbody>';
									
									$('.popup-DLevent .event_list').html(x);
									$('.popup-DLevent table.event_list').data('info', inf);
									
									for(var i=0; i<inf.length; i++){
										$('.popup-DLevent tr[name="el'+(i+1)+'"]').data('info', inf[i]);
									}
								}
								$('.popup-DLevent .event_date').text(tmp.toDateString().substr(4));
								
								sys.loading(0);
								apps.popup.open('.popup-DLevent');
								
								$('.popup-DLevent .event_list span.button').on('click', function(){
									var x = '';
									var trName = $(this).attr('name');
									var inf = $('.popup-DLevent tr[name="' + trName + '"]').data('info');
									
									$('.DLdetails-popover').data('date', (new Date(inf.date)).getTime());
										
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap"><input class="evtd_ld_DL" type="text" autocomplete="off" value="' + ((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap"><input class="evtd_venue_DL" type="text" autocomplete="off" value="' + ((inf.venue==null) ? '' : (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue)) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap"><input class="evtd_desc_DL" type="text" autocomplete="off" value="' + ((inf.description==null) ? '' : inf.description) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time</div><div class="item-input-wrap"><input class="evtd_sbtm_DL" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : inf.time) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Bride & Groom / Company</div><div class="item-input-wrap"><input class="evtd_bng_DL" type="text" autocomplete="off" value="' + ((inf.bride_groom==null) ? '' : inf.bride_groom) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap"><input class="evtd_band_DL" type="text" autocomplete="off" value="' + ((inf.band==null) ? '' : inf.band) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Price</div><div class="item-input-wrap"><input class="evtd_price_DL" type="text" autocomplete="off" value="' + ((inf.price==null) ? '' : inf.price) + '" disabled><label class="toggle toggle-init color-green evtd_paid_DL"><input type="checkbox"' + (inf.paid=='1' ? ' checked' : '') + ' disabled><span class="toggle-icon"></span></label></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row">';
									x += '<button class="evtd_cls_DL button col button-fill" data-eid="' + inf.primary_id + '">Close</button>';
									x += '<button class="evtd_sve_DL button col button-fill">Save</button>';
									x += '</div></div></div></li>';
											
									x = x.replace(/(?:\r\n|\r|\n)/g, '<br>');
									$('.DLdetails-popover ul').html(x);
									$('div.DLdetails-popover').data('info', inf);
											
									var evtdVenueAutocomplete = apps.autocomplete.create({
											openIn: 'dropdown',
											inputEl: '.evtd_venue_DL',
											limit: 5,
											source: function(query, render){
												var results = [], locs = $('body').data('loc');
												if(query.length === 0){
													render(results);
													return;
												}
												
												for(var i = 0; i < locs.length; i++){
													if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
												}
												
												render(results);
											},
											off: { blur }
										});
											
									$('.DLdetails-popover button.evtd_cls_DL').data('trName', trName);
									$('.DLdetails-popover button.evtd_cls_DL').on('click', function(){
										apps.popover.get('.DLdetails-popover').close();
									});
									
									$('.DLdetails-popover button.evtd_sve_DL').on('click', function(){
										var trName = $('.DLdetails-popover button.evtd_cls_DL').data('trName'),
											inf = $('div.DLdetails-popover').data('info'),
											pid = $('.DLdetails-popover button.evtd_cls_DL').data('eid'),
											ld = $('input.evtd_ld_DL').val(),
											time = $('input.evtd_sbtm_DL').val(),
											venue = sys.locToPid($('input.evtd_venue_DL').val()),
											desc = $('input.evtd_desc_DL').val(),
											band = $('input.evtd_band_DL').val(),
											bng = $('input.evtd_bng_DL').val();
											
										var DATA = {
											'usr' : STORAGE.getItem('usr'),
											'pid' : pid,
											'ld' : ld,
											'time' : time,
											'venue' : venue,
											'desc' : desc,
											'band' : band,
											'bng' : bng
										};
										
										var post_data = "ACT=" + encodeURIComponent('evd_udt_DL')
													  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
													  
										$.ajax({
											type: 'POST',
											url: 'https://app.wkventertainment.com/',
											data: post_data,
											beforeSend: function(){
												sys.loading(1);
											},
											success: function(str){
												if(str==='200 OK'){
													inf.luncheon_dinner = ((ld == '') ? 'Dinner' : ld);
													inf.time = ((time == '') ? null : time);
													inf.venue = ((venue == '') ? null : venue);
													inf.description = ((desc == '') ? null : desc);
													inf.band = ((band == '') ? null : band);
													inf.bng = ((bng == '') ? null : bng);
								
													$('tr[name="' + trName + '"]').data('info', inf);
													$('div.DLdetails-popover').data('info', inf);
								
													$('tr[name="' + trName + '"] td.tb-ld').text((sys.ldToShort(ld)));
													$('tr[name="' + trName + '"] td.tb-venue').text((venue == '' ? '-' : (venue.indexOf('#PID#') != -1 ? sys.pidToLoc(venue).loc_name : venue)));
													$('tr[name="' + trName + '"] td.tb-venue').data('pid', venue);
													$('tr[name="' + trName + '"] td.tb-desc').text((desc == '' ? '-' : desc));
													$('tr[name="' + trName + '"] td.tb-time').text((time == '' ? '-' : time));
													$('tr[name="' + trName + '"] td.tb-band').text((band == '' ? '-' : band));
													$('tr[name="' + trName + '"] td.tb-bng').text((bng == '' ? '-' : bng));
													
													sys.loading(0);
													
													var success_toast = apps.toast.create({
																		   icon: '<i class="material-icons">cloud_done</i>',
																		   text: 'Details Successfully Saved',
																		   position: 'center',
																		   closeTimeout: 2000
																	   });
													success_toast.open();
													
													navigator.vibrate(100);
													
													apps.popover.get('.DLdetails-popover').close();
												}else{
													sys.loading(0);
													
													var failed_toast = apps.toast.create({
																		   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																		   text: 'Oooppss, error',
																		   position: 'center',
																		   closeTimeout: 2000
																	   });
													failed_toast.open();
													
													navigator.vibrate(100);
												}
											}
										});
									});
									
									apps.popover.open('.DLdetails-popover');
								});
							}
						});
					}
				};
				
				$('#wkv-DLcalendar .calendar-month-current .calendar-day').on('click', function(){
					if($(this).hasClass('calendar-day-selected')){
						sys.dateClick(new Date(dlCalendarInline.getValue()[0]))
					}
				});
			}else{
				sys.dateClick = function(tmp){
					if(!sys.isEmpty(tmp)){
						DATA = {
							'usr' : user,
							'date' : tmp.toDateString().substr(4)
						};
						post_data = "ACT=" + encodeURIComponent('cal_get')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
								  
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								$('.popup-event .event_list').data('date', tmp.toDateString().substr(4));
								var hidden = (((tmp.getTime() - (new Date()).getTime()) > 86400000 ) ? ((parseInt($('body').data('user_level'))<7) ? true : false) : false);
								$('a.leave_app').removeClass('disabled');
								
								if(str==='204 No Response'){
									$('.popup-event .event_list').html('<p style="margin-left:10px;">No event found.</p>');
									
									if(((tmp.getTime() - (new Date()).getTime()) <= 0 )){
										$('a.leave_app').addClass('disabled');
									}
								}else{
									var x = '<thead><tr><th class="label-cell"></th>'
										  + '<th class="label-cell">&emsp;PIC&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
										  + '<th class="label-cell">L/D</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Venue&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Desc.&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
										  + '<th class="tablet-only">Band</th>'
										  + '<th class="label-cell">&emsp;&emsp;&emsp;Crew&emsp;&emsp;&emsp;</th>'
										  + '<th class="label-cell">&emsp;IN&emsp;&emsp;</th>'
										  + '<th class="label-cell">&emsp;OUT&emsp;&emsp;</th></tr></thead><tbody>',
										inf = JSON.parse(str);
									
									for(var i=0; i<inf.length; i++){
										x += '<tr name="el'+(i+1)+'"><td class="label-cell"><span class="button button-fill" name="el'+(i+1)+'">'+(i+1)+'</span></td>';
										x += '<td class="tb-pic label-cell'+(((parseInt($('body').data('user_level'))>=8) && ((sys.ldToShort(inf[i].luncheon_dinner)!='ST') && (sys.ldToShort(inf[i].luncheon_dinner)!='RH') && (sys.ldToShort(inf[i].luncheon_dinner)!='XX'))) ? (inf[i].paid=='1' ? ' tb-paid' : ' tb-not-paid') : '' ) + (((parseInt($('body').data('user_level'))>=8) && (!sys.isEmpty(inf[i].review))) ? ' tt" data-review="' + inf[i].review + '"' : '"') + '>'+inf[i].pic+'</td>';
										x += '<td class="tb-ld label-cell">'+(sys.ldToShort(inf[i].luncheon_dinner))+'</td>';
										x += '<td class="tb-venue label-cell" data-pid="' + inf[i].venue + '">'+((inf[i].venue==null) ? '-' : (inf[i].venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf[i].venue).loc_name : inf[i].venue))+'</td>';
										x += '<td class="tb-desc label-cell">'+((inf[i].description==null) ? '-' : sys.shorten(inf[i].description))+'</td>';
										x += '<td class="tb-band tablet-only">'+((inf[i].band==null) ? '-' : inf[i].band)+'</td>';
										x += '<td class="tb-crew label-cell">'+((hidden || inf[i].crew==null) ? '-' : sys.unameToSname(inf[i].crew))+'</td>';
										x += '<td class="tb-cin label-cell">'+((hidden || inf[i].car_in==null) ? '-' : sys.carToTcar(inf[i].car_in))+'</td>';
										x += '<td class="tb-cout label-cell">'+((hidden || inf[i].car_out==null) ? '-' : sys.carToTcar(inf[i].car_out))+'</td>';
										x += '</tr>';
									}
									x += '</tbody>';
									
									$('.popup-event .event_list').html(x);
									$('.popup-event table.event_list').data('info', inf);
									
									$('.popup-event .event_list .tt').each(function(){
										var rstr = parseInt(($(this).data('review')).substr(1,1)),
											rcmt = ($(this).data('review')).substr(4),
											rhtml = '<div><div>';
										
										for(var i=0; i<5; i++){
											if(rstr>i){
												rhtml += '<i class="icon material-icons md-only rstr_on">grade</i>';
											}else{
												rhtml += '<i class="icon material-icons md-only rstr_off">grade</i>';
											}
										}
										
										rhtml += '</div><p>' + rcmt + '</p></div>';
										
										apps.tooltip.create({
											targetEl: $(this),
											text: rhtml
										});
									});
									
									for(var i=0; i<inf.length; i++){
										$('.popup-event tr[name="el'+(i+1)+'"]').data('info', inf[i]);
									}
									
									if(((tmp.getTime() - (new Date()).getTime()) <= 0 ) || inf.length > 10){
										$('a.leave_app').addClass('disabled');
									}
								}
								$('.popup-event .event_date').text(tmp.toDateString().substr(4));
								
								if(parseInt($('body').data('user_level'))>=9){
									DATA = {
										'usr' : user,
										'date' : tmp.toDateString().substr(4)
									};
									post_data = "ACT=" + encodeURIComponent('evt_lvc')
											  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
											  
									$.ajax({
										type: 'POST',
										url: 'https://app.wkventertainment.com/',
										data: post_data,
										success: function(str){
											sys.loading(0);
											
											if(str==='204 No Response'){
												$('.details-popover').data('leave', '');
											}else{
												$('.details-popover').data('leave', str);
											}
											apps.popup.open('.popup-event');
										}
									});
								}else{
									sys.loading(0);
									apps.popup.open('.popup-event');
								}
								
								$('.popup-event .event_list span.button').on('click', function(){
									var x = '';
									var trName = $(this).attr('name');
									var inf = $('.popup-event tr[name="' + trName + '"]').data('info');
									
									
									DATA = {
										'usr' : user,
										'level' : $('body').data('user_level'),
										'pid' : inf.primary_id
									};
									post_data = "ACT=" + encodeURIComponent('evt_lck')
											  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
											  
									$.ajax({
										type: 'POST',
										url: 'https://app.wkventertainment.com/',
										data: post_data,
										beforeSend: function(){
											sys.loading(1);
										},
										success: function(str){
											sys.loading(0);
											
											var inf1 = JSON.parse(str);
											
											$('.details-popover').data('md5', md5(((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner)+((inf.time==null) ? '' : inf.time)+((inf.venue==null) ? '' : inf.venue)+((inf.description==null) ? '' : inf.description)+((inf.band==null) ? '' : inf.band)+((inf.crew==null) ? '' : inf.crew)+((inf.crew_st==null) ? '' : inf.crew_st)+((inf.crew_ob==null) ? '' : inf.crew_ob)+((inf.crew_xx==null) ? '' : inf.crew_xx)+((inf.car_in==null) ? '' : inf.car_in)+((inf.car_out==null) ? '' : inf.car_out)+((inf.remarks==null) ? '' : inf.remarks)));
											$('.details-popover').data('title', (inf.pic + ' on ' + (inf.date.substr(8,2)) + '/' + (inf.date.substr(5,2))));
											$('.details-popover').data('date', (new Date(inf.date)).getTime());
											
											if(parseInt($('body').data('user_level'))>=9 && inf1.lock==0){
												$('.details-popover').data('lock', 0);
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap"><input class="evtd_ld" type="text" autocomplete="off" value="' + ((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time&emsp;&emsp;&emsp;&emsp;<span class="evtd_sbta">&#9949;</span></div><div class="item-input-wrap"><input class="evtd_sbtm" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : (((inf.time).indexOf(', ') == -1) ? inf.time : (inf.time.split(', '))[0])) + '" data-val="' + ((inf.time==null) ? '' : inf.time) + '"><input class="evtd_sbtm1" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : (((inf.time).indexOf(', ') == -1) ? inf.time : (inf.time.split(', '))[1])) + '"><input class="evtd_sbtm2" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : (((inf.time).indexOf(', ') == -1) ? inf.time : (inf.time.split(', '))[2])) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap"><input class="evtd_venue" type="text" autocomplete="off" value="' + ((inf.venue==null) ? '' : (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue)) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap"><input class="evtd_desc" type="text" autocomplete="off" value="' + ((inf.description==null) ? '' : inf.description) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Remarks</div><div class="item-input-wrap"><input class="evtd_rmk" type="text" autocomplete="off" value="' + ((inf.remarks==null) ? '' : inf.remarks) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Price</div><div class="item-input-wrap"><input class="evtd_price" type="text" autocomplete="off" value="' + ((inf.price==null) ? '' : inf.price) + '"><label class="toggle toggle-init color-green evtd_paid"><input type="checkbox"' + (inf.paid=='1' ? ' checked' : '') + '><span class="toggle-icon"></span></label></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap"><input class="evtd_band" type="text" autocomplete="off" value="' + ((inf.band==null) ? '' : inf.band) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap"><input class="evtd_crew" type="text" autocomplete="off" data-uname="' + inf.crew + '" value="' + ((inf.crew==null) ? '' : sys.unameToSname(inf.crew)) + '" data-st="' + ((inf.crew_st==null) ? '' : inf.crew_st) + '" data-ob="' + ((inf.crew_ob==null) ? '' : inf.crew_ob) + '" data-xx="' + ((inf.crew_xx==null) ? '' : inf.crew_xx) + '" ></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap"><input class="evtd_cin" type="text" autocomplete="off" value="' + ((inf.car_in==null) ? '' : sys.carToTcar(inf.car_in, 'r')) + '" data-ori="' + ((inf.car_in==null) ? '' : inf.car_in) + '" data-val="' + ((inf.car_in==null) ? '' : sys.carToTcar(inf.car_in, 'r')) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap"><input class="evtd_cout" type="text" autocomplete="off" value="' + ((inf.car_out==null) ? '' : sys.carToTcar(inf.car_out, 'r')) + '" data-ori="' + ((inf.car_out==null) ? '' : inf.car_out) + '" data-val="' + ((inf.car_out==null) ? '' : sys.carToTcar(inf.car_out, 'r')) + '"></div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row">';
												x += '<button class="evtd_dlt button col button-fill" data-eid="' + inf.primary_id + '">Delete</button>';
												x += '<button class="evtd_cls button col button-fill" data-eid="' + inf.primary_id + '">Close</button>';
												x += '</div></div></div></li>';
											}else{
												$('.details-popover').data('lock', 1);
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap">' + ((inf.luncheon_dinner==null) ? '-' : inf.luncheon_dinner) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time</div><div class="item-input-wrap">' + ((inf.time==null) ? '-' : inf.time) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap">' + ((inf.venue==null) ? '-' : (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue)) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap">' + ((inf.description==null) ? '-' : inf.description) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Remarks</div><div class="item-input-wrap">' + ((inf.remarks==null) ? '-' : sys.commasToNextLine(inf.remarks, 'h')) + '</div></div></div></li>';
												if(parseInt($('body').data('user_level'))>=7){
													x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">price</div><div class="item-input-wrap">' + ((inf.price==null) ? '-' : inf.price) + '</div></div></div></li>';
												}
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap">' + ((inf.band==null) ? '-' : inf.band) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap">' + ((hidden || inf.crew==null) ? '-' : sys.unameToSname(inf.crew)) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap">' + ((hidden || inf.car_in==null) ? '-' : sys.carToTcar(inf.car_in, 'r')) + '</div></div></div></li>';
												x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap">' + ((hidden || inf.car_out==null) ? '-' : sys.carToTcar(inf.car_out, 'r')) + '</div></div></div></li>';
											}
											
											x = x.replace(/(?:\r\n|\r|\n)/g, '<br>');
											$('.details-popover ul').html(x);
											$('div.details-popover').data('info', inf);
											
											var evtdVenueAutocomplete = apps.autocomplete.create({
													openIn: 'dropdown',
													inputEl: '.evtd_venue',
													limit: 5,
													source: function(query, render){
														var results = [], locs = $('body').data('loc');
														if(query.length === 0){
															render(results);
															return;
														}
														
														for(var i = 0; i < locs.length; i++){
															if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
														}
														
														render(results);
													},
													off: { blur }
												});
											
											if(parseInt($('body').data('user_level'))>=9 && inf1.lock==0){
												$('.details-popover button.evtd_cls').data('trName', trName);
												$('.details-popover button.evtd_cls').on('click', function(){
													var pid = $(this).data('eid');
													
													var DATA = {
															'usr' : STORAGE.getItem('usr'),
															'pid' : pid
														};
													var post_data = "ACT=" + encodeURIComponent('evt_ulk')
																  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
																  
													$.ajax({
														type: 'POST',
														url: 'https://app.wkventertainment.com/',
														data: post_data,
														beforeSend: function(){
															sys.loading(1);
														},
														success: function(str){
															if(str==='200 OK'){
																sys.loading(0);
																apps.popover.get('.details-popover').close();
															}
														}
													});
												});
												
												$('.details-popover button.evtd_dlt').on('click', function(){
													var pid = $(this).data('eid');
													
													var DATA = {
															'usr' : STORAGE.getItem('usr'),
															'pid' : pid
														};
													var post_data = "ACT=" + encodeURIComponent('evd_dlt')
																  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
																  
													$.ajax({
														type: 'POST',
														url: 'https://app.wkventertainment.com/',
														data: post_data,
														beforeSend: function(){
															sys.loading(1);
														},
														success: function(str){
															sys.loading(0);
															
															if(str==='200 OK'){
																$('tr[name="' + trName + '"]').remove();
																$('.popover-backdrop')[0].click();
																$('.fab.evtd_shr').css('display', 'none');
																
																var success_toast = apps.toast.create({
																					   icon: '<i class="material-icons">delete</i>',
																					   text: 'Details Successfully Deleted',
																					   position: 'center',
																					   closeTimeout: 2000
																				   });
																success_toast.open();
															}else{
																var failed_toast = apps.toast.create({
																					   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																					   text: 'Oooppss, error',
																					   position: 'center',
																					   closeTimeout: 2000
																				   });
																failed_toast.open();
																
																navigator.vibrate(100);
															}
														}
													});
												});
												
												$('.details-popover').on('change', 'input.evtd_sbtm, input.evtd_sbtm1, input.evtd_sbtm2', function(){
													var ST = $('input.evtd_sbtm').val(),
														OB = $('input.evtd_sbtm1').val(),
														XX = $('input.evtd_sbtm2').val();
														
													$('input.evtd_sbtm').data('val', (ST + ', ' + OB + ', ' + XX));
												});
											}
											$('.fab.evtd_shr').css('display', 'block');
											apps.popover.open('.details-popover');
											
											$('span.evtd_sbta').on('click', function(){
												if($('.evtd_sbtm1').css('opacity')=='1'){
													$('.evtd_sbtm1').css('opacity', '0');
													$('.evtd_sbtm2').css('opacity', '0');
													
													setTimeout(function(){
														$('.evtd_sbtm1').css('display', 'none');
														$('.evtd_sbtm2').css('display', 'none');
													}, 1100);
												}else{
													$('.evtd_sbtm1').css('display', 'inline-block');
													$('.evtd_sbtm2').css('display', 'inline-block');
													
													setTimeout(function(){
														$('.evtd_sbtm1').css('opacity', '1');
														$('.evtd_sbtm2').css('opacity', '1');
													}, 100);
												}
											});
											
											if(parseInt($('body').data('user_level'))>=9 && inf1.lock!=0){
												var success_toast = apps.toast.create({
																	   icon: '<i class="material-icons">pan_tool</i>',
																	   text: (sys.unameToSname(inf1.lock) + ' is editing the details.'),
																	   position: 'center',
																	   closeTimeout: 2000
																   });
												success_toast.open();
											}
										}
									});
								});
							}
						});
					}
				};
				
				$('#wkv-calendar .calendar-month-current .calendar-day').on('click', function(){
					if($(this).hasClass('calendar-day-selected')){
						sys.dateClick(new Date(calendarInline.getValue()[0]))
					}
				});
			}
		}
	};
	
	$('.event_list').on('click', '.tb-venue', function(){
		var pid = $(this).data('pid');
		
		if(pid){
			if(pid.indexOf('#PID#') != -1){
				var loc = sys.pidToLoc(pid);
				
				apps.dialog.create({
					title: 'Navigate',
					text: 'Which are you heading to?',
					buttons: [{
							text: 'Main Lobby',
							cssClass: 'wazeBtn',
							onClick: function(){
								if(loc['point_lobby']){
									window.open('https://www.waze.com/ul?ll=' + loc['point_lobby'].split(', ')[0] + '%2C' + loc['point_lobby'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}else{
									window.open('https://www.waze.com/ul?ll=' + loc['loc_point'].split(', ')[0] + '%2C' + loc['loc_point'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}
							}
						},{
							text: 'Loading Bay',
							onClick: function(){
								if(loc['point_loading']){
									window.open('https://www.waze.com/ul?ll=' + loc['point_loading'].split(', ')[0] + '%2C' + loc['point_loading'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}else if(loc['point_lobby']){
									window.open('https://www.waze.com/ul?ll=' + loc['point_lobby'].split(', ')[0] + '%2C' + loc['point_lobby'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}else{
									window.open('https://www.waze.com/ul?ll=' + loc['loc_point'].split(', ')[0] + '%2C' + loc['loc_point'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}
							}
						}],
					closeByBackdropClick: true
				}).open();
			}
		}
	});
	
	$('#app').on('click', 'span.pic-call', function(){
		var contact = $(this).data('con');
		
		if(contact){
			apps.dialog.close();
			apps.dialog.create({
				title: 'Contact',
				text: contact,
				buttons: [{
						text: 'Call',
						cssClass: 'wazeBtn',
						onClick: function(){
							window.open(('tel:' + contact), '_system');
						}
					},{
						text: 'Whatsapp',
						onClick: function(){
							window.open(('https://wa.me/' + contact.substr(1)), '_system');
						}
					}],
				closeByBackdropClick: true
			}).open();
		}
	});
	
	$('#app').on('click', 'span.rmk-media', function(){
		var source = $(this).data('src');
		
		window.open(('https://app.wkventertainment.com/files/upload/' + source), '_system');
	});
	
	$('#task_tl').on('click', '.timeline-item-inner', function(){
		var pid = $(this).data('locpid'),
			rmk = sys.commasToNextLine($(this).data('rmk'));
		
		if(pid){
			var loc = sys.pidToLoc(pid);
			
			apps.dialog.create({
				text: (sys.isEmpty(rmk) ? (sys.isEmpty($(this).find('span').text()) ? 'No details found.' : ($(this).find('span').text() + (sys.isEmpty($(this).data('crew')) ? '' : ('<br/>' + sys.unameToSname($(this).data('crew'), '@'))))) : rmk),
				buttons: [{
						text: 'Main Lobby',
						cssClass: 'wazeBtn',
						onClick: function(){
							if(loc['point_lobby']){
								window.open('https://www.waze.com/ul?ll=' + loc['point_lobby'].split(', ')[0] + '%2C' + loc['point_lobby'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
							}else{
								window.open('https://www.waze.com/ul?ll=' + loc['loc_point'].split(', ')[0] + '%2C' + loc['loc_point'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
							}
						}
					},{
						text: 'Loading Bay',
						onClick: function(){
							if(loc['point_loading']){
								window.open('https://www.waze.com/ul?ll=' + loc['point_loading'].split(', ')[0] + '%2C' + loc['point_loading'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
							}else if(loc['point_lobby']){
								window.open('https://www.waze.com/ul?ll=' + loc['point_lobby'].split(', ')[0] + '%2C' + loc['point_lobby'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
							}else{
								window.open('https://www.waze.com/ul?ll=' + loc['loc_point'].split(', ')[0] + '%2C' + loc['loc_point'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
							}
						}
					}],
				closeByBackdropClick: true
			}).open();
		}else if(!sys.isEmpty(rmk)){
			apps.dialog.alert(rmk);
		}
	});
	
	$('a#btn-stlo').on('click', function(){
		apps.dialog.confirm('Confirm logout?', function (){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('log_out')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					if(str=='200 OK'){
						var logout_toast = apps.toast.create({
												icon: '<i class="material-icons">screen_lock_portrait</i>',
												text: 'Logged Out',
												position: 'center',
												closeTimeout: 1000
											});
						logout_toast.open();
						
						setTimeout(function(){
							STORAGE.removeItem('usr');
							STORAGE.removeItem('pwd');
							
							location.reload();
						}, 1000);
					}else{
						var failed_toast = apps.toast.create({
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
			var failed_toast = apps.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Error, field is empty',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}else if(newpwd != conpwd){
			var failed_toast = apps.toast.create({
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
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					
					if(str==='200 OK'){
						apps.popup.close('.popup-strp', true);
						
						var success_toast = apps.toast.create({
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
						var failed_toast = apps.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Invalid current password',
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
	
	$('div.popup-staa .block img, #update a.button').on('click', function(){
		if(sys.getMobileOS()=='Android'){
			window.open("market://details?id=com.wkv.manage", "_system");
		}else if(sys.getMobileOS()=='iOS'){
			window.open("itms-apps://itunes.apple.com/app/wkv/id1492921260", "_system");
		}else{
			window.open("https://app.wkventertainment.com/", "_system");
		}
	});
	
	$('body').on('touchstart', function(e){
		tapHold = setTimeout(sys.longTap, 2000);
		tapHoldStr = window.getSelection().toString();
	});
	
	$('body').on('touchmove touchend', function(e){
		if(tapHold){
			clearTimeout(tapHold);
		}
	});
	
	$('body').on('touchcancel', function(e){
		if(tapHoldStr != window.getSelection().toString()){
			if(tapHold){
				clearTimeout(tapHold);
			}
		}
	});
	
	$('#app_rld').on('click', function(){
		location.reload();
	});
	
	$('#npr_sve').on('click', function(){
		var usr = $('#npr input[name="npr_con"]').data('uid'),
			pw1 = $('#npr input[name="npr_pw1"]').val(),
			pw2 = $('#npr input[name="npr_pw2"]').val(),
			dnm = $('#npr input[name="npr_dnm"]').val(),
			cpn = $('#npr input[name="npr_cpn"]').val(),
			eml = $('#npr input[name="npr_eml"]').val(),
			add = $('#npr input[name="npr_add1"]').val() + ((sys.isEmpty($('#npr input[name="npr_add2"]').val())) ? '' : ('**' + $('#npr input[name="npr_add2"]').val())) + ((sys.isEmpty($('#npr input[name="npr_add3"]').val())) ? '' : ('**' + $('#npr input[name="npr_add3"]').val()));
		
		if(!sys.isEmpty(pw1)){
			if(pw1 == pw2){
				DATA = {
					'usr' : $('#npr input[name="npr_con"]').data('uid'),
					'pwd' : pw1,
					'dnm' : dnm,
					'cpn' : cpn,
					'eml' : eml,
					'add' : add
				};
				
				post_data = "ACT=" + encodeURIComponent('npr_udt')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						if(str==='200 OK'){
							STORAGE.setItem('usr', usr);
							STORAGE.setItem('pwd', pw1);
							
							location.reload();
						}else{
							sys.loading(0);
							
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
					}
				});
			}else{
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Password does not match.',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
				
				navigator.vibrate(100);
			}
		}else{
			var failed_toast = apps.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Password cannot be left empty.',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
			
			navigator.vibrate(100);
		}
	});
	
	if(sys.isDealer()){
		
		// codeDealer
		
		$('a#DLhome-btn').on('mousedown touchstart', function(){
			if($(this).hasClass('tab-link-active')){
				location.reload();
			}
		});
		
		$('a#DLschedule-btn').on('mousedown touchstart', function(){
			if($(this).hasClass('tab-link-active')){
				calendarInline.setYearMonth(((new Date).getYear()+1900), ((new Date).getMonth()), 500);
			}
		});
		
		$('#DLtask_tl').on('click', '.timeline-item-inner', function(){
			var pid = $(this).data('locpid'),
				rmk = sys.commasToNextLine($(this).data('rmk')),
				rvw = $(this).data('review'),
				rate = '';
				
			if(sys.isEmpty(rvw)){
				if(((new Date().getTime() - new Date($(this).data('datetime')).getTime()) > 0)){
					rate += '<br/>';
					rate += '<div class="card card-outline"><div class="card-content card-content-padding">';
					rate += '<p class="segmented segmented-raised rstar">';
					rate += '<button class="button rstar1 off" data-num="1"><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button rstar2 off" data-num="2"><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button rstar3 off" data-num="3"><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button rstar4 off" data-num="4"><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button rstar5 off" data-num="5"><i class="icon material-icons md-only">grade</i></button>';
					rate += '</p>';
					rate += '<div class="item-input-wrap">';
					rate += '<input class="rstar_rvw" type="text" placeholder="Your review for the service" style="width:100%;margin: 20px 0 10px;"/>';
					rate += '</div>';
					rate += '<button class="button button-fill rstar_sve" data-eid="' + $(this).data('eid') + '">Submit</button>';
					rate += '</div></div>';
				}
			}else{
				var star = rvw.substr(1,1),
					comment = rvw.substr(4);
				
				if(((new Date().getTime() - new Date($(this).data('datetime')).getTime()) > 0)){
					rate += '<br/>';
					rate += '<div class="card card-outline noselect"><div class="card-content card-content-padding">';
					rate += '<p class="segmented segmented-raised rstar">';
					rate += '<button class="button ' + ((star>0) ? 'on' : 'off') + '" disabled><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button ' + ((star>1) ? 'on' : 'off') + '" disabled><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button ' + ((star>2) ? 'on' : 'off') + '" disabled><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button ' + ((star>3) ? 'on' : 'off') + '" disabled><i class="icon material-icons md-only">grade</i></button>';
					rate += '<button class="button ' + ((star>4) ? 'on' : 'off') + '" disabled><i class="icon material-icons md-only">grade</i></button>';
					rate += '</p>';
					rate += '<div class="item-input-wrap">';
					rate += '<span style="width:100%;margin: 20px 0 10px;">' + comment + '</span>';
					rate += '</div>';
					rate += '</div></div>';
				}
			}
			
			if(pid){
				var loc = sys.pidToLoc(pid);
				
				apps.dialog.create({
					text: ((sys.isEmpty(rmk) ? (sys.isEmpty($(this).find('span').text()) ? 'No details found.' : ($(this).find('span').text() + (sys.isEmpty($(this).data('crew')) ? '' : ('<br/>' + sys.unameToSname($(this).data('crew'), '@'))))) : rmk) + rate),
					buttons: [{
							text: 'Main Lobby',
							cssClass: 'wazeBtn',
							onClick: function(){
								if(loc['point_lobby']){
									window.open('https://www.waze.com/ul?ll=' + loc['point_lobby'].split(', ')[0] + '%2C' + loc['point_lobby'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}else{
									window.open('https://www.waze.com/ul?ll=' + loc['loc_point'].split(', ')[0] + '%2C' + loc['loc_point'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}
							}
						},{
							text: 'Loading Bay',
							onClick: function(){
								if(loc['point_loading']){
									window.open('https://www.waze.com/ul?ll=' + loc['point_loading'].split(', ')[0] + '%2C' + loc['point_loading'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}else if(loc['point_lobby']){
									window.open('https://www.waze.com/ul?ll=' + loc['point_lobby'].split(', ')[0] + '%2C' + loc['point_lobby'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}else{
									window.open('https://www.waze.com/ul?ll=' + loc['loc_point'].split(', ')[0] + '%2C' + loc['loc_point'].split(', ')[1] + '&navigate=yes&zoom=16', '_system');
								}
							}
						}],
					closeByBackdropClick: true
				}).open();
			}else if(!sys.isEmpty(rmk)){
				apps.dialog.alert(rmk + rate);
			}
			
			if(sys.isDealer() && ((new Date().getTime() - new Date($(this).data('datetime')).getTime()) > 0)){
				$('#app').on('click', 'div.dialog p.rstar button', function(){
					var num = $(this).data('num');
					
					$('p.rstar button').removeClass('on');
					$('p.rstar button').addClass('off');
					
					for(var i=1; i<=num; i++){
						$('p.rstar button.rstar'+i).removeClass('off');
						$('p.rstar button.rstar'+i).addClass('on');
					}
				});
				
				$('#app').on('click', 'div.dialog button.rstar_sve', function(){
					if($('.rstar button.on').length>0){
						var review = '#' + $('.rstar button.on').length + '# ' + $('.rstar_rvw').val(),
							eid = $(this).data('eid');
						
						DATA = {
								'usr' : usr,
								'pid' : eid,
								'review' : review
							};
						post_data = "ACT=" + encodeURIComponent('rvw_sve')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								sys.loading(0);
							
								if(str==='200 OK'){
									$(('.tsk' + eid)).data('review', review);
									
									if($('div.dialog-buttons-1').length){
										$('div.dialog-buttons-1').find('.dialog-button.dialog-button-bold').click();
									}else{
										$('div.dialog-backdrop')[0].click();
									}
									
									var success_toast = apps.toast.create({
														   icon: '<i class="material-icons">loyalty</i>',
														   text: 'Thank you for the review. Please let us know what we can do for you in the future.',
														   position: 'center',
														   closeTimeout: 5000
													   });
									success_toast.open();
								}else{
									var failed_toast = apps.toast.create({
														   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
														   text: 'Oooppss, error',
														   position: 'center',
														   closeTimeout: 2000
													   });
									failed_toast.open();
									
									navigator.vibrate(100);
								}
							}
						});
					}else{
						var failed_toast = apps.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'No rating found',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
						
						navigator.vibrate(100);
					}
				});
			}
		});
		
		$('.evts_add_DL').on('click', function(){
			$('.popup-backdrop').css('display', 'none');
			$('.evt_ord_tab').css('display', 'block');
			
			$('.evt_ord_checkout').data('date', ($('.popup-DLevent .event_date').text()));
		});
		
		$('.evt_ord_DL a.fab-close').on('click', function(){
			$('.evts_cart_DL').data('item', []);
			$('.evt_ord_proceed').data('item', []);
			sys.updateCartPrice();
			
			$('.evt_ord_1').css('display', 'block');
			$('.evt_ord_2').css('display', 'none');
			$('.evt_ord_3').css('display', 'none');
			$('.evt_ord_4').css('display', 'none');
			$('.evt_ord_5').css('display', 'none');
			$('.evt_ord_6').css('display', 'none');
			$('.evt_ord_7').css('display', 'none');
			$('.evt_ord_8').css('display', 'none');
			$('.evt_ord_9').css('display', 'none');
			$('.evt_ord_10').css('display', 'none');
			$('.evt_ord_11').css('display', 'none');
			$('.evt_ord_12').css('display', 'none');
			$('.evt_ord_13').css('display', 'none');
			$('.evt_ord_14').css('display', 'none');
			$('.evt_ord_15').css('display', 'none');
			$('.popup-backdrop').css('display', 'block');
			$('.evt_ord_tab').css('display', 'none');
		});
		
		$('div.evt_ord_DL').on('change', 'input[name="evt-ord-item"]', function(){
			var temp = 0;
			
			switch($('input[name="evt-ord-item"]:checked').val()){
				case 'SD_hset':
				case 'SD_2t2m':
				case 'SD_4t2m':
				case 'SD_6t2m':
				case 'LT_ctst':
				case 'LT_f600':
				case 'LT_1_0k':
				case 'LT_1_5k':
				case 'LT_2_0k':
				case 'LT_2_5k':
				case 'LS_sidr':
				case 'LS_sfly':
				case 'LS_sodr':
				case 'PJ_pjol':
				case 'PJ_p6x6':
				case 'PJ_p8x8':
				case 'TV_tv43':
				case 'TV_tv55':
				case 'TV_tv65':
				case 'KR_krok':
				case 'SG_4f4f':
				case 'BL_bkln':
				case 'TS_gp12':
				case 'TS_gp16':
				case 'TS_gpfl':
				case 'TS_gpct':
				case 'BD_3f3f':
				case 'LF_1chd':
				case 'LF_1cfd':
				case 'LF_2chd':
				case 'LF_2cfd':
				case 'EF_efmc':
					$('.evt_ord_proceed').prop('disabled', false);
					$('.evt_ord_proceed').removeClass('disabled');
					$('.evt_ord_checkout').prop('disabled', true);
					$('.evt_ord_checkout').addClass('disabled');
					break;
				default:
					$('.evt_ord_proceed').prop('disabled', true);
					$('.evt_ord_proceed').addClass('disabled');
					break;
			}
			
			$('.evt_ord_proceed').data('item', [$('input[name="evt-ord-item"]:checked').val()]);
			sys.updateCartPrice();
		});
		
		$('button.evts_cart_DL').on('click', function(){
			var html = '<p>',
				cart = (sys.isEmpty($('.evts_cart_DL').data('item')) ? [] : $('.evts_cart_DL').data('item')),
				temp = $('.evt_ord_proceed').data('item'),
				num = 0, row = 0;
			
			for(var i=0; i < cart.length; i++){
				var cBtn = true;
				
				if(cart[i].substr(0,1)!='a'){
					num++;
					if((i+1)==cart.length && ($('.evt_ord_1').css('display') == 'none' && $('.evt_ord_4').css('display') == 'none')){
						cBtn = false;
					}
				}else{
					if(cart[i].substr(0,2)=='aS'){
						cBtn = false;
					}else if(cart[i].substr(0,2)=='aG'){
						cBtn = false;
					}
				}
				html += sys.orderCode(cart[i], num, ('c'+row), cBtn);
				row++;
			}
			
			if(!sys.isEmpty(temp)){
				row = 0;
				for(var i=0; i < temp.length; i++){
					if(temp[i].substr(0,1)!='a'){
						num++;
					}
					html += sys.orderCode(temp[i], num, ('t'+row), true);
					row++;
				}
			}
			html += '</p>';
			
			apps.dialog.alert('<div class="evt_dlg_cart">'+html+'</div>');
			
			$('div.evt_dlg_cart i.icon').on('click', function(){
				var code = $(this).data('code'),
					num = $(this).data('num'),
					row = $(this).data('row'),
					item = [];
				
				if($(this).data('main')){
					if(row.substr(0,1)=='c'){
						if(code == 'LS_sidr'){
							item = $('.evts_cart_DL').data('item');
							
							item[row.substr(1)] = null;
							
							for(var i = (parseInt(row.substr(1)) + 1); i < item.length; i++){
								if(!sys.isEmpty(item[i])){
									if(item[i].substr(0,2)=='aS'){
										item[i] = null;
									}else{
										break;
									}
								}
							}
							$('.evts_cart_DL').data('item', item);
							sys.updateCartPrice();
							
							$('div[item_count='+num+']').remove();
						}else if(code == 'LS_sfly'){
							item = $('.evts_cart_DL').data('item');
							
							item[row.substr(1)] = null;
							
							for(var i = (parseInt(row.substr(1)) + 1); i < item.length; i++){
								if(!sys.isEmpty(item[i])){
									if(item[i].substr(0,2)=='aS'){
										item[i] = null;
									}else{
										break;
									}
								}
							}
							$('.evts_cart_DL').data('item', item);
							sys.updateCartPrice();
							
							$('div[item_count='+num+']').remove();
						}else if(code == 'LS_sodr'){
							item = $('.evts_cart_DL').data('item');
							
							item[row.substr(1)] = null;
							
							for(var i = (parseInt(row.substr(1)) + 1); i < item.length; i++){
								if(!sys.isEmpty(item[i])){
									if(item[i].substr(0,2)=='aS'){
										item[i] = null;
									}else{
										break;
									}
								}
							}
							$('.evts_cart_DL').data('item', item);
							sys.updateCartPrice();
							
							$('div[item_count='+num+']').remove();
						}else if(code == 'SG_4f4f'){
							item = $('.evts_cart_DL').data('item');
							
							item[row.substr(1)] = null;
							
							for(var i = (parseInt(row.substr(1)) + 1); i < item.length; i++){
								if(!sys.isEmpty(item[i])){
									if(item[i].substr(0,2)=='aG'){
										item[i] = null;
									}else{
										break;
									}
								}
							}
							$('.evts_cart_DL').data('item', item);
							sys.updateCartPrice();
							
							$('div[item_count='+num+']').remove();
						}else if(code == 'BD_3f3f'){
							item = $('.evts_cart_DL').data('item');
							
							item[row.substr(1)] = null;
							
							for(var i = (parseInt(row.substr(1)) + 1); i < item.length; i++){
								if(!sys.isEmpty(item[i])){
									if(item[i].substr(0,2)=='aR'){
										item[i] = null;
									}else{
										break;
									}
								}
							}
							$('.evts_cart_DL').data('item', item);
							sys.updateCartPrice();
							
							$('div[item_count='+num+']').remove();
						}else{
							item = $('.evts_cart_DL').data('item');
							
							item[parseInt(row.substr(1))] = null;
							for(var i = (parseInt(row.substr(1)) + 1); i < item.length; i++){
								if(!sys.isEmpty(item[i])){
									if(item[i].substr(0,2)==('a'+code.substr(1,1))){
										item[i] = null;
									}else{
										break;
									}
								}
							}
							$('.evts_cart_DL').data('item', item);
							sys.updateCartPrice();
							
							$('div[item_count='+num+']').remove();
						}
					}else{
						$('input[value=' + code.substr(0, 7) + ']').prop('checked', false);
						item = $('.evt_ord_proceed').data('item');
						item[parseInt(row.substr(1))] = null;
						$('.evt_ord_proceed').data('item', item);
						sys.updateCartPrice();
						$('div[item_count='+num+']').remove();
						
						if(parseInt($('.evts_ord_price').text())==0){
							$('.evt_ord_checkout').prop('disabled', true);
							$('.evt_ord_checkout').addClass('disabled');
						}else{
							$('.evt_ord_checkout').prop('disabled', false);
							$('.evt_ord_checkout').removeClass('disabled');
						}
						$('.evt_ord_proceed').prop('disabled', true);
						$('.evt_ord_proceed').addClass('disabled');
					}
				}else{
					if(row.substr(0,1)=='c'){
						item = $('.evts_cart_DL').data('item');
						item[parseInt(row.substr(1))] = null;
						$('.evts_cart_DL').data('item', item);
						sys.updateCartPrice();
					}else{
						$('input[value=' + code.substr(0, 7) + ']').prop('checked', false);
						item = $('.evt_ord_proceed').data('item');
						item[parseInt(row.substr(1))] = null;
						$('.evt_ord_proceed').data('item', item);
						sys.updateCartPrice();
					}
					$(this).parents('div.row.no-gap').remove();
				}
				
				if(parseFloat($('.evts_ord_price').text())==0){
					$('button.evt_ord_checkout').addClass('disabled');
					$('button.evt_ord_checkout').prop('disabled', true);
				}
			});
			
			$('.evt_dlg_cart').parents('.dialog').attr('style', 'display: block; width: calc(100% - 30px) !important; margin-left: 15px !important; left: 0 !important; top: 15px !important; height: calc(100% - 142px);');
			$('.evt_dlg_cart').parents('.dialog-inner').attr('style', 'height: calc(100% - 99px); overflow: auto;');
		});
		
		$('#app').on('click', '.dialog-button-bold', function(){
			var cItem = $('.evts_cart_DL').data('item'),
				tItem = $('.evt_ord_proceed').data('item');
				
			$('.evts_cart_DL').data('item', sys.removeNull(cItem));
			$('.evt_ord_proceed').data('item', sys.removeNull(tItem));
		});
		
		$('.evt_ord_2 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_2 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_2 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="SD_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="SD_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="SD_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="SD_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_2').on('change', 'input[name="SD_adon"]', function(){
			var addOn = [];
			
			$('input[name="SD_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_3 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_3 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_3 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
						
						if($(this)[0].value){
							($('input[name="SG_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
							
						if(($('input[name="SG_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="SG_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_3').on('change', 'input[name="SG_adon"]', function(){
			var addOn = [];

			$('input[name="SG_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_5 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_5 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_5 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="LT_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="LT_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="LT_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="LT_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_5').on('change', 'input[name="LT_adon"]', function(){
			var addOn = [];
			
			$('input[name="LT_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_6 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_6 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_6 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="LS_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="LS_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="LS_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="LS_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_6').on('change', 'input[name="LS_adon"]', function(){
			var addOn = [];
			
			$('input[name="LS_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_7 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_7 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_7 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="PJ_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="PJ_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="PJ_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="PJ_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_7').on('change', 'input[name="PJ_adon"]', function(){
			var addOn = [];
			
			$('input[name="PJ_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_8 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_8 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_8 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="TV_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="TV_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="TV_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="TV_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_8').on('change', 'input[name="TV_adon"]', function(){
			var addOn = [];
			
			$('input[name="TV_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_9 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_9 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_9 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="KR_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="KR_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="KR_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="KR_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_9').on('change', 'input[name="KR_adon"]', function(){
			var addOn = [];
			
			$('input[name="KR_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_10 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_10 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_10 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="BL_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="BL_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="BL_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="BL_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_10').on('change', 'input[name="BL_adon"]', function(){
			var addOn = [];
			
			$('input[name="BL_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_11 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_11 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_11 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="TZ_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="TZ_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="TZ_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="TZ_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_11').on('change', 'input[name="TZ_adon"]', function(){
			var addOn = [];
			
			$('input[name="TZ_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_12 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_12 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_12 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="TS_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="TS_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="TS_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="TS_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_12').on('change', 'input[name="TS_adon"]', function(){
			var addOn = [];
			
			$('input[name="TS_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_13 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_13 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_13 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="BD_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="BD_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="BD_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="BD_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_13').on('change', 'input[name="BD_adon"]', function(){
			var addOn = [];
			
			$('input[name="BD_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_14 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_14 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_14 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="LF_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="LF_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="LF_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="LF_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_14').on('change', 'input[name="LF_adon"]', function(){
			var addOn = [];
			
			$('input[name="LF_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('.evt_ord_15 .stepper-button-minus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_15 .stepper-button-plus').on('click', function(e){
			e.preventDefault();
			e.stopPropagation();
		});
		
		$('.evt_ord_15 div.stepper-init').each(function(){
			apps.stepper.create({
				el: $(this),
				on: {
					change: function(){
						var addOn = [];
							
						if($(this)[0].value){
							($('input[name="EF_adon"][value="'+$(this)[0].inputEl.name+'"]')).prop('checked', true);
						}
						
						($('input[name="EF_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0]
							
						if(($('input[name="EF_adon"][value="'+$(this)[0].inputEl.name+'"]'))[0].checked){
							$('input[name="EF_adon"]:checked').each(function(){
								var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
								
								if(qty){
									addOn.push($(this).val()+qty);
								}
							});
							
							$('.evt_ord_proceed').data('item', addOn);
							
							sys.updateCartPrice();
						}
					}
				}
			})
		});
		
		$('div.evt_ord_15').on('change', 'input[name="EF_adon"]', function(){
			var addOn = [];
			
			$('input[name="EF_adon"]:checked').each(function(){
				var qty = $('div.item-title input[name="'+$(this).val()+'"]').val();
				
				if(qty){
					addOn.push($(this).val()+qty);
				}
			});
			
			$('.evt_ord_proceed').data('item', addOn);
			
			sys.updateCartPrice();
		});
		
		$('button.evt_ord_proceed').on('click', function(){
			var temp = $('.evt_ord_proceed').data('item'),
				cart = (sys.isEmpty($('.evts_cart_DL').data('item')) ? [] : $('.evts_cart_DL').data('item'));
			
			if($('.evt_ord_1').css('display') != 'none'){
				if(!sys.isEmpty(temp)){
					$('.evt_ord_0').css('z-index', '1');
					setTimeout(function(){
						$('.evt_ord_0').css('opacity', '1');
					}, 500);
					setTimeout(function(){
						for(var i=1; i<=4; i++){
							$('.evt_ord_'+i).css('display', 'none');
						}
						$('.evt_ord_'+sys.getAddOn(temp[0])).find('input[type="checkbox"]').each(function(){
							if($(this).prop('disabled')){
								$(this).prop("checked", true);
							}else{
								$(this).prop("checked", false);
							}
						});
						$('.evt_ord_'+sys.getAddOn(temp[0])).find('input[type="text"]').each(function(){
							if($(this).data('default')){
								apps.stepper.setValue($(this).parents('.stepper'), $(this).data('default'));
							}else{
								apps.stepper.setValue($(this).parents('.stepper'), 0);
							}
						});
						
						$('.evt_ord_'+sys.getAddOn(temp[0])).css('display', 'block');
						$('.evt_ord_0').css('opacity', '0');
						if(sys.getAddOn(temp[0])==6){
							$('.evt_ord_proceed').data('item', ["aS_ledw1", "aS_ledh1"]);
							apps.accordion.open($('.evt_ord_ldug'));
						}else if(sys.getAddOn(temp[0])==3){
							$('.evt_ord_proceed').data('item', ["aG_sslg4", "aG_sswh4", "aG_sshg2.0"]);
							apps.accordion.open($('.evt_ord_stug'));
						}else if(sys.getAddOn(temp[0])==13){
							$('.evt_ord_proceed').data('item', ["aR_bdlg3", "aR_bdhg3"]);
							apps.accordion.open($('.evt_ord_bdug'));
						}
						$('button.evt_ord_checkout').addClass('disabled');
						$('button.evt_ord_checkout').prop('disabled', true);
					}, 900);
					setTimeout(function(){
						$('.evt_ord_0').css('z-index', '-1');
					}, 1200);
					
					cart.push(temp[0]);
					$('.evts_cart_DL').data('item', cart)
					$('.evt_ord_proceed').removeData('item');
				}
			}else{
				if($('.evt_ord_4').css('display') != 'none'){
					$('.evt_ord_proceed').removeData('item');
					sys.updateCartPrice();
				}else if(!sys.isEmpty(temp)){
					$('.evts_cart_DL').data('item', cart.concat(temp));
					$('.evt_ord_proceed').removeData('item');
				}
				
				$('input[name="evt-ord-item"]').prop("checked", false);
				$('button.evt_ord_proceed').prop('disabled', true);
				$('button.evt_ord_proceed').addClass('disabled');
				
				$('.evt_ord_0').css('z-index', '1');
				setTimeout(function(){
					$('.evt_ord_0').css('opacity', '1');
				}, 500);
				setTimeout(function(){
					$('button.evt_ord_proceed').text('Next');
					for(var i=2; i<=4; i++){
						$('.evt_ord_'+i).css('display', 'none');
					}
					$('.evt_ord_1').css('display', 'block');
					$('.evt_ord_0').css('opacity', '0');
					
					$('button.evt_ord_checkout').removeClass('disabled');
					$('button.evt_ord_checkout').prop('disabled', false);
				}, 900);
				setTimeout(function(){
					$('.evt_ord_0').css('z-index', '-1');
				}, 1200);
			}
		});
		
		apps.autocomplete.create({
			openIn: 'dropdown',
			inputEl: '#evt_ord_co_vne',
			limit: 5,
			source: function(query, render){
				var results = [], locs = $('body').data('loc');
				if(query.length === 0){
					render(results);
					return;
				}
				
				for (var i = 0; i < locs.length; i++) {
					if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
				}
				
				render(results);
			},
			off: { blur }
		});
		
		$('#evt_ord_co_vne').on('change', function(){
			var loc = $(this).val(),
				lpid = sys.locToPid(loc),
				distance = 0,
				price = 0;
			
			if(lpid.indexOf('#PID#') != -1){
				distance = sys.getDistance(sys.pidToLoc(lpid).loc_point, sys.pidToLoc(lpid).loc_state);
				
				if(distance <= 75){
					$('.evt_ord_proceed').data('item', ['TS_trsp0']);
				}else if(distance <= 135){
					$('.evt_ord_proceed').data('item', ['TS_trsp100']);
				}else if(distance <= 200){
					$('.evt_ord_proceed').data('item', ['TS_trsp150']);
				}else if(distance <= 250){
					$('.evt_ord_proceed').data('item', ['TS_trsp200']);
				}else if(distance <= 300){
					$('.evt_ord_proceed').data('item', ['TS_trsp250']);
				}else if(distance <= 350){
					$('.evt_ord_proceed').data('item', ['TS_trsp300']);
				}else if(distance <= 400){
					$('.evt_ord_proceed').data('item', ['TS_trsp350']);
				}else if(distance <= 450){
					$('.evt_ord_proceed').data('item', ['TS_trsp400']);
				}else if(distance <= 500){
					$('.evt_ord_proceed').data('item', ['TS_trsp450']);
				}else{
					$('.evt_ord_proceed').data('item', ['TS_trsp500']);
				}
				
				sys.updateCartPrice();
			}else{
				$('.evt_ord_proceed').data('item', ['TS_nots1']);
				sys.updateCartPrice();
			}
			
			if(sys.isEmpty(loc) || !sys.isTime($('#evt_ord_co_tme').val())){
				$('button.evt_ord_checkout').prop('disabled', true);
				$('button.evt_ord_checkout').addClass('disabled');
			}else{
				$('button.evt_ord_checkout').prop('disabled', false);
				$('button.evt_ord_checkout').removeClass('disabled');
			}
		});
		
		$('#evt_ord_co_tme').on('change', function(){
			if(!sys.isTime($(this).val())){
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">access_time</i>',
									   text: 'Invalid time format',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
			}
			
			if(sys.isEmpty($('#evt_ord_co_vne').val()) || !sys.isTime($(this).val())){
				$('button.evt_ord_checkout').prop('disabled', true);
				$('button.evt_ord_checkout').addClass('disabled');
			}else{
				$('button.evt_ord_checkout').prop('disabled', false);
				$('button.evt_ord_checkout').removeClass('disabled');
			}
		});
		
		$('button.evt_ord_checkout').on('click', function(){
			if($('.evt_ord_4').css('display') != 'none'){
				var html = '';
					html += '<strong>Date</strong> : ' + $('#evt_ord_co_dte').val();
					html += '<br/><strong>L/D</strong> : ' + ($('#evt_ord_co_lod').val() == 'L' ? 'Lunch' : 'Dinner');
					html += '<br/><strong>Standby Time</strong> : ' + $('#evt_ord_co_tme').val();
					html += '<br/><strong>Venue</strong> : ' + $('#evt_ord_co_vne').val();
					html += '<br/><strong>Price : RM ' + $('.evts_ord_price').text() + '</strong>';
					
				apps.dialog.confirm((html), 'Confirmation', function(){
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'dte' : $('#evt_ord_co_dte').val(),
						'lod' : $('#evt_ord_co_lod').val(),
						'tme' : $('#evt_ord_co_tme').val(),
						'vne' : sys.locToPid($('#evt_ord_co_vne').val()),
						'vne_name' : $('#evt_ord_co_vne').val(),
						'bng' : $('#evt_ord_co_bng').val(),
						'bnd' : $('#evt_ord_co_bnd').val(),
						'aif' : $('#evt_ord_co_aif').val(),
						'equipment' : ($('.evts_cart_DL').data('item')).concat($('.evt_ord_proceed').data('item'))
					};
					var post_data = "ACT=" + encodeURIComponent('ord_smt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							if(str=='200 OK'){
								$('.evt_ord_4').css('display', 'none');
								$('.evt_ord_1').css('display', 'block');
								$('button.evt_ord_proceed').text('Next');
								$('.evt_ord_DL a.fab-close')[0].click();
								apps.popup.close('.popup-DLevent');
								
								$('a#DLschedule-btn').trigger('mousedown');
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">done_outline</i>',
													   text: 'Order submitted, we will contact you for further confirmation/clarification.',
													   position: 'center',
													   closeTimeout: 5000
												   });
								success_toast.open();
							}else{
								sys.loading(0);
								var failed_toast = apps.toast.create({
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
			}else{
				var temp = $('.evt_ord_proceed').data('item');
			
				if(!sys.isEmpty(temp)){
					$('.evts_cart_DL').data('item', cart.concat(temp));
					$('.evt_ord_proceed').removeData('item');
				}
				
				$('#evt_ord_co_vne').val('');
				$('.evt_ord_proceed').data('item', ['TS_nots1']);
				$('button.evt_ord_proceed').prop('disabled', false);
				$('button.evt_ord_proceed').removeClass('disabled');
				$('button.evt_ord_proceed').text('Back');
				
				$('#evt_ord_co_dte').val($('.evt_ord_checkout').data('date'));
				
				$('.evt_ord_0').css('z-index', '1');
				setTimeout(function(){
					$('.evt_ord_0').css('opacity', '1');
				}, 500);
				setTimeout(function(){
					$('.evt_ord_1').css('display', 'none');
					$('.evt_ord_4').css('display', 'block');
					$('.evt_ord_0').css('opacity', '0');
					
					$('button.evt_ord_checkout').addClass('disabled');
					$('button.evt_ord_checkout').prop('disabled', true);
				}, 900);
				setTimeout(function(){
					$('.evt_ord_0').css('z-index', '-1');
				}, 1200);
			}
		});
	}else{
		
		// codeCrew
		
		$('a#home-btn').on('mousedown touchstart', function(){
			if($(this).hasClass('tab-link-active')){
				location.reload();
			}
		});

		$('a#schedule-btn').on('mousedown touchstart', function(){
			if($(this).hasClass('tab-link-active')){
				calendarInline.setYearMonth(((new Date).getYear()+1900), ((new Date).getMonth()), 500);
			}
		});
		
		$('#rprt-btn').on('click', function(){
			var pic = [];
			$('#rprt_cal').html('');
			
			tmpCalendar = apps.calendar.create({
				containerEl: '#rprt_cal',
				value: [new Date()],
				weekHeader: true,
				rangePicker: true
			});
			
			var crews = $('body').data('crew');
			
			for(var i = 0, j=0; i < crews.length; i++){
				if(crews[i]['user_level'] == 0){
					pic[j] = crews[i]['nc_name'];
					j++;
				}
			}
			
			var autoSearch = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#rprt_pic',
				limit: 5,
				source: function(query, render){
					var results = [];
					
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < pic.length; i++){
						if (pic[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(pic[i]);
					}
					
					render(results);
				},
				off: { blur }
			});
		});
		
		$('.rprt_gen').on('click', function(){
			var from = sys.dateToString(tmpCalendar.getValue()[0], 'yyyy-mm-dd'),
				to = sys.dateToString(((tmpCalendar.getValue().length < 2) ? (tmpCalendar.getValue()[0]) : (tmpCalendar.getValue()[1])), 'yyyy-mm-dd');
			
			var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'from' : from,
					'to' : to
				};
			var post_data = "ACT=" + encodeURIComponent('rpt_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
				
					if(inf['reply']==='200 OK'){
						if(!sys.isEmpty($('#rprt_pic').val())){
							var match = false, x = '', total = 0, patternD = new RegExp(/\((.*?)\)/), patternP = new RegExp(/[0-9.]*/), pic = ($('#rprt_pic').val()).toLowerCase().replace(/\s/g, '');
							
							if($('input.rprt_mww')[0].checked){
								for(var i=0, j=0; i<inf['sales'].length; i++){
									if((inf['sales'][i].pic).toLowerCase().replace(/\s/g, '') == pic){
										if(sys.isEmpty(inf['sales'][i].price)){
											inf['sales'][i].price = 0;
										}
										
										var tprice = 0;
										
										if(patternD.test(inf['sales'][i].price)){
											var day = patternD.exec(inf['sales'][i].price)[1];
											var price = patternP.exec(inf['sales'][i].price)[0];
											
											tprice = (parseFloat(price) / parseFloat(day));
											total += tprice;
										}else{
											tprice = parseFloat(inf['sales'][i].price);
											total += tprice;
										}
										
										x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="col-10' + ((inf['sales'][i].price != 0) ? (inf['sales'][i].paid=='1' ? ' tb-paid pay-btn' : ' tb-not-paid pay-btn') : '') + '" data-pid="' + inf['sales'][i].primary_id + '">' + (j+1) + '</div><div class="tt col-20" data-rmk="' + inf['sales'][i].remarks + '">' + (inf['sales'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['sales'][i].venue).loc_name) ? inf['sales'][i].venue : (sys.pidToLoc(inf['sales'][i].venue).loc_name))  + '</div><div class="col-15">RM ' + tprice + '</div></div></div></li>';
										j++;
										match = true;
									}
								}
								x += '<li class="item-content"><div class="item-inner">Total sales: RM ' + total.toFixed(2) + '</div></li>';
							}else{
								for(var i=0, j=0; i<inf['sales'].length; i++){
									if(((inf['sales'][i].pic).toLowerCase().replace(/\s/g, '')).indexOf(pic) != -1){
										if(sys.isEmpty(inf['sales'][i].price)){
											inf['sales'][i].price = 0;
										}
										
										var tprice = 0;
										
										if(patternD.test(inf['sales'][i].price)){
											var day = patternD.exec(inf['sales'][i].price)[1];
											var price = patternP.exec(inf['sales'][i].price)[0];
											
											tprice = (parseFloat(price) / parseFloat(day));
											total += tprice;
										}else{
											tprice = parseFloat(inf['sales'][i].price);
											total += tprice;
										}
										
										x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="col-10' + ((inf['sales'][i].price != 0) ? (inf['sales'][i].paid=='1' ? ' tb-paid pay-btn' : ' tb-not-paid pay-btn') : '') + '" data-pid="' + inf['sales'][i].primary_id + '">' + (j+1) + '</div><div class="tt col-20" data-rmk="' + inf['sales'][i].remarks + '">' + (inf['sales'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['sales'][i].venue).loc_name) ? inf['sales'][i].venue : (sys.pidToLoc(inf['sales'][i].venue).loc_name))  + '</div><div class="col-15">RM ' + tprice + '</div></div></div></li>';
										j++;
										match = true;
									}
								}
								x += '<li class="item-content"><div class="item-inner">Total sales: RM ' + total.toFixed(2) + '</div></li>';
							}
							
							if(match){
								$('.rprt-result ul').html(x);
								
								$('.rprt-result ul .tt').each(function(){
									apps.tooltip.create({
										targetEl: $(this),
										text: sys.commasToNextLine($(this).data('rmk'), 'h')
									});
								});
							}else{
								$('.rprt-result ul').html('<li class="item-content"><div class="item-inner">No report found.</div></li>');
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'No report found.',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}else{
							var x = '', total = 0, patternD = new RegExp(/\((.*?)\)/), patternP = new RegExp(/[0-9.]*/);
						
							for(var i=0; i<inf['sales'].length; i++){
								if(!sys.isEmpty(inf['sales'][i].price)){
									if(patternD.test(inf['sales'][i].price)){
										var day = patternD.exec(inf['sales'][i].price)[1];
										var price = patternP.exec(inf['sales'][i].price)[0];
										total += (parseFloat(price) / parseFloat(day));
									}else{
										total += parseFloat(inf['sales'][i].price);
									}
								}
							}
							x += '<li class="item-content"><div class="item-inner">Total sales: RM ' + total.toFixed(2) + '</div></li>';
							$('.rprt-result ul').html(x);
						}
						sys.loading(0);
					}else if(inf['reply']==='204 No Response'){
						$('.rprt-result ul').html('<li class="item-content"><div class="item-inner">No report found.</div></li>');
						var failed_toast = apps.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'No report found.',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
						sys.loading(0);
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
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
		
		$('.rprt-result').on('click', 'div.pay-btn', function(){
			var pid = $(this).data('pid'),
				numBtn = $(this);
			
			if($(this).hasClass('tb-not-paid')){
				apps.dialog.confirm(('Set status to "Green"?'), 'Confirmation', function(){
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'pid' : pid,
						'paid' : 1
					};
					var post_data = "ACT=" + encodeURIComponent('pay_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);
							if(str=='200 OK'){
								numBtn.removeClass('tb-not-paid');
								numBtn.addClass('tb-paid');
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">local_atm</i>',
													   text: 'Status updated.',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
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
			}else{
				apps.dialog.confirm(('Set status to "Red"?'), 'Confirmation', function(){
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'pid' : pid,
						'paid' : 0
					};
					var post_data = "ACT=" + encodeURIComponent('pay_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);
							if(str=='200 OK'){
								numBtn.removeClass('tb-paid');
								numBtn.addClass('tb-not-paid');
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">local_atm</i>',
													   text: 'Status updated.',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
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
			}
		});
		
		$('#rwht-btn').on('click', function(){
			var work = [], work_id = [],
				crews = $('body').data('crew');
			$('#rwht_cal').html('');
			
			tmpCalendar = apps.calendar.create({
				containerEl: '#rwht_cal',
				value: [new Date()],
				weekHeader: true,
				rangePicker: true
			});
			
			for(var i = 0, j = 0; i < crews.length; i++){
				if(crews[i]['user_level'] > 0){
					work[j] = crews[i]['short_name'];
					j++;
				}
			}
			
			var autoSearch = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#rwht_crw',
				limit: 5,
				source: function(query, render){
					var results = [];
					
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < work.length; i++){
						if (work[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(work[i]);
					}
					
					render(results);
				},
				off: { blur }
			});
		});
		
		$('.rwht_gen').on('click', function(){
			var from = sys.dateToString(tmpCalendar.getValue()[0], 'yyyy-mm-dd'),
				to = sys.dateToString(((tmpCalendar.getValue().length < 2) ? (tmpCalendar.getValue()[0]) : (tmpCalendar.getValue()[1])), 'yyyy-mm-dd'),
				wcrew = sys.snameToUname($('#rwht_crw').val());
			
			if(!sys.isEmpty(wcrew)){
				var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'from' : from,
						'to' : to
					};
				var post_data = "ACT=" + encodeURIComponent('rwh_chk')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
							  
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						var inf = JSON.parse(str);
					
						if(inf['reply']==='200 OK'){
							var match = false, x = '', total = 0, cday = '', num = 0;
							
							for(var i = 0; i < inf['work'].length; i++){
								if(!sys.isEmpty(inf['work'][i].crew)){
									if(inf['work'][i].crew.indexOf(',') != -1){
										var many = inf['work'][i].crew.split(',');
										
										for(var j = 0; j < many.length; j++){
											if(many[j] == wcrew){
												x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="tt col-10" data-pid="' + inf['work'][i].primary_id + '">' + (num+1) + '</div><div class="col-20">' + (inf['work'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['work'][i].venue).loc_name) ? inf['work'][i].venue : (sys.pidToLoc(inf['work'][i].venue).loc_name)) + '</div><div class="col-15 tt noselect" data-rmk="' + (sys.isEmpty(inf['work'][i].remarks) ? inf['work'][i].description : inf['work'][i].remarks) + '"><i class="material-icons">info</i></div></div></div></li>';
												if(cday != ((inf['work'][i].date).substr(0,10))){
													total++;
												}
												num++;
												match = true;
												cday = (inf['work'][i].date).substr(0,10);
												break;
											}
										}
									}else{
										if(inf['work'][i].crew == wcrew){
											x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="tt col-10" data-pid="' + inf['work'][i].primary_id + '">' + (num+1) + '</div><div class="col-20">' + (inf['work'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['work'][i].venue).loc_name) ? inf['work'][i].venue : (sys.pidToLoc(inf['work'][i].venue).loc_name)) + '</div><div class="col-15 tt noselect" data-rmk="' + (sys.isEmpty(inf['work'][i].remarks) ? inf['work'][i].description : inf['work'][i].remarks) + '"><i class="material-icons">info</i></div></div></div></li>';
											if(cday != ((inf['work'][i].date).substr(0,10))){
												total++;
											}
											num++;
											match = true;
											cday = (inf['work'][i].date).substr(0,10);
										}
									}
								}
							}
							
							if(match){
								x += '<li class="item-content"><div class="item-inner">Total working days: ' + total + '</div></li>';
								$('.rwht-result ul').html(x);
								
								$('.rwht-result ul .tt').each(function(){
									apps.tooltip.create({
										targetEl: $(this),
										text: sys.commasToNextLine($(this).data('rmk'), 'h')
									});
								});
							}else{
								$('.rwht-result ul').html('<li class="item-content"><div class="item-inner">No history found.</div></li>');
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'No report found.',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
							
							sys.loading(0);
						}else if(inf['reply']==='204 No Response'){
							$('.rwht-result ul').html('<li class="item-content"><div class="item-inner">No history found.</div></li>');
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'No report found.',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							sys.loading(0);
						}else{
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
					}
				});
			}else{
				navigator.vibrate(100);
			}
		});
		
		$('#sfcl-btn').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr')
				};
			var post_data = "ACT=" + encodeURIComponent('sfc_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
				
					if(inf['reply']==='200 OK'){
						var selfc = inf['selfc'], x = '';
							
						for(var i=0; i<selfc.length; i++){
							x += '<li><a href="#" class="item-link item-content" data-pid="' + selfc[i].primary_id + '" data-text="' + selfc[i].pic + ' ('+(selfc[i].date).substr(0,10)+')"><div class="item-media">';
							x += '<i class="icon material-icons md-only" style="color:#' + ((selfc[i].status == '1') ? '080' : ((selfc[i].status == '0') ? 'A00' : 'EA0')) + ';">' + ((selfc[i].status == '1') ? 'call_received' : ((selfc[i].status == '0') ? 'call_made' : 'clear_all')) + '</i></div>';
							x += '<div class="item-inner"><div class="item-title">' + selfc[i].pic + '<div class="item-header">' + (sys.isEmpty(selfc[i].description) ? '-' : selfc[i].description) + '</div>';
							x += '</div><div class="item-after">' + (selfc[i].date).substr(5,5) + '</div></div></a></li>';
						}
						$('#selfc_list').html(x);
						sys.loading(0);
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
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
		
		$('#selfc_list').on('click', 'a.item-link', function(){
			var pid = $(this).data('pid'), link = $(this);
			
			apps.dialog.create({
				title: 'Status for',
				text: $(this).data('text'),
				buttons: [{
						text: 'Pending',
					},{
						text: 'Collected',
					},{
						text: 'Returned',
					},
				],
				verticalButtons: true,
				onClick: function(dialog, index){
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'pid' : pid,
						'status' : (index == 0 ? '' : (index-1))
					};
					var post_data = "ACT=" + encodeURIComponent('sfc_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);
							
							if(str=='200 OK'){
								if(index == 2){
									link.find('i.icon').css('color', '#080');
									link.find('i.icon').html('call_received');
								}else if(index == 1){
									link.find('i.icon').css('color', '#A00');
									link.find('i.icon').html('call_made');
								}else{
									link.find('i.icon').css('color', '#EA0');
									link.find('i.icon').html('clear_all');
								}
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">done_outline</i>',
													   text: 'Status updated.',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}
			}).open();
		});
		
		$('#sntf-btn').on('click', function(){
			var crews = $('body').data('crew'),
				x = '';
			
			for(var i = 0; i < crews.length; i++){
				if(!sys.isEmpty(crews[i]['player_id'])){
					
					x += '<li><label class="item-checkbox item-content"><input type="checkbox" name="sncw-checkbox" value="' + crews[i]['player_id'] + '"/>';
					x += '<i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title">' + crews[i]['short_name'] + '</div></div></label></li>';
				}
			}
			
			$('div.sntf-crw ul').html(x);
			
			var searchbar = apps.searchbar.create({
					el: '.popup-sntf .searchbar',
					searchContainer: '.popup-sntf .list.sntf-crw',
					searchIn: '.item-title'
				});
		});
		
		$('button.sntf_snd').on('click', function(){
			var receivers = [],
				message = $('#sntf_msg').val(),
				sender = $('#edpf_name').val(),
				title = $('#sntf_ttl').val();
			
			for(var i=0; i<$('input[name="sncw-checkbox"]:checked').length; i++){
				receivers.push($('input[name="sncw-checkbox"]:checked:eq('+i+')').val());
			}
			
			if(sys.isEmpty(sender)){
				sender = 'The Management';
			}
			if(!sys.isEmpty(receivers) && !sys.isEmpty(message)){
				var DATA = {
					'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
					'include_player_ids' : receivers,
					'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
					'headings' : { 'en': (sys.isEmpty(title) ? ('Notification from ' + sender) : title)},
					'contents' : { 'en': message},
					'data' : { 'sender': usr }
				};
						  
				$.ajax({
					type: 'POST',
					url: 'https://onesignal.com/api/v1/notifications',
					data: JSON.stringify(DATA),
					contentType: "application/json; charset=utf-8",
					dataType: "json",
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(inf){
						if(!sys.isEmpty(inf['id'])){
							$('#sntf_ttl').val('');
							$('#sntf_msg').val('');
							sys.loading(0);
							var success_toast = apps.toast.create({
													icon: '<i class="material-icons">send</i>',
													text: 'Notification sent',
													position: 'center',
													closeTimeout: 2000
												});
								success_toast.open();
						}else{
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
					}
				});
			}
		});
		
		$('#fgnr-btn').on('click', function(){
			var pic = [], crews = $('body').data('crew');
			
			for(var i = 0, j=0; i < crews.length; i++){
				if(crews[i]['user_level'] == 0){
					pic[j] = crews[i]['nc_name'];
					j++;
				}
			}
			
			var autoSearchPICQ = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#fgnr_q_pic',
				limit: 5,
				source: function(query, render){
					var results = [];
					
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < pic.length; i++){
						if (pic[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(pic[i]);
					}
					$('#fgnr_q_pic').data('result', results);
					render(results);
				},
				off: { blur }
			});
			
			var autoSearchVenueQ = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#fgnr_q_vne',
				limit: 5,
				source: function(query, render){
					var results = [], locs = $('body').data('loc');
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < locs.length; i++){
						if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
					}
					
					render(results);
				},
				off: { blur }
			});
			
			var autoSearchPICI = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#fgnr_i_pic',
				limit: 5,
				source: function(query, render){
					var results = [];
					
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < pic.length; i++){
						if (pic[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(pic[i]);
					}
					$('#fgnr_i_pic').data('result', results);
					render(results);
				},
				off: { blur }
			});
			
			var autoSearchVenueI = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#fgnr_i_vne',
				limit: 5,
				source: function(query, render){
					var results = [], locs = $('body').data('loc');
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < locs.length; i++){
						if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
					}
					
					render(results);
				},
				off: { blur }
			});
			
			var autoSearchPICR = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#fgnr_r_pic',
				limit: 5,
				source: function(query, render){
					var results = [];
					
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < pic.length; i++){
						if (pic[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(pic[i]);
					}
					$('#fgnr_r_pic').data('result', results);
					render(results);
				},
				off: { blur }
			});
			
			var autoSearchVenueR = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#fgnr_r_vne',
				limit: 5,
				source: function(query, render){
					var results = [], locs = $('body').data('loc');
					if(query.length === 0){
						render(results);
						return;
					}
					
					for(var i = 0; i < locs.length; i++){
						if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
					}
					
					render(results);
				},
				off: { blur }
			});
		});
		
		$('#fgnr_q_pic').on('change', function(){
			var result = $('#fgnr_q_pic').data('result');
			
			if(result.length > 0){
				for(var i = 0; i < result.length; i++){
					if($('#fgnr_q_pic').val() == result[i]){
						var crews = $('body').data('crew'), pic = '';
						
						for(var j = 0; j < crews.length; j++){
							if((crews[j]['nc_name'] == $('#fgnr_q_pic').val()) && (crews[j]['user_level'] == 0)){
								pic = crews[j];
							}
						}
						
						$('#fgnr_q_attn').val(pic['nc_name']);
						$('#fgnr_q_comp').val(pic['nc_pos1']);
						$('#fgnr_q_addr').val(pic['nc_pos2']);
						$('#fgnr_q_tel').val(pic['nc_contact']);
						$('#fgnr_q_eml').val(pic['nc_email']);
						$('#fgnr_q_ognz').val(pic['nc_name'] + (sys.isEmpty(pic['nc_pos1']) ? '' : (' (' + pic['nc_pos1'] + ')')));
					}
				}
			}
		});
		
		$('.popup-fgnr .fgnr_tplt.fgnr_q a').on('click', function(){
			if(!sys.isEmpty($(this).data('value'))){
				var tmp = $('#fgnr_q_eql').val(), val = $(this).data('value');
				$('#fgnr_q_eql').val((sys.isEmpty(tmp) ? '' : (tmp + '\n\n')) + val);
			}
		});
		
		$('#fgnr_q_gnr').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'emlSent' : $('#fgnr_q_seml')[0].checked,
					'sales' : $('span.ncf-name').data('value'),
					'tel' : $('span.ncf-tel').data('value'),
					'email' : $('span.ncf-email').data('value'),
					'picid' : $('#fgnr_q_pic').val(),
					'cattn' : $('#fgnr_q_attn').val(),
					'ccomp' : $('#fgnr_q_comp').val(),
					'caddr' : $('#fgnr_q_addr').val(),
					'ceml' : $('#fgnr_q_eml').val(),
					'ctel' : $('#fgnr_q_tel').val(),
					'cfax' : $('#fgnr_q_fax').val(),
					'cmbl' : $('#fgnr_q_mbl').val(),
					'ognz' : $('#fgnr_q_ognz').val(),
					'vne' : $('#fgnr_q_vne').val(),
					'dte' : $('#fgnr_q_dte').val(),
					'tme' : $('#fgnr_q_tme').val(),
					'eql' : $('#fgnr_q_eql').val()
				};
			var get_data = "ACT=" + encodeURIComponent('pdf_gen')
						 + "&TYPE=" + encodeURIComponent('Q')
						 + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			var url = 'https://app.wkventertainment.com/?' + (get_data + ("&MD5=" + encodeURIComponent(md5(sys.serialize(DATA))) + "&CS=" + encodeURIComponent(sys.checksum(md5(sys.serialize(DATA))))));
			
			window.open(url, "_system");
		});
		
		$('#fgnr_i_src').on('click', function(){
			var ref = $('#fgnr_i_ref').val();
			
			if(!sys.isEmpty(ref)){
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'ref' : ref
				};
				
				var post_data = "ACT=" + encodeURIComponent('qrf_chk')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
							  
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						var inf = JSON.parse(str);
					
						if(inf['reply']==='200 OK'){
							$('#fgnr_i_pic').val(inf['doc']['picid']);
							$('#fgnr_i_attn').val(inf['doc']['cattn']);
							$('#fgnr_i_comp').val(inf['doc']['ccomp']);
							$('#fgnr_i_addr').val(inf['doc']['caddr']);
							$('#fgnr_i_eml').val(inf['doc']['ceml']);
							$('#fgnr_i_tel').val(inf['doc']['ctel']);
							$('#fgnr_i_fax').val(inf['doc']['cfax']);
							$('#fgnr_i_mbl').val(inf['doc']['cmbl']);
							$('#fgnr_i_ognz').val(inf['doc']['ognz']);
							$('#fgnr_i_vne').val(inf['doc']['vne']);
							$('#fgnr_i_dte').val(inf['doc']['dte']);
							$('#fgnr_i_tme').val(inf['doc']['tme']);
							$('#fgnr_i_eql').val(inf['doc']['eql']);
							
							sys.loading(0);
						}else if(inf['reply']==='204 No Response'){
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Reference number not found.',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}else{
							sys.loading(0);
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
					}
				});
			}
		});
		
		$('#fgnr_i_pic').on('change', function(){
			var result = $('#fgnr_i_pic').data('result');
			
			if(result.length > 0){
				for(var i = 0; i < result.length; i++){
					if($('#fgnr_i_pic').val() == result[i]){
						var crews = $('body').data('crew'), pic = '';
						
						for(var j = 0; j < crews.length; j++){
							if((crews[j]['nc_name'] == $('#fgnr_i_pic').val()) && (crews[j]['user_level'] == 0)){
								pic = crews[j];
							}
						}
						
						$('#fgnr_i_attn').val(pic['nc_name']);
						$('#fgnr_i_comp').val(pic['nc_pos1']);
						$('#fgnr_i_addr').val(pic['nc_pos2']);
						$('#fgnr_i_tel').val(pic['nc_contact']);
						$('#fgnr_i_eml').val(pic['nc_email']);
						$('#fgnr_i_ognz').val(pic['nc_name'] + (sys.isEmpty(pic['nc_pos1']) ? '' : (' (' + pic['nc_pos1'] + ')')));
					}
				}
			}
		});
		
		$('.popup-fgnr .fgnr_tplt.fgnr_i a').on('click', function(){
			if(!sys.isEmpty($(this).data('value'))){
				var tmp = $('#fgnr_i_eql').val(), val = $(this).data('value');
				$('#fgnr_i_eql').val((sys.isEmpty(tmp) ? '' : (tmp + '\n\n')) + val);
			}
		});
		
		$('#fgnr_i_gnr').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'ref' : $('#fgnr_i_ref').val(),
					'emlSent' : $('#fgnr_i_seml')[0].checked,
					'sales' : $('span.ncf-name').data('value'),
					'tel' : $('span.ncf-tel').data('value'),
					'email' : $('span.ncf-email').data('value'),
					'picid' : $('#fgnr_i_pic').val(),
					'cattn' : $('#fgnr_i_attn').val(),
					'ccomp' : $('#fgnr_i_comp').val(),
					'caddr' : $('#fgnr_i_addr').val(),
					'ceml' : $('#fgnr_i_eml').val(),
					'ctel' : $('#fgnr_i_tel').val(),
					'cfax' : $('#fgnr_i_fax').val(),
					'cmbl' : $('#fgnr_i_mbl').val(),
					'ognz' : $('#fgnr_i_ognz').val(),
					'vne' : $('#fgnr_i_vne').val(),
					'dte' : $('#fgnr_i_dte').val(),
					'tme' : $('#fgnr_i_tme').val(),
					'eql' : $('#fgnr_i_eql').val()
				};
			var get_data = "ACT=" + encodeURIComponent('pdf_gen')
						 + "&TYPE=" + encodeURIComponent('I')
						 + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			var url = 'https://app.wkventertainment.com/?' + (get_data + ("&MD5=" + encodeURIComponent(md5(sys.serialize(DATA))) + "&CS=" + encodeURIComponent(sys.checksum(md5(sys.serialize(DATA))))));
			
			window.open(url, "_system");
		});
		
		$('#fgnr_r_pic').on('change', function(){
			var result = $('#fgnr_r_pic').data('result');
			
			if(result.length > 0){
				for(var i = 0; i < result.length; i++){
					if($('#fgnr_r_pic').val() == result[i]){
						var crews = $('body').data('crew'), pic = '';
						
						for(var j = 0; j < crews.length; j++){
							if((crews[j]['nc_name'] == $('#fgnr_r_pic').val()) && (crews[j]['user_level'] == 0)){
								pic = crews[j];
							}
						}
						
						$('#fgnr_r_attn').val(pic['nc_name']);
						$('#fgnr_r_comp').val(pic['nc_pos1']);
						$('#fgnr_r_addr').val(pic['nc_pos2']);
						$('#fgnr_r_tel').val(pic['nc_contact']);
						$('#fgnr_r_eml').val(pic['nc_email']);
						$('#fgnr_r_ognz').val(pic['nc_name'] + (sys.isEmpty(pic['nc_pos1']) ? '' : (' (' + pic['nc_pos1'] + ')')));
					}
				}
			}
		});
		
		$('.popup-fgnr .fgnr_tplt.fgnr_r a').on('click', function(){
			if(!sys.isEmpty($(this).data('value'))){
				var tmp = $('#fgnr_r_eql').val(), val = $(this).data('value');
				$('#fgnr_r_eql').val((sys.isEmpty(tmp) ? '' : (tmp + '\n\n')) + val);
			}
		});
		
		$('#gpst-btn').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr')
				};
			var post_data = "ACT=" + encodeURIComponent('gps_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
				
					if(inf['reply']==='200 OK'){
						var gps = inf['gps'], x = '';
							
						for(var i=0; i<gps.length; i++){
							var tdiff = ((new Date().getTime() + ((new Date().getTimezoneOffset() + 480) * 60000)) - new Date(gps[i].login_date).getTime())/60000;
							var tcolor = (sys.isEmpty(gps[i].login_location) ? '#800' : ((tdiff < 5) ? '#080' : ((tdiff < 10) ? '#190' : ((tdiff < 15) ? '#390' : ((tdiff < 20) ? '#5A0' : ((tdiff < 25) ? '#7A0' : ((tdiff < 30) ? '#9B0' : ((tdiff < 35) ? '#AB0' : ((tdiff < 40) ? '#CC0' : ((tdiff < 45) ? '#BA0' : ((tdiff < 50) ? '#B90' : ((tdiff < 55) ? '#A70' : ((tdiff < 60) ? '#A50' : ((tdiff < 65) ? '#930' : '#A00'))))))))))))));
							
							x += '<li><a href="#" class="item-link item-content" data-usr="' + gps[i].user_id + '" data-loc="' + gps[i].login_location + '" data-time="' + gps[i].login_date + '">';
							x += '<div class="item-media"><i class="icon material-icons md-only" style="color:' + tcolor + '">' + (sys.isEmpty(gps[i].login_location) ? 'gps_off' : ((tdiff < 60) ? 'signal_cellular_4_bar' : 'signal_cellular_connected_no_internet_4_bar')) + '</i></div>';
							x += '<div class="item-inner"><div class="item-title">' + gps[i].nc_name + ((!sys.isEmpty(gps[i].login_location) && tdiff<100) ? ('<div class="item-footer">Active ' + parseInt(tdiff) + ' minutes ago</div>') : '') + '</div></div></a></li>';
						}
						$('#gpst_list').html(x);
						sys.loading(0);
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
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
		
		$('#gpst_list').on('click', 'a.item-link', function(){
			var loc = $(this).data('loc');
			
			if(!sys.isEmpty(loc) && (loc != '0,0')){
				var lat = loc.split(',')[0], lon = loc.split(',')[1];
				
				apps.dialog.alert('<iframe src="https://embed.waze.com/iframe?zoom=15&lat=' + lat + '&lon=' + lon + '&pin=1" width="100%" height="300px"></iframe>', '');
			}else{
				apps.dialog.alert('No location found.', '');
			}
		});
		
		$('.details-popover').on('click', 'input.evtd_rmk', function(){
			var x = '';
			
			if(!sys.isEmpty($(this).val())){
				x = sys.commasToNextLine($(this).val(), 'n');
			}else{
				x = (sys.isEmpty($('.evtd_desc').val()) ? '2 Top 2 Mon\n' : ($('.evtd_desc').val()) + '\n');
				x += 'Venue : ' + $('.evtd_venue').val() + '\n';
				x += 'PIC : `' + $('.details-popover .list li:eq(0) .item-input-wrap').text() + '`\n\n';
				x += (sys.isEmpty($('.evtd_band').val()) ? '' : ('Band : ' + $('.evtd_band').val() + '\n'));
				x += 'Depart : \n';
				x += 'Standby : ' + $('.evtd_sbtm').val();
				
				var car = (($('.evtd_cin').val().indexOf(',') != -1) ? $('.evtd_cin').val().split(', ') : [$('.evtd_cin').val()]);
				var crew = (($('.evtd_crew').val().indexOf(',') != -1) ? $('.evtd_crew').val().split(', ') : [$('.evtd_crew').val()]);
				
				if(!sys.isEmpty(car)){
					x += '\n\n';
					
					for(var i=0; i<car.length; i++){
						x += car[i]  + ' : \n';
					}
				}
				if(!sys.isEmpty(crew)){
					x += '\n\n';
					
					for(var i=0; i<crew.length; i++){
						x += '@' + crew[i] + (((i+1) == crew.length) ? '' : ' ');
					}
				}
				
				$(this).val(sys.commasToNextLine(x, 'r'));
			}
			
			$('.panel-evt-rmk textarea').val(x);
			
			$('.panel-evt-car').hide();
			$('.panel-evt-crew').hide();
			$('.panel-evt-rmk').show();
			
			apps.panel.open('left', true);
			
			$('.panel-evt-rmk textarea').focus();
		});
		
		$('#rmk_amd').on('click', function(){
			$('#amd_fle').trigger('click');
		});
		
		$('#amd_fle').on('change', function(){
			$.ajax({
				url: 'https://app.wkventertainment.com/',
				type: 'POST',
				data:  new FormData($('#amd_frm')[0]),
				contentType: false,
				cache: false,
				processData:false,
				beforeSend : function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
				
					if(inf['reply']==='200 OK'){
						var x = ($('.panel-evt-rmk textarea').val() + '\n*[' + inf['type'] + ']^' + inf['path'] + '*');
						
						$('.panel-evt-rmk textarea').val(x);
						$('.details-popover input.evtd_rmk').val(sys.commasToNextLine(x, 'r'));
						sys.loading(0);
					}else if(inf['reply']==='400 Bad Request'){
						sys.loading(0);
						var failed_toast = apps.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'Invalid file.',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
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
		
		$('.panel-evt-rmk textarea').on('paste keyup', function(){
			var x = sys.commasToNextLine($(this).val(), 'r');
			
			$('.details-popover input.evtd_rmk').val(x);
		});
		
		$('.details-popover').on('click', 'input.evtd_crew', function(){
			$('.evt-crew-edit').removeClass('evt-crew-edit');
			
			var crews = $('body').data('crew'),
				work = (sys.isEmpty($('input.evtd_crew').data('uname')) ? [] : ($('input.evtd_crew').data('uname').indexOf(',') != -1 ? $('input.evtd_crew').data('uname').split(',') : [$('input.evtd_crew').data('uname')])),
				leave = (sys.isEmpty($('.details-popover').data('leave')) ? [] : ($('.details-popover').data('leave').indexOf(',') != -1 ? $('.details-popover').data('leave').split(',') : [$('.details-popover').data('leave')])),
				ST = (sys.isEmpty($('input.evtd_crew').data('st')) ? [] : ($('input.evtd_crew').data('st').indexOf(',') != -1 ? $('input.evtd_crew').data('st').split(',') : [$('input.evtd_crew').data('st')])),
				OB = (sys.isEmpty($('input.evtd_crew').data('ob')) ? [] : ($('input.evtd_crew').data('ob').indexOf(',') != -1 ? $('input.evtd_crew').data('ob').split(',') : [$('input.evtd_crew').data('ob')])),
				XX = (sys.isEmpty($('input.evtd_crew').data('xx')) ? [] : ($('input.evtd_crew').data('xx').indexOf(',') != -1 ? $('input.evtd_crew').data('xx').split(',') : [$('input.evtd_crew').data('xx')])),
				x = '';
			
			for(var i = 0; i < crews.length; i++){
				if(crews[i]['user_level'] > 0){
					var select = false;
					for(var j = 0; j < work.length; j++){
						if(crews[i]['user_id'] == work[j]){
							select = true;
							break;
						}
					}
					var leaveApproved = false;
					for(var k = 0; k < leave.length; k++){
						if(crews[i]['user_id'] == leave[k]){
							leaveApproved = true;
							break;
						}
					}
					x += '<li><div class="row"><div style="width:calc( 100% - 90px );"><label class="item-checkbox item-content"><input type="checkbox" ' + (select ? 'checked="checked"' : '') + ' name="evcw-checkbox" value="' + crews[i]['user_id'] + '" data-sn="' + crews[i]['short_name'] + '" />';
					x += '<i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title' + (leaveApproved ? ' colorRed' : '') + '">' + crews[i]['short_name'] + '</div></div></label></div><div class="crw_tme_a" style="width:90px;">';
					x += '<label class="checkbox evt_setup"><input type="checkbox" name="' + crews[i]['user_id'] + '" value="ST" ' + (((ST.indexOf(crews[i]['user_id'])) != -1) ? 'checked="checked"' : '') + '><i class="icon-checkbox"></i></label>';
					x += '<label class="checkbox evt_onboard"><input type="checkbox" name="' + crews[i]['user_id'] + '" value="OB" ' + (((OB.indexOf(crews[i]['user_id'])) != -1) ? 'checked="checked"' : '') + '><i class="icon-checkbox"></i></label>';
					x += '<label class="checkbox evt_dismantle"><input type="checkbox" name="' + crews[i]['user_id'] + '" value="XX" ' + (((XX.indexOf(crews[i]['user_id'])) != -1) ? 'checked="checked"' : '') + '><i class="icon-checkbox"></i></label></div></div></li>';
				}
			}
			$('.evt-crew ul').html(x);
			
			$('label.evt_setup i.icon-checkbox').text('ST');
			$('label.evt_onboard i.icon-checkbox').text('0B');
			$('label.evt_dismantle i.icon-checkbox').text('XX');
			$('.panel-evt-rmk').hide();
			$('.panel-evt-car').hide();
			$('.panel-evt-crew').show();
			$(this).addClass('evt-crew-edit');
			apps.panel.open('left', true);
			
			var searchbar = apps.searchbar.create({
					el: '.panel-evt-crew .searchbar',
					searchContainer: '.panel-evt-crew .list.evt-crew',
					searchIn: '.item-title'
				});
				
			$('.panel-evt-crew .searchbar input').focus();
		});
		
		$('#app').on('click', 'span.evt-crew-ta', function(){
			if($('div.crw_tme_a').css('opacity')=='1'){
				$('div.crw_tme_a').css('opacity', '0');
				
				setTimeout(function(){
					$('div.crw_tme_a').css('display', 'none');
				}, 1100);
			}else{
				$('div.crw_tme_a').css('display', 'block');
				
				setTimeout(function(){
					$('div.crw_tme_a').css('opacity', '1');
				}, 100);
			}
		});
		
		$('input#tskld_crew').on('click', function(){
			$('.evt-crew-edit').removeClass('evt-crew-edit');
			
			var crews = $('body').data('crew'),
				work = (sys.isEmpty($('input#tskld_crew').data('uname')) ? [] : ($('input#tskld_crew').data('uname').indexOf(',') != -1 ? $('input#tskld_crew').data('uname').split(',') : [$('input#tskld_crew').data('uname')])),
				x = '';
			
			for(var i = 0; i < crews.length; i++){
				if(crews[i]['user_level'] > 0){
					var select = false;
					for(var j = 0; j < work.length; j++){
						if(crews[i]['user_id'] == work[j]){
							select = true;
							break;
						}
					}
					x += '<li><label class="item-checkbox item-content"><input type="checkbox" ' + (select ? 'checked="checked"' : '') + ' name="evcw-checkbox" value="' + crews[i]['user_id'] + '" data-sn="' + crews[i]['short_name'] + '" />';
					x += '<i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title">' + crews[i]['short_name'] + '</div></div></label></li>';
				}
			}
			$('.evt-crew ul').html(x);
			$('.panel-evt-rmk').hide();
			$('.panel-evt-car').hide();
			$('.panel-evt-crew').show();
			$(this).addClass('evt-crew-edit');
			apps.panel.open('left', true);
			
			var searchbar = apps.searchbar.create({
					el: '.panel-evt-crew .searchbar',
					searchContainer: '.panel-evt-crew .list.evt-crew',
					searchIn: '.item-title'
				});
				
			$('.panel-evt-crew .searchbar input').focus();
		});
		
		$('div.evt-crew').on('change', 'input[name="evcw-checkbox"]', function(){
			var wcrew = [], wcrewsn = [], ST = [], OB = [], XX = [];
			
			for(var i=0; i<$('input[name="evcw-checkbox"]:checked').length; i++){
				wcrew.push($('input[name="evcw-checkbox"]:checked:eq('+i+')').val());
				wcrewsn.push($('input[name="evcw-checkbox"]:checked:eq('+i+')').data('sn'));
			}
			
			for(var i=0; i<$('label.evt_setup input[value="ST"]:checked').length; i++){
				ST.push($('label.evt_setup input[value="ST"]:checked:eq('+i+')').attr('name'));
			}
			$('input.evt-crew-edit').data('st', ST.join(','));
			
			for(var i=0; i<$('label.evt_onboard input[value="OB"]:checked').length; i++){
				OB.push($('label.evt_onboard input[value="OB"]:checked:eq('+i+')').attr('name'));
			}
			$('input.evt-crew-edit').data('ob', OB.join(','));
			
			for(var i=0; i<$('label.evt_dismantle input[value="XX"]:checked').length; i++){
				XX.push($('label.evt_dismantle input[value="XX"]:checked:eq('+i+')').attr('name'));
			}
			$('input.evt-crew-edit').data('xx', XX.join(','));
			
			$('input.evt-crew-edit').data('uname', wcrew.join(','));
			$('input.evt-crew-edit').val(wcrewsn.join(', '));
		});
		
		$('div.evt-crew').on('click', 'label.item-checkbox', function(){
			var input = $(this).find('input');
			var uid = input.val();
			
			if(!input.prop("checked")){
				$('input[name="'+uid+'"]').prop("checked", false);
			}
		});
		
		$('div.evt-crew').on('click', 'label.evt_setup, label.evt_onboard, label.evt_dismantle', function(){
			var name = $(this).find('input').attr('name');
			
			if($('input[name="' + name + '"]:checked').length){
				$('input[name="evcw-checkbox"][value="' + name + '"]').prop("checked", true);
			}else{
				$('input[name="evcw-checkbox"][value="' + name + '"]').prop("checked", false);
			}
			$('input[name="evcw-checkbox"][value="' + name + '"]').trigger('change');
		});
		
		$('.details-popover').on('click', 'input.evtd_cin, input.evtd_cout', function(){
			$('.evt-car-edit').removeClass('evt-car-edit');
			var cars = $('body').data('car'),
				selected = (($(this).val().indexOf(',') != -1) ? $(this).val().split(', ') : [$(this).val()]),
				x = '';
			
			for(var i = 0; i < cars.length; i++){
				var select = false;
				for(var j = 0; j < selected.length; j++){
					if(cars[i] == selected[j]){
						select = true;
						break;
					}
				}
				x += '<li><label class="item-checkbox item-content"><input type="checkbox" ' + (select ? 'checked="checked"' : '') + ' name="evcr-checkbox" value="' + cars[i] + '" />';
				x += '<i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title">' + cars[i] + '</div></div></label></li>';
			}
			$('.evt-car ul').html(x);
			$('.panel-evt-crew').hide();
			$('.panel-evt-rmk').hide();
			$('.panel-evt-car').show();
			$(this).addClass('evt-car-edit');
			apps.panel.open('left', true);
			
			var searchbar = apps.searchbar.create({
					el: '.panel-evt-car .searchbar',
					searchContainer: '.panel-evt-car .list.evt-car',
					searchIn: '.item-title'
				});
				
			$('.panel-evt-car .searchbar input').focus();
		});
		
		$('div.evt-car').on('change', 'input[name="evcr-checkbox"]', function(){
			var wcar = [];
			
			for(var i=0; i<$('input[name="evcr-checkbox"]:checked').length; i++){
				wcar.push($('input[name="evcr-checkbox"]:checked:eq('+i+')').val());
			}
			
			$('input.evt-car-edit').val(wcar.join(', '));
		});
		
		$('#status-btn').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr')
				};
			var post_data = "ACT=" + encodeURIComponent('usr_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
				
					if(inf['reply']==='200 OK'){
						var status = inf['status'], x = '';
						$('body').data('crew', inf['status']);
							
						for(var i=0; i<status.length; i++){
							if(status[i].user_level > 1){
								x += '<li><a href="#" class="item-link item-content" data-usr="' + status[i].user_id + '" data-who="' + status[i].nc_name + '">';
								x += '<div class="item-media"><i class="icon material-icons md-only">' + (status[i].clocked_in == 1 ? 'directions_run' : 'hotel') + '</i></div>';
								x += '<div class="item-inner"><div class="item-title">' + status[i].nc_name + (status[i].clocked_in == 1 ? ('<div class="item-footer">' + status[i].clocked_time + '</div>') : '') + '</div></div></a></li>';
							}
						}
						$('#user-status').html(x);
						sys.loading(0);
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
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
		
		$('#itml-btn').on('click', function(){
			var searchbar = apps.searchbar.create({
					el: '.popup-itml .searchbar',
					searchContainer: '.popup-itml .list.itm_list',
					searchIn: '.item-title'
				});
			
			var inv = $('body').data('inv'), x ='';
			
			for(var i=0; i<inv.length; i++){
				if(!sys.isEmpty(inv[i].photo_url)){
					x += '<li><a href="#" class="item-link item-content" data-url="' + inv[i].photo_url + '"><div class="item-inner"><div class="item-title">' + ((sys.isEmpty(inv[i].brand) ? '' : ( inv[i].brand + ' ')) + inv[i].description) + '</div></div></a></li>';
				}
			}
			
			$('.itm_list ul').html(x);
		});
		
		$('.popup-itml .itm_list ul').on('click', 'a.item-link', function(){
			var x = '';
			
			x += '<strong>' + $(this).find('.item-title').text() + '</strong><br/>';
			x += '<img class="itml" src="https://app.wkventertainment.com/files/photo/' + $(this).data('url') + '" alt="' + $(this).find('.item-title').text() + '">';
			
			apps.dialog.create({
				title: '',
				text: x,
				cssClass: 'itm-dialog',
				buttons: [
					{
						text: 'Close',
					}
				],
				closeByBackdropClick: true
			}).open();
		});
		
		$('#itid-btn').on('click', function(){
			if(typeof cordova != 'undefined'){
				cordova.plugins.barcodeScanner.scan(
					function(result){
						if(!result.cancelled){
							if(sys.isEmpty((result.text).match(/w:[A-Z0-9]{4}\d{4}/))){
								var failed_toast = apps.toast.create({
													   text: 'Invalid Barcode',
													   position: 'center',
													   closeTimeout: 1000
												   });
									failed_toast.open();
							}else{
								var inv = $('body').data('inv'), uid = (result.text).substr(2, 4), found = false, target = parseInt((result.text).substr(-4));
							
								for(var i=0; i<inv.length; i++){
									if(inv[i].unique_id == uid){
										found = true;
										var point = JSON.parse(inv[i].point);
										var x = ((sys.isEmpty(inv[i].brand) ? '' : ( inv[i].brand + ' ')) + inv[i].description);
										
										if(!sys.isEmpty(point[target])){
											x += ('<br/><br/>Condition :&nbsp;&nbsp;&nbsp;' + ((point[target].c == '2') ? 'Check Pending' : ((point[target].c == '1') ? 'OK' : 'Spoilt')));
											x += ('<br/>Locate :&nbsp;&nbsp;&nbsp;' + (point[target].p));
											x += ((typeof point[target].l == 'undefined') ? '' : ('<br/>Length :&nbsp;&nbsp;&nbsp;' + (point[target].l) + 'm'));
										}
										var success_toast = apps.toast.create({
															   text: x,
															   position: 'center',
															   closeTimeout: 6000
														   });
											success_toast.open();
										break;
									}
								}
								
								if(!found){
									var failed_toast = apps.toast.create({
													   text: 'No item found',
													   position: 'center',
													   closeTimeout: 2000
												   });
									failed_toast.open();
								}
							}
						}	  
					}, function (error) {
						alert("Scanning failed: " + error);
					}, {
						preferFrontCamera : false,
						showFlipCameraButton : false,
						showTorchButton : true,
						torchOn: false,
						saveHistory: false,
						prompt : "Place a barcode inside the scan area",
						resultDisplayDuration: 0,
						formats : "DATA_MATRIX",
						orientation : "portrait",
						disableAnimations : true,
						disableSuccessBeep: false
					}
				);
			}else{
				apps.loginScreen.open('#barcode');
				$('input.itid-bcs').focus();
			}
		});
		
		$('#barcode .button').on('click', function(){
			apps.loginScreen.close('#barcode');
		});
		
		$('input.itid-bcs').on('change', function(e){
			console.log($('input.itid-bcs').val());
			$('input.itid-bcs').val('');
		});
		
		$('#user-status').on('click', 'a.item-link', function(){
			var target = $(this).data('usr');
			var who = $(this).data('who');
			var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'target' : target
				};
			var post_data = "ACT=" + encodeURIComponent('clk_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
					$('.status-name').text(who);
				},
				success: function(str){
					if(str==='204 No Response'){
						$('.panel-status .list ul').html('<p style="margin-left:10px;">No work history found.</p>');
						
						apps.panel.open('right', true);
					}else{
						var inf = JSON.parse(str);
						
						if(inf['reply']==='200 OK'){
							var x ='',
								work = inf['work'],
								tmp_end = '';
							
							for(var i=0; i < work.length; i++){
								if(work[i].clock_action == 'OUT'){
									tmp_end = work[i].clock_in_out;
								}else{
									if(!sys.isEmpty(tmp_end)){
										var duration = (((new Date(tmp_end)).getTime() - (new Date(work[i].clock_in_out)).getTime())/3600000).toFixed(2);
										
										x += '<li><a href="#" class="item-link item-content" data-location="' + work[i].clock_location + '" data-venue="' + work[i].status + '" data-in="' + work[i].clock_in_out + '" data-out="' + tmp_end + '">';
										x += '<div class="item-inner"><div class="item-title">' + work[i].status;
										x += '<div class="item-footer">' + tmp_end + '</div></div><div class="item-after">' + duration + ' Hr</div></div></a></li>';
									}
								}
							}
							if(sys.isEmpty(x)){
								x = '<p style="margin-left:10px;">No work history found.</p>';
							}
							$('.panel-status .list ul').html(x);
							
							apps.panel.open('right', true);
						}else{
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}
					}
					sys.loading(0);
				}
			});
		});
		
		$('.panel-status .list ul').on('click', 'a', function(){
			var x = '';
			
			x += '<span class="dialog-label">In</span>: ' + $(this).data('in') + '<br/>';
			x += '<span class="dialog-label">Out</span>: ' + $(this).data('out') + '<br/>';
			x += 'Duration : ' + $(this).find('.item-after').text() + '<br/><br/>';
			x += '<strong>' + $(this).data('venue') + '</strong><br/>';
			x += '<iframe width="100%" height="250" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=' + $(this).data('location') + '&zoom=17"> </iframe>';
			
			apps.dialog.alert(x, '');
		});
		
		$('.popup-cntd').on('scroll', function(){
			var offset = 15 - $('.popup-cntd')[0].scrollTop;
			$(this).find('.fab').css('bottom', (offset + 'px'));
		});
		
		$('.popup-amtl').on('click', '.link.popup-open', function(){
			apps.popup.close('.popup-amtl', true);
			$('.popup-backdrop').addClass('backdrop-in');
		});
		
		$('#cntd-btn').on('click', function(){
			$('.popup-cntd input').val('');
			$('.popup-cntd input[name="cnv-checkbox"]').prop('checked', false);
			
			var searchbar = apps.searchbar.create({
					el: '.popup-cntd .searchbar',
					searchContainer: '.popup-cntd .list',
					searchIn: '.item-title'
				});
		});
		
		$('a.cnv-share').on('click', function(){
			var cnv = [], share = '';
			
			for(var i=0; i<$('input[name="cnv-checkbox"]:checked').length; i++){
				if(i != 0){
					share += '\n\n';
				}
				share += ($('input[name="cnv-checkbox"]:checked:eq('+i+')').data('fn')) + '\n';
				share += ($('input[name="cnv-checkbox"]:checked:eq('+i+')').data('ic'));
			}
			
			if(typeof window.plugins != 'undefined'){
				window.plugins.socialsharing.share(share);
			}else{
				$('body').append('<textarea id="tempCopy"/></textarea>');
				$('body textarea#tempCopy').val(share).select();
				document.execCommand("copy");
				$('body textarea#tempCopy').remove();
			}
		});
		
		$('#abctg-btn').on('click', function(){
			if(typeof cordova != 'undefined'){
				cordova.plugins.barcodeScanner.scan(
					function(result){
						if(!result.cancelled){
							if(sys.isEmpty((result.text).match(/w:[A-Z0-9]{4}\d{4}/))){
								var failed_toast = apps.toast.create({
													   text: 'Invalid Barcode',
													   position: 'center',
													   closeTimeout: 1000
												   });
									failed_toast.open();
							}else{
								var inv = $('body').data('inv'), uid = (result.text).substr(2, 4), found = false, target = parseInt((result.text).substr(-4));
							
								for(var i=0; i<inv.length; i++){
									if(inv[i].unique_id == uid){
										if(sys.isEmpty(inv[i].point)){ inv[i].point = '[]'; }
										
										var points = JSON.parse(inv[i].point);
										
										if(['XLRC', 'CCPE', '3PPC'].indexOf(uid) != -1){
											apps.dialog.prompt('What is the length of cable in metre?', function(lngt){
												points[target] = {'p':'Basement', 'l':lngt, 'c':'2'};
												
												var DATA = {
														'usr' : STORAGE.getItem('usr'),
														'pid' : inv[i].primary_id,
														'point' : JSON.stringify(points)
													};
												var post_data = "ACT=" + encodeURIComponent('rst_btg')
															  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
												
												$.ajax({
													type: 'POST',
													url: 'https://app.wkventertainment.com/',
													data: post_data,
													beforeSend: function(){
														sys.loading(1);
													},
													success: function(str){
														sys.loading(0);
														if(str=='200 OK'){
															inv[i].point = JSON.stringify(points);
															$('body').data('inv', inv);
															
															var success_toast = apps.toast.create({
																				   icon: '<i class="material-icons">cloud_done</i>',
																				   text: 'Tag Details Successfully Saved.',
																				   position: 'center',
																				   closeTimeout: 2000
																			   });
															success_toast.open();
														}else{
															var failed_toast = apps.toast.create({
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
										}else{
											points[target] = {'p':'Basement', 'c':'2'};
											
											var DATA = {
													'usr' : STORAGE.getItem('usr'),
													'pid' : inv[i].primary_id,
													'point' : JSON.stringify(points)
												};
											var post_data = "ACT=" + encodeURIComponent('rst_btg')
														  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
											
											$.ajax({
												type: 'POST',
												url: 'https://app.wkventertainment.com/',
												data: post_data,
												beforeSend: function(){
													sys.loading(1);
												},
												success: function(str){
													sys.loading(0);
													if(str=='200 OK'){
														inv[i].point = JSON.stringify(points);
														$('body').data('inv', inv);
														
														var success_toast = apps.toast.create({
																			   icon: '<i class="material-icons">cloud_done</i>',
																			   text: 'Tag Details Successfully Saved.',
																			   position: 'center',
																			   closeTimeout: 2000
																		   });
														success_toast.open();
													}else{
														var failed_toast = apps.toast.create({
																			   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																			   text: 'Oooppss, error',
																			   position: 'center',
																			   closeTimeout: 2000
																		   });
														failed_toast.open();
													}
												}
											});
										}
										found = true;
										break;
									}
								}
								
								if(!found){
									var failed_toast = apps.toast.create({
													   text: 'No valid item found',
													   position: 'center',
													   closeTimeout: 1000
												   });
									failed_toast.open();
								}
							}
						}	  
					}, function (error) {
						alert("Scanning failed: " + error);
					}, {
						preferFrontCamera : false,
						showFlipCameraButton : false,
						showTorchButton : true,
						torchOn: false,
						saveHistory: false,
						prompt : "Place a barcode inside the scan area",
						resultDisplayDuration: 0,
						formats : "DATA_MATRIX",
						orientation : "portrait",
						disableAnimations : true,
						disableSuccessBeep: false
					}
				);
			}else{
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Barcode scanner not supported.',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
			}
		});
		
		$('#clrdl-btn').on('click', function(){
			apps.dialog.confirm(('Are you sure?'), 'Confirmation', function(){
				var DATA = {
					'usr' : STORAGE.getItem('usr')
				};
				var post_data = "ACT=" + encodeURIComponent('clr_dt')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						sys.loading(0);
						if(str=='200 OK'){
							var success_toast = apps.toast.create({
												   icon: '<i class="material-icons">delete_forever</i>',
												   text: 'All details unlocked.',
												   position: 'center',
												   closeTimeout: 2000
											   });
							success_toast.open();
						}else{
							var failed_toast = apps.toast.create({
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
		
		$('#crewl-btn').on('click', function(){
			var x = '', crews = $('body').data('crew');
			
			for(var i = 0, j = 0; i < crews.length; i++){
				if(crews[i]['user_level'] > 0){
					x += '<li>';
					x += '<a href="#" class="item-link item-content" data-num="' + i + '" data-jnum"' + j + '" data-uid="' + crews[i]['user_id'] + '" data-dname="' + crews[i]['nc_name'] + '" data-sname="' + crews[i]['short_name'] + '">';
					x += '<div class="item-inner"><div class="item-title">';
					x += crews[i]['nc_name'];
					x += '<div class="item-footer">' + crews[i]['short_name'] + '</div>';
					x += '</div></div></a></li>';
					j++;
				}
			}
			$('.crew_list ul').html(x);
		});
		
		$('.crewl_add').on('click', function(){
			$('#crewld_dname').removeData('uid');
			$('#crewld_dname').prop('disabled', false);
			if($('#crewld_dname').parent().find('span').length == 0){
				$('#crewld_dname').parent().append('<span class="input-clear-button"></span>');
			}
			$('#crewld_dname').val('');
			$('#crewld_sname').val('');
			apps.popover.open('.crewld-popover');
		});
		
		$('.crew_list').on('click', 'a.item-link', function(){
			$('#crewld_dname').prop('disabled', true);
			$('#crewld_dname').parent().find('span').remove();
			$('#crewld_dname').data('uid', $(this).data('uid'));
			$('#crewld_dname').data('num', $(this).data('num'));
			$('#crewld_dname').data('jnum', $(this).data('jnum'));
			$('#crewld_dname').val($(this).data('dname'));
			$('#crewld_sname').val($(this).data('sname'));
			apps.popover.open('.crewld-popover');
		});
		
		$('.crewld_ok').on('click', function(){
			var dnm = $('#crewld_dname').val() , snm = $('#crewld_sname').val();
			
			if(sys.isEmpty(dnm) || sys.isEmpty(snm)){
				navigator.vibrate(100);
			}else{
				var crew = $('body').data('crew');
				
				if(sys.isEmpty($('#crewld_dname').data('uid'))){
					var uid = dnm.toLowerCase().replace(/\s/g, '');
					
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'dnm' : dnm,
						'snm' : snm,
						'uid' : uid
					};
					var post_data = "ACT=" + encodeURIComponent('crw_add')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);

							if(str == '200 OK'){
								var x = '<li>';
									x += '<a href="#" class="item-link item-content" data-num="' + crew.length + '">';
									x += '<div class="item-inner"><div class="item-title">' + dnm + '<div class="item-footer">' + snm + '</div></div></div></a></li>';
									
								var ncrew = {
									'clocked_in' : '0',
									'clocked_time' : '2019-01-01 00:00:00',
									'nc_name' : dnm,
									'short_name' : snm,
									'user_id' : uid,
									'user_level' : '1'
								};
								crew.push(ncrew);
								$('body').data('crew', crew);
								
								$('.crew_list ul').append(x);
								apps.popover.close('.crewld-popover');
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">cloud_done</i>',
													   text: 'Details Successfully Saved',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}else{
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'snm' : snm,
						'uid' : $('#crewld_dname').data('uid')
					};
					var post_data = "ACT=" + encodeURIComponent('crw_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);
							
							if(str == '200 OK'){
								var cnum = $('#crewld_dname').data('num'), jnum = $('#crewld_dname').data('jnum');
								var x = '<a href="#" class="item-link item-content" data-num="' + cnum + '" data-jnum="' + jnum + '" data-uid="' + $('#crewld_dname').data('uid') + '" data-dname="' + dnm + '" data-sname="' + snm + '">';
									x += '<div class="item-inner"><div class="item-title">' + dnm + '<div class="item-footer">' + snm + '</div></div></div></a>';
									
								crew[cnum]['short_name'] = snm;
								
								$('body').data('crew', crew);
								$('.crew_list ul li:eq(' + jnum + ')').html(x);
								apps.popover.close('.crewld-popover');
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">cloud_done</i>',
													   text: 'Details Successfully Saved',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}
			}
		});
		
		$('#locl-btn').on('click', function(){
			var x = '', locs = $('body').data('loc');
			
			for(var i = 0; i < locs.length; i++){
				x += '<li>';
				x += '<a href="#" class="item-link item-content" data-num="' + i + '">';
				x += '<div class="item-inner">';
				x += '<div class="item-title">';
				x += locs[i]['loc_name'];
				x += '<div class="item-footer">' + locs[i]['loc_state'] + ' (' + locs[i]['loc_category'] + ')</div>';
				x += '</div>';
				x += '</div>';
				x += '</a>';
				x += '</li>';
			}
			$('.loc_list ul').html(x);
			
			var searchbar = apps.searchbar.create({
					el: '.popup-locl .searchbar',
					searchContainer: '.popup-locl .list.loc_list',
					searchIn: '.item-title'
				});
		});
		
		$('.loc_list').on('click', 'a.item-link', function(){
			var locs = $('body').data('loc')[$(this).data('num')];
			
			$('.lmap').html('<iframe width="100%" height="300" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=' + locs['loc_point'] + '&zoom=15"></iframe>');
			$('#locld_name').data('pid', locs['primary_id']);
			$('#locld_name').data('num', $(this).data('num'));
			$('#locld_name').val(locs['loc_name']);
			$('#locld_cat').val(locs['loc_category']);
			$('#locld_state').val(locs['loc_state']);
			$('#locld_point').val(locs['loc_point']);
			$('#locld_range').val(locs['loc_range']);
			$('#locld_lobby').val(locs['point_lobby']);
			$('#locld_loading').val(locs['point_loading']);
			
			var mpixel = parseFloat(locs['loc_range']) * 0.17;
			$('span.lpoint_tl, span.lpoint_tr').css('top', ((133 - parseInt(mpixel))+'px'));
			$('span.lpoint_tl, span.lpoint_bl').css('left', ((123 - parseInt(mpixel))+'px'));
			$('span.lpoint_tr, span.lpoint_br').css('left', ((123 + parseInt(mpixel))+'px'));
			$('span.lpoint_bl, span.lpoint_br').css('top', ((133 + parseInt(mpixel))+'px'));
			
			apps.popover.open('.locld-popover');
		});
		
		$('#locld_point').on('change', function(){
			var point = $(this).val();
			var plat = parseFloat(point.split(',')[0]),
				plon = parseFloat(point.split(',')[1]);
			
			if((plat >= -90 && plat <= 90) && (plon >= -180 && plon <= 180)){
				$('.lmap').html('<iframe width="100%" height="300" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=' + point + '&zoom=15"> </iframe>');
			}else{
				navigator.vibrate(100);
			}
		});
		
		$('#locld_range').on('change', function(){
			var range = $(this).val();
			
			var mpixel = parseFloat(range) * 0.17;
			$('span.lpoint_tl, span.lpoint_tr').css('top', ((133 - parseInt(mpixel))+'px'));
			$('span.lpoint_tl, span.lpoint_bl').css('left', ((123 - parseInt(mpixel))+'px'));
			$('span.lpoint_tr, span.lpoint_br').css('left', ((123 + parseInt(mpixel))+'px'));
			$('span.lpoint_bl, span.lpoint_br').css('top', ((133 + parseInt(mpixel))+'px'));
		});
		
		$('button.locl_add').on('click', function(){
			$('.lmap').html('<iframe width="100%" height="300" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=0,0&zoom=15"></iframe>');
			$('#locld_name').removeData('pid');
			$('#locld_name').removeData('num');
			$('#locld_name').val('');
			$('#locld_cat').val('');
			$('#locld_state').val('');
			$('#locld_point').val('0, 0');
			$('#locld_range').val('100');
			$('#locld_lobby').val('');
			$('#locld_loading').val('');
			
			$('span.lpoint_tl, span.lpoint_tr').css('top', ((133 - 17)+'px'));
			$('span.lpoint_tl, span.lpoint_bl').css('left', ((123 - 17)+'px'));
			$('span.lpoint_tr, span.lpoint_br').css('left', ((123 + 17)+'px'));
			$('span.lpoint_bl, span.lpoint_br').css('top', ((133 + 17)+'px'));
			
			apps.popover.open('.locld-popover');
		});
		
		$('button.locld_ok').on('click', function(){
			var lnme = $('#locld_name').val(),
				lcat = $('#locld_cat').val(),
				lstt = $('#locld_state').val(),
				lpnt = $('#locld_point').val(),
				lrgn = $('#locld_range').val(),
				llby = $('#locld_lobby').val(),
				lldb = $('#locld_loading').val();
			
			if(sys.isEmpty(lnme) || sys.isEmpty(lcat) ||  sys.isEmpty(lstt) ||  sys.isEmpty(lpnt) ||  sys.isEmpty(lrgn)){
				navigator.vibrate(100);
			}else{
				var plat = parseFloat(lpnt.split(',')[0]),
					plon = parseFloat(lpnt.split(',')[1]);
			
				if((plat >= -90 && plat <= 90) && (plon >= -180 && plon <= 180)){
					var lpid = $('#locld_name').data('pid'),
						locs = $('body').data('loc');
					
					if(sys.isEmpty(lpid)){
						var DATA = {
									'usr' : STORAGE.getItem('usr'),
									'name' : lnme,
									'category' : lcat,
									'state' : lstt,
									'point' : lpnt,
									'range' : lrgn,
									'lobby' : llby,
									'loading' : lldb
								};
						var post_data = "ACT=" + encodeURIComponent('loc_add')
									  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								sys.loading(0);
								
								var inf = JSON.parse(str);
								
								if(inf['reply']==='200 OK'){
									var x = '<li>';
										x += '<a href="#" class="item-link item-content" data-num="' + locs.length + '">';
										x += '<div class="item-inner"><div class="item-title">' + lnme;
										x += '<div class="item-footer">' + lstt + ' (' + lcat + ')</div>';
										x += '</div></div></a></li>';
										
									var nloc = {
											'primary_id' : inf['pid'],
											'loc_name' : lnme,
											'loc_category' : lcat,
											'loc_state' : lstt,
											'loc_point' : lpnt,
											'loc_range' : lrgn,
											'point_lobby' : llby,
											'point_loading' : lldb
										};
										
									locs.push(nloc);
									$('body').data('loc', locs);
									
									$('.loc_list ul').append(x);
									apps.popover.close('.locld-popover');
									
									var success_toast = apps.toast.create({
														   icon: '<i class="material-icons">cloud_done</i>',
														   text: 'Details Successfully Saved',
														   position: 'center',
														   closeTimeout: 2000
													   });
									success_toast.open();
								}else{
									var failed_toast = apps.toast.create({
														   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
														   text: 'Oooppss, error',
														   position: 'center',
														   closeTimeout: 2000
													   });
									failed_toast.open();
								}
							}
						});
					}else{
						var DATA = {
									'usr' : STORAGE.getItem('usr'),
									'pid' : lpid,
									'name' : lnme,
									'category' : lcat,
									'state' : lstt,
									'point' : lpnt,
									'range' : lrgn,
									'lobby' : llby,
									'loading' : lldb
								};
						var post_data = "ACT=" + encodeURIComponent('loc_udt')
									  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
									  
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								sys.loading(0);
								
								var num = $('#locld_name').data('num');
								
								if(str == '200 OK'){
									var x = '<a href="#" class="item-link item-content" data-num="' + num + '">';
										x += '<div class="item-inner"><div class="item-title">' + lnme;
										x += '<div class="item-footer">' + lstt + ' (' + lcat + ')</div>';
										x += '</div></div></a>';
										
									var nloc = {
											'primary_id' : lpid,
											'loc_name' : lnme,
											'loc_category' : lcat,
											'loc_state' : lstt,
											'loc_point' : lpnt,
											'loc_range' : lrgn,
											'point_lobby' : llby,
											'point_loading' : lldb
										};
									
									locs[num] = nloc;
									$('body').data('loc', locs);
									
									$('.loc_list ul li:eq('+num+')').html(x);
									apps.popover.close('.locld-popover');
									
									var success_toast = apps.toast.create({
														   icon: '<i class="material-icons">cloud_done</i>',
														   text: 'Details Successfully Saved',
														   position: 'center',
														   closeTimeout: 2000
													   });
									success_toast.open();
								}else{
									var failed_toast = apps.toast.create({
														   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
														   text: 'Oooppss, error',
														   position: 'center',
														   closeTimeout: 2000
													   });
									failed_toast.open();
								}
							}
						});
					}
				}else{
					navigator.vibrate(100);
				}
			}
		});
		
		$('#picl-btn').on('click', function(){
			var x = '', crews = $('body').data('crew');
			
			for(var i = 0, j=0; i < crews.length; i++){
				if(crews[i]['user_level'] == 0){
					x += '<li>';
					x += '<a href="#" class="item-link item-content" data-num="' + i + '" data-jnum="' + j + '" data-uid="' + crews[i]['user_id'] + '" data-dname="' + crews[i]['nc_name'] + '" data-comp="' + crews[i]['nc_pos1'] + '" data-adr="' + crews[i]['nc_pos2'] + '" data-con="' + crews[i]['nc_contact'] + '" data-eml="' + crews[i]['nc_email'] + '">';
					x += '<div class="item-inner"><div class="item-title">';
					x += crews[i]['nc_name'];
					x += '<div class="item-footer">' + crews[i]['nc_contact'] + (sys.isEmpty(crews[i]['nc_pos1']) ? '' : (' (' + crews[i]['nc_pos1'] + ')')) + '</div>';
					x += '</div></div></a></li>';
					j++;
				}
			}
			$('.pic_list ul').html(x);
			
			var searchbar = apps.searchbar.create({
					el: '.popup-picl .searchbar',
					searchContainer: '.popup-picl .list.pic_list',
					searchIn: '.item-title'
				});
		});
		
		$('.picl_add').on('click', function(){
			$('#picl_dname').removeData('uid');
			$('#picl_dname').prop('disabled', false);
			if($('#picl_dname').parent().find('span').length == 0){
				$('#picl_dname').parent().append('<span class="input-clear-button"></span>');
			}
			$('#picl_dname').val('');
			$('#picl_comp').val('');
			$('#picl_adr').val('');
			$('#picl_con').val('');
			$('#picl_eml').val('');
			apps.popover.open('.picl-popover');
		});
		
		$('.pic_list').on('click', 'a.item-link', function(){
			$('#picl_dname').prop('disabled', true);
			$('#picl_dname').parent().find('span').remove();
			$('#picl_dname').data('uid', $(this).data('uid'));
			$('#picl_dname').data('num', $(this).data('num'));
			$('#picl_dname').data('jnum', $(this).data('jnum'));
			$('#picl_dname').val($(this).data('dname'));
			$('#picl_comp').val($(this).data('comp'));
			$('#picl_adr').val($(this).data('adr'));
			$('#picl_con').val($(this).data('con'));
			$('#picl_eml').val($(this).data('eml'));
			apps.popover.open('.picl-popover');
		});
		
		$('.picl_ok').on('click', function(){
			var dnm = $('#picl_dname').val(), comp = $('#picl_comp').val(), adr = $('#picl_adr').val(), con = $('#picl_con').val(), eml = $('#picl_eml').val();
			
			if(sys.isEmpty(dnm) || sys.isEmpty(con)){
				navigator.vibrate(100);
			}else{
				var crew = $('body').data('crew');
				
				if(sys.isEmpty($('#picl_dname').data('uid'))){
					var uid = dnm.toLowerCase().replace(/\s/g, '');
					
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'dnm' : dnm,
						'comp' : comp,
						'adr' : adr,
						'con' : con,
						'eml' : eml,
						'uid' : uid
					};
					var post_data = "ACT=" + encodeURIComponent('pic_add')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);

							if(str == '200 OK'){
								var x = '<li>';
									x += '<a href="#" class="item-link item-content" data-num="' + crew.length + '" data-jnum="' + $('.pic_list ul li').length + '" data-uid="' + uid + '" data-dname="' + dnm + '" data-comp="' + comp + '" data-adr="' + adr + '" data-con="' + con + '" data-eml="' + eml + '">';
									x += '<div class="item-inner"><div class="item-title">' + dnm + '<div class="item-footer">' + con + (sys.isEmpty(comp) ? '' : (' (' + comp + ')')) + '</div></div></div></a></li>';
									
								var ncrew = {
									'clocked_in' : '0',
									'clocked_time' : '2019-01-01 00:00:00',
									'nc_name' : dnm,
									'user_id' : uid,
									'nc_contact' : con,
									'nc_pos1' : comp,
									'nc_pos2' : adr,
									'nc_email' : eml,
									'user_level' : '0'
								};
								crew.push(ncrew);
								$('body').data('crew', crew);
								
								$('.pic_list ul').append(x);
								apps.popover.close('.picl-popover');
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">cloud_done</i>',
													   text: 'Details Successfully Saved',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}else{
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'comp' : comp,
						'adr' : adr,
						'con' : con,
						'eml' : eml,
						'uid' : $('#picl_dname').data('uid')
					};
					var post_data = "ACT=" + encodeURIComponent('pic_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);
							
							if(str == '200 OK'){
								var pnum = $('#picl_dname').data('num'), jnum = $('#picl_dname').data('jnum');
								var x = '<a href="#" class="item-link item-content" data-num="' + pnum + '" data-jnum="' + jnum + '" data-uid="' + $('#picl_dname').data('uid') + '" data-dname="' + dnm + '" data-comp="' + comp + '" data-adr="' + adr + '" data-con="' + con + '" data-eml="' + eml + '">';
									x += '<div class="item-inner"><div class="item-title">' + dnm + '<div class="item-footer">' + con + (sys.isEmpty(comp) ? '' : (' (' + comp + ')')) + '</div></div></div></a>';
								
								crew[pnum]['nc_contact'] = con;
								crew[pnum]['nc_email'] = eml;
								crew[pnum]['nc_pos1'] = comp;
								crew[pnum]['nc_pos2'] = adr;
								
								$('body').data('crew', crew);
								$('.pic_list ul li:eq(' + jnum + ')').html(x);
								apps.popover.close('.crewld-popover');
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">cloud_done</i>',
													   text: 'Details Successfully Saved',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}
			}
		});
		
		$('#tskl-btn').on('click', function(){
			var DATA = {
						'usr' : STORAGE.getItem('usr')
					};
			var post_data = "ACT=" + encodeURIComponent('tsk_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));

			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					
					if(str==='204 No Response'){
						$('.popup-tskl .tsk_list ul').html('<p style="margin-left:10px;">No task found.</p>');
					}else{
						var inf = JSON.parse(str), x = '';
						
						if(inf['reply']==='200 OK'){
							for(var i=0; i<inf['task'].length; i++){
								x += '<li><a href="#" class="item-link item-content" data-num="' + i + '" data-pid="' + inf['task'][i].primary_id + '">';
								x += '<div class="item-inner"><div class="item-title">' + inf['task'][i].description;
								x += '<div class="item-footer">' + ((inf['task'][i].venue.indexOf('#PID#') != -1) ? sys.pidToLoc(inf['task'][i].venue).loc_name : inf['task'][i].venue) + '</div>';
								x += '</div><div class="item-after">' + inf['task'][i].date.substr(0, 10) + ' (' + inf['task'][i].time + ')</div></div></a></li>';
							}
							
							$('.tsk_list ul').html(x);
							$('.tsk_list').data('info', inf['task']);
						}
					}
				}
			});
			
			var searchbar = apps.searchbar.create({
					el: '.popup-tskl .searchbar',
					searchContainer: '.popup-tskl .list.tsk_list',
					searchIn: '.item-title'
				});
		});
		
		var tsklVenueAutocomplete = apps.autocomplete.create({
				openIn: 'dropdown',
				inputEl: '#tskld_venue',
				limit: 5,
				source: function(query, render){
					var results = [], locs = $('body').data('loc');
					if(query.length === 0){
						render(results);
						return;
					}
					
					for (var i = 0; i < locs.length; i++) {
						if (locs[i].loc_name.toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(locs[i].loc_name);
					}
					
					render(results);
				},
				off: { blur }
			});
		
		$('button.tskl_add').on('click', function(){
			$('#tskld_date').val('');
			$('#tskld_date').removeData('pid');
			$('#tskld_date').removeData('num');
			$('#tskld_time').val('');
			$('#tskld_venue').val('');
			$('#tskld_desc').val('');
			$('#tskld_crew').val('');
			$('#tskld_crew').removeData('uname');
			
			apps.popover.open('.tskld-popover');
		});
		
		$('.tsk_list').on('click', 'a.item-link', function(){
			var tskl = $('.tsk_list').data('info')[$(this).data('num')];
			
			$('#tskld_date').val(tskl.date.substr(0,10));
			$('#tskld_date').data('pid', $(this).data('pid'));
			$('#tskld_date').data('num', $(this).data('num'));
			$('#tskld_time').val(tskl.time);
			$('#tskld_venue').val(sys.pidToLoc(tskl.venue).loc_name);
			$('#tskld_desc').val(tskl.description);
			$('#tskld_crew').data('uname', tskl.crew);
			$('#tskld_crew').val(sys.unameToSname(tskl.crew));
			$('.tskld-popover').data('md5', md5(tskl.date.substr(0,10)+tskl.time+tskl.venue+tskl.description+tskl.crew));
			
			apps.popover.open('.tskld-popover');
		});
		
		$('button.tskld_ok').on('click', function(){
			var tldt = $('#tskld_date').val(),
				tltm = $('#tskld_time').val(),
				tlvn = $('#tskld_venue').val(),
				tlds = $('#tskld_desc').val(),
				tlcw = $('#tskld_crew').data('uname');
			
			if(sys.isEmpty(tldt) || sys.isEmpty(tltm) ||  sys.isEmpty(tlvn) ||  sys.isEmpty(tlcw)){
				navigator.vibrate(100);
			}else{
				var tpid = $('#tskld_date').data('pid'),
					num = $('#tskld_date').data('num'),
					tskl = (sys.isEmpty($('.tsk_list').data('info')) ? [] : $('.tsk_list').data('info'));
				
				if(sys.isEmpty(tpid)){
					var DATA = {
								'usr' : STORAGE.getItem('usr'),
								'date' : tldt,
								'time' : tltm,
								'venue' : sys.locToPid(tlvn),
								'desc' : tlds,
								'crew' : tlcw
							};
					var post_data = "ACT=" + encodeURIComponent('tsk_add')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							var inf = JSON.parse(str);
							
							if(inf['reply']==='200 OK'){
								var x = '<li><a href="#" class="item-link item-content" data-num="' + tskl.length + '" data-pid="' + inf['pid'] + '">';
									x += '<div class="item-inner"><div class="item-title">' + tlds;
									x += '<div class="item-footer">' + tlvn + '</div>';
									x += '</div><div class="item-after">' + tldt + ' (' + tltm + ')</div></div></a></li>';
									
								var ntsk = {
										'primary_id' : inf['pid'],
										'date' : tldt,
										'time' : tltm,
										'venue' : sys.locToPid(tlvn),
										'description' : tlds,
										'crew' : tlcw
									};
								
								if(tskl.length == 0){
									$('.popup-tskl .tsk_list ul p').remove();
								}
								tskl.push(ntsk);
								$('.tsk_list').data('info', tskl);
								$('.tsk_list ul').append(x);
								apps.popover.close('.tskld-popover');
								
								if(((((new Date(tldt)).getTime()) - ((new Date()).getTime())) < 172800000) && !sys.isEmpty(tlcw)){
									var rcrew = ((tlcw).split(',')), receivers = [];
									
									for(var i=0; i < rcrew.length; i++){
										rcrew[i] = sys.uidToPyid(rcrew[i]);
									}
									receivers = rcrew.filter(function(str){
										return (!sys.isEmpty(str))
									});
									
									if(!sys.isEmpty(receivers)){
										var DATA = {
												'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
												'include_player_ids' : receivers,
												'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
												'collapse_id' : ('tsk_' + inf['pid']),
												'headings' : { 'en': ('Task added for ' + (tlds + ' on ' + (tldt.substr(8, 2) + '/' + tldt.substr(5, 2))))},
												'contents' : { 'en': 'Kindly double check your latest schedule. :)'},
												'data' : { 'sender': usr, 'system' : 'tsk_add', 'feedback' : ('tsk_' + inf['pid'])}
											};
													  
										$.ajax({
											type: 'POST',
											url: 'https://onesignal.com/api/v1/notifications',
											data: JSON.stringify(DATA),
											contentType: "application/json; charset=utf-8",
											dataType: "json",
											success: function(inf){
												if(!sys.isEmpty(inf['id'])){
													sys.loading(0);
										
													var success_toast = apps.toast.create({
																		   icon: '<i class="material-icons">cloud_done</i>',
																		   text: 'Details Successfully Saved',
																		   position: 'center',
																		   closeTimeout: 2000
																	   });
													success_toast.open();
												}else{
													sys.loading(0);
													
													var failed_toast = apps.toast.create({
																		   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																		   text: 'Oooppss, error',
																		   position: 'center',
																		   closeTimeout: 2000
																	   });
													failed_toast.open();
												}
											}
										});
									}
								}else{
									sys.loading(0);
									
									var success_toast = apps.toast.create({
														   icon: '<i class="material-icons">cloud_done</i>',
														   text: 'Details Successfully Saved',
														   position: 'center',
														   closeTimeout: 2000
													   });
									success_toast.open();
								}
							}else{
								sys.loading(0);
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}else{
					var DATA = {
								'pid' : tpid,
								'usr' : STORAGE.getItem('usr'),
								'date' : tldt,
								'time' : tltm,
								'venue' : sys.locToPid(tlvn),
								'desc' : tlds,
								'crew' : tlcw
							};
					var post_data = "ACT=" + encodeURIComponent('tsk_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							var inf = JSON.parse(str);
							
							if(inf['reply']==='200 OK'){
								var x = '<a href="#" class="item-link item-content" data-num="' + num + '" data-pid="' + tpid + '">';
									x += '<div class="item-inner"><div class="item-title">' + tlds;
									x += '<div class="item-footer">' + tlvn + '</div>';
									x += '</div><div class="item-after">' + tldt + ' (' + tltm + ')</div></div></a>';
									
								var ntsk = {
										'primary_id' : tpid,
										'date' : tldt,
										'time' : tltm,
										'venue' : sys.locToPid(tlvn),
										'description' : tlds,
										'crew' : tlcw
									};
								
								tskl[num] = ntsk;
								$('.tsk_list').data('info', tskl);
								$('.tsk_list ul li:eq('+num+')').html(x);
								apps.popover.close('.tskld-popover');
								
								if(((((new Date(tldt)).getTime()) - ((new Date()).getTime())) < 172800000) && !sys.isEmpty(tlcw)){
									if(md5(tldt+tltm+sys.locToPid(tlvn)+tlds+tlcw) != $('.tskld-popover').data('md5')){
										var rcrew = ((tlcw).split(',')), receivers = [];
									
										for(var i=0; i < rcrew.length; i++){
											rcrew[i] = sys.uidToPyid(rcrew[i]);
										}
										receivers = rcrew.filter(function(str){
											return (!sys.isEmpty(str))
										});
										
										if(!sys.isEmpty(receivers)){
											var DATA = {
													'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
													'include_player_ids' : receivers,
													'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
													'collapse_id' : ('tsk_' + tpid),
													'headings' : { 'en': ('Task details updated for ' + (tlds + ' on ' + (tldt.substr(8, 2) + '/' + tldt.substr(5, 2))))},
													'contents' : { 'en': 'Kindly double check your latest schedule. :)'},
													'data' : { 'sender': usr, 'system' : 'tsk_udt', 'feedback' : ('tsk_' + tpid)}
												};
														  
											$.ajax({
												type: 'POST',
												url: 'https://onesignal.com/api/v1/notifications',
												data: JSON.stringify(DATA),
												contentType: "application/json; charset=utf-8",
												dataType: "json",
												success: function(inf){
													if(!sys.isEmpty(inf['id'])){
														sys.loading(0);
											
														var success_toast = apps.toast.create({
																			   icon: '<i class="material-icons">cloud_done</i>',
																			   text: 'Details Successfully Saved',
																			   position: 'center',
																			   closeTimeout: 2000
																		   });
														success_toast.open();
													}else{
														sys.loading(0);
														
														var failed_toast = apps.toast.create({
																			   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																			   text: 'Oooppss, error',
																			   position: 'center',
																			   closeTimeout: 2000
																		   });
														failed_toast.open();
													}
												}
											});
										}
									}else{
										sys.loading(0);
										
										var success_toast = apps.toast.create({
															   icon: '<i class="material-icons">cloud_done</i>',
															   text: 'Details Successfully Saved',
															   position: 'center',
															   closeTimeout: 2000
														   });
										success_toast.open();
									}
								}else{
									sys.loading(0);
									
									var success_toast = apps.toast.create({
														   icon: '<i class="material-icons">cloud_done</i>',
														   text: 'Details Successfully Saved',
														   position: 'center',
														   closeTimeout: 2000
													   });
									success_toast.open();
								}
							}else{
								sys.loading(0);
								
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
							}
						}
					});
				}
			}
		});
		
		$('#alrl-btn').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr')
				}
			var post_data = "ACT=" + encodeURIComponent('alr_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					if(str==='204 No Response'){
						$('.popup-alrl .list ul').html('<p style="margin-left:10px;">No leave request found.</p>');
					}else{
						var inf = JSON.parse(str);
						
						if(inf['reply']==='200 OK'){
							var x ='', leave = inf['leave'];
							
							for(var i=0; i < leave.length; i++){
								x += '<li><a href="#" class="item-link item-content" data-num="' + i + '" data-pid="' + leave[i].primary_id + '" data-reason="' + leave[i].clock_location + '" data-status="' + leave[i].status + '" data-uid="' + leave[i].user_id + '">';
								x += '<div class="item-media"><i class="icon material-icons md-only' + (leave[i].status=='0' ? '' : (leave[i].status=='1' ? ' green' : ' red')) + '">' + (leave[i].status=='0' ? 'access_time' : (leave[i].status=='1' ? 'thumb_up_alt' : 'assistant_photo')) + '</i></div>'
								x += '<div class="item-inner"><div class="item-title">' + sys.unameToSname(leave[i].user_id) + '</div><div class="item-after">' + (leave[i].clock_in_out).substr(0,10) + '</div></div></a></li>';
							}
							$('.popup-alrl .alr_list ul').html(x);
						}else{
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}
					}
					sys.loading(0);
				}
			});
			
			var searchbar = apps.searchbar.create({
					el: '.popup-alrl .searchbar',
					searchContainer: '.popup-alrl .list.alr_list',
					searchIn: '.item-title, .item-after'
				});
		});
		
		$('.alr_list').on('click', 'a.item-link', function(){
			$('#alrd_date').val($(this).find('.item-after').text());
			$('#alrd_date').data('pid', $(this).data('pid'));
			$('#alrd_date').data('num', $(this).data('num'));
			$('#alrd_date').data('uid', $(this).data('uid'));
			$('#alrd_user').val($(this).find('.item-title').text());
			$('#alrd_reason').val($(this).data('reason'));
			var status = (($(this).data('status') == '1') ? 'OK' : (($(this).data('status') == '0') ? '' : $(this).data('status')));
			$('#alrd_status').val(status);
			
			apps.popover.open('.alrld-popover');
		});
		
		$('.alrd_ok').on('click', function(){
			var status = (($('#alrd_status').val().toLowerCase()=='ok') ? '1' : ((sys.isEmpty($('#alrd_status').val())) ? '0' : $('#alrd_status').val()));
			var DATA = {
						'pid' : $('#alrd_date').data('pid'),
						'usr' : STORAGE.getItem('usr'),
						'status' : status
					};
			var post_data = "ACT=" + encodeURIComponent('lrq_udt')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));

			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					
					if(str==='200 OK'){
						if(status != 0){
							var plyid = sys.uidToPyid($('#alrd_date').data('uid'));
						
							if(!sys.isEmpty(plyid)){
								var DATA = {
									'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
									'include_player_ids' : [plyid],
									'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
									'headings' : { 'en' : ((status==1) ? 'Leave Request Approved' : 'Leave Request Rejected')},
									'contents' : { 'en' : ('For date : ' + $('#alrd_date').val())},
									'data' : { 'sender' : usr, 'system' : 'lrq_udt', 'feedback' : ('lrs_' + $('#alrd_date').data('pid')) }
								};
										  
								$.ajax({
									type: 'POST',
									url: 'https://onesignal.com/api/v1/notifications',
									data: JSON.stringify(DATA),
									contentType: "application/json; charset=utf-8",
									dataType: "json",
									beforeSend: function(){
										sys.loading(1);
									},
									success: function(inf){
										if(!sys.isEmpty(inf['id'])){
											var x = '<a href="#" class="item-link item-content" data-num="' + $('#alrd_date').data('num') + '" data-pid="' + $('#alrd_date').data('pid') + '" data-reason="' + $('#alrd_reason').val() + '" data-status="' + status + '">';
												x += '<div class="item-media"><i class="icon material-icons md-only' + (status=='0' ? '' : (status=='1' ? ' green' : ' red')) + '">' + (status=='0' ? 'access_time' : (status=='1' ? 'thumb_up_alt' : 'assistant_photo')) + '</i></div>'
												x += '<div class="item-inner"><div class="item-title">' + $('#alrd_user').val() + '</div><div class="item-after">' + $('#alrd_date').val() + '</div></div></a>';
												
											$('.alr_list ul li:eq(' + $('#alrd_date').data('num') + ')').html(x);
											apps.popover.close('.alrld-popover');
											
											sys.loading(0);
											var success_toast = apps.toast.create({
																   icon: '<i class="material-icons">cloud_done</i>',
																   text: 'Details Successfully Saved',
																   position: 'center',
																   closeTimeout: 2000
															   });
											success_toast.open();
										}else{
											sys.loading(0);
											var failed_toast = apps.toast.create({
																   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																   text: 'Oooppss, error',
																   position: 'center',
																   closeTimeout: 2000
															   });
											failed_toast.open();
										}
									}
								});
							}
						}else{
							var x = '<a href="#" class="item-link item-content" data-num="' + $('#alrd_date').data('num') + '" data-pid="' + $('#alrd_date').data('pid') + '" data-reason="' + $('#alrd_reason').val() + '" data-status="' + status + '">';
								x += '<div class="item-media"><i class="icon material-icons md-only' + (status=='0' ? '' : (status=='1' ? ' green' : ' red')) + '">' + (status=='0' ? 'access_time' : (status=='1' ? 'thumb_up_alt' : 'assistant_photo')) + '</i></div>'
								x += '<div class="item-inner"><div class="item-title">' + $('#alrd_user').val() + '</div><div class="item-after">' + $('#alrd_date').val() + '</div></div></a>';
								
							$('.alr_list ul li:eq(' + $('#alrd_date').data('num') + ')').html(x);
							apps.popover.close('.alrld-popover');
							
							var success_toast = apps.toast.create({
												   icon: '<i class="material-icons">cloud_done</i>',
												   text: 'Details Successfully Saved',
												   position: 'center',
												   closeTimeout: 2000
											   });
							success_toast.open();
						}
					}else{
						var failed_toast = apps.toast.create({
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
		
		$('#audiop_slist .links-list a').on('click', function(){
			var url = 'https://app.wkventertainment.com/files/music/' + $(this).data('url'),
				x = '<audio src="' + url + '" controls="true" loop="true" autoplay="true"></audio>';
			
			$('#audiop_plyr div.item-inner').html(x);
			$('#audiop_plyr span').html('<strong>' + $(this).text() + '</strong>' + (($(this).data('url').indexOf('bensound') != -1) ? '&emsp;from Bensound.com' : ''));
		});
		
		$('select#ltcl_nme').on('change', function(){
			var tmp = $(this).val();
			
			if(tmp=='Wash' || tmp=='LT Beam' || tmp=='EF Beam' || tmp=='CN Beam'){
				$('#ltcl_ads').val('16');
			}else if(tmp=='PAR' || tmp=='S City'){
				$('#ltcl_ads').val('8');
			}else if(tmp=='City' || tmp=='Profile'){
				$('#ltcl_ads').val('3');
			}else if(tmp=='Gobo'){
				$('#ltcl_ads').val('20');
			}else if(tmp=='Blinder'){
				$('#ltcl_ads').val('12');
			}
		});
		
		$('button#ltcl_add').on('click', function(){
			var name = $('#ltcl_nme option:selected').val(),
				addr = parseInt($('#ltcl_ads').val()),
				qnty = parseInt($('#ltcl_qty').val());
			
			if(!sys.isEmpty(name) && $.isNumeric(addr) && $.isNumeric(qnty)){
				var tmp = '', tmp_add = parseInt($('#ltcl_spc').data('dmx'));
			
				for(var x=0; x<qnty; x++){
					var dmx = ('000' + tmp_add).slice(-3);
					
					tmp = '<span class="badge fix_index' + (x) + '">' + name + '<br/>[ ' + dmx + ' ]</span> ';
					tmp_add += addr;
					$('#ltcl_spc').data('dmx', tmp_add);
					
					$('#ltcl_spc').append(tmp);
					
					apps.tooltip.destroy(('.fix_index'+x));
					apps.tooltip.create({
						targetEl: ('.fix_index'+x),
						text: (x+1)
					});
				}
				
				$('#ltcl_nme').val('');
				$('#ltcl_ads').val('');
				$('#ltcl_qty').val('');
			}else{
				var failed_toast = apps.toast.create({
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
			var loc = $('iframe#gmap').data('loc'),
				tasks = $('#task_tl').data('inf');
			
			$('iframe#gmap').attr('src', ('https://embed.waze.com/iframe?zoom=16&lat=' + loc.split(',')[0] + '&lon=' + loc.split(',')[1] + '&pin=1'));
			sys.getTime();
			$('.popup-clock button.clock-in').addClass('disabled');
			
			if(!sys.isEmpty(tasks) && $('.popup-clock button.clock-out').hasClass('disabled')){
				for(var i=0; i<tasks.length; i++){
					if(tasks[i].venue.indexOf('#PID#') != -1){
						var wtime = (new Date(tasks[i].date.substr(0, 11) + tasks[i].time + ':00')).getTime();
						var ctime = (new Date($('#app-time').data('time'))).getTime();
						
						if((ctime >= (wtime - 7200000)) && (ctime <= (wtime + 1800000))){
							var venue = sys.pidToLoc(tasks[i].venue);
							
							if(sys.coordinateCheck(loc, venue.loc_point, venue.loc_range)){
								$('button.clock-in').data('loc', venue);
								$('.popup-clock button.clock-in').removeClass('disabled');
								break;
							}
						}
					}
				}
			}
		});
		
		$$('button.clock-in').on('click', function () {
			var loc = $(this).data('loc');
			apps.dialog.confirm(('Clock in to ' + loc.loc_name + '?'), 'Confirmation', function(){
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'loc' : $('iframe#gmap').data('loc'),
					'lname' : loc.loc_name
				};
				var post_data = "ACT=" + encodeURIComponent('clk_in')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						sys.loading(0);
						if(str=='200 OK'){
							STORAGE.setItem('clock_in', Date.now());
							
							var clockin_toast = apps.toast.create({
													icon: '<i class="material-icons">alarm_on</i>',
													text: 'Clocked In',
													position: 'center',
													closeTimeout: 2000
												});
							sys.clockToggle('in');
							clockin_toast.open();
						}else{
							var failed_toast = apps.toast.create({
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
			apps.dialog.confirm('Clock out?', 'Confirmation', function(){
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'loc' : $('iframe#gmap').data('loc')
				};
				var post_data = "ACT=" + encodeURIComponent('clk_out')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						sys.loading(0);
						if(str=='200 OK'){
							STORAGE.removeItem('clock_in');
							
							var clockout_toast = apps.toast.create({
													icon: '<i class="material-icons">alarm_off</i>',
													text: 'Clocked Out',
													position: 'center',
													closeTimeout: 2000
												});
							sys.clockToggle('out');
							clockout_toast.open();
						}else{
							var failed_toast = apps.toast.create({
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
		
		$('a.fab_move').on('click', function(){
			var floatBtn = $('.popup-event').find('.fab.fab-right-bottom');
			
			if(floatBtn.hasClass('floatLeft')){
				floatBtn.css('right', '15px');
				floatBtn.removeClass('floatLeft');
			}else{
				floatBtn.css('right', 'calc(100% - 71px)');
				floatBtn.addClass('floatLeft');
			}
		});
		
		$('a.leave_app').on('click', function(){
			apps.dialog.prompt('Reason :', 'Leave Request', function(reason){
				var date = $('.popup-event .event_list').data('date');
				apps.dialog.confirm(('Date : ' + date + '<br/>Reason : <strong>' + reason + '</strong>'), 'Confirmation of Submission', function () {
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'date' : date,
						'reason' : reason
					};
					var post_data = "ACT=" + encodeURIComponent('lrq_add')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							if(str==='200 OK'){
								var superUser = sys.pyid('super');
								
								if(!sys.isEmpty(superUser)){
									var DATA = {
										'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
										'include_player_ids': superUser,
										'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
										'headings' : { 'en' : ('Leave Request on ' + date)},
										'contents' : { 'en' : ('From : ' + $('#edpf_name').val())},
										'data' : { 'sender' : usr, 'system' : 'lrq_add', 'feedback' : ('lrq_') }
									};
											  
									$.ajax({
										type: 'POST',
										url: 'https://onesignal.com/api/v1/notifications',
										data: JSON.stringify(DATA),
										contentType: "application/json; charset=utf-8",
										dataType: "json",
										success: function(inf){
											if(!sys.isEmpty(inf['id'])){
												sys.loading(0);
												var success_toast = apps.toast.create({
																		icon: '<i class="material-icons">hearing</i>',
																		text: 'Leave request pending for approval.',
																		position: 'center',
																		closeTimeout: 2000
																	});
													success_toast.open();
											}else{
												sys.loading(0);
												var failed_toast = apps.toast.create({
																	   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																	   text: 'Oooppss, error',
																	   position: 'center',
																	   closeTimeout: 2000
																   });
												failed_toast.open();
											}
										}
									});
								}
							}else{
								sys.loading(0);
								var failed_toast = apps.toast.create({
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
		});
		
		$('a.evts_shr').on('click', function(){
			var inf = $('table.event_list').data('info');

			var share = '';
			
			if(inf.length == 0){
				share += 'No event.'
			}else{
				share = sys.toMonth(inf[0].date) + ' ' + sys.toDay(inf[0].date) + ' (' + sys.toWeek(inf[0].date) + ')\n\n';
				
				for(var i = 0; i < inf.length; i++){
					share += (i+1) + '. ' + (sys.isEmpty(inf[i].description) ? '' : (sys.shorten(inf[i].description) + ', ')) + (inf[i].venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf[i].venue).loc_name : inf[i].venue) + '.\n';
					share += '< *' + (sys.isEmpty(inf[i].crew) ? '-' : sys.unameToSname(inf[i].crew)) + '* >\n';
				}
			}

			if(typeof window.plugins != 'undefined'){
				window.plugins.socialsharing.share(share);
			}else{
				$('body').append('<textarea id="tempCopy"/></textarea>');
				$('body textarea#tempCopy').val(share).select();
				document.execCommand("copy");
				$('body textarea#tempCopy').remove();
			}
		});
		
		$('button.evts_ok').on('click', function(){
			var pic = $('#evts_ipic').val(),
				desc = $('#evts_idesc').val(),
				ld = $('#evts_ild').val(),
				date = $('.popup-event .event_list').data('date');
			
			if(!sys.isEmpty(pic)){
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'date' : date,
					'pic' : pic,
					'desc' : desc,
					'ld' : ld
				};
				var post_data = "ACT=" + encodeURIComponent('evd_add')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						var inf = JSON.parse(str);
				
						if(inf['reply']==='200 OK'){
							var num = $('.popup-event .event_list tbody tr').length;
							if(num == 0){
								var x = '<thead><tr><th class="label-cell"></th>'
									  + '<th class="label-cell">&emsp;PIC&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
									  + '<th class="label-cell">L/D</th>'
									  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Venue&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
									  + '<th class="label-cell">&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;Desc.&emsp;&emsp;&emsp;&emsp;&emsp;&emsp;</th>'
									  + '<th class="tablet-only">Band</th>'
									  + '<th class="label-cell">&emsp;&emsp;&emsp;Crew&emsp;&emsp;&emsp;</th>'
									  + '<th class="label-cell">&emsp;IN&emsp;&emsp;</th>'
									  + '<th class="label-cell">&emsp;OUT&emsp;&emsp;</th></tr></thead><tbody>';
								
								x += '<tr name="el1"><td class="label-cell"><span class="button button-fill" name="el1">1</span></td>';
								x += '<td class="tb-pic label-cell' + (parseInt($('body').data('user_level'))>=8 ? ' tb-not-paid' : '') + '">'+pic+'</td>';
								x += '<td class="tb-ld label-cell">'+(sys.ldToShort(ld))+'</td>';
								x += '<td class="tb-venue label-cell" data-pid="">-</td>';
								x += '<td class="tb-desc label-cell">'+((desc=='') ? '-' : desc)+'</td>';
								x += '<td class="tb-band tablet-only">-</td>';
								x += '<td class="tb-crew label-cell">-</td>';
								x += '<td class="tb-cin label-cell">-</td>';
								x += '<td class="tb-cout label-cell">-</td>';
								x += '</tr>';
								x += '</tbody>';
								$('.popup-event .event_list').html(x);
								
								$('table.event_list').data('info', inf[0]);
								$('tr[name="el1"]').data('info', inf[0]);
							}else{
								var nnum = parseInt($('.popup-event .event_list tbody tr:nth-child('+ num +')').attr('name').substr(2)) + 1;
								var x = '';
								
								x += '<tr name="el' + nnum + '"><td class="label-cell"><span class="button button-fill" name="el' + nnum + '">' + nnum + '</span></td>';
								x += '<td class="tb-pic label-cell' + (parseInt($('body').data('user_level'))>=8 ? ' tb-not-paid' : '') + '">'+pic+'</td>';
								x += '<td class="tb-ld label-cell">'+(sys.ldToShort(ld))+'</td>';
								x += '<td class="tb-venue label-cell" data-pid="">-</td>';
								x += '<td class="tb-desc label-cell">'+((desc=='') ? '-' : desc)+'</td>';
								x += '<td class="tb-band tablet-only">-</td>';
								x += '<td class="tb-crew label-cell">-</td>';
								x += '<td class="tb-cin label-cell">-</td>';
								x += '<td class="tb-cout label-cell">-</td>';
								x += '</tr>';
								
								$('.popup-event .event_list').append(x);
								
								var oinfo = $('table.event_list').data('info');
								oinfo[oinfo.length] = inf[0];
								
								$('table.event_list').data('info', oinfo);
								$('tr[name="el' + nnum + '"]').data('info', inf[0]);
							}
							
							$('.event_list span').on('click', function(){
								var x = '';
								var inf = $('tr[name="' + $(this).attr('name') + '"]').data('info');
								var trName = $(this).attr('name');
								
								if(parseInt($('body').data('user_level'))>=9){
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap"><input class="evtd_ld" type="text" autocomplete="off" value="' + ((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time&emsp;&emsp;&emsp;&emsp;<span class="evtd_sbta">&#9949;</span></div><div class="item-input-wrap"><input class="evtd_sbtm" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : (((inf.time).indexOf(', ') == -1) ? inf.time : (inf.time.split(', '))[0])) + '" data-val="' + ((inf.time==null) ? '' : inf.time) + '"><input class="evtd_sbtm1" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : (((inf.time).indexOf(', ') == -1) ? inf.time : (inf.time.split(', '))[1])) + '"><input class="evtd_sbtm2" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : (((inf.time).indexOf(', ') == -1) ? inf.time : (inf.time.split(', '))[2])) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap"><input class="evtd_venue" type="text" autocomplete="off" value="' + ((inf.venue==null) ? '' : (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue)) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap"><input class="evtd_desc" type="text" autocomplete="off" value="' + ((inf.description==null) ? '' : inf.description) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Remarks</div><div class="item-input-wrap"><input class="evtd_rmk" type="text" autocomplete="off" value="' + ((inf.remarks==null) ? '' : inf.remarks) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Price</div><div class="item-input-wrap"><input class="evtd_price" type="text" autocomplete="off" value="' + ((inf.price==null) ? '' : inf.price) + '"><label class="toggle toggle-init color-green evtd_paid"><input type="checkbox"' + (inf.paid=='1' ? ' checked' : '') + '><span class="toggle-icon"></span></label></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap"><input class="evtd_band" type="text" autocomplete="off" value="' + ((inf.band==null) ? '' : inf.band) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap"><input class="evtd_crew" type="text" autocomplete="off" value="' + ((inf.crew==null) ? '' : inf.crew) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap"><input class="evtd_cin" type="text" autocomplete="off" value="' + ((inf.car_in==null) ? '' : inf.car_in) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap"><input class="evtd_cout" type="text" autocomplete="off" value="' + ((inf.car_out==null) ? '' : inf.car_out) + '"></div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row">';
									x += '<button class="evtd_dlt button col button-fill" data-eid="' + inf.primary_id + '">Delete</button>';
									x += '<button class="evtd_cls button col button-fill" data-eid="' + inf.primary_id + '">Close</button>';
									x += '</div></div></div></li>';
								}else{
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap">' + ((inf.luncheon_dinner==null) ? '-' : inf.luncheon_dinner) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time</div><div class="item-input-wrap">' + ((inf.time==null) ? '-' : inf.time) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap">' + ((inf.venue==null) ? '-' : (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue)) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap">' + ((inf.description==null) ? '-' : inf.description) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Remarks</div><div class="item-input-wrap">' + ((inf.remarks==null) ? '-' : sys.commasToNextLine(inf.remarks, 'h')) + '</div></div></div></li>';
									if(parseInt($('body').data('user_level'))>=7){
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">price</div><div class="item-input-wrap">' + ((inf.price==null) ? '-' : inf.price) + '</div></div></div></li>';
									}
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap">' + ((inf.band==null) ? '-' : inf.band) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap">' + ((inf.crew==null) ? '-' : inf.crew) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap">' + ((inf.car_in==null) ? '-' : inf.car_in) + '</div></div></div></li>';
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap">' + ((inf.car_out==null) ? '-' : inf.car_out) + '</div></div></div></li>';
								}
								
								x = x.replace(/(?:\r\n|\r|\n)/g, '<br>');
								$('.details-popover ul').html(x);
								$('div.details-popover').data('info', inf);
								
								if(parseInt($('body').data('user_level'))>=9){
									$('.details-popover button.evtd_cls').data('trName', trName);
									$('.details-popover button.evtd_cls').on('click', function(){
										apps.popover.get('.details-popover').close()
									});
									$('.details-popover button.evtd_dlt').on('click', function(){
										var pid = $(this).data('eid');
										
										var DATA = {
												'usr' : STORAGE.getItem('usr'),
												'pid' : pid
											};
										var post_data = "ACT=" + encodeURIComponent('evd_dlt')
													  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
													  
										$.ajax({
											type: 'POST',
											url: 'https://app.wkventertainment.com/',
											data: post_data,
											beforeSend: function(){
												sys.loading(1);
											},
											success: function(str){
												sys.loading(0);
												
												if(str==='200 OK'){
													$('tr[name="' + trName + '"]').remove();
													$('.popover-backdrop')[0].click();
													$('.fab.evtd_shr').css('display', 'none');
													
													var success_toast = apps.toast.create({
																		   icon: '<i class="material-icons">delete</i>',
																		   text: 'Details Successfully Deleted',
																		   position: 'center',
																		   closeTimeout: 2000
																	   });
													success_toast.open();
												}else{
													var failed_toast = apps.toast.create({
																		   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																		   text: 'Oooppss, error',
																		   position: 'center',
																		   closeTimeout: 2000
																	   });
													failed_toast.open();
													
													navigator.vibrate(100);
												}
											}
										});
									});
								}
								
								apps.popover.open('.details-popover');
								
								$('span.evtd_sbta').on('click', function(){
									if($('.evtd_sbtm1').css('opacity')=='1'){
										$('.evtd_sbtm1').css('opacity', '0');
										$('.evtd_sbtm2').css('opacity', '0');
										
										setTimeout(function(){
											$('.evtd_sbtm1').css('display', 'none');
											$('.evtd_sbtm2').css('display', 'none');
										}, 1100);
									}else{
										$('.evtd_sbtm1').css('display', 'inline-block');
										$('.evtd_sbtm2').css('display', 'inline-block');
										
										setTimeout(function(){
											$('.evtd_sbtm1').css('opacity', '1');
											$('.evtd_sbtm2').css('opacity', '1');
										}, 100);
									}
								});
							});
							
							var DATA = {
								'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
								'include_player_ids': ['d01c1bb0-5de1-4a4a-819f-66e3bacdd8ff'],
								'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
								'headings' : { 'en' : 'Whatsapp Message Server check required.'},
								'contents' : { 'en' : ('New event added by : ' + usr)},
								'data' : { 'sender' : usr, 'system' : 'evd_add' }
							};
									  
							$.ajax({
								type: 'POST',
								url: 'https://onesignal.com/api/v1/notifications',
								data: JSON.stringify(DATA),
								contentType: "application/json; charset=utf-8",
								dataType: "json",
								success: function(inf){
									if(!sys.isEmpty(inf['id'])){
										sys.loading(0);
										var success_toast = apps.toast.create({
															   icon: '<i class="material-icons">cloud_done</i>',
															   text: 'Details Successfully Added',
															   position: 'center',
															   closeTimeout: 2000
														   });
										success_toast.open();
										
										navigator.vibrate(100);
									}else{
										sys.loading(0);
										var failed_toast = apps.toast.create({
															   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
															   text: 'Oooppss, error',
															   position: 'center',
															   closeTimeout: 2000
														   });
										failed_toast.open();
									}
								}
							});
							
							$('.evts_input button.fab-close')[0].click();
							$('#evts_ipic').val(''),
							$('#evts_idesc').val(''),
							$('#evts_ild').val('Dinner');
						}else{
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
					}
				});
			}else{
				navigator.vibrate(100);
			}
		});
		
		$('a.evtd_shr').on('click', function(e){
			var inf = $('.details-popover').data('info');
			var share = sys.toMonth(inf.date) + ' ' + sys.toDay(inf.date) + ' (' + sys.toWeek(inf.date) + ')\n'
					  + (sys.isEmpty(inf.description) ? 'Sound \n2 Top 2 Mon' : (inf.description).replace("  ", "\n")) + '\n'
					  + 'Wedding Dinner \n' 
					  + 'Venue : ' + (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue) + '\n'
					  + 'PIC : ' + inf.pic + '\n'
					  + (sys.isEmpty(inf.band) ? '' : (inf.band + '\n'))
					  + 'Setup : 3pm\n' 
					  + 'Sound Check : 5pm\n\n'
					  + (sys.isEmpty(inf.car_in) ? '' : ('Use : ' + inf.car_in + '\n'))
					  + (sys.isEmpty(inf.remarks) ? '' : ('Remarks : ' + sys.commasToNextLine(inf.remarks, 'n') + '\n'));
					  
			if(typeof window.plugins != 'undefined'){
				window.plugins.socialsharing.share(share);
			}else{
				$('body').append('<textarea id="tempCopy"/></textarea>');
				$('body textarea#tempCopy').val(share).select();
				document.execCommand("copy");
				$('body textarea#tempCopy').remove();
			}
		});
		
		$('.popover-backdrop').on('click', function(e){
			if($('.details-popover').css('display')=='block'){
				if(this === e.target){
					if((parseInt($('body').data('user_level')) >= 9) && ($('.details-popover').data('lock') == 0)){
						var trName = $('.details-popover button.evtd_cls').data('trName'),
							inf = $('div.details-popover').data('info'),
							pid = $('.details-popover button.evtd_cls').data('eid'),
							ld = $('input.evtd_ld').val(),
							time = $('input.evtd_sbtm').data('val'),
							venue = sys.locToPid($('input.evtd_venue').val()),
							desc = $('input.evtd_desc').val(),
							price = $('input.evtd_price').val(),
							paid = $('.evtd_paid input')[0].checked,
							band = $('input.evtd_band').val(),
							crew = (($('input.evtd_crew').data('uname') == null) ? '' : $('input.evtd_crew').data('uname')),
							st = ((sys.isEmpty($('input.evtd_crew').data('st'))) ? '' : $('input.evtd_crew').data('st')),
							ob = ((sys.isEmpty($('input.evtd_crew').data('ob'))) ? '' : $('input.evtd_crew').data('ob')),
							xx = ((sys.isEmpty($('input.evtd_crew').data('xx'))) ? '' : $('input.evtd_crew').data('xx')),
							cin = ($('input.evtd_cin').val() == $('input.evtd_cin').data('val')) ? $('input.evtd_cin').data('ori') : $('input.evtd_cin').val(),
							cout = ($('input.evtd_cout').val() == $('input.evtd_cout').data('val')) ? $('input.evtd_cout').data('ori') : $('input.evtd_cout').val(),
							rmk = $('input.evtd_rmk').val();
						
						var DATA = {
							'usr' : STORAGE.getItem('usr'),
							'pid' : pid,
							'ld' : ld,
							'time' : time,
							'venue' : venue,
							'desc' : desc,
							'price' : price,
							'paid' : paid,
							'band' : band,
							'crew' : crew,
							'crew_st' : st,
							'crew_ob' : ob,
							'crew_xx' : xx,
							'cin' : cin,
							'cout' : cout,
							'rmk' : rmk
						};
						var post_data = "ACT=" + encodeURIComponent('evd_udt')
									  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								if(str==='200 OK'){
									inf.luncheon_dinner = ((ld == '') ? 'Dinner' : ld);
									inf.time = ((time == '') ? null : time);
									inf.venue = ((venue == '') ? null : venue);
									inf.description = ((desc == '') ? null : desc);
									inf.price = ((price == '') ? null : price);
									inf.paid = paid;
									inf.band = ((band == '') ? null : band);
									inf.crew = ((crew == '') ? null : crew);
									inf.crew_st = ((st == '') ? null : st);
									inf.crew_ob = ((ob == '') ? null : ob);
									inf.crew_xx = ((xx == '') ? null : xx);
									inf.car_in = ((cin == '') ? null : cin);
									inf.car_out = ((cout == '') ? null : cout);
									inf.remarks = ((rmk == '') ? null : rmk);
									
									$('tr[name="' + trName + '"]').data('info', inf);
									$('div.details-popover').data('info', inf);
									
									if(parseInt($('body').data('user_level'))>=8 && ((sys.ldToShort(ld) != 'ST') && sys.ldToShort(ld) != 'RH' && sys.ldToShort(ld) != 'XX')){
										if(paid){
											$('tr[name="' + trName + '"] td.tb-pic').removeClass('tb-not-paid');
											$('tr[name="' + trName + '"] td.tb-pic').addClass('tb-paid');
										}else{
											$('tr[name="' + trName + '"] td.tb-pic').removeClass('tb-paid');
											$('tr[name="' + trName + '"] td.tb-pic').addClass('tb-not-paid');
										}
									}
									$('tr[name="' + trName + '"] td.tb-ld').text((sys.ldToShort(ld)));
									$('tr[name="' + trName + '"] td.tb-venue').text((venue == '' ? '-' : (venue.indexOf('#PID#') != -1 ? sys.pidToLoc(venue).loc_name : venue)));
									$('tr[name="' + trName + '"] td.tb-venue').data('pid', venue);
									$('tr[name="' + trName + '"] td.tb-desc').text((desc == '' ? '-' : desc));
									$('tr[name="' + trName + '"] td.tb-band').text((band == '' ? '-' : band));
									$('tr[name="' + trName + '"] td.tb-crew').text((crew == '' ? '-' : sys.unameToSname(crew)));
									$('tr[name="' + trName + '"] td.tb-cin').html((cin == '' ? '-' : sys.carToTcar(cin)));
									$('tr[name="' + trName + '"] td.tb-cout').html((cout == '' ? '-' : sys.carToTcar(cout)));
									
									$('.fab.evtd_shr').css('display', 'none');
									
									if((($('.details-popover').data('date') - ((new Date()).getTime())) < 172800000) && !sys.isEmpty(inf.crew)){
										if((md5(ld+time+venue+desc+band+crew+st+ob+xx+cin+cout+rmk)) != $('.details-popover').data('md5')){
											var rcrew = ((inf.crew).split(',')), receivers = [];
											for(var i=0; i < rcrew.length; i++){
												rcrew[i] = sys.uidToPyid(rcrew[i]);
											}
											receivers = rcrew.filter(function(str){
												return (!sys.isEmpty(str))
											});
											
											if(!sys.isEmpty(receivers)){
												var DATA = {
														'app_id' : '1e0f19a6-8d77-404f-9006-c9d9f381fe59',
														'include_player_ids' : receivers,
														'template_id': '7052a1cb-7d5a-46cd-bacd-76498a49254f',
														'collapse_id' : ('evd_' + pid),
														'headings' : { 'en': ('Event details updated for ' + $('.details-popover').data('title'))},
														'contents' : { 'en': 'Kindly double check your latest schedule. :)'},
														'data' : { 'sender': usr, 'system' : 'evd_udt', 'feedback' : ('evd_' + pid)}
													};
															  
												$.ajax({
													type: 'POST',
													url: 'https://onesignal.com/api/v1/notifications',
													data: JSON.stringify(DATA),
													contentType: "application/json; charset=utf-8",
													dataType: "json",
													success: function(inf){
														if(!sys.isEmpty(inf['id'])){
															sys.loading(0);
															
															var success_toast = apps.toast.create({
																				   icon: '<i class="material-icons">cloud_done</i>',
																				   text: 'Details Successfully Saved',
																				   position: 'center',
																				   closeTimeout: 2000
																			   });
															success_toast.open();
															
															navigator.vibrate(100);
														}else{
															sys.loading(0);
															
															var failed_toast = apps.toast.create({
																				   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
																				   text: 'Oooppss, error',
																				   position: 'center',
																				   closeTimeout: 2000
																			   });
															failed_toast.open();
														}
													}
												});
											}else{
												sys.loading(0);
												
												var success_toast = apps.toast.create({
																	   icon: '<i class="material-icons">cloud_done</i>',
																	   text: 'Details Successfully Saved',
																	   position: 'center',
																	   closeTimeout: 2000
																   });
												success_toast.open();
												
												navigator.vibrate(100);
											}
										}else{
											sys.loading(0);
											
											var success_toast = apps.toast.create({
																   icon: '<i class="material-icons">cloud_done</i>',
																   text: 'Details Successfully Saved',
																   position: 'center',
																   closeTimeout: 2000
															   });
											success_toast.open();
											
											navigator.vibrate(100);
										}
									}else{
										sys.loading(0);
										
										var success_toast = apps.toast.create({
															   icon: '<i class="material-icons">cloud_done</i>',
															   text: 'Details Successfully Saved',
															   position: 'center',
															   closeTimeout: 2000
														   });
										success_toast.open();
										
										navigator.vibrate(100);
									}
								}else{
									sys.loading(0);
									
									var failed_toast = apps.toast.create({
														   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
														   text: 'Oooppss, error',
														   position: 'center',
														   closeTimeout: 2000
													   });
									failed_toast.open();
									
									navigator.vibrate(100);
								}
							}
						});
					}
				}
			}
		});
		
		var swiper = apps.swiper.create('.swiper-container', {
			speed: 100,
			spaceBetween: 50
		});
		
		$('.evts_next').on('click', function(){
			apps.popover.close('.details-popover');
			
			var day = new Date((calendarInline.getValue()[0].getTime())+86400000);
			calendarInline.setValue([day]);
			
			sys.dateClick(day);
		});
		
		$('.evts_prev').on('click', function(){
			apps.popover.close('.details-popover');
			
			var day = new Date((calendarInline.getValue()[0].getTime())-86400000);
			calendarInline.setValue([day]);
			
			sys.dateClick(day);
		});
		
		$('.event_list').on('click', '.tb-cin span, .tb-cout span', function(){
			if(parseInt($('body').data('user_level')) > 7){
				var inf = $(this).closest('tr').data('info'),
					trName = $(this).closest('tr').attr('name'),
					carIn = $(this).closest('td').hasClass('tb-cin'),
					text = $(this).text().split('\xa0')[0];
					
				apps.dialog.prompt('Sequence for ' + text + '?', function(num){
					var pid = inf.primary_id,
						cin = inf.car_in,
						cout = inf.car_out,
						pattern = new RegExp(/\^F(.*?)\^B/),
						cars = [],
						x = '';
					
					if(carIn){
						if(cin.indexOf(', ')!=-1){
							cars = cin.split(', ');
						}else{
							cars = [cin];
						}
						
						for(var i=0; i<cars.length; i++){
							if(cars[i].indexOf(text)!=-1){
								if(num!=0){
									if(cars[i].indexOf('^F')!=-1){
										cars[i] = cars[i].replace((pattern.exec(cars[i])[0]), ('^F' + num + '^B'));
									}else{
										cars[i] = (text + ('^F' + num + '^B'));
									}
								}else{
									if(cars[i].indexOf('^F')!=-1){
										cars[i] = cars[i].replace((pattern.exec(cars[i])[0]), '');
									}
								}
							}
							x += (((i != 0 ) ? ', ' : '') + (cars[i]));
						}
						
						cin = x;
					}else{
						if(cout.indexOf(', ')!=-1){
							cars = cout.split(', ');
						}else{
							cars = [cout];
						}
						
						for(var i=0; i<cars.length; i++){
							if(cars[i].indexOf(text)!=-1){
								if(num!=0){
									if(cars[i].indexOf('^F')!=-1){
										cars[i] = cars[i].replace((pattern.exec(cars[i])[0]), ('^F' + num + '^B'));
									}else{
										cars[i] = (text + ('^F' + num + '^B'));
									}
								}else{
									if(cars[i].indexOf('^F')!=-1){
										cars[i] = cars[i].replace((pattern.exec(cars[i])[0]), '');
									}
								}
							}
							x += (((i != 0 ) ? ', ' : '') + (cars[i]));
						}
						
						cout = x;
					}
					
					var DATA = {
						'usr' : STORAGE.getItem('usr'),
						'pid' : pid,
						'cin' : cin,
						'cout' : cout
					};
					var post_data = "ACT=" + encodeURIComponent('evc_udt')
								  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
								  
					$.ajax({
						type: 'POST',
						url: 'https://app.wkventertainment.com/',
						data: post_data,
						beforeSend: function(){
							sys.loading(1);
						},
						success: function(str){
							sys.loading(0);
							
							if(str==='200 OK'){
								inf.car_in = ((cin == '') ? null : cin);
								inf.car_out = ((cout == '') ? null : cout);
								
								$('tr[name="' + trName + '"]').data('info', inf);
								$('tr[name="' + trName + '"] td.tb-cin').html((cin == '' ? '-' : sys.carToTcar(cin)));
								$('tr[name="' + trName + '"] td.tb-cout').html((cout == '' ? '-' : sys.carToTcar(cout)));
								
								var success_toast = apps.toast.create({
													   icon: '<i class="material-icons">cloud_done</i>',
													   text: 'Details Successfully Saved',
													   position: 'center',
													   closeTimeout: 2000
												   });
								success_toast.open();
							}else{
								var failed_toast = apps.toast.create({
													   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
													   text: 'Oooppss, error',
													   position: 'center',
													   closeTimeout: 2000
												   });
								failed_toast.open();
								
								navigator.vibrate(100);
							}
						}
					});
				});
			}
		});
		
		$('.details-popover').on('keyup', 'input.evtd_ld', function(){
			if(($(this).val()).toLowerCase()=='setup' || ($(this).val()).toLowerCase()=='rehearsal' || ($(this).val()).toLowerCase()=='dismantle'){
				$('.evtd_price').val(0);
			}
		});
		
		$('button#edpf_chg').on('click', function(){
			var name = $('#edpf_name').val(),
				tel = $('#edpf_tel').val(),
				email = $('#edpf_eml').val();
				
			if(sys.isEmpty(name) || sys.isEmpty(tel) || sys.isEmpty(email)){
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Error, field is empty',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
				
				navigator.vibrate(100);
			}else if(!sys.isEmail(email)){
				var failed_toast = apps.toast.create({
									   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
									   text: 'Error, email is not valid',
									   position: 'center',
									   closeTimeout: 2000
								   });
				failed_toast.open();
				
				navigator.vibrate(100);
			}else{
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'name' : name,
					'tel' : tel,
					'email' : email
				};
				var post_data = "ACT=" + encodeURIComponent('chg_prf')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
							  
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						sys.loading(0);
						
						if(str==='200 OK'){
							var success_toast = apps.toast.create({
												   icon: '<i class="material-icons">playlist_add_check</i>',
												   text: 'Profile Successfully Save',
												   position: 'center',
												   closeTimeout: 2000
											   });
							success_toast.open();
							
							$('span.ncf-name').text(name.toLowerCase());
							$('span.ncf-name').html($('span.ncf-name').text().replace(/ /g, '&nbsp;&nbsp;&nbsp;'));
							$('span.ncf-tel').text(tel.toLowerCase());
							$('span.ncf-email').text(email.toLowerCase());
							
							$('span.ncf-name').data('value', name);
							$('span.ncf-tel').data('value', tel);
							$('span.ncf-email').data('value', (email.toLowerCase()));
						}else{
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
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
		
		$('#lvapv-btn').on('click', function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr')
				}
			var post_data = "ACT=" + encodeURIComponent('lrq_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					if(str==='204 No Response'){
						$('.popup-stla .list ul').html('<p style="margin-left:10px;">No leave request found.</p>');
					}else{
						var inf = JSON.parse(str);
						
						if(inf['reply']==='200 OK'){
							var x ='', leave = inf['leave'];
							
							for(var i=0; i < leave.length; i++){
								x += '<li><a href="#" class="item-link item-content" data-reason="' + leave[i].clock_location + '" data-status="' + leave[i].status + '">';
								x += '<div class="item-media"><i class="icon material-icons md-only' + (leave[i].status=='0' ? '' : (leave[i].status=='1' ? ' green' : ' red')) + '">' + (leave[i].status=='0' ? 'access_time' : (leave[i].status=='1' ? 'thumb_up_alt' : 'assistant_photo')) + '</i></div>'
								x += '<div class="item-inner"><div class="item-title">' + (leave[i].clock_in_out).substr(0,10) + '</div></div></a></li>';
							}
							$('.popup-stla .list ul').html(x);
						}else{
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'Oooppss, error',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
							
							navigator.vibrate(100);
						}
					}
					sys.loading(0);
				}
			});
		});
		
		$('.popup-stla .list ul').on('click', 'a', function(){
			var x = '';
			x += 'Status : <strong>' + ($(this).data('status')=='0' ? 'Pending' : ($(this).data('status')=='1' ? 'Approved' : $(this).data('status'))) + '</strong><br/><br/>';
			x += 'Date : ' + $(this).find('.item-title').text() + '<br/>';
			x += 'Reason : ' + $(this).data('reason');
			apps.dialog.alert(x, '');
		});
		
		$('.btn-stht').on('click', function(){
			if(!$(this).hasClass('button-active')){
				$('.btn-strl').removeClass('button-active');
				$('.btn-stht').addClass('button-active');
				$('.list-strl').css('display', 'none');
				$('.list-stht').css('display', 'block');
			}
		});
		
		$('.btn-strl').on('click', function(){
			if(!$(this).hasClass('button-active')){
				$('.btn-stht').removeClass('button-active');
				$('.btn-strl').addClass('button-active');
				$('.list-stht').css('display', 'none');
				$('.list-strl').css('display', 'block');
			}
		});
		
		$('#wkhs-btn').on('click', function(){
			var wcrew = STORAGE.getItem('usr'),
				DATA = {
					'usr' : STORAGE.getItem('usr')
				}
			var post_data = "ACT=" + encodeURIComponent('whs_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			$.ajax({
				type: 'POST',
				url: 'https://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
					
					if(inf['reply']==='200 OK'){
						var match = false, x = '', total = 0, cday = '', num = 0;
						
						for(var i = 0; i < inf['work'].length; i++){
							if(!sys.isEmpty(inf['work'][i].crew)){
								if(inf['work'][i].crew.indexOf(',') != -1){
									var many = inf['work'][i].crew.split(',');
									
									for(var j = 0; j < many.length; j++){
										if(many[j] == wcrew){
											x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="tt col-10" data-pid="' + inf['work'][i].primary_id + '">' + (num+1) + '</div><div class="col-20">' + (inf['work'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['work'][i].venue).loc_name) ? inf['work'][i].venue : (sys.pidToLoc(inf['work'][i].venue).loc_name)) + '</div><div class="col-15 tt noselect" data-rmk="' + (sys.isEmpty(inf['work'][i].remarks) ? inf['work'][i].description : inf['work'][i].remarks) + '"><i class="material-icons">info</i></div></div></div></li>';
											if(cday != ((inf['work'][i].date).substr(0,10))){
												total++;
											}
											num++;
											match = true;
											cday = (inf['work'][i].date).substr(0,10);
											break;
										}
									}
								}else{
									if(inf['work'][i].crew == wcrew){
										x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="tt col-10" data-pid="' + inf['work'][i].primary_id + '">' + (num+1) + '</div><div class="col-20">' + (inf['work'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['work'][i].venue).loc_name) ? inf['work'][i].venue : (sys.pidToLoc(inf['work'][i].venue).loc_name)) + '</div><div class="col-15 tt noselect" data-rmk="' + (sys.isEmpty(inf['work'][i].remarks) ? inf['work'][i].description : inf['work'][i].remarks) + '"><i class="material-icons">info</i></div></div></div></li>';
										if(cday != ((inf['work'][i].date).substr(0,10))){
											total++;
										}
										num++;
										match = true;
										cday = (inf['work'][i].date).substr(0,10);
									}
								}
							}
						}
						
						if(match){
							$('.popup-stht .list.list-stht ul').html(x);
							
							$('.popup-stht .list.list-stht ul .tt').each(function(){
								apps.tooltip.create({
									targetEl: $(this),
									text: sys.commasToNextLine($(this).data('rmk'), 'h')
								});
							});
						}else{
							$('.popup-stht .list.list-stht ul').html('<li class="item-content"><div class="item-inner">No history found.</div></li>');
							var failed_toast = apps.toast.create({
												   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
												   text: 'No report found.',
												   position: 'center',
												   closeTimeout: 2000
											   });
							failed_toast.open();
						}
						
						var leave = {};
		
						leave['bfw'] = 0;
						leave['wrk'] = 0;
						leave['cpl'] = 0;
						leave['mcl'] = 0;
						leave['pbh'] = 0;
						leave['scl'] = 0;
						leave['tcpl'] = 3;
						leave['tmcl'] = 14;
						leave['twrk'] = sys.getDayNum(new Date());
						leave['odl'] = sys.getWeekNum(new Date());
						
						if(STORAGE.getItem('level')>=8){
							leave['tanl'] = 14;
						}else{
							leave['tanl'] = 10;
						}
						
						switch(STORAGE.getItem('usr')){
							case 'aiman':
								leave['bfw'] = 2;
								break;
							case 'gx':
								leave['bfw'] = 9.5;
								break;
							case 'huizai':
								leave['bfw'] = 22;
								break;
							case 'yiling':
								leave['bfw'] = 11;
								break;
							case 'yokekei':
								leave['bfw'] = 9;
								break;
						}
						
						var DATA = {
							'usr' : STORAGE.getItem('usr'),
							'start' : STORAGE.getItem('created'),
							'date' : new Date().toDateString()
						};
						var post_data = "ACT=" + encodeURIComponent('lvn_chk')
									  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						
						$.ajax({
							type: 'POST',
							url: 'https://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								var inf = JSON.parse(str);
									
								if(inf['reply']==='200 OK'){
									if(inf['work']){
										var sameAs = '';
										
										for(var i=0; i<inf['work'].length; i++){
											var allCrew = (inf['work'][i].crew).split(',');
											
											if((sameAs != inf['work'][i].date) && (allCrew.indexOf(STORAGE.getItem('usr')) != -1)){
												sameAs = inf['work'][i].date;
												leave['wrk']++;
											}
										}
									}
									
									if(inf['leave']){
										for(var i=0; i<inf['leave'].length; i++){
											if(inf['leave'][i].clock_action == 'PBH'){
												leave['pbh']++;
											}else if(inf['leave'][i].clock_action == 'MCL'){
												leave['mcl']++;
											}else if(inf['leave'][i].clock_action == 'SCL'){
												leave['scl']++;
											}else if(inf['leave'][i].clock_action == 'CPL'){
												leave['cpl']++;
											}
										}
									}
									
									$('.rl-tanl').text(leave.tanl);
									$('.rl-tmcl').text(leave.tmcl);
									$('.rl-mcl').text((leave.tmcl - leave.mcl));
									$('.rl-tcpl').text(leave.tcpl);
									$('.rl-cpl').text((leave.tcpl - leave.cpl));
									
									var work = (leave.twrk - leave.odl - leave.pbh - leave.mcl - leave.scl - leave.cpl - leave.wrk - leave.bfw);
									
									if(work>0){
										if(work >= leave.tanl){
											$('.rl-ofd').text(0);
											$('.rl-anl').text((work - leave.tanl));
										}else{
											$('.rl-anl').text((leave.tanl - work));
											$('.rl-ofd').text(0);
										}
									}else{
										$('.rl-anl').text(leave.tanl);
										$('.rl-ofd').text((work * (-1)));
									}
									
									$('.popup-stht .list-strl div.strl-tl').html('');
									var targetDay = new Date(sys.dateToString(new Date(), 'yyyy-mm-dd')),
										x = '<div class="timeline">';
									
									for(var i=0; i<leave.twrk; i++){
										var diff = (i * 86400000);
										var today = sys.dateToString(new Date((targetDay.getTime() - diff)), 'yyyy-mm-dd'),
											noWork = true,
											creditDebit = false,
											y = '';
										
										y += '<div class="timeline-item">';
										y += '<div class="timeline-item-date">' + today.substr(8,2) + ' <small>' + sys.toMonth(today) + '</small></div>';
										y += '<div class="timeline-item-divider"></div>';
										y += '<div class="timeline-item-content">';
										
										if(new Date(today).getDay() == 1){
											y += '<div class="timeline-item-inner d-credit"><strong>+ 1</strong>&emsp;Off Day</div>';
											creditDebit = true;
										}
										
										if(inf['leave']){
											for(var j=0; j<inf['leave'].length; j++){
												if(inf['leave'][j].clock_in_out.substr(0,10) == today){
													switch(inf['leave'][j].clock_action){
														case 'PBH':
															y += '<div class="timeline-item-inner d-credit"><strong>+ 1</strong>&emsp;Off Day [<small><strong>'+inf['leave'][j].clock_location+'</strong></small>]</div>';
															creditDebit = true;
															break;
														case 'MCL':
															y += '<div class="timeline-item-inner d-debit"><strong>- 1</strong>&emsp;Sick Leave</div>';
															y += '<div class="timeline-item-inner d-credit"><strong>+ 1</strong>&emsp;Off Day [<small><strong>Convert from Sick Leave</strong></small>]</div>';
															creditDebit = true;
															break;
														case 'CPL':
															y += '<div class="timeline-item-inner d-debit"><strong>- 1</strong>&emsp;Compassionate Leave</div>';
															y += '<div class="timeline-item-inner d-credit"><strong>+ 1</strong>&emsp;Off Day [<small><strong>Convert from Compassionate Leave</strong></small>]</div>';
															creditDebit = true;
															break;
														case 'SCL':
															y += '<div class="timeline-item-inner d-credit"><strong>+ 1</strong>&emsp;Off Day [<small><strong>'+inf['leave'][j].clock_location+'</strong></small>]</div>';
															creditDebit = true;
															break;
													}
												}
											}
										}
										
										for(var j=0; j<inf['work'].length; j++){
											if(inf['work'][j].date.substr(0,10) == today){
												var allCrew = (inf['work'][j].crew).split(',');
												
												if(allCrew.indexOf(STORAGE.getItem('usr')) != -1){
													noWork = false;
													break;
												}
											}
										}
										
										if(noWork){
											y += '<div class="timeline-item-inner d-debit"><strong>- 1</strong>&emsp;Off Day</div>';
											creditDebit = true;
										}
										
										y += '</div></div>';
										
										if(creditDebit){
											x += y;
										}
									}
									
									if(leave['bfw']>0){
										x += '<div class="timeline-item">';
										x += '<div class="timeline-item-date">' + STORAGE.getItem('created').substr(8,2) + ' <small>' + sys.toMonth(STORAGE.getItem('created').substr(0,10)) + '</small></div>';
										x += '<div class="timeline-item-divider"></div>';
										x += '<div class="timeline-item-content">';
										x += '<div class="timeline-item-inner d-credit"><strong>+ ' + leave['bfw'] + '</strong>&emsp;Off Day [<small><strong>Brought forward</strong></small>]</div>';
										x += '</div></div>';
									}
										
									x += '</div>';
									
									$('.popup-stht .list-strl div.strl-tl').html(x);
									
									sys.loading(0);
								}
							}
						});
					}else if(inf['reply']==='204 No Response'){
						$('.popup-stht .list.list-stht ul').html('<li class="item-content"><div class="item-inner">No history found.</div></li>');
						var failed_toast = apps.toast.create({
											   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
											   text: 'No report found.',
											   position: 'center',
											   closeTimeout: 2000
										   });
						failed_toast.open();
						sys.loading(0);
					}else{
						sys.loading(0);
						var failed_toast = apps.toast.create({
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
		
		$('.popup-stht .list.list-stht ul').on('click', 'a', function(){
			var x = '';
			
			x += '<span class="dialog-label">In</span>: ' + $(this).data('in') + '<br/>';
			x += '<span class="dialog-label">Out</span>: ' + $(this).data('out') + '<br/>';
			x += 'Duration : ' + $(this).find('.item-after').text() + '<br/><br/>';
			x += '<strong>' + $(this).data('venue') + '</strong><br/>';
			x += '<iframe width="100%" height="250" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=' + $(this).data('location') + '&zoom=17"> </iframe>';
			
			apps.dialog.alert(x, '');
		});
	}
	
	DATA = {
		'usr' : usr,
		'pwd' : pwd,
		'version' : APP_VERSION
	};
	
	post_data = "ACT=" + encodeURIComponent('ssn_chk')
			  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
	
	$.ajax({
		type: 'POST',
		url: 'https://app.wkventertainment.com/',
		data: post_data,
		timeout: 20000,
		error: function(){
			sys.loading(0);
			apps.loginScreen.open('#error');
		},
		success: function(str){
			var inf = JSON.parse(str);
			sys.getLocation();
			
			if(inf['new']=='1'){
				$('#npr .list').css('opacity', '0');
				
				setTimeout(function(){
					var success_toast = apps.toast.create({
									   text: '<span style="font-size:13px;">Welcome to WKV Application</span>',
									   position: 'center',
									   closeTimeout: 2700
								   });
					success_toast.open();
				}, 1500);
				
				setTimeout(function(){
					var success_toast = apps.toast.create({
									   text: 'Before proceed,',
									   position: 'center',
									   closeTimeout: 2300
								   });
					success_toast.open();
				}, 4500);
				
				setTimeout(function(){
					var success_toast = apps.toast.create({
									   text: '<span style="font-size:12px;">Kindly fill up the following details.</span>',
									   position: 'center',
									   closeTimeout: 3200
								   });
					success_toast.open();
				}, 7000);
				setTimeout(function(){ $('#npr .list').css('opacity', '1'); }, 10500);
				
				$('#npr input[name="npr_con"]').val(inf['contact']);
				$('#npr input[name="npr_con"]').data('uid', inf['uid']);
				$('#npr input[name="npr_dnm"]').val(inf['sname']);
				$('#npr input[name="npr_cpn"]').val(inf['pos1']);
				
				var fad = '';
				
				if(inf['pos2']){
					fad = inf['pos2'].split('**');
				}
				
				$('#npr input[name="npr_add1"]').val(fad[0]);
				$('#npr input[name="npr_add2"]').val(fad[1]);
				$('#npr input[name="npr_add3"]').val(fad[2]);
				
				$('#npr input[name="npr_eml"]').val(inf['email']);
				
				apps.loginScreen.open('#npr');
			}else if(inf['new']=='-1' && STORAGE.getItem('reset') == 'TRUE'){
				$('#rpw input[name="rpw_pw1"]').data('uid', inf['uid']);
				
				apps.loginScreen.open('#rpw');
			}
			
			STORAGE.setItem('level', inf['level']);
			STORAGE.setItem('comp', inf['cid']);
			STORAGE.setItem('created', inf['created']);
			
			$('body').data('user_level', inf['level']);
			$('body').data('crew', inf['status']);
			$('body').data('loc', inf['location']);
			$('body').data('car', inf['car']);
			$('body').data('inv', inf['inventory']);
			
			if(inf['clocked']=='1'){
				STORAGE.setItem('clock_in', (new Date(inf['time']).getTime()));
				sys.clockToggle('in');
			}else{
				STORAGE.removeItem('clock_in');
				sys.clockToggle('out');
			}
			
			if(inf['reply']=='406 Not Acceptable'){
				apps.loginScreen.open('#lgn');
			}else if(inf['reply']=='426 Upgrade Required'){
				apps.loginScreen.open('#update');
			}else{
				if(!sys.isEmpty(inf['pos1'])){
					$('span.ncf-pos1').text(inf['pos1'].toLowerCase());
				}
				if(!sys.isEmpty(inf['pos2'])){
					$('span.ncf-pos2').text(inf['pos2'].toLowerCase());
				}
				
				$('span.ncf-name').text(inf['name'].toLowerCase());
				$('span.ncf-name').html($('span.ncf-name').text().replace(/ /g, '&nbsp;&nbsp;&nbsp;'));
				$('#edpf_name').val(inf['name']);
				$('span.ncf-tel').text(inf['contact']);
				$('#edpf_tel').val(inf['contact']);
				if(!sys.isEmpty(inf['email'])){
					$('span.ncf-email').text(inf['email'].toLowerCase());
					$('span.ncf-email').data('value', (inf['email'].toLowerCase()));
				}
				$('#edpf_eml').val(inf['email']);
				
				$('span.ncf-name').data('value', inf['name']);
				$('span.ncf-tel').data('value', inf['contact']);
				
				$('div.views').css('opacity', '1');
			}
			
			sys.getTime();
			sys.startClock();
			
			if(inf['status']){
				var status = inf['status'], x = '';
				
				for(var i=0; i<status.length; i++){
					x += '<li><a href="#" class="item-link item-content" data-usr="' + status[i].user_id + '" data-who="' + status[i].nc_name + '">';
					x += '<div class="item-media"><i class="icon material-icons md-only">' + (status[i].clocked_in == 1 ? 'directions_run' : 'hotel') + '</i></div>';
					x += '<div class="item-inner"><div class="item-title">' + status[i].nc_name + (status[i].clocked_in == 1 ? ('<div class="item-footer">' + status[i].clocked_time + '</div>') : '') + '</div></div></a></li>';
				}
				$('#user-status').html(x);
			}
			
			if(!sys.isEmpty(inf['task'])){
				if(inf['task'][0] != 'none'){
					var today = new Date(),
						dd = String(today.getDate()).padStart(2, '0'),
						mm = String(today.getMonth() + 1).padStart(2, '0'),
						yyyy = today.getFullYear();
					var todayString = (yyyy + '-' + mm + '-' + dd + ' 00:00:00'),
						todayClass = '';
					
					if(sys.isDealer()){
						var task = inf['task'], x = '', sameAs = 0, rmk = '';
					
						for(var i=0; i<task.length; i++){
							if(task[i]['date'] == todayString){
								todayClass = ' todayTask';
							}else{
								todayClass = '';
							}
							
							if(task[i]['date'] != sameAs){
								x += '<div class="timeline-item">';
								x += '<div class="timeline-item-date">' + task[i]['date'].substr(8,2) + ' <small>' + sys.toMonth(task[i]['date']) + '</small></div>';
								x += '<div class="timeline-item-divider"></div>';
								x += '<div class="timeline-item-content">';
							}
							rmk = '<strong>Standby Time</strong> : ' + task[i]['time'] + ',,'
								+ '<strong>Venue</strong> : ' + (sys.isEmpty(task[i]['venue']) ?  '-' : (task[i]['venue'].indexOf('#PID#') != -1 ? sys.pidToLoc(task[i]['venue']).loc_name : task[i]['venue'])) + ',,'
								+ '<strong>Description</strong> : ' + (sys.isEmpty(task[i]['description']) ?  '-' : task[i]['description']) + ',,'
								+ '<strong>E.User</strong> : ' + (sys.isEmpty(task[i]['bride_groom']) ?  '-' : task[i]['bride_groom']) + ',,'
								+ '<strong>Band</strong> : ' + (sys.isEmpty(task[i]['band']) ?  '-' : task[i]['band']) + ',,'
								+ '<strong>Price</strong> : ' + ((sys.isEmpty(task[i]['price']) || task[i]['price'] == '0') ?  '-' : ('RM ' + parseFloat(task[i]['price']).toFixed(2))) + ',,'
								+ ((sys.isEmpty(task[i]['price']) || task[i]['price'] == '0') ? '' : ('<strong>Paid Status</strong> : ' + (task[i]['paid'] == '1' ? 'PAID,,' : 'PENDING,,')));
							x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + todayClass + '" data-eid="' + task[i]['primary_id'] + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + rmk + '" data-review="' + task[i]['review'] + '" data-datetime="' + (task[i]['date'].substr(0,11) + (sys.isEmpty(task[i]['time']) ? '23:59' : task[i]['time'])) + ':00">';
							
							if(task[i]['time']){
								x += '<div class="timeline-item-time">' + task[i]['time'] + '</div>';
							}
							
							x += '<strong>' + (sys.isEmpty(task[i]['venue']) ?  '-' : (task[i]['venue'].indexOf('#PID#') != -1 ? sys.pidToLoc(task[i]['venue']).loc_name : task[i]['venue'])) + '</strong>' + (task[i]['description'] ? ('<br/><span>' + task[i]['description'] + '</span>') : '');
							x += '</div>';
							
							sameAs = task[i]['date'];
							
							if(sys.isEmpty(task[i+1]) || task[i+1]['date'] != sameAs){
								x += '</div></div>';
							}
						}
						$('#DLtask_tl').data('inf', task);
						$('#DLtask_tl').html(x);
					}else{
						var task = inf['task'], x = '', sameAs = 0;
					
						for(var i=0; i<task.length; i++){
							var match = false;
							
							if(task[i]['date'] == todayString){
								todayClass = ' todayTask';
							}else{
								todayClass = '';
							}
							
							if(task[i]['date'] != sameAs){
								x += '<div class="timeline-item">';
								x += '<div class="timeline-item-date">' + task[i]['date'].substr(8,2) + ' <small>' + sys.toMonth(task[i]['date']) + '</small></div>';
								x += '<div class="timeline-item-divider"></div>';
								x += '<div class="timeline-item-content">';
							}
							
							if(!sys.isEmpty(task[i]['crew_st']) || !sys.isEmpty(task[i]['crew_ob']) || !sys.isEmpty(task[i]['crew_xx'])){
								var st = (sys.isEmpty(task[i]['crew_st']) ? [] : task[i]['crew_st'].split(',')),
									ob = (sys.isEmpty(task[i]['crew_ob']) ? [] : task[i]['crew_ob'].split(',')),
									xx = (sys.isEmpty(task[i]['crew_xx']) ? [] : task[i]['crew_xx'].split(','));
								
								if(st.indexOf(usr) != -1){
									x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + todayClass + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '" data-crew="' + task[i]['crew_st'] + '">';
									x += '<div class="timeline-item-time">' + task[i]['time'].split(', ')[0]+ '</div>';
									x += '<strong>' + (sys.isEmpty(task[i]['venue']) ?  '-' : (task[i]['venue'].indexOf('#PID#') != -1 ? sys.pidToLoc(task[i]['venue']).loc_name : task[i]['venue'])) + '</strong>' + (task[i]['description'] ? ('<br/><span>' + task[i]['description'] + '</span>') : '');
									x += '</div>';
									
									match = true;
								}
								
								if(ob.indexOf(usr) != -1){
									x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + todayClass + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '" data-crew="' + task[i]['crew_ob'] + '">';
									x += '<div class="timeline-item-time">' + task[i]['time'].split(', ')[1]+ '</div>';
									x += '<strong>' + (sys.isEmpty(task[i]['venue']) ?  '-' : (task[i]['venue'].indexOf('#PID#') != -1 ? sys.pidToLoc(task[i]['venue']).loc_name : task[i]['venue'])) + '</strong>' + (task[i]['description'] ? ('<br/><span>' + task[i]['description'] + '</span>') : '');
									x += '</div>';
									
									match = true;
								}
								
								if(xx.indexOf(usr) != -1){
									x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + todayClass + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '" data-crew="' + task[i]['crew_xx'] + '">';
									x += '<div class="timeline-item-time">' + task[i]['time'].split(', ')[2]+ '</div>';
									x += '<strong>' + (sys.isEmpty(task[i]['venue']) ?  '-' : (task[i]['venue'].indexOf('#PID#') != -1 ? sys.pidToLoc(task[i]['venue']).loc_name : task[i]['venue'])) + '</strong>' + (task[i]['description'] ? ('<br/><span>' + task[i]['description'] + '</span>') : '');
									x += '</div>';
									
									match = true;
								}
							}
							
							if(!match){
								x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + todayClass + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '" data-crew="' + task[i]['crew'] + '">';
							
								if(task[i]['time']){
									x += '<div class="timeline-item-time">' + ((task[i]['time'].indexOf(', ') != -1) ? (task[i]['time'].split(', ')[0]) : (task[i]['time'])) + '</div>';
								}
								
								x += '<strong>' + (sys.isEmpty(task[i]['venue']) ?  '-' : (task[i]['venue'].indexOf('#PID#') != -1 ? sys.pidToLoc(task[i]['venue']).loc_name : task[i]['venue'])) + '</strong>' + (task[i]['description'] ? ('<br/><span>' + task[i]['description'] + '</span>') : '');
								x += '</div>';
							}
							
							sameAs = task[i]['date'];
							
							if(sys.isEmpty(task[i+1]) || task[i+1]['date'] != sameAs){
								x += '</div></div>';
							}
						}
						$('#task_tl').data('inf', task);
						$('#task_tl').html(x);
						
						sys.arrangeTask();
					}
				}
			}
			
			for(var i=10; i>parseInt(inf['level']); i--){
				if($('.level'+i).length > 0){
					$('.level'+i).remove();
				}
			}
			
			for(var i=0; i<parseInt(inf['level']); i++){
				if($('.ltlevel'+i).length > 0){
					$('.ltlevel'+i).remove();
				}
			}
			
			if(inf['level']<1){
				apps.tab.show('#pg-DLhome', false);
			}else{
				apps.tab.show('#pg-home', false);
			}
			
			if(sys.isDealer()){
				dlCalendarInline = apps.calendar.create({
						containerEl: '#wkv-DLcalendar',
						value:  [new Date()],
						weekHeader: true,
						renderToolbar: function () {
							return  '<div class="toolbar calendar-custom-toolbar no-shadow">' +
									'<div class="toolbar-inner">' +
									'<div class="left">' +
									'<a href="#" class="link icon-only"><i class="icon icon-back ' + (apps.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
									'</div>' +
									'<div class="center"></div>' +
									'<div class="right">' +
									'<a href="#" class="link icon-only"><i class="icon icon-forward ' + (apps.theme === 'md' ? 'color-black' : '') + '"></i></a>' +
									'</div>' +
									'</div>' +
									'</div>';
						},
						on: {
							init: function (c) {
								$$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] +', ' + c.currentYear);
								$$('.calendar-custom-toolbar .left .link').on('click', function () {
									dlCalendarInline.prevMonth();
								});
								$$('.calendar-custom-toolbar .right .link').on('click', function () {
									dlCalendarInline.nextMonth();
								});
							},
							monthYearChangeStart: function (c) {
								$$('.calendar-custom-toolbar .center').text(monthNames[c.currentMonth] +', ' + c.currentYear);
								sys.dayClick(usr);
								sys.eventCheck(usr, c.currentMonth, c.currentYear);
							}
						}
					});
			}
			
			sys.dayClick(usr);
			sys.eventCheck(usr, (new Date().getMonth()), new Date().getYear()+1900, true);
			
			setTimeout(function(){
				$('#app').css('display', 'block');
				sys.loading(0)
			}, 2000);
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
	'isTime' : function(str){
		if(str.length == 5){
			if(str.substr(2,1) == ':'){
				if((parseInt(str.substr(0,2)) >= 0) && (parseInt(str.substr(0,2)) <= 23)){
					if((parseInt(str.substr(3,2)) >= 0) && (parseInt(str.substr(3,2)) <= 59)){
						return true;
					}
				}
			}
		}
		return false;
	},
	'isEmail' : function(email){
		var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
		return re.test(email);
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
	'getMobileOS': function(){
		var userAgent = navigator.userAgent || navigator.vendor || window.opera;
		
		if (/windows phone/i.test(userAgent)) {
			return "Windows Phone";
		}

		if (/android/i.test(userAgent)) {
			return "Android";
		}
		
		if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
			return "iOS";
		}
		
		return "unknown";
	},
	'isDealer' : function(){
		return (STORAGE.getItem('level')==='0');
	},
	'shorten' : function(text){
		return (text.slice(0, 100) + (text.length > 100 ? '...' : ''));
	},
	'commasToNextLine' : function(str, mode){
		if(str){
			if(sys.isEmpty(mode)){
				var x = str.replace(/,,/g, '<br/>'), pattern = new RegExp(/\`(.*?)\`/g), media = new RegExp(/\*\[(.*?)\]\^(.*?)\*/g);
				
				if(media.test(x)){
					var files = x.match(media);
					
					for(var i=0; i<files.length; i++){
						var source = files[i].substr(9, (files[i].length - 10));
						var type = files[i].substr(2, 5);
						var link = '<span data-src="' + source + '" class="rmk-media">[ ' + type + ' ]</a>';
						
						x = x.replace(files[i], link);
					}
				}
				
				if(pattern.test(x)){
					var pic = x.match(pattern), crews = $('body').data('crew');
					
					for(var j=0; j<pic.length; j++){
						var spic = pic[j].substr(1, (pic[j].length - 2));
						var uid = spic.toLowerCase().replace(/\s/g, '');
						var dialog = spic;
						
						for(var i=0; i < crews.length; i++){
							if((crews[i]['user_id'] == uid) && (crews[i]['user_level'] == 0)){
								var dialog = '<span class="pic-call" data-con="' + crews[i].nc_contact + '">' + spic + '</span>';
								
								x = x.replace(pic[j], dialog);
								break;
							}
						}
						x = x.replace(pic[j], dialog);
					}
				}
				
				return x;
			}else if(mode == 'h'){
				var x = str.replace(/,,/g, '<br/>');
				var y = x.replace(/`/g, '');
				
				return y;
			}else if(mode == 'n'){
				return str.replace(/,,/g, '\n');
			}else if(mode == 'r'){
				return str.replace(/\n/g, ',,');
			}
		}
		return '';
	},
	'dateToString' : function(date, str){
		var x = '', d = new Date(date);
		
		switch(str){
			case 'dd':
				sys.pad((d.getDate()));
				break;
			case 'mm':
				sys.pad((d.getMonth()+1));
				break;
			case 'yyyy':
				x += d.getFullYear();
				break;
			case 'yyyy-mm-dd':
				x += d.getFullYear();
				x += '-' + sys.pad((d.getMonth()+1));
				x += '-' + sys.pad((d.getDate()));
				break;
		}
		return x;
	},
	'unameToSname' : function(str, mode){
		if(sys.isEmpty(mode)){
			if(str){
				var aCrew = str.split(','), sCrew = [], all = $('body').data('crew');
				
				if(str.indexOf(',') != -1){
					for(var i=0; i<aCrew.length; i++){
						for(var j=0; j<all.length; j++){
							if(aCrew[i] == all[j].user_id){
								sCrew[i] = all[j].short_name;
								break;
							}
						}
					}
					
					return sCrew.join(', ');
				}else{
					for(var j=0; j<all.length; j++){
						if(str == all[j].user_id){
							return all[j].short_name;
						}
					}
				}
			}
		}else{
			if(mode == '@'){
				if(str){
					var aCrew = str.split(','), sCrew = [], all = $('body').data('crew');
					
					if(str.indexOf(',') != -1){
						for(var i=0; i<aCrew.length; i++){
							for(var j=0; j<all.length; j++){
								if(aCrew[i] == all[j].user_id){
									sCrew[i] = ('@' + all[j].short_name);
									break;
								}
							}
						}
						
						return sCrew.join(' ');
					}else{
						for(var j=0; j<all.length; j++){
							if(str == all[j].user_id){
								return ('@' + all[j].short_name);
							}
						}
					}
				}
			}
		}
		return null;
	},
	'snameToUname' : function(str){
		var all = $('body').data('crew');
		
		if(str){
			for(var j=0; j<all.length; j++){
				if(str == all[j].short_name){
					return all[j].user_id;
				}
			}
		}
		return null;
	},
	'uidToPyid' : function(str){
		if(str){
			var crews = $('body').data('crew');
			
			for(var i=0; i<crews.length; i++){
				if(str == crews[i].user_id){
					return crews[i].player_id;
				}
			}
		}
		return null;
	},
	'pyid' : function(str){
		var level = 99, plyid = [], crews = $('body').data('crew');
		
		switch(str){
			case 'super':
				level = 9;
				break;
			case 'management':
				level = 8;
				break;
			case 'fulltime':
				level = 3;
				break;
			case 'crew':
				level = 2;
				break;
			case 'all':
				level = 1;
				break;
		}
		
		for(var i=0; i<crews.length; i++){
			if(!sys.isEmpty(crews[i].player_id)){
				if(parseInt(crews[i].user_level) >= level){
					plyid.push(crews[i].player_id);
				}
			}
		}
		
		return plyid;
	},
	'carToTcar' : function(str, mode){
		var Tcar = '';
		if(sys.isEmpty(mode)){
			if(str){
				if(str.indexOf(', ') != '-1'){
					var cars = str.split(', ');
					
					for(var i=0; i<cars.length; i++){
						if(i != 0){
							Tcar += ', ';
						}
						Tcar += '<span>' + cars[i] + '</span>';
					}
				}else{
					Tcar += '<span>' + str + '</span>';
				}
				Tcar = Tcar.replace(/\^F/g, '&nbsp;<sup>');
				Tcar = Tcar.replace(/\^B/g, '</sup>');
				return Tcar;
			}
		}else if(mode=='r'){
			if(str){
				var pattern = new RegExp(/\^F(.*?)\^B/);
				
				if(str.indexOf('^F')!=-1){
					Tcar = str.replace((pattern.exec(str)[0]), '');
					Tcar = Tcar.replace(('\xa0'), '');
				}else{
					Tcar = str;
				}
				return Tcar;
			}
		}
		return null;
	},
	'coordinateCheck' : function(currentPoint, targetPoint, range){
		var currentLAT = parseFloat(currentPoint.split(',')[0]),
			currentLON = parseFloat(currentPoint.split(',')[1]),
			targetLAT = parseFloat(targetPoint.split(',')[0]),
			targetLON = parseFloat(targetPoint.split(',')[1]);
		
		var rangeLAT = parseFloat(range) * 0.000006773,
			rangeLON = parseFloat(range) * 0.000009030;
		
		if(((currentLAT >= (targetLAT - rangeLAT)) && ((currentLAT <= (targetLAT + rangeLAT)))) && ((currentLON >= (targetLON - rangeLON)) && ((currentLON <= (targetLON + rangeLON))))){
			return true;
		}
		
		return false;
	},
	'pidToLoc' : function(str){
		var locs = $('body').data('loc'),
			pid = str.substr(6);
		
		for(var i=0; i<locs.length; i++){
			if(pid == locs[i].primary_id){
				return locs[i];
			}
		}
		return false;
	},
	'locToPid' : function(loc_name){
		var locs = $('body').data('loc');
		
		for(var i=0; i<locs.length; i++){
			if(loc_name == locs[i].loc_name){
				return ('#PID# ' + locs[i]['primary_id']);
			}
		}
		return loc_name;
	},
	'ldToShort' : function(str){
		if(str){
			if(str.toLowerCase() == 'lunch'){
				return 'L';
			}else if(str.toLowerCase() == 'dinner'){
				return 'D';
			}else if(str.toLowerCase() == 'setup'){
				return 'ST';
			}else if(str.toLowerCase() == 'rehearsal'){
				return 'RH';
			}else if(str.toLowerCase() == 'dismantle'){
				return 'XX';
			}else if(str.toLowerCase().indexOf('board') != -1){
				if(str.toLowerCase().indexOf('lunch') != -1){
					return 'L:OB';
				}else{
					return 'D:OB';
				}
			}
		}
		return '-';
	},
	'eventCheck' : function(user, month, year, skip){
		if(sys.isEmpty(user)){
			user = STORAGE.getItem('usr');
		}
		
		if(!sys.isEmpty(user)){
			if(sys.isDealer()){
				var DATA = {
					'usr' : user,
					'month' : month,
					'year' : year
				};
				
				if(!sys.isEmpty(STORAGE.getItem('comp'))){
					DATA = {
						'usr' : user,
						'comp' : STORAGE.getItem('comp'),
						'month' : month,
						'year' : year
					};
				}
				
				var post_data = "ACT=" + encodeURIComponent('evt_chk_DL')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
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
									var tmpClass = (inf[tmpDay] > 4 ? 'hl5' : ('hl'+inf[tmpDay]));
									$('#wkv-DLcalendar .calendar-month-current .calendar-day:not(.calendar-day-next):not(.calendar-day-prev):eq('+(i-1)+')').addClass(tmpClass);
								}
							}
						}
						
						if(!skip){
							sys.loading(0);
						}
					}
				});
			}else{
				var DATA = {
					'usr' : user,
					'month' : month,
					'year' : year
				};
				var post_data = "ACT=" + encodeURIComponent('evt_chk')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
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
						
						if(!skip){
							sys.loading(0);
						}
					}
				});
			}
		}
	},
	'getLocation' : function(){
		navigator.geolocation.watchPosition(function(position){
			if(geoToken){
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'lon' : position.coords.longitude,
					'lat' : position.coords.latitude
				};
				var post_data = "ACT=" + encodeURIComponent('loc_chk')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					success: function(str){
						$('iframe#gmap').data('loc', (position.coords.latitude+','+position.coords.longitude));
					}
				});
				
				geoToken = false;
			}
		}, function(error){
			console.log('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
		}, { enableHighAccuracy: true });
	},
	'pad' : function(d){
		return (d < 10) ? '0' + d.toString() : d.toString();
	},
	'capFirst' : function(str){
		var x = str.toLowerCase().replace(/\b[a-z]/g, function(letter){
			return letter.toUpperCase();
		});
		
		return x;
	},
	'getTime' : function(){
		var post_data = "ACT=" + encodeURIComponent('tme_chk');
	
		$.ajax({
			type: 'POST',
			url: 'https://app.wkventertainment.com/',
			data: post_data,
			success: function(str){
				$('#app-time').data('time', new Date(str));
				$('#app-time').text((new Date(str)).toString().substr(4,20));
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
		
		if(geoCount <= 0){
			geoToken = true;
			geoCount = 60;
			sys.getLocation();
		}else{
			geoCount--;
		}
		
		if(workTime){
			var work = (Date.now() - workTime)/1000;
			var s = sys.pad(parseInt(work) % 60),
				m = sys.pad(parseInt(work / 60) % 60),
				h = sys.pad(parseInt(work / 3600));
			
			$('#pg-home .workClock .h1').text(h.substr(0,1));
			$('#pg-home .workClock .m1').text(m.substr(0,1));
			$('#pg-home .workClock .s1').text(s.substr(0,1));
			$('#pg-home .workClock .h2').text(h.substr(1,1));
			$('#pg-home .workClock .m2').text(m.substr(1,1));
			$('#pg-home .workClock .s2').text(s.substr(1,1));
		}else{
			$('#pg-home .workClock .h1').text('0');
			$('#pg-home .workClock .m1').text('0');
			$('#pg-home .workClock .s1').text('0');
			$('#pg-home .workClock .h2').text('0');
			$('#pg-home .workClock .m2').text('0');
			$('#pg-home .workClock .s2').text('0');
		}
		setTimeout(sys.startClock, 1000);
	},
	'clockToggle' : function(str){
		if(str=='out'){
			$('.popup-clock button.clock-out').addClass('disabled');
		}else if(str=='in'){
			$('.popup-clock button.clock-in').addClass('disabled');
			$('.popup-clock button.clock-out').removeClass('disabled');
		}
	},
	'onBackKeyDown' : function(){
		if((!$('#home-btn').hasClass('tab-link-active')) || $('html').hasClass('with-modal-popup')){
			$('.popup-backdrop')[0].click();
			$('#home-btn')[0].click();
			
			if($('.evt_ord_tab').length){
				$('.evt_ord_tab').css('display', 'none');
			}
			
			return false;
		}else{
			function onConfirm(buttonIndex) {
				if(buttonIndex == 1){
					navigator.app.exitApp();
				}
			}

			navigator.notification.confirm(
				'Exit the app?',
				onConfirm,
				'Confirmation',
				['OK','Cancel']
			);
		}
	},
	'toMonth' : function(month){
		var x = month.substr(5, 2);
		
		switch(x){
			case '01':
				return 'Jan';
			case '02':
				return 'Feb';
			case '03':
				return 'Mar';
			case '04':
				return 'Apr';
			case '05':
				return 'May';
			case '06':
				return 'Jun';
			case '07':
				return 'Jul';
			case '08':
				return 'Aug';
			case '09':
				return 'Sep';
			case '10':
				return 'Oct';
			case '11':
				return 'Nov';
			case '12':
				return 'Dec';
		}
		return false;
	},
	'toDay' : function(day){
		var x = parseInt(day.substr(8, 2));
		
		if(x == 1 || x == 21 || x == 31){
			return x + 'st';
		}else if(x == 2 || x == 22){
			return x + 'nd';
		}else if(x == 3 || x == 23){
			return x + 'rd';
		}else{
			return x + 'th';
		}
	},
	'toWeek' : function(week){
		var d = new Date(week);
		var x = d.getDay();
		
		switch(x){
			case 1:
				return 'Mon';
			case 2:
				return 'Tue';
			case 3:
				return 'Wed';
			case 4:
				return 'Thu';
			case 5:
				return 'Fri';
			case 6:
				return 'Sat';
			case 0:
				return 'Sun';
		}
		return false;
	},
	'checksum' : function(md5str){
		function rdC(){
			var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
			
			return characters.charAt(Math.floor(Math.random() * 36));
		}
		
		return (rdC() + md5str.charAt(8) + md5str.charAt(17) + rdC() + md5str.charAt(1) + md5str.charAt(10) + rdC() + md5str.charAt(31) + md5str.charAt(24) + rdC() + md5str.charAt(2) + md5str.charAt(19) + rdC() + md5str.charAt(11) + rdC() + md5str.charAt(27));
	},
	'longTap' : function(){
		if(sys.isEmpty(window.getSelection().toString())){
			if($('*:focus').length){
				cordova.plugins.clipboard.paste(function(text){
					var pos = $('*:focus')[0].selectionStart;
					var tmpStart = ($('*:focus').val()).substring(0, pos),
						tmpEnd = ($('*:focus').val()).substring(pos, ($('*:focus').val().length));
					
					$('*:focus').val((tmpStart + text + tmpEnd));
				});
				apps.toast.create({
					icon: '<i class="material-icons">flip_to_front</i>',
					text: 'Text pasted.',
					position: 'center',
					closeTimeout: 1000
				}).open();
			}
		}else{
			cordova.plugins.clipboard.copy(window.getSelection().toString());
			apps.toast.create({
				icon: '<i class="material-icons">flip_to_back</i>',
				text: 'Text copied.',
				position: 'center',
				closeTimeout: 1000
			}).open();
		}
	},
	'getLeave' : function(){
		var leave = {};
		
		leave['bfw'] = 0;
		leave['wrk'] = 0;
		leave['cpl'] = 0;
		leave['mcl'] = 0;
		leave['pbh'] = 0;
		leave['scl'] = 0;
		leave['tcpl'] = 3;
		leave['tmcl'] = 14;
		leave['twrk'] = sys.getDayNum(new Date());
		leave['odl'] = sys.getWeekNum(new Date());
		
		if(STORAGE.getItem('level')>=8){
			leave['tanl'] = 14;
		}else{
			leave['tanl'] = 10;
		}
		
		switch(STORAGE.getItem('usr')){
			case 'aiman':
				leave['bfw'] = 2;
				break;
			case 'gx':
				leave['bfw'] = 9.5;
				break;
			case 'huizai':
				leave['bfw'] = 22;
				break;
			case 'yiling':
				leave['bfw'] = 11;
				break;
			case 'yokekei':
				leave['bfw'] = 9;
				break;
		}
		
		var DATA = {
			'usr' : STORAGE.getItem('usr'),
			'start' : STORAGE.getItem('created'),
			'date' : new Date().toDateString()
		};
		var post_data = "ACT=" + encodeURIComponent('lvn_chk')
					  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
		
		$.ajax({
			type: 'POST',
			url: 'https://app.wkventertainment.com/',
			data: post_data,
			beforeSend: function(){
				sys.loading(1);
			},
			success: function(str){
				var inf = JSON.parse(str);
					
				if(inf['reply']==='200 OK'){
					if(inf['work']){
						var sameAs = '';
						
						for(var i=0; i<inf['work'].length; i++){
							if(sameAs != inf['work'][i].date){
								sameAs = inf['work'][i].date;
								leave['wrk']++;
							}
						}
					}
					
					if(inf['leave']){
						for(var i=0; i<inf['leave'].length; i++){
							if(inf['leave'][i].clock_action == 'PBH'){
								leave['pbh']++;
							}else if(inf['leave'][i].clock_action == 'MCL'){
								leave['mcl']++;
							}else if(inf['leave'][i].clock_action == 'SCL'){
								leave['scl']++;
							}else if(inf['leave'][i].clock_action == 'CPL'){
								leave['cpl']++;
							}
						}
					}
					
					sys.loading(0);
				}
			}
		});
		
		return leave;
	},
	'getDistance' : function(loc, state){
		function toRadians(degree){
			var pi = Math.PI;
			return degree * (pi/180);
		}
		
		function getMultiplier(str){
			switch(str){
				case 'Genting':
					return 3.2;
				case 'Janda Baik':
				case 'Pahang':
					return 2.2;
				case 'Bentong':
				case 'Jerantut':
				case 'Genting Sempah':
					return 1.8;
				case 'Batang Berjuntai':
				case 'Bidor':
				case 'Kuala Kubu Baru':
				case 'Kuala Lipis':
				case 'Kuala Selangor':
				case 'Port Dickson':
				case 'Puncak Alam':
				case 'Raub':
				case 'Rawang':
				case 'Sekinchan':
				case 'Serendah':
				case 'Singapore':
				case 'Sungai Buloh':
				case 'Tanjung Karang':
				case 'Tanjung Malim':
				case 'Tanjung Sepat':
				case 'Temerloh':
					return 1.5;
				case 'Ampang':
				case 'Banting':
				case 'Batu Caves':
				case 'Beranang':
				case 'Cyberjaya':
				case 'Damansara':
				case 'Desa Park':
				case 'Gombak':
				case 'Ipoh':
				case 'Kepong':
				case 'Klang':
				case 'Kota Kemuning':
				case 'Kuala Lumpur':
				case 'Kuchai Lama':
				case 'Kuantan':
				case 'Mantin':
				case 'Melaka':
				case 'Mont Kiara':
				case 'Nilai':
				case 'Petaling Jaya':
				case 'Puchong':
				case 'Putrajaya':
				case 'Selayang':
				case 'Sentul':
				case 'Sepang':
				case 'Seremban':
				case 'Setapak':
				case 'Setia Alam':
				case 'Setiawangsa':
				case 'Shah Alam':
				case 'Sri Hartamas':
				case 'Subang Jaya':
				case 'Taiping':
				case 'Taman OUG':
				case 'TTDI':
					return 1.4;
				case 'Bangi':
				case 'Bangsar':
				case 'Belakong':
				case 'Bukit Jalil':
				case 'Broga':
				case 'Cheras':
				case 'Johor':
				case 'Johor Bahru':
				case 'Kajang':
				case 'Penang':
				case 'Semenyih':
				case 'Serdang':
				case 'Sungai Long':
					return 1.3;
			}
			
			return 1.4;
		}

		var lat1 = '2.986539',
			lon1 = '101.798407',
			lat2 = loc.split(', ')[0],
			lon2 = loc.split(', ')[1];

		var R = 6371,
			RdLat1 = toRadians(lat1),
			RdLat2 = toRadians(lat2),
			RdLatD = toRadians((lat2-lat1)),
			RdLonD = toRadians((lon2-lon1));

		var a = Math.sin(RdLatD/2) * Math.sin(RdLatD/2) +
				Math.cos(RdLat1) * Math.cos(RdLat2) *
				Math.sin(RdLonD/2) * Math.sin(RdLonD/2);
		
		var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
		var d = (R * c);

		return (d * getMultiplier(state));
	},
	'removeNull' : function(arr){
		var result = [];
		
		if(!sys.isEmpty(arr)){
			for(var i=0; i<arr.length; i++){
				if(arr[i]){
					result.push(arr[i]);
				}
			}
		}
		
		return result;
	},
	'orderCode' : function(code, num, row, cBtn){
		var html = '', code;
		
		if(code.substr(7) != '0'){
			switch((code.substr(0,7))){
				case 'TS_trsp':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Transportation Fees</strong></div>';
					html += '<div class="col-10"></div>';
					html += '</div>';
					break;
				case 'TS_nots':
					html += '<div class="row no-gap">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80"><strong>*** Transportation not included.</strong></div>';
					html += '<div class="col-10"></div>';
					html += '</div>';
					break;
				case 'SD_hset':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Sound System - Half Set</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Speaker (Monitor)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Mixer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Wireless Handheld Microphone</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Dual Channel DI Box</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">3 u x Microphone Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Book Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Sound Engineer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'SD_2t2m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Sound System - 2 Top 2 Mon</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Speaker (Top)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Speaker (Monitor)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Mixer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Wireless Handheld Microphone</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Dual Channel DI Box</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">3 u x Microphone Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Book Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Speaker Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Sound Engineer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'SD_4t2m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Sound System - 4 Top 2 Mon</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">4 u x Speaker (Top)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Speaker (Monitor)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Mixer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Wireless Handheld Microphone</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Dual Channel DI Box</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">3 u x Microphone Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Book Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">4 u x Speaker Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Sound Engineer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'SD_6t2m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Sound System - 6 Top 2 Mon</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">6 u x Speaker (Top)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Speaker (Monitor)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Mixer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Wireless Handheld Microphone</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Dual Channel DI Box</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">3 u x Microphone Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Book Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">6 u x Speaker Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Sound Engineer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aD_istm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Wired Instrument Mic</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_cdsm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Wired Condenser Mic</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_mcst':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Microphone Stand</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_bkst':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Book Stand</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_dibx':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Dual Channel DI Box</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_wrsm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Wireless Microphone</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_hsmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Headworn Microphone</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_dmst':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Drum Mic Set</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_tops':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Top Speaker</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_mons':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Monitor Speaker</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_b58a':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Shure SLX Beta 58A Wireless Mic</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_wsbp':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Wireless Body Pack (for instrument)</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_sxmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Saxophone Mic Clip</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_vlmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Violin Mic Clip</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_sgcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Stage Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_sdcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Sound Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_ovtm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Extra hours</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_sbwf':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Subwoofer</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_dgtm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra &emsp; - Upgrade to Digital Mixer</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_estp':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra &emsp; - Early setup</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aD_dmrs':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra &emsp; - Dismantle &amp; Resetup</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'LT_ctst':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Lighting System (Custom Settings)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Programmer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'LT_f600':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Lighting System - 600 (Face Light)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">8 u x LED Par Can (RGBW)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Lighting Controller</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Lighting Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Programmer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'LT_1_0k':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Lighting System - 1k (Stage Light)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">16 u x LED Par Can (RGBW)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Smoke Machine</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Avolite Tiger Touch</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Lighting Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Programmer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'LT_1_5k':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Lighting System - 1.5k (Stage Light)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">8 u x BEAM 230 Moving Head</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">20 u x LED Par Can (RGBW)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Followspot</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Smoke Machine</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Avolite Tiger Touch</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Lighting Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Programmer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Crew</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'LT_2_0k':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Lighting System - 2.0k (Hall + Stage Light)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">12 u x BEAM 230 Moving Head</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">24 u x LED Par Can (RGBW)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">6 u x LED City Light</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Followspot</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Smoke Machine</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Avolite Tiger Touch</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Lighting Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Programmer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Crew</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'LT_2_5k':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Lighting System - 2.5k (Hall + Stage Light)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">12 u x BEAM 230 Moving Head</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">36 u x LED Par Can (RGBW)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">10 u x LED City Light</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Followspot</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Smoke Machine</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Avolite Tiger Touch</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Lighting Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Programmer</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Lighting Crew</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aL_lpcc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x LED Par Can (RGBW)</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lbmh':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x BEAM 230 Moving Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lctl':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x LED City Light</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lfls':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Followspot</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lfgm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Fog machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_ltcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Lighting Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lhzm':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Haze Machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lwmh':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x LED Wash</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lpfl':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Profile Light</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_ladl':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Audience Light</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_luvl':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x UV Light</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_lgbb':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Customaize Gobo + Gobo Beam</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_ts1m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x 1m Truss c/w Base Plate</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_ts2m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x 2m Truss c/w Base Plate</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_ts3m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x 3m Truss c/w Base Plate</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_tp12':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Goal Post ( < 12m )<br/><sup>( Truss + 2 x Truss Crank )</sup></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aL_tp16':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Goal Post ( 13m - 16m )<br/><sup>( Truss + 2 x Truss Crank )</sup></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'LS_sidr':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>LED Screen (Indoor)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'LS_sfly':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>LED Screen (Fly)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'LS_sodr':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>LED Screen (Outdoor)</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aS_ledw':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Width</div><div class="col-70">:&emsp;<strong>' + code.substr(7) + ' m</strong></div></div>';
					break;
				case 'aS_ledh':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Height</div><div class="col-70">:&emsp;<strong>' + code.substr(7) + ' m</strong></div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aS_swt4':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x 4CH Blackmagic ATEM Switcher</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aS_swt8':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x 8CH Blackmagic ATEM Switcher</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'PJ_pjol':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Projector</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x 3800 Ansi Lumen Projector</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'PJ_p6x6':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Projector + Screen <sup>(6 x 6)</sup></strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x 3800 Ansi Lumen Projector</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Projector Screen (6ft x 6ft)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'PJ_p8x8':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Projector + Screen <sup>(8 x 8)</sup></strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x 3800 Ansi Lumen Projector</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Projector Screen (8ft x 8ft)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aJ_sbcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Standby Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'TV_tv43':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>43 inch Television</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x 43 inch Television</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'TV_tv55':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>55 inch Television</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x 55 inch Television</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'TV_tv65':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>65 inch Television</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x 65 inch Television</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aV_tvts':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Truss Stand c/w Base Plate</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aV_tvcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Standby Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'KR_krok':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Karaoke System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Myway Karaoke System</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-15"></div><div class="col-85"><strong><sup>* More than 30,000 updated Chinese / English Songs</sup></strong></div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-15"></div><div class="col-85"><strong><sup>* 1,000 Popular Malay Songs</sup></strong></div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Myway 19" Touch Screen Monitor</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x LCD Monitor</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Standby Crew</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aK_tv43':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Upgrade</strong>&emsp;' + code.substr(7) + ' x 43 inch Television</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aK_tv55':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Upgrade</strong>&emsp;' + code.substr(7) + ' x 55 inch Television</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aK_tv65':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Upgrade</strong>&emsp;' + code.substr(7) + ' x 65 inch Television</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aK_sbcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Standby Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'SG_4f4f':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Stage System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aG_sslg':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Length</div><div class="col-70">:&emsp;<strong>' + code.substr(7) + ' ft</strong></div></div>';
					break;
				case 'aG_sswh':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Width</div><div class="col-70">:&emsp;<strong>' + code.substr(7) + ' ft</strong></div></div>';
					break;
				case 'aG_sshg':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Height</div><div class="col-70">:&emsp;<strong>' + parseFloat(code.substr(7)).toFixed(2) + ' ft</strong></div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">* Skirting included.</div></div>';
					break;
				case 'aG_stcs':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Staircase</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aG_crpt':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;- Carpet</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'BL_bkln':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Backline System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_kb12':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Roland KC200 (100watts) 12" 4 channel</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_kb15':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Roland KC600 (200watts) 15" 4 channel</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_brb9':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Laney RB410 Cabinet c/w RB9 Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_blh5':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Hartke 410B Cabinet c/w LH500 Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_btx6':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Hartke 410XL V2 Cabinet c/w TX600 Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_gl12':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Laney LX412 Cabinet c/w LX120RH Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_gmg1':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Marshall MG412 Cabinet c/w MG100HCFX Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_goc1':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Orange CR Pro 412 Cabinet c/w CR120H Head</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_dygz':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Yamaha Gig Maker Drumset c/w Zildjian Cymbal</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_dysz':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Yamaha Stage Custom Drumset c/w Zildjian S390 Cymbal</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_dtis':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Tama ImperialStar Hairline Drumset c/w Stagg SH-Set Cymbal</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aB_sbcw':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Standby Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'TS_gp12':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Truss System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Truss Crank Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x Truss (290mm x 290mm) (Max 12m)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary Connectors, Bullets & Pins</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'TS_gp16':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Truss System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Truss Crank Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x Truss (400mm x 400mm) (Max 16m)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary Connectors, Bullets & Pins</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'TS_gpfl':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Truss System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Chain Block Hoist & Slings</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Truss Base & Support</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x Truss (400mm x 400mm) (H:6m L:16m)</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary Connectors, Bullets & Pins</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'TS_gpct':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Truss System</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Base Plates</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary Connectors, Bullets & Pins</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'aT_tsjb':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x Joint Box (290mm x 290mm)</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aT_ts1m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x 1m Truss (290mm x 290mm)</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aT_ts2m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x 2m Truss (290mm x 290mm)</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aT_ts3m':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x 3m Truss (290mm x 290mm)</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aT_sbcw':
				case 'aT_sbcr':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-20"></div>';
					html += '<div class="col-70"><strong>* Extra</strong>&emsp;' + code.substr(7) + ' x Standby Crew</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'BD_3f3f':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Truss Backdrop</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aR_bdlg':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Length</div><div class="col-70">:&emsp;<strong>' + code.substr(7) + ' ft</strong></div></div>';
					break;
				case 'aR_bdhg':
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-20">Height</div><div class="col-70">:&emsp;<strong>' + code.substr(7) + ' ft</strong></div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup & Dismantle</div></div>';
					break;
				case 'LF_1chd':
				case 'LF_1cfd':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Livefeed</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Sony NXCAM HXR-NX100</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Camcorder Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary Cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Camera Operator</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup &amp; Dismantle</div></div>';
					break;
				case 'LF_2chd':
				case 'LF_2cfd':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Livefeed</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Sony NXCAM HXR-NX100</div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Camcorder Stand</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 u x Blackmagic BiDirectional Converter</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 u x Blackmagic ATEM Television Studio</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 lot x All Necessary Cables & Extensions</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">2 x Camera Operator</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">1 x Digital Imaging Technician</div></div>';
					html += '<div class="row no-gap" item_count="' + num + '"><div class="col-10"></div><div class="col-90">Setup &amp; Dismantle</div></div>';
					break;
				case 'aF_bats':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x Blackmagic ATEM Television Studio</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
				case 'aF_bamn':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x Blackmagic ATEM Mini</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aF_copr':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x Camera Operator</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aF_mdit':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' x Digital Imaging Technician</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'EF_efmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10">' + num + '.</div>';
					html += '<div class="col-80"><strong>Effect Machine</strong></div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-main="1" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_cnft':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Confetti</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_cspk':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Cold Spark</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_fgmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Fog Machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_hzmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Haze Machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_lwfg':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Low Fog Machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_snmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Snow Machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
				case 'aE_bbmc':
					html += '<div class="row no-gap" item_count="' + num + '">';
					html += '<div class="col-10"></div>';
					html += '<div class="col-80">' + code.substr(7) + ' u x Bubble Machine</div>';
					if(cBtn){
						html += '<div class="col-10"><i class="icon material-icons md-only" style="color:#999;" data-num="' + num + '" data-code="' + code + '" data-row="' + row + '">cancel</i></div>';
					}else{
						html += '<div class="col-10"></div>';
					}
					html += '</div>';
					break;
			}
		}
		
		return html;
	},
	'checkPrice' : function(code){
		if(sys.isEmpty(code)){
			return 0;
		}
		
		var price = 0,
			name = code.substr(0, 7),
			qty = ((sys.isEmpty(code.substr(7))) ? 1 : parseFloat(code.substr(7)));
		
		switch(name){
			case 'TS_nots':
				price = 0;
				break;
			case 'TS_trsp':
				price = 1;
				break;
			case 'aD_istm':
			case 'aD_cdsm':
			case 'aD_mcst':
			case 'aD_bkst':
			case 'aD_dibx':
				price = 25;
				break;
			case 'aL_lpcc':
				price = 35;
				break;
			case 'aL_llts':
				price = 40;
				break;
			case 'aD_wrsm':
			case 'aD_hsmc':
			case 'aD_dmst':
			case 'aV_tvts':
				price = 50;
				break;
			case 'aL_lpfl':
			case 'aL_luvl':
				price = 60;
				break;
			case 'aL_lfgm':
			case 'aL_lwmh':
			case 'aL_ts1m':
			case 'aT_ts1m':
			case 'EF_efmc':
			case 'aE_fgmc':
				price = 80;
				break;
			case 'aD_tops':
			case 'aD_mons':
			case 'aD_b58a':
			case 'aD_wsbp':
			case 'aD_sxmc':
			case 'aD_vlmc':
			case 'aL_lbmh':
			case 'aL_lhzm':
			case 'aL_ltcw':
			case 'aJ_sbcw':
			case 'aV_tvcw':
			case 'aK_sbcw':
			case 'aG_sbcw':
			case 'BL_bkln':
			case 'aB_sbcw':
			case 'aT_sbcw':
			case 'aT_sbcr':
			case 'aT_tsjb':
			case 'aR_sbcw':
			case 'aE_hzmc':
				price = 100;
				break;
			case 'aL_ladl':
			case 'aD_sgcw':
			case 'aL_ts2m':
			case 'aT_ts2m':
				price = 120;
				break;
			case 'aL_lctl':
				price = 125;
				break;
			case 'aD_sdcw':
			case 'aD_ovtm':
			case 'aL_ts3m':
			case 'PJ_pjol':
			case 'aB_kb12':
			case 'aT_ts3m':
			case 'aE_cnft':
			case 'aE_bbmc':
				price = 150;
				break;				
			case 'aD_sbwf':
			case 'aD_dgtm':
			case 'aD_estp':
			case 'aB_brb9':
			case 'aB_gl12':
			case 'TS_gpct':
			case 'aF_copr':
			case 'aF_mdit':
			case 'aE_cspk':
			case 'aE_snmc':
				price = 200;
				break;
			case 'aL_lfls':
			case 'aS_swt4':
			case 'PJ_p6x6':
			case 'aB_kb15':
			case 'aB_blh5':
			case 'aB_btx6':
			case 'aB_gmg1':
			case 'aB_goc1':
			case 'aF_bamn':
				price = 250;
				break;
			case 'aD_dmrs':
			case 'LT_ctst':
			case 'aB_dygz':
			case 'aE_lwfg':
				price = 300;
				break;
			case 'PJ_p8x8':
			case 'TV_tv43':
			case 'aK_tv43':
			case 'aB_dtis':
				price = 350;
				break;
			case 'aS_swt8':
			case 'aB_dysz':
			case 'aF_bats':
				price = 400;
				break;
			case 'TV_tv55':
			case 'aK_tv55':
				price = 450;
				break;
			case 'SD_hset':
				price = 500;
				break;
			case 'aL_lgbb':
			case 'TV_tv65':
			case 'aK_tv65':
				price = 550;
				break;
			case 'LT_f600':
			case 'SD_2t2m':
			case 'KR_krok':
				price = 600;
				break;
			case 'SD_4t2m':
			case 'LF_1chd':
				price = 800;
				break;
			case 'SD_6t2m':
			case 'LT_1_0k':
				price = 1000;
				break;
			case 'LF_1cfd':
				price = 1100;
				break;
			case 'aL_tp12':
			case 'TS_gp12':
				price = 1200;
				break;
			case 'aL_tp16':
			case 'LT_1_5k':
			case 'TS_gp16':
				price = 1500;
				break;
			case 'TS_gpfl':
				price = 1800;
				break;
			case 'LT_2_0k':
				price = 2000;
				break;
			case 'LF_2chd':
				price = 2200;
				break;
			case 'LT_2_5k':
				price = 2500;
				break;
			case 'LF_2cfd':
				price = 2800;
				break;
		}
		
		return (price * qty);
	},
	'updateCartPrice' : function(){
		var cart_item = $('.evts_cart_DL').data('item'),
			temp_item = $('.evt_ord_proceed').data('item'),
			total = 0,
			discount_LT = 0,
			discount_KR = { 'SD' : false, 'KR' : false , 'PS' : 0, 'UG' : 0},
			discount_BL = { 'BL' : false, 'aB' : false },
			discount_EF = { 'EF' : false, 'aE' : false };
			
		if(!sys.isEmpty(cart_item)){
			for(var i=0; i<cart_item.length; i++){
				var uprice = sys.checkPrice(cart_item[i]);
				
				if(uprice){
					total += uprice;
					
					if(cart_item[i].indexOf('LT_') != -1 || cart_item[i].indexOf('aL_l') != -1 ){
						discount_LT += uprice;
					}else if(cart_item[i].indexOf('SD_') != -1){
						discount_KR.SD = true;
					}else if(cart_item[i].indexOf('KR_krok') != -1){
						discount_KR.KR = true;
						discount_KR.PS++;
					}else if(cart_item[i].indexOf('aK_tv') != -1){
						discount_KR.UG += parseInt(cart_item[i].substr(7));
					}else if(cart_item[i].indexOf('BL_bkln') != -1){
						discount_BL.BL = true;
					}else if(cart_item[i].indexOf('aB_') != -1){
						discount_BL.aB = true;
					}else if(cart_item[i].indexOf('EF_efmc') != -1){
						discount_EF.EF = true;
					}else if(cart_item[i].indexOf('aE_') != -1){
						discount_EF.aE = true;
					}
				}else{
					if(cart_item[i] == 'LS_sidr' || cart_item[i] == 'LS_sfly' || cart_item[i] == 'LS_sodr'){
						var wdth = 1,
							hght = 1,
							ledTypePrice = 22;
							limit = ((cart_item.length > (i+3)) ? (i+3) : cart_item.length),
							screenPrice = 0;
							
						for(var j=(i+1); j<limit; j++){
							if(!sys.isEmpty(cart_item[j])){
								switch(cart_item[j].substr(0, 7)){
									case 'aS_ledw':
										wdth = parseFloat(cart_item[j].substr(7));
										break;
									case 'aS_ledh':
										hght = parseFloat(cart_item[j].substr(7));
										break;
								}
							}
						}
						
						if(cart_item[i] == 'LS_sidr'){
							ledTypePrice = 20;
						}
						
						screenPrice += (((wdth * 3.28084) * (hght * 3.28084)) * ledTypePrice);
						uprice += screenPrice;
						
						if(screenPrice < 1500){
							uprice += 400;
						}else if(screenPrice < 2000){
							uprice += 300;
						}else{
							uprice += 200;
						}
						
						total += uprice;
					}else if(cart_item[i] == 'SG_4f4f'){
						var lgth = 4,
							wdth = 4,
							crpt = 0,
							stcs = 0,
							limit = ((cart_item.length > (i+6)) ? (i+6) : cart_item.length);
							
						for(var j=(i+1); j<limit; j++){
							if(!sys.isEmpty(cart_item[j])){
								switch(cart_item[j].substr(0, 7)){
									case 'aG_sslg':
										lgth = parseFloat(cart_item[j].substr(7));
										break;
									case 'aG_sswh':
										wdth = parseFloat(cart_item[j].substr(7));
										break;
									case 'aG_stcs':
										stcs = parseFloat(cart_item[j].substr(7));
										break;
									case 'aG_crpt':
										crpt = parseFloat(cart_item[j].substr(7));
										break;
								}
							}
						}
						
						uprice += 200;
						uprice += (( lgth * wdth ) * 4.5);
						if(crpt){
							uprice += ( lgth * wdth );
						}
						if(stcs){
							uprice += ( stcs * 150);
							
							if((lgth * wdth) >= 96){
								uprice -= 150;
							}
						}
						
						total += uprice;
					}else if(cart_item[i] == 'BD_3f3f'){
						var lgth = 3,
							hgth = 3;
							limit = ((cart_item.length > (i+3)) ? (i+3) : cart_item.length);
							
						for(var j=(i+1); j<limit; j++){
							if(!sys.isEmpty(cart_item[j])){
								switch(cart_item[j].substr(0, 7)){
									case 'aR_bdlg':
										lgth = parseFloat(cart_item[j].substr(7));
										break;
									case 'aR_bdhg':
										hgth = parseFloat(cart_item[j].substr(7));
										break;
								}
							}
						}
						
						uprice += (( lgth * hgth ) * 6.5);
						
						total += uprice;
					}
				}
			}
		}
		
		if(!sys.isEmpty(temp_item)){
			for(var i=0; i<temp_item.length; i++){
				var uprice = sys.checkPrice(temp_item[i]);
				
				if(uprice){
					total += uprice;
					
					if(temp_item[i].indexOf('LT_') != -1 || temp_item[i].indexOf('aL_l') != -1 ){
						discount_LT += uprice;
					}else if(temp_item[i].indexOf('SD_') != -1){
						discount_KR.SD = true;
					}else if(temp_item[i].indexOf('KR_krok') != -1){
						discount_KR.KR = true;
						discount_KR.PS++;
					}else if(temp_item[i].indexOf('aK_tv') != -1){
						discount_KR.UG += parseInt(temp_item[i].substr(7));
					}else if(temp_item[i].indexOf('BL_bkln') != -1){
						discount_BL.BL = true;
					}else if(temp_item[i].indexOf('aB_') != -1){
						discount_BL.aB = true;
					}else if(temp_item[i].indexOf('EF_efmc') != -1){
						discount_EF.EF = true;
					}else if(temp_item[i].indexOf('aE_') != -1){
						discount_EF.aE = true;
					}
				}else{
					if(!sys.isEmpty(temp_item[i])){
						if(temp_item[i] == 'LS_sidr' || temp_item[i] == 'LS_sfly' || temp_item[i] == 'LS_sodr'){
							var wdth = 1,
								hght = 1,
								ledTypePrice = 22;
								limit = ((temp_item.length > (i+3)) ? (i+3) : temp_item.length),
								screenPrice = 0;
								
							for(var j=(i+1); j<limit; j++){
								if(!sys.isEmpty(temp_item[j])){
									switch(temp_item[j].substr(0, 7)){
										case 'aS_ledw':
											lgth = parseFloat(temp_item[j].substr(7));
											break;
										case 'aS_ledh':
											hght = parseFloat(temp_item[j].substr(7));
											break;
									}
								}
							}
							
							if(temp_item[i] == 'LS_sidr'){
								ledTypePrice = 20;
							}
							
							screenPrice += (((wdth * 3.28084) * (hght * 3.28084)) * ledTypePrice);
							uprice += screenPrice;
							
							if(screenPrice < 1500){
								uprice += 400;
							}else if(screenPrice < 2000){
								uprice += 300;
							}else{
								uprice += 200;
							}
							
							total += uprice;
						}else if(temp_item[i].substr(0, 7) == 'aS_ledw'){
							var wdth = 1,
								hght = 1,
								ledTypePrice = 22;
								limit = ((temp_item.length > (i+3)) ? (i+3) : temp_item.length),
								screenPrice = 0;
								
							for(var j=i; j<limit; j++){
								if(!sys.isEmpty(temp_item[j])){
									switch(temp_item[j].substr(0, 7)){
										case 'aS_ledw':
											wdth = parseFloat(temp_item[j].substr(7));
											break;
										case 'aS_ledh':
											hght = parseFloat(temp_item[j].substr(7));
											break;
									}
								}
							}
							
							if(cart_item[(cart_item.length - 1)] == 'LS_sidr'){
								ledTypePrice = 20;
							}
							uprice -= 400;
							screenPrice += ((((wdth) * 3.28084) * ((hght) * 3.28084)) * ledTypePrice);
							uprice += (screenPrice - (3.28084*3.28084*ledTypePrice));
							
							if(screenPrice < 1500){
								uprice += 400;
							}else if(screenPrice < 2000){
								uprice += 300;
							}else{
								uprice += 200;
							}
							
							total += uprice;
						}else if(temp_item[i] == 'SG_4f4f'){
							var lgth = 4,
								wdth = 4,
								crpt = 0,
								stcs = 0,
								limit = ((temp_item.length > (i+6)) ? (i+6) : temp_item.length);
								
							for(var j=(i+1); j<limit; j++){
								switch(temp_item[j].substr(0, 7)){
									case 'aG_sslg':
										lgth = parseFloat(temp_item[j].substr(7));
										break;
									case 'aG_sswh':
										wdth = parseFloat(temp_item[j].substr(7));
										break;
									case 'aG_stcs':
										stcs = parseFloat(temp_item[j].substr(7));
										break;
									case 'aG_crpt':
										crpt = parseFloat(temp_item[j].substr(7));
										break;
								}
							}
							
							uprice += 200;
							uprice += (( lgth * wdth ) * 4.5);
							if(crpt){
								uprice += ( lgth * wdth );
							}
							if(stcs){
								uprice += ( stcs * 150);
								
								if((lgth * wdth) >= 96){
									uprice -= 150;
								}
							}
							
							total += uprice;
						}else if(temp_item[i].substr(0, 7) == 'aG_sslg'){
							var lgth = 4,
								wdth = 4,
								crpt = 0,
								stcs = 0,
								limit = ((temp_item.length > (i+5)) ? (i+6) : temp_item.length);
								
							for(var j=i; j<limit; j++){
								switch(temp_item[j].substr(0, 7)){
									case 'aG_sslg':
										lgth = parseFloat(temp_item[j].substr(7));
										break;
									case 'aG_sswh':
										wdth = parseFloat(temp_item[j].substr(7));
										break;
									case 'aG_stcs':
										stcs = parseFloat(temp_item[j].substr(7));
										break;
									case 'aG_crpt':
										crpt = parseFloat(temp_item[j].substr(7));
										break;
								}
							}
							
							uprice -= 272;
							uprice += 200;
							uprice += (( lgth * wdth ) * 4.5);
							if(crpt){
								uprice += ( lgth * wdth );
							}
							if(stcs){
								uprice += ( stcs * 150);
								
								if((lgth * wdth) >= 96){
									uprice -= 150;
								}
							}
							
							total += uprice;
						}else if(temp_item[i] == 'BD_3f3f'){
							var lgth = 3,
								hgth = 3,
								limit = ((temp_item.length > (i+3)) ? (i+3) : temp_item.length);
								
							for(var j=(i+1); j<limit; j++){
								switch(temp_item[j].substr(0, 7)){
									case 'aR_bdlg':
										lgth = parseFloat(temp_item[j].substr(7));
										break;
									case 'aR_bdhg':
										hgth = parseFloat(temp_item[j].substr(7));
										break;
								}
							}
							
							uprice += (( lgth * hgth ) * 6.5);
							
							total += uprice;
						}else if(temp_item[i].substr(0, 7) == 'aR_bdlg'){
							var lgth = 3,
								hgth = 3,
								limit = ((temp_item.length > (i+2)) ? (i+3) : temp_item.length);
								
							for(var j=i; j<limit; j++){
								switch(temp_item[j].substr(0, 7)){
									case 'aR_bdlg':
										lgth = parseFloat(temp_item[j].substr(7));
										break;
									case 'aR_bdhg':
										hgth = parseFloat(temp_item[j].substr(7));
										break;
								}
							}
							
							uprice -= 58.5;
							uprice += (( lgth * hgth ) * 6.5);
							
							total += uprice;
						}
					}
				}
			}
		}
		
		if(discount_LT >= 3000){
			total -= (discount_LT/10);
		}
		
		if(discount_KR.SD && discount_KR.KR){
			total -= 100;
		}
		
		if(discount_KR.PS > 0 && discount_KR.UG > 0){
			if(discount_KR.PS <= discount_KR.UG){
				total -= (discount_KR.PS * 150);
			}else{
				total -= (discount_KR.UG * 150);
			}
		}
		
		if(discount_BL.BL && discount_BL.aB){
			total -= 100;
		}
		
		if(discount_EF.EF && discount_EF.aE){
			total -= 80;
		}
		
		if(total>0 && total<500){
			total += 100;
		}
		
		$('.evts_ord_price').text(total.toFixed(2));
	},
	'getAddOn' : function(code){
		switch(code){
			case 'SD_hset':
			case 'SD_2t2m':
			case 'SD_4t2m':
			case 'SD_6t2m':
				return 2;
				break;
			case 'SG_4f4f':
				return 3;
				break;
			case 'LT_ctst':
			case 'LT_f600':
			case 'LT_1_0k':
			case 'LT_1_5k':
			case 'LT_2_0k':
			case 'LT_2_5k':
				return 5;
			case 'LS_sidr':
			case 'LS_sfly':
			case 'LS_sodr':
				return 6;
			case 'PJ_pjol':
			case 'PJ_p6x6':
			case 'PJ_p8x8':
				return 7;
			case 'TV_tv43':
			case 'TV_tv55':
			case 'TV_tv65':
				return 8;
			case 'KR_krok':
				return 9;
			case 'BL_bkln':
				return 10;
			case 'TS_gp12':
			case 'TS_gp16':
			case 'TS_gpfl':
				return 11;
			case 'TS_gpct':
				return 12;
			case 'BD_3f3f':
				return 13;
			case 'LF_1chd':
			case 'LF_1cfd':
			case 'LF_2chd':
			case 'LF_2cfd':
				return 14;
			case 'EF_efmc':
				return 15;
				break;
		}
		
		return 0;
	},
	'getWeekNum' : function(dt){
		dt = new Date(Date.UTC(dt.getFullYear(), dt.getMonth(), dt.getDate()));
		dt.setUTCDate(dt.getUTCDate() + 4 - (dt.getUTCDay()||7));
		
		var yearStart = new Date(STORAGE.getItem('created'));
		var weekNo = Math.ceil(( ( (dt - yearStart) / 86400000) + 1)/7);
		
		return weekNo;
	},
	'getDayNum' : function(dt){
		var start = new Date(STORAGE.getItem('created'));
		var diff = dt - start;
		var oneDay = 1000 * 60 * 60 * 24;
		var day = Math.floor(diff / oneDay);
		
		return (day+1);
	},
	'arrangeTask' : function(){
		var day = $('#task_tl').find('div.timeline-item-content').length;
		
		for(var i=0; i<day; i++){
			var task = $('#task_tl').find('div.timeline-item-content:eq('+i+')').find('div.timeline-item-inner').length,
				time = [];
			
			for(var j=0; j<task; j++){
				time[j] = {
					't' : $('#task_tl').find('div.timeline-item-content:eq('+i+')').find('div.timeline-item-inner:eq('+j+')').find('.timeline-item-time').text(),
					's' : j
				};
				$('#task_tl').find('div.timeline-item-content:eq('+i+')').find('div.timeline-item-inner:eq('+j+')').attr('data-num', j);
			}
			
			time.sort(function(a, b){
				if (a.t < b.t){
					return -1;
				}
				if (a.t > b.t){
					return 1;
				}
				return 0;
			});
			
			for(var j=0; j<time.length; j++){
				($('#task_tl').find('div.timeline-item-content:eq('+i+')').find('div.timeline-item-inner[data-num="'+time[j].s+'"]')).appendTo($('#task_tl div.timeline-item-content:eq('+i+')'));
			}
		}
	}
}