var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var apps = new Framework7({
			  root: '#app',
			  id: 'com.wkv.manage',
			  name: 'WKV',
			  theme: 'md',
			  version: "1.0.88",
			  rtl: false,
			  language: "en-US"
		  });
var geoToken = true, geoCount = 120;

var app = {
    initialize: function() {
        this.bindEvents();
    },
	
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function() {
        app.receivedEvent('deviceready');
		
		var fetchTask = function(){
			var DATA = {
					'usr' : STORAGE.getItem('usr')
				};
			var post_data = "ACT=" + encodeURIComponent('msg_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			if(STORAGE.getItem('usr')){
				$.ajax({
					type: 'POST',
					url: 'http://app.wkventertainment.com/',
					data: post_data,
					success: function(str){
						var inf = JSON.parse(str);
					
						if(inf['reply']==='200 OK'){
							if(inf['new']){
								cordova.plugins.notification.local.hasPermission(function(granted){
									cordova.plugins.notification.local.schedule({
										title: inf['title'],
										text: inf['text'],
										foreground: false
									});
								});
							}
						}else{
							navigator.notification.alert(
								'Error occur',
								console.log(('Error + ' + inf['reply'])),
								('Contact administrator, Error code : [' + inf['reply'] + ']'),
								'OK'
							);
						}
					}
				});
			}
			
			window.SchedulerPlugin.finish();
		};
		 
		var errorHandler = function(error){
			'Error occur',
			console.log('SchedulerPlugin error: ', error),
			('Contact administrator, Error : [' + error + ']'),
			'OK'
		};
		
		window.SchedulerPlugin.configure(
			fetchTask,
			errorHandler,
			{ minimumFetchInterval: 30 }
		);
		
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
				url: 'http://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
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
							
							$('span.ncf-pos1').text(inf['pos1'].toLowerCase());
							$('span.ncf-pos2').text(inf['pos2'].toLowerCase());
							$('span.ncf-name').text(inf['name'].toLowerCase());
							$('span.ncf-name').html($('span.ncf-name').text().replace(/ /g, '&nbsp;&nbsp;&nbsp;'));
							$('#edpf_name').val(inf['name']);
							$('span.ncf-tel').text(inf['contact'].toLowerCase());
							$('#edpf_tel').val(inf['contact']);
							$('span.ncf-email').text(inf['email'].toLowerCase());
							$('#edpf_eml').val(inf['email']);
							
							$('div.views').css('opacity', '1');
							
							$('#lgn input[name="lgn_usr"]').val('');
							$('#lgn input[name="lgn_pwd"]').val('');
							
							sys.eventCheck(usr, (new Date().getMonth()), new Date().getYear()+1900);
							
							if(inf['status'].length){
								var status = inf['status'], x = '';
								
								for(var i=0; i<status.length; i++){
									x += '<li><a href="#" class="item-link item-content" data-usr="' + status[i].user_id + '" data-who="' + status[i].nc_name + '">';
									x += '<div class="item-media"><i class="icon material-icons md-only">' + (status[i].clocked_in == 1 ? 'directions_run' : 'hotel') + '</i></div>';
									x += '<div class="item-inner"><div class="item-title">' + status[i].nc_name + (status[i].clocked_in == 1 ? ('<div class="item-footer">' + status[i].clocked_time + '</div>') : '') + '</div></div></a></li>';
								}
								$('#user-status').html(x);
							}
							
							for(var i=9; i>parseInt(inf['level']); i--){
								if($('.level'+i).length > 0){
									$('.level'+i).remove();
								}
							}
							
							apps.loginScreen.close('#lgn');
						}else{
							var failed_toast = apps.toast.create({
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
							url: 'http://app.wkventertainment.com/',
							data: post_data,
							beforeSend: function(){
								sys.loading(1);
							},
							success: function(str){
								sys.loading(0);
								$('.popup-event .event_list').data('date', tmp.toDateString().substr(4));
								
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
										x += '<td class="tb-pic label-cell">'+inf[i].pic+'</td>';
										x += '<td class="tb-ld label-cell">'+((inf[i].luncheon_dinner==null) ? '-' : ((inf[i].luncheon_dinner=='Lunch') ? 'L' : 'D'))+'</td>';
										x += '<td class="tb-venue label-cell">'+((inf[i].venue==null) ? '-' : inf[i].venue)+'</td>';
										x += '<td class="tb-desc tablet-only">'+((inf[i].description==null) ? '-' : inf[i].description)+'</td>';
										x += '<td class="tb-mixer tablet-only">'+((inf[i].mixer==null) ? '-' : inf[i].mixer)+'</td>';
										x += '<td class="tb-wmic tablet-only">'+((inf[i].wireless_mic==null) ? '-' : inf[i].wireless_mic)+'</td>';
										x += '<td class="tb-spkr tablet-only">'+((inf[i].speaker==null) ? '-' : inf[i].speaker)+'</td>';
										x += '<td class="tb-band tablet-only">'+((inf[i].band==null) ? '-' : inf[i].band)+'</td>';
										x += '<td class="tb-crew label-cell">'+((inf[i].crew==null) ? '-' : sys.unameToSname(inf[i].crew))+'</td>';
										x += '<td class="tb-cin label-cell">'+((inf[i].car_in==null) ? '-' : inf[i].car_in)+'</td>';
										x += '<td class="tb-cout label-cell">'+((inf[i].car_out==null) ? '-' : inf[i].car_out)+'</td>';
										x += '<td class="tb-bng tablet-only">'+((inf[i].bride_groom==null) ? '-' : inf[i].bride_groom)+'</td>';
										x += '</tr>';
									}
									x += '</tbody>';
									
									$('.popup-event .event_list').html(x);
									$('table.event_list').data('info', inf);
									
									for(var i=0; i<inf.length; i++){
										$('tr[name="el'+(i+1)+'"]').data('info', inf[i]);
									}
								}
								$('.popup-event .event_date').text(tmp.toDateString().substr(4));
								apps.popup.open('.popup-event');
								
								$('.event_list span').on('click', function(){
									var x = '';
									var inf = $('tr[name="' + $(this).attr('name') + '"]').data('info');
									var trName = $(this).attr('name');
									
									if(parseInt($('body').data('user_level'))>=8){
										var crews = $('body').data('crew');
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap"><input class="evtd_ld" type="text" autocomplete="off" value="' + ((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap"><input class="evtd_venue" type="text" autocomplete="off" value="' + ((inf.venue==null) ? '' : inf.venue) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap"><input class="evtd_desc" type="text" autocomplete="off" value="' + ((inf.description==null) ? '' : inf.description) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Price</div><div class="item-input-wrap"><input class="evtd_price" type="text" autocomplete="off" value="' + ((inf.price==null) ? '' : inf.price) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Mixer</div><div class="item-input-wrap"><input class="evtd_mixer" type="text" autocomplete="off" value="' + ((inf.mixer==null) ? '' : inf.mixer) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Wireless Microphone</div><div class="item-input-wrap"><input class="evtd_wmic" type="text" autocomplete="off" value="' + ((inf.wireless_mic==null) ? '' : inf.wireless_mic) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Speaker</div><div class="item-input-wrap"><input class="evtd_spkr" type="text" autocomplete="off" value="' + ((inf.speaker==null) ? '' : inf.speaker) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap"><input class="evtd_band" type="text" autocomplete="off" value="' + ((inf.band==null) ? '' : inf.band) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap"><input class="evtd_crew" type="text" autocomplete="off" data-uname="' + inf.crew + '" value="' + ((inf.crew==null) ? '' : sys.unameToSname(inf.crew)) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap"><input class="evtd_cin" type="text" autocomplete="off" value="' + ((inf.car_in==null) ? '' : inf.car_in) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap"><input class="evtd_cout" type="text" autocomplete="off" value="' + ((inf.car_out==null) ? '' : inf.car_out) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Client, Bride/Groom</div><div class="item-input-wrap"><input class="evtd_bng" type="text" autocomplete="off" value="' + ((inf.bride_groom==null) ? '' : inf.bride_groom) + '"></div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row"><button class="evtd_sve button col button-fill" data-eid="' + inf.primary_id + '">Save</button>';
										if(parseInt($('body').data('user_level'))>=9){
											x += '<button class="evtd_dlt button col button-fill" data-eid="' + inf.primary_id + '">Delete</button>';
										}
										x += '</div></div></div></li>';
									}else{
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap">' + ((inf.luncheon_dinner==null) ? '-' : inf.luncheon_dinner) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap">' + ((inf.venue==null) ? '-' : inf.venue) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap">' + ((inf.description==null) ? '-' : inf.description) + '</div></div></div></li>';
										if(parseInt($('body').data('user_level'))>=7){
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">price</div><div class="item-input-wrap">' + ((inf.price==null) ? '-' : inf.price) + '</div></div></div></li>';
										}
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Mixer</div><div class="item-input-wrap">' + ((inf.mixer==null) ? '-' : inf.mixer) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Wireless Microphone</div><div class="item-input-wrap">' + ((inf.wireless_mic==null) ? '-' : inf.wireless_mic) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Speaker</div><div class="item-input-wrap">' + ((inf.speaker==null) ? '-' : inf.speaker) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap">' + ((inf.band==null) ? '-' : inf.band) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap">' + ((inf.crew==null) ? '-' : sys.unameToSname(inf.crew)) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap">' + ((inf.car_in==null) ? '-' : inf.car_in) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap">' + ((inf.car_out==null) ? '-' : inf.car_out) + '</div></div></div></li>';
										x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Client, Bride/Groom</div><div class="item-input-wrap">' + ((inf.bride_groom==null) ? '-' : inf.bride_groom) + '</div></div></div></li>';
									}
									
									x = x.replace(/(?:\r\n|\r|\n)/g, '<br>');
									$('.details-popover ul').html(x);
									$('div.details-popover').data('info', inf);
									
									if(parseInt($('body').data('user_level'))>=8){
										$('.details-popover button.evtd_sve').data('trName', trName);
										$('.details-popover button.evtd_sve').on('click', function(){
											var pid = $(this).data('eid'),
												ld = $('input.evtd_ld').val(),
												venue = $('input.evtd_venue').val(),
												desc = $('input.evtd_desc').val(),
												price = $('input.evtd_price').val(),
												mixer = $('input.evtd_mixer').val(),
												wmic = $('input.evtd_wmic').val(),
												spkr = $('input.evtd_spkr').val(),
												band = $('input.evtd_band').val(),
												crew = $('input.evtd_crew').data('uname'),
												cin = $('input.evtd_cin').val(),
												cout = $('input.evtd_cout').val(),
												bng = $('input.evtd_bng').val();
											
											var DATA = {
												'usr' : STORAGE.getItem('usr'),
												'pid' : pid,
												'ld' : ld,
												'venue' : venue,
												'desc' : desc,
												'price' : price,
												'mixer' : mixer,
												'wmic' : wmic,
												'spkr' : spkr,
												'band' : band,
												'crew' : crew,
												'cin' : cin,
												'cout' : cout,
												'bng' : bng
											};
											var post_data = "ACT=" + encodeURIComponent('evd_udt')
														  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
														  
											$.ajax({
												type: 'POST',
												url: 'http://app.wkventertainment.com/',
												data: post_data,
												beforeSend: function(){
													sys.loading(1);
												},
												success: function(str){
													sys.loading(0);
													
													if(str==='200 OK'){
														inf.luncheon_dinner = ((ld == '') ? 'Dinner' : ld);
														inf.venue = ((venue == '') ? null : venue);
														inf.description = ((desc == '') ? null : desc);
														inf.price = ((price == '') ? null : price);
														inf.mixer = ((mixer == '') ? null : mixer);
														inf.wireless_mic = ((wmic == '') ? null : wmic);
														inf.speaker = ((spkr == '') ? null : spkr);
														inf.band = ((band == '') ? null : band);
														inf.crew = ((crew == '') ? null : crew);
														inf.car_in = ((cin == '') ? null : cin);
														inf.car_out = ((cout == '') ? null : cout);
														inf.bride_groom = ((bng == '') ? null : bng);
														$('tr[name="' + trName + '"]').data('info', inf);
														$('div.details-popover').data('info', inf);
														$('tr[name="' + trName + '"] td.tb-ld').text((ld == 'Lunch') ? 'L' : 'D');
														$('tr[name="' + trName + '"] td.tb-venue').text((venue == '' ? '-' : venue));
														$('tr[name="' + trName + '"] td.tb-desc').text((desc == '' ? '-' : desc));
														$('tr[name="' + trName + '"] td.tb-price').text((price == '' ? '-' : price));
														$('tr[name="' + trName + '"] td.tb-mixer').text((mixer == '' ? '-' : mixer));
														$('tr[name="' + trName + '"] td.tb-wmic').text((wmic == '' ? '-' : wmic));
														$('tr[name="' + trName + '"] td.tb-spkr').text((spkr == '' ? '-' : spkr));
														$('tr[name="' + trName + '"] td.tb-band').text((band == '' ? '-' : band));
														$('tr[name="' + trName + '"] td.tb-crew').text((crew == '' ? '-' : sys.unameToSname(crew)));
														$('tr[name="' + trName + '"] td.tb-cin').text((cin == '' ? '-' : cin));
														$('tr[name="' + trName + '"] td.tb-cout').text((cout == '' ? '-' : cout));
														$('tr[name="' + trName + '"] td.tb-bng').text((bng == '' ? '-' : bng));									
														
														$('.fab.evtd_shr').css('display', 'none');
														
														var success_toast = apps.toast.create({
																			   icon: '<i class="material-icons">cloud_done</i>',
																			   text: 'Details Successfully Saved',
																			   position: 'center',
																			   closeTimeout: 2000
																		   });
														success_toast.open();
														
														navigator.vibrate(100);
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
												url: 'http://app.wkventertainment.com/',
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
									$('.fab.evtd_shr').css('display', 'block');
									apps.popover.open('.details-popover');
								});
							}
						});
					}
				}
			});
		}
	};
	sys.dayClick(usr);
	sys.eventCheck(usr, (new Date().getMonth()), new Date().getYear()+1900);
	
	$('.details-popover').on('click', 'input.evtd_crew', function(){
		var crews = $('body').data('crew'),
			work = (sys.isEmpty($('input.evtd_crew').data('uname')) ? [] : $('input.evtd_crew').data('uname').split(','));
			x = '';
		
		for(var i = 0; i < crews.length; i++){
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
		$('.evt-crew ul').html(x);
		apps.panel.open('left', true);
	});
	
	$('div.evt-crew').on('click', 'li', function(){
		var wcrew = [], wcrewsn = [];
		
		for(var i=0; i<$('input[name="evcw-checkbox"]:checked').length; i++){
			wcrew.push($('input[name="evcw-checkbox"]:checked:eq('+i+')').val());
			wcrewsn.push($('input[name="evcw-checkbox"]:checked:eq('+i+')').data('sn'));
		}
		
		$('input.evtd_crew').data('uname', wcrew.join(','));
		$('input.evtd_crew').val(wcrewsn.join(', '));
	});
	
	$('#status-btn').on('click', function(){
		var DATA = {
				'usr' : STORAGE.getItem('usr')
			};
		var post_data = "ACT=" + encodeURIComponent('usr_chk')
					  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
					  
		$.ajax({
			type: 'POST',
			url: 'http://app.wkventertainment.com/',
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
						if(status[i].user_level > 0){
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
			url: 'http://app.wkventertainment.com/',
			data: post_data,
			beforeSend: function(){
				sys.loading(1);
				$('.status-name').text(who);
			},
			success: function(str){
				if(sys.isEmpty(str)){
					str = '{"clock_action":"NO","reply":"200 OK"}';
				}
				var inf = JSON.parse(str);
				
				if(inf['reply']==='200 OK'){
					if(inf['clock_action']=='IN' || inf['clock_action']=='ADD' || inf['clock_action']=='OUT'){
						var x = '';
						x += '<iframe width="100%" height="300" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=' + inf['clock_location'] + '&zoom=16"> </iframe>';
						$('.panel-status .clk-loc').html(x);
						$('.panel-status .clk-time').html(inf['clock_action'] + ' : ' + inf['clock_in_out']);
					}else{
						$('.panel-status .clk-loc').html('');
						$('.panel-status .clk-time').html('No record.');
					}
					sys.loading(0);
					apps.panel.open('right', true);
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
	
	$('#crewl-btn').on('click', function(){
		var x = '', crews = $('body').data('crew');
		
		for(var i = 0; i < crews.length; i++){
			x += '<li>';
			x += '<a href="#" class="item-link item-content" data-num="' + i + '">';
			x += '<div class="item-inner">';
			x += '<div class="item-title">';
			x += crews[i]['nc_name'];
			x += '<div class="item-footer">' + crews[i]['short_name'] + '</div>';
			x += '</div>';
			x += '</div>';
			x += '</a>';
			x += '</li>';
		}
		$('.crew_list ul').html(x);
	});
	
	$('.crew_list').on('click', 'a.item-link', function(){
		var crew = $('body').data('crew')[$(this).data('num')];
		
		$('#crewld_dname').data('uid', crew['user_id']);
		$('#crewld_dname').data('num', $(this).data('num'));
		$('#crewld_dname').val(crew['nc_name']);
		$('#crewld_sname').val(crew['short_name']);
		apps.popover.open('.crewld-popover');
	});
	
	$('.crewld_ok').on('click', function(){
		
	});
	
	$('input#ltcl_nme').on('keyup', function(){
		var tmp = ($(this).val()).toLowerCase();
		
		if(tmp.includes('beam') || tmp.includes('moving') || tmp.includes('wash') || tmp.includes('zoom')){
			$('#ltcl_ads').val('16');
		}else if(tmp.includes('par') || tmp.includes('pcc') || tmp.includes('pcw') || tmp.includes('small')){
			$('#ltcl_ads').val('8');
		}else if(tmp.includes('city')){
			$('#ltcl_ads').val('3');
		}else if(tmp.includes('led 200') || tmp.includes('200')){
			$('#ltcl_ads').val('20');
		}else if(tmp.includes('blinder')){
			$('#ltcl_ads').val('12');
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
		var loc = $('iframe#gmap').data('loc');
		
		$('iframe#gmap').attr('src', ('https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center='+loc+'&zoom=17'));
		sys.getTime();
	})
	
	$$('button.clock-check').on('click', function () {
		apps.dialog.confirm('Clock to this location?', 'Confirmation', function(){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('clk_add')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'http://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					if(str=='200 OK'){
						var clockcheck_toast = apps.toast.create({
												icon: '<i class="material-icons">alarm_add</i>',
												text: 'Clocked',
												position: 'center',
												closeTimeout: 2000
											});
						clockcheck_toast.open();
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
	
	$$('button.clock-in').on('click', function () {
		apps.dialog.confirm('Clock in to this location?', 'Confirmation', function(){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('clk_in')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'http://app.wkventertainment.com/',
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
		apps.dialog.confirm('Clock out from this location?', 'Confirmation', function(){
			var DATA = {
				'usr' : STORAGE.getItem('usr'),
				'loc' : $('iframe#gmap').data('loc')
			};
			var post_data = "ACT=" + encodeURIComponent('clk_out')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'http://app.wkventertainment.com/',
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
	
	$('a.evts_shr').on('click', function(){
		var inf = $('table.event_list').data('info');

		var share = '';
		
		if(inf.length == 0){
			share += 'No event.'
		}else{
			share = sys.toMonth(inf[0].date) + ' ' + sys.toDay(inf[0].date) + ' (' + sys.toWeek(inf[0].date) + ')\n\n';
			
			for(var i = 0; i < inf.length; i++){
				share += (i+1) + '. ' + (sys.isEmpty(inf[i].description) ? '' : (inf[i].description + ', ')) + inf[i].venue + '.\n';
				share += '< *' + (sys.isEmpty(inf[i].crew) ? '-' : (inf[i].crew)) + '* >\n';
			}
		}

		window.plugins.socialsharing.share(share);
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
				url: 'http://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					var inf = JSON.parse(str);
			
					if(inf['reply']==='200 OK'){
						var num = $('.popup-event .event_list tbody tr').length;
						if(num == 0){
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
								  + '<th class="tablet-only">B/G</th></tr></thead><tbody>';
							
							x += '<tr name="el1"><td class="label-cell"><span class="button button-fill" name="el1">1</span></td>';
							x += '<td class="tb-pic label-cell">'+pic+'</td>';
							x += '<td class="tb-ld label-cell">'+((ld=='Lunch') ? 'L' : 'D')+'</td>';
							x += '<td class="tb-venue label-cell">-</td>';
							x += '<td class="tb-desc tablet-only">'+((desc=='') ? '-' : desc)+'</td>';
							x += '<td class="tb-mixer tablet-only">-</td>';
							x += '<td class="tb-wmic tablet-only">-</td>';
							x += '<td class="tb-spkr tablet-only">-</td>';
							x += '<td class="tb-band tablet-only">-</td>';
							x += '<td class="tb-crew label-cell">-</td>';
							x += '<td class="tb-cin label-cell">-</td>';
							x += '<td class="tb-cout label-cell">-</td>';
							x += '<td class="tb-bng tablet-only">-</td>';
							x += '</tr>';
							x += '</tbody>';
							$('.popup-event .event_list').html(x);
							
							$('table.event_list').data('info', inf[0]);
							$('tr[name="el1"]').data('info', inf[0]);
						}else{
							var nnum = parseInt($('.popup-event .event_list tbody tr:nth-child('+ num +')').attr('name').substr(2)) + 1;
							var x = '';
							
							x += '<tr name="el' + nnum + '"><td class="label-cell"><span class="button button-fill" name="el' + nnum + '">' + nnum + '</span></td>';
							x += '<td class="tb-pic label-cell">'+pic+'</td>';
							x += '<td class="tb-ld label-cell">'+((ld=='Lunch') ? 'L' : 'D')+'</td>';
							x += '<td class="tb-venue label-cell">-</td>';
							x += '<td class="tb-desc tablet-only">'+((desc=='') ? '-' : desc)+'</td>';
							x += '<td class="tb-mixer tablet-only">-</td>';
							x += '<td class="tb-wmic tablet-only">-</td>';
							x += '<td class="tb-spkr tablet-only">-</td>';
							x += '<td class="tb-band tablet-only">-</td>';
							x += '<td class="tb-crew label-cell">-</td>';
							x += '<td class="tb-cin label-cell">-</td>';
							x += '<td class="tb-cout label-cell">-</td>';
							x += '<td class="tb-bng tablet-only">-</td>';
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
							
							if(parseInt($('body').data('user_level'))>=8){
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap"><input class="evtd_ld" type="text" autocomplete="off" value="' + ((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap"><input class="evtd_venue" type="text" autocomplete="off" value="' + ((inf.venue==null) ? '' : inf.venue) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap"><input class="evtd_desc" type="text" autocomplete="off" value="' + ((inf.description==null) ? '' : inf.description) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Price</div><div class="item-input-wrap"><input class="evtd_price" type="text" autocomplete="off" value="' + ((inf.price==null) ? '' : inf.price) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Mixer</div><div class="item-input-wrap"><input class="evtd_mixer" type="text" autocomplete="off" value="' + ((inf.mixer==null) ? '' : inf.mixer) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Wireless Microphone</div><div class="item-input-wrap"><input class="evtd_wmic" type="text" autocomplete="off" value="' + ((inf.wireless_mic==null) ? '' : inf.wireless_mic) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Speaker</div><div class="item-input-wrap"><input class="evtd_spkr" type="text" autocomplete="off" value="' + ((inf.speaker==null) ? '' : inf.speaker) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap"><input class="evtd_band" type="text" autocomplete="off" value="' + ((inf.band==null) ? '' : inf.band) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap"><input class="evtd_crew" type="text" autocomplete="off" value="' + ((inf.crew==null) ? '' : inf.crew) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap"><input class="evtd_cin" type="text" autocomplete="off" value="' + ((inf.car_in==null) ? '' : inf.car_in) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap"><input class="evtd_cout" type="text" autocomplete="off" value="' + ((inf.car_out==null) ? '' : inf.car_out) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Client, Bride/Groom</div><div class="item-input-wrap"><input class="evtd_bng" type="text" autocomplete="off" value="' + ((inf.bride_groom==null) ? '' : inf.bride_groom) + '"></div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row"><button class="evtd_sve button col button-fill" data-eid="' + inf.primary_id + '">Save</button>';
								if(parseInt($('body').data('user_level'))>=9){
									x += '<button class="evtd_dlt button col button-fill" data-eid="' + inf.primary_id + '">Delete</button>';
								}
								x += '</div></div></div></li>';
							}else{
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap">' + ((inf.luncheon_dinner==null) ? '-' : inf.luncheon_dinner) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap">' + ((inf.venue==null) ? '-' : inf.venue) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap">' + ((inf.description==null) ? '-' : inf.description) + '</div></div></div></li>';
								if(parseInt($('body').data('user_level'))>=7){
									x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">price</div><div class="item-input-wrap">' + ((inf.price==null) ? '-' : inf.price) + '</div></div></div></li>';
								}
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Mixer</div><div class="item-input-wrap">' + ((inf.mixer==null) ? '-' : inf.mixer) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Wireless Microphone</div><div class="item-input-wrap">' + ((inf.wireless_mic==null) ? '-' : inf.wireless_mic) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Speaker</div><div class="item-input-wrap">' + ((inf.speaker==null) ? '-' : inf.speaker) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap">' + ((inf.band==null) ? '-' : inf.band) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap">' + ((inf.crew==null) ? '-' : inf.crew) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle to Event</div><div class="item-input-wrap">' + ((inf.car_in==null) ? '-' : inf.car_in) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Vehicle back from Event</div><div class="item-input-wrap">' + ((inf.car_out==null) ? '-' : inf.car_out) + '</div></div></div></li>';
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Client, Bride/Groom</div><div class="item-input-wrap">' + ((inf.bride_groom==null) ? '-' : inf.bride_groom) + '</div></div></div></li>';
							}
							
							x = x.replace(/(?:\r\n|\r|\n)/g, '<br>');
							$('.details-popover ul').html(x);
							$('div.details-popover').data('info', inf);
							
							if(parseInt($('body').data('user_level'))>=8){
								$('.details-popover button.evtd_sve').data('trName', trName);
								$('.details-popover button.evtd_sve').on('click', function(){
									var pid = $(this).data('eid'),
										ld = $('input.evtd_ld').val(),
										venue = $('input.evtd_venue').val(),
										desc = $('input.evtd_desc').val(),
										price = $('input.evtd_price').val(),
										mixer = $('input.evtd_mixer').val(),
										wmic = $('input.evtd_wmic').val(),
										spkr = $('input.evtd_spkr').val(),
										band = $('input.evtd_band').val(),
										crew = $('input.evtd_crew').data('uname'),
										cin = $('input.evtd_cin').val(),
										cout = $('input.evtd_cout').val(),
										bng = $('input.evtd_bng').val();
									
									var DATA = {
										'usr' : STORAGE.getItem('usr'),
										'pid' : pid,
										'ld' : ld,
										'venue' : venue,
										'desc' : desc,
										'price' : price,
										'mixer' : mixer,
										'wmic' : wmic,
										'spkr' : spkr,
										'band' : band,
										'crew' : crew,
										'cin' : cin,
										'cout' : cout,
										'bng' : bng
									};
									var post_data = "ACT=" + encodeURIComponent('evd_udt')
												  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
												  
									$.ajax({
										type: 'POST',
										url: 'http://app.wkventertainment.com/',
										data: post_data,
										beforeSend: function(){
											sys.loading(1);
										},
										success: function(str){
											sys.loading(0);
											
											if(str==='200 OK'){
												inf.luncheon_dinner = ((ld == '') ? 'Dinner' : ld);
												inf.venue = ((venue == '') ? null : venue);
												inf.description = ((desc == '') ? null : desc);
												inf.price = ((price == '') ? null : price);
												inf.mixer = ((mixer == '') ? null : mixer);
												inf.wireless_mic = ((wmic == '') ? null : wmic);
												inf.speaker = ((spkr == '') ? null : spkr);
												inf.band = ((band == '') ? null : band);
												inf.crew = ((crew == '') ? null : crew);
												inf.car_in = ((cin == '') ? null : cin);
												inf.car_out = ((cout == '') ? null : cout);
												inf.bride_groom = ((bng == '') ? null : bng);
												$('tr[name="' + trName + '"]').data('info', inf);
												$('div.details-popover').data('info', inf);
												$('tr[name="' + trName + '"] td.tb-ld').text((ld == 'Lunch') ? 'L' : 'D');
												$('tr[name="' + trName + '"] td.tb-venue').text((venue == '' ? '-' : venue));
												$('tr[name="' + trName + '"] td.tb-desc').text((desc == '' ? '-' : desc));
												$('tr[name="' + trName + '"] td.tb-price').text((price == '' ? '-' : price));
												$('tr[name="' + trName + '"] td.tb-mixer').text((mixer == '' ? '-' : mixer));
												$('tr[name="' + trName + '"] td.tb-wmic').text((wmic == '' ? '-' : wmic));
												$('tr[name="' + trName + '"] td.tb-spkr').text((spkr == '' ? '-' : spkr));
												$('tr[name="' + trName + '"] td.tb-band').text((band == '' ? '-' : band));
												$('tr[name="' + trName + '"] td.tb-crew').text((crew == '' ? '-' : sys.unameToSname(crew)));
												$('tr[name="' + trName + '"] td.tb-cin').text((cin == '' ? '-' : cin));
												$('tr[name="' + trName + '"] td.tb-cout').text((cout == '' ? '-' : cout));
												$('tr[name="' + trName + '"] td.tb-bng').text((bng == '' ? '-' : bng));									
												
												$('.fab.evtd_shr').css('display', 'none');
												
												var success_toast = apps.toast.create({
																	   icon: '<i class="material-icons">cloud_done</i>',
																	   text: 'Details Successfully Saved',
																	   position: 'center',
																	   closeTimeout: 2000
																   });
												success_toast.open();
												
												navigator.vibrate(100);
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
										url: 'http://app.wkventertainment.com/',
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
						});
						
						var success_toast = apps.toast.create({
											   icon: '<i class="material-icons">cloud_done</i>',
											   text: 'Details Successfully Added',
											   position: 'center',
											   closeTimeout: 2000
										   });
						success_toast.open();
						
						navigator.vibrate(100);
						
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
				  + (sys.isEmpty(inf.bride_groom) ? '' : ('Couple Name : ' + inf.bride_groom + '\n'))
				  + 'Venue : ' + inf.venue + '\n'
				  + 'PIC : ' + inf.pic + '\n'
				  + (sys.isEmpty(inf.band) ? '' : (inf.band + '\n'))
				  + 'Setup : 3pm\n' 
				  + 'Sound Check : 5pm\n\n'
				  + (sys.isEmpty(inf.car_in) ? '' : ('Use : ' + inf.car_in + '\n'));
		window.plugins.socialsharing.share(share);
	});
	
	$('.popover-backdrop').on('click', function(e){
		if(this === e.target){
			if(parseInt($('body').data('user_level')) > 7){
				var trName = $('.details-popover button.evtd_sve').data('trName'),
					inf = $('div.details-popover').data('info'),
					pid = $('.details-popover button.evtd_sve').data('eid'),
					ld = $('input.evtd_ld').val(),
					venue = $('input.evtd_venue').val(),
					desc = $('input.evtd_desc').val(),
					price = $('input.evtd_price').val(),
					mixer = $('input.evtd_mixer').val(),
					wmic = $('input.evtd_wmic').val(),
					spkr = $('input.evtd_spkr').val(),
					band = $('input.evtd_band').val(),
					crew = $('input.evtd_crew').data('uname'),
					cin = $('input.evtd_cin').val(),
					cout = $('input.evtd_cout').val(),
					bng = $('input.evtd_bng').val();
				
				var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'pid' : pid,
					'ld' : ld,
					'venue' : venue,
					'desc' : desc,
					'price' : price,
					'mixer' : mixer,
					'wmic' : wmic,
					'spkr' : spkr,
					'band' : band,
					'crew' : crew,
					'cin' : cin,
					'cout' : cout,
					'bng' : bng
				};
				var post_data = "ACT=" + encodeURIComponent('evd_udt')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
							  
				$.ajax({
					type: 'POST',
					url: 'http://app.wkventertainment.com/',
					data: post_data,
					beforeSend: function(){
						sys.loading(1);
					},
					success: function(str){
						sys.loading(0);
						
						if(str==='200 OK'){
							inf.luncheon_dinner = ((ld == '') ? 'Dinner' : ld);
							inf.venue = ((venue == '') ? null : venue);
							inf.description = ((desc == '') ? null : desc);
							inf.price = ((price == '') ? null : price);
							inf.mixer = ((mixer == '') ? null : mixer);
							inf.wireless_mic = ((wmic == '') ? null : wmic);
							inf.speaker = ((spkr == '') ? null : spkr);
							inf.band = ((band == '') ? null : band);
							inf.crew = ((crew == '') ? null : crew);
							inf.car_in = ((cin == '') ? null : cin);
							inf.car_out = ((cout == '') ? null : cout);
							inf.bride_groom = ((bng == '') ? null : bng);
							$('tr[name="' + trName + '"]').data('info', inf);
							$('div.details-popover').data('info', inf);
							$('tr[name="' + trName + '"] td.tb-ld').text((ld == 'Lunch') ? 'L' : 'D');
							$('tr[name="' + trName + '"] td.tb-venue').text((venue == '' ? '-' : venue));
							$('tr[name="' + trName + '"] td.tb-desc').text((desc == '' ? '-' : desc));
							$('tr[name="' + trName + '"] td.tb-price').text((price == '' ? '-' : price));
							$('tr[name="' + trName + '"] td.tb-mixer').text((mixer == '' ? '-' : mixer));
							$('tr[name="' + trName + '"] td.tb-wmic').text((wmic == '' ? '-' : wmic));
							$('tr[name="' + trName + '"] td.tb-spkr').text((spkr == '' ? '-' : spkr));
							$('tr[name="' + trName + '"] td.tb-band').text((band == '' ? '-' : band));
							$('tr[name="' + trName + '"] td.tb-crew').text((crew == '' ? '-' : sys.unameToSname(crew)));
							$('tr[name="' + trName + '"] td.tb-cin').text((cin == '' ? '-' : cin));
							$('tr[name="' + trName + '"] td.tb-cout').text((cout == '' ? '-' : cout));
							$('tr[name="' + trName + '"] td.tb-bng').text((bng == '' ? '-' : bng));									
							
							$('.fab.evtd_shr').css('display', 'none');
							
							var success_toast = apps.toast.create({
												   icon: '<i class="material-icons">cloud_done</i>',
												   text: 'Details Successfully Saved',
												   position: 'center',
												   closeTimeout: 2000
											   });
							success_toast.open();
							
							navigator.vibrate(100);
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
		}
	});
	
	var swiper = apps.swiper.create('.swiper-container', {
		speed: 100,
		spaceBetween: 50
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
				url: 'http://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					if(str=='200 OK'){
						STORAGE.removeItem('usr');
						STORAGE.removeItem('pwd');
						
						apps.loginScreen.open('#lgn');
						
						var logout_toast = apps.toast.create({
												icon: '<i class="material-icons">screen_lock_portrait</i>',
												text: 'Logged Out',
												position: 'center',
												closeTimeout: 2000
											});
						logout_toast.open();
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
				url: 'http://app.wkventertainment.com/',
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
				url: 'http://app.wkventertainment.com/',
				data: post_data,
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					sys.loading(0);
					
					if(str==='200 OK'){
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
			// 'model' : device.model,
			// 'platform' : device.platform,
			// 'uuid' : device.uuid,
			// 'version' : device.version,
			// 'manufacturer' : device.manufacturer,
			// 'serial' : device.serial
		};
	post_data = "ACT=" + encodeURIComponent('ssn_chk')
			  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
	
	$.ajax({
		type: 'POST',
		url: 'http://app.wkventertainment.com/',
		data: post_data,
		timeout: 10000,
		error: function(){
			sys.loading(0);
			apps.loginScreen.open('#error');
		},
		success: function(str){
			var inf = JSON.parse(str);
			sys.getLocation();
			$('body').data('user_level', inf['level']);
			$('body').data('crew', inf['status']);
			
			if(inf['clocked']=='1'){
				STORAGE.setItem('clock_in', (new Date(inf['time']).getTime()));
				sys.clockToggle('in');
			}else{
				STORAGE.removeItem('clock_in');
				sys.clockToggle('out');
			}
			
			if(inf['reply']!=='200 OK'){
				apps.loginScreen.open('#lgn');
			}else{
				$('span.ncf-pos1').text(inf['pos1'].toLowerCase());
				$('span.ncf-pos2').text(inf['pos2'].toLowerCase());
				$('span.ncf-name').text(inf['name'].toLowerCase());
				$('span.ncf-name').html($('span.ncf-name').text().replace(/ /g, '&nbsp;&nbsp;&nbsp;'));
				$('#edpf_name').val(inf['name']);
				$('span.ncf-tel').text(inf['contact'].toLowerCase());
				$('#edpf_tel').val(inf['contact']);
				$('span.ncf-email').text(inf['email'].toLowerCase());
				$('#edpf_eml').val(inf['email']);
				
				$('div.views').css('opacity', '1');
			}
			
			sys.getTime();
			sys.startClock();
			sys.loading(0);
			
			if(inf['status'].length){
				var status = inf['status'], x = '';
				
				for(var i=0; i<status.length; i++){
					x += '<li><a href="#" class="item-link item-content" data-usr="' + status[i].user_id + '" data-who="' + status[i].nc_name + '">';
					x += '<div class="item-media"><i class="icon material-icons md-only">' + (status[i].clocked_in == 1 ? 'directions_run' : 'hotel') + '</i></div>';
					x += '<div class="item-inner"><div class="item-title">' + status[i].nc_name + (status[i].clocked_in == 1 ? ('<div class="item-footer">' + status[i].clocked_time + '</div>') : '') + '</div></div></a></li>';
				}
				$('#user-status').html(x);
			}
			
			for(var i=9; i>parseInt(inf['level']); i--){
				if($('.level'+i).length > 0){
					$('.level'+i).remove();
				}
			}
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
	'unameToSname' : function(str){
		var aCrew = str.split(","), sCrew = [], all = $('body').data('crew');
		
		for(var i=0; i<aCrew.length; i++){
			for(var j=0; j<all.length; j++){
				if(aCrew[i] == all[j].user_id){
					sCrew[i] = all[j].short_name;
					break;
				}
			}
		}
		
		return sCrew.join(', ');
	},
	'eventCheck' : function(user, month, year){
		if(sys.isEmpty(user)){
			user = STORAGE.getItem('usr');
		}
		
		if(!sys.isEmpty(user)){
			var DATA = {
				'usr' : user,
				'month' : month,
				'year' : year
			};
			var post_data = "ACT=" + encodeURIComponent('evt_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
			
			$.ajax({
				type: 'POST',
				url: 'http://app.wkventertainment.com/',
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
		}
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
					url: 'http://app.wkventertainment.com/',
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
			url: 'http://app.wkventertainment.com/',
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
			geoCount = 120;
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
			$('.popup-clock button.clock-in').removeClass('disabled');
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
	}
}