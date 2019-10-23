var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var apps = new Framework7({
			  root: '#app',
			  id: 'com.wkv.manage',
			  name: 'WKV',
			  theme: 'md',
			  version: "1.0.193",
			  rtl: false,
			  language: "en-US"
		  });
var geoToken = true, geoCount = 120, APP_VERSION = 10193, tmpCalendar = '';

var app = {
    initialize: function() {
        this.bindEvents();
    },
	
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function(){
        app.receivedEvent('deviceready');
		
		var notificationOpenedCallback = function(jsonData) {
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
		});
	
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
					sys.getLocation();
					
					if(inf['clocked']=='1'){
						sys.clockToggle('in');
					}else{
						sys.clockToggle('out');
					}
					$('body').data('user_level', inf['level']);
					$('body').data('crew', inf['status']);
					$('body').data('loc', inf['location']);
					$('body').data('car', inf['car']);
					
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
							
							if(inf['status']){
								var status = inf['status'], x = '';
								
								for(var i=0; i<status.length; i++){
									x += '<li><a href="#" class="item-link item-content" data-usr="' + status[i].user_id + '" data-who="' + status[i].nc_name + '">';
									x += '<div class="item-media"><i class="icon material-icons md-only">' + (status[i].clocked_in == 1 ? 'directions_run' : 'hotel') + '</i></div>';
									x += '<div class="item-inner"><div class="item-title">' + status[i].nc_name + (status[i].clocked_in == 1 ? ('<div class="item-footer">' + status[i].clocked_time + '</div>') : '') + '</div></div></a></li>';
								}
								$('#user-status').html(x);
							}
							
							if(inf['task'][0] != 'none'){
								var task = inf['task'], x = '', sameAs = 0;
								
								for(var i=0; i<task.length; i++){
									if(task[i]['date'] != sameAs){
										x += '<div class="timeline-item">';
										x += '<div class="timeline-item-date">' + task[i]['date'].substr(8,2) + ' <small>' + sys.toMonth(task[i]['date']) + '</small></div>';
										x += '<div class="timeline-item-divider"></div>';
										x += '<div class="timeline-item-content">';
									}
									
									x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '">';
									
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
								$('#task_tl').html(x);
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
					}, 5000);
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
									x += '<td class="tb-pic label-cell '+(((parseInt($('body').data('user_level'))>=8) && (sys.ldToShort(inf[i].luncheon_dinner)!='ST')) ? (inf[i].paid=='1' ? 'tb-paid' : 'tb-not-paid') : '' )+'">'+inf[i].pic+'</td>';
									x += '<td class="tb-ld label-cell">'+(sys.ldToShort(inf[i].luncheon_dinner))+'</td>';
									x += '<td class="tb-venue label-cell" data-pid="' + inf[i].venue + '">'+((inf[i].venue==null) ? '-' : (inf[i].venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf[i].venue).loc_name : inf[i].venue))+'</td>';
									x += '<td class="tb-desc label-cell">'+((inf[i].description==null) ? '-' : inf[i].description)+'</td>';
									x += '<td class="tb-band tablet-only">'+((inf[i].band==null) ? '-' : inf[i].band)+'</td>';
									x += '<td class="tb-crew label-cell">'+((hidden || inf[i].crew==null) ? '-' : sys.unameToSname(inf[i].crew))+'</td>';
									x += '<td class="tb-cin label-cell">'+((hidden || inf[i].car_in==null) ? '-' : sys.carToTcar(inf[i].car_in))+'</td>';
									x += '<td class="tb-cout label-cell">'+((hidden || inf[i].car_out==null) ? '-' : sys.carToTcar(inf[i].car_out))+'</td>';
									x += '</tr>';
								}
								x += '</tbody>';
								
								$('.popup-event .event_list').html(x);
								$('table.event_list').data('info', inf);
								
								for(var i=0; i<inf.length; i++){
									$('tr[name="el'+(i+1)+'"]').data('info', inf[i]);
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
							
							
							$('.event_list span.button').on('click', function(){
								var x = '';
								var inf = $('tr[name="' + $(this).attr('name') + '"]').data('info');
								var trName = $(this).attr('name');
								
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
										
										$('.details-popover').data('md5', md5(((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner)+((inf.time==null) ? '' : inf.time)+((inf.venue==null) ? '' : inf.venue)+((inf.description==null) ? '' : inf.description)+((inf.band==null) ? '' : inf.band)+((inf.crew==null) ? '' : inf.crew)+((inf.car_in==null) ? '' : inf.car_in)+((inf.car_out==null) ? '' : inf.car_out)+((inf.remarks==null) ? '' : inf.remarks)));
										$('.details-popover').data('title', (inf.pic + ' on ' + (inf.date.substr(8,2)) + '/' + (inf.date.substr(5,2))));
										$('.details-popover').data('date', (new Date(inf.date)).getTime());
										
										if(parseInt($('body').data('user_level'))>=9 && inf1.lock==0){
											$('.details-popover').data('lock', 0);
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Person In Charge</div><div class="item-input-wrap">' + ((inf.pic==null) ? '-' : inf.pic) + '</div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Luncheon/Dinner</div><div class="item-input-wrap"><input class="evtd_ld" type="text" autocomplete="off" value="' + ((inf.luncheon_dinner==null) ? '' : inf.luncheon_dinner) + '"></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time</div><div class="item-input-wrap"><input class="evtd_sbtm" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : inf.time) + '"></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Venue</div><div class="item-input-wrap"><input class="evtd_venue" type="text" autocomplete="off" value="' + ((inf.venue==null) ? '' : (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue)) + '"></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Description</div><div class="item-input-wrap"><input class="evtd_desc" type="text" autocomplete="off" value="' + ((inf.description==null) ? '' : inf.description) + '"></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Remarks</div><div class="item-input-wrap"><input class="evtd_rmk" type="text" autocomplete="off" value="' + ((inf.remarks==null) ? '' : inf.remarks) + '"></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Price</div><div class="item-input-wrap"><input class="evtd_price" type="text" autocomplete="off" value="' + ((inf.price==null) ? '' : inf.price) + '"><label class="toggle toggle-init color-green evtd_paid"><input type="checkbox"' + (inf.paid=='1' ? ' checked' : '') + '><span class="toggle-icon"></span></label></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Live Band Information</div><div class="item-input-wrap"><input class="evtd_band" type="text" autocomplete="off" value="' + ((inf.band==null) ? '' : inf.band) + '"></div></div></div></li>';
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Crew</div><div class="item-input-wrap"><input class="evtd_crew" type="text" autocomplete="off" data-uname="' + inf.crew + '" value="' + ((inf.crew==null) ? '' : sys.unameToSname(inf.crew)) + '"></div></div></div></li>';
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
										}
										$('.fab.evtd_shr').css('display', 'block');
										apps.popover.open('.details-popover');
										
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
	};
	sys.dayClick(usr);
	sys.eventCheck(usr, (new Date().getMonth()), new Date().getYear()+1900, true);
	
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
	
	$('a#home-btn').on('mousedown touchstart', function(){
		if($(this).hasClass('tab-link-active')){
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
				beforeSend: function(){
					sys.loading(1);
				},
				success: function(str){
					var inf = JSON.parse(str);
					
					$('body').data('user_level', inf['level']);
					$('body').data('crew', inf['status']);
					$('body').data('loc', inf['location']);
					$('body').data('car', inf['car']);
					
					if(inf['reply']=='406 Not Acceptable'){
						apps.loginScreen.open('#lgn');
					}else if(inf['reply']=='426 Upgrade Required'){
						apps.loginScreen.open('#update');
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
							var task = inf['task'], x = '', sameAs = 0;
							
							for(var i=0; i<task.length; i++){
								if(task[i]['date'] != sameAs){
									x += '<div class="timeline-item">';
									x += '<div class="timeline-item-date">' + task[i]['date'].substr(8,2) + ' <small>' + sys.toMonth(task[i]['date']) + '</small></div>';
									x += '<div class="timeline-item-divider"></div>';
									x += '<div class="timeline-item-content">';
								}
								
								x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '">';
								
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
							$('#task_tl').data('inf', task);
							$('#task_tl').html(x);
						}
					}
					sys.loading(0);
				}
			});
		}
	});
	
	$('a#schedule-btn').on('mousedown touchstart', function(){
		if($(this).hasClass('tab-link-active')){
			calendarInline.setYearMonth(((new Date).getYear()+1900), ((new Date).getMonth()), 500);
		}
	});
	
	$('#task_tl').on('click', '.timeline-item-inner', function(){
		var pid = $(this).data('locpid'),
			rmk = sys.commasToNextLine($(this).data('rmk'));
		
		if(pid){
			var loc = sys.pidToLoc(pid);
			
			apps.dialog.create({
				text: (sys.isEmpty(rmk) ? (sys.isEmpty($(this).find('span').text()) ? 'No details found.' : $(this).find('span').text()) : rmk),
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
								
								x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="tt col-10' + ((inf['sales'][i].price != 0) ? (inf['sales'][i].paid=='1' ? ' tb-paid' : ' tb-not-paid') : '') + '" data-pid="' + inf['sales'][i].primary_id + '" data-rmk="' + inf['sales'][i].remarks + '">' + (j+1) + '</div><div class="col-20">' + (inf['sales'][i].date).substr(0,10) + '</div><div class="col-45">' + (sys.isEmpty(sys.pidToLoc(inf['sales'][i].venue).loc_name) ? inf['sales'][i].venue : (sys.pidToLoc(inf['sales'][i].venue).loc_name))  + '</div><div class="col-15">RM ' + tprice + '</div></div></div></li>';
								j++;
								match = true;
							}
						}
						x += '<li class="item-content"><div class="item-inner">Total sales: RM ' + total.toFixed(2) + '</div></li>';
						
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
		var doc = new jsPDF();
		var img = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQIAJQAlAAD/4RaORXhpZgAASUkqAAgAAAAFABoBBQABAAAASgAAABsBBQABAAAAUgAAACgBAwABAAAAAwAAADEBAgANAAAAWgAAADIBAgAUAAAAaAAAAHwAAADOAgAAEwAAAM4CAAATAAAAR0lNUCAyLjEwLjEwAAAyMDE5OjEwOjIzIDEyOjU2OjIzAAgAAAEEAAEAAAAAAQAAAQEEAAEAAABiAAAAAgEDAAMAAADiAAAAAwEDAAEAAAAGAAAABgEDAAEAAAAGAAAAFQEDAAEAAAADAAAAAQIEAAEAAADoAAAAAgIEAAEAAACeFQAAAAAAAAgACAAIAP/Y/+AAEEpGSUYAAQEAAAEAAQAA/9sAQwAIBgYHBgUIBwcHCQkICgwUDQwLCwwZEhMPFB0aHx4dGhwcICQuJyAiLCMcHCg3KSwwMTQ0NB8nOT04MjwuMzQy/9sAQwEJCQkMCwwYDQ0YMiEcITIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIy/8AAEQgAYgEAAwEiAAIRAQMRAf/EAB8AAAEFAQEBAQEBAAAAAAAAAAABAgMEBQYHCAkKC//EALUQAAIBAwMCBAMFBQQEAAABfQECAwAEEQUSITFBBhNRYQcicRQygZGhCCNCscEVUtHwJDNicoIJChYXGBkaJSYnKCkqNDU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6g4SFhoeIiYqSk5SVlpeYmZqio6Slpqeoqaqys7S1tre4ubrCw8TFxsfIycrS09TV1tfY2drh4uPk5ebn6Onq8fLz9PX29/j5+v/EAB8BAAMBAQEBAQEBAQEAAAAAAAABAgMEBQYHCAkKC//EALURAAIBAgQEAwQHBQQEAAECdwABAgMRBAUhMQYSQVEHYXETIjKBCBRCkaGxwQkjM1LwFWJy0QoWJDThJfEXGBkaJicoKSo1Njc4OTpDREVGR0hJSlNUVVZXWFlaY2RlZmdoaWpzdHV2d3h5eoKDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uLj5OXm5+jp6vLz9PX29/j5+v/aAAwDAQACEQMRAD8A9f8AFfjDTvB1pBdalFctFM5jUwoGw2M85I/yKp+FfiHovjC9mtdNW5WWFPMbzkC5GccYJqr8V9I/tb4e6htUGW0xdJ7bT83/AI6Wrxz4Paj9h+IFtGzYW6jeHHqcZH8qhyalY0UU43PpaaVIIJJpDhI1LMfYDNedwfGzwrPcRwrHfqZGCgtCoAycc/N0rofiHqA0zwBrVxuKsbYxKR1y/wAg/wDQq+Ult5nWNkjZhI5RNozuYY4Hv8w/OlOTWwQgmtT7SBDAEdDzWfqOt2mlJPLeFore3i82WdhhF9Fz3Y+g/wAKk0Z55dDsJLqIxXDW8ZljbqrbRkfnXi/xS8STnW5IrpgbS1bFpZ9ppMcyP/sqeg7kfjVt2VyYq7sdpc/GLw3ZGIXUGoxGWMSIGhGSpJAON3HQ9a67w/r1n4k0iLU7DzPs8hIXzF2ng46V81ePrGWwm0GO4JNzJpMc0xbrveWVj+WcfhXtvwjYL8N7FmIADSEk9vmNRGTbsypRSV0dtc3MNnbSXNxIsUMalndjgACvPx8a/CjSiNBfuxbau23zk+3NeffFX4ivrl2+iaVLjTYTiWRT/r2/+JH61tfCL4dkNF4l1eEY27rOB19ekh/p+dHM27IOVJXkdfqvxb0LRLz7JqFlqcE+xX2NCudp5B+9XT+G/Edj4p0dNU0/zPIdmTEigMCDg5GTXknx60Ypc6ZrUa/LIDbSn/aHzL+m78qv/AXVPM03U9LZuYpFmUezDB/UU1J81mDiuW6PYq4LWfi54b0PWLnTLlL157Z9jmKIFc47HdXcXU62tpNcOcLGhc/gM18i+XceKfFvlxEmbULvCkjONzdT9B/KicmthQinufWOj6pDrWk22pW8cscNwm9FlADY9xmr1Q2drFY2UFpCu2KGNY0HoAMCpqsgKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigCG7t0u7Oe2kAKSoyEHuCMV8lWUj+F/G0LuWU2F6A5xyVVsH8xn86+u6+Yfi5pn9m/EK9IXCXKJcL+Iwf1BrOptc0p72PU/jbfCLwIlurD/AEq5QcdwPm/wrO8A+FY7Xwdo+p3en41COWeWJpxhIg+P3j/RYxj61qRWlv4o8N+E9R1JTdeTbq8doODPOFC5PoowSf8AOdnxtA5+Hd79qmc+VEJZvs3y71ByUHoCOPpTtrcV7LlL/hjXLHVNEmubSeaa3t5ZENxNnMpByzj2yTj2FfNlu8/jLx9CZ2aRr68BIc5wm7O38BxXaeE/FsrfD7xgrsI2SACCNOBErjYAv0rO+Cmlm+8dfamXMVlA0pPbccKo/Un8Klvmsi0uW7J/jogj8aWKL0XTIwP+/klZLeP5rT4dWvhnTWeKRi/2qYcHaTnap9+9bHx3/wCR5s/+wdH/AOjJKofDj4ez+Jbj+1L2Fv7KtyWKAfNcMP4F9s9TUu/M0ilblTZp/Cv4b/23MmtazBjT0OYIXH+vI74/uj9a+ggAoAAAA4AFeYap4yj8O6pHbwLDJPAFN82f3VnB2iTHVz+p/DHo2naha6rp0F/ZyiW3nQOjDuDWsUlojKTb1ZzvxJ0b+3PAuo26ruliTz4vXcvP+I/GvEfg/q39m+P7WFmxHeo1ueeMkZX9Rj8a+mJI1ljeNxlWBUj1Br5J1a3m8K+OriNRtksL7fH9A25T+WDUz0aZVPVNH0j8Q9QOneBNVkUMZZYvIjCjJLudox+dcf8ACzwFBoMqX+qor6y8fmJFjP2VDwM+jHn9feu11mWz1C202QkPKSLq3iP3QdvEj/7KhifrirHhie2vNMe6tNzxSTNi4f71wRwXPtkED2AqrXdyL2Vjarh/iJ8QYPBlnHDAqzancKTFGeiL03N7Z6euDXZ3VzFZ2stzO4SKJC7sTwABk18xa8914z13XNaufMijt7bz4EI5MXROvbBz+NEnZaDgrvUp3XxH8X3c5lfXrtDnIWJgij8BXR+GvjPr2mTpHq7DUbUn5iyhZFHsR1/GvM6KwUmjdxTPsXQtdsPEelRalpswlgkH0KnuCOxFaVfPHwS8QS2PiltGdz9mvkYqp7SKM5/IGvoet4yurnPKPK7BRRRVEhRRRQAUUUUAFFFFABRRRQAUUUUAFcN448G6dr2saXqmoAvHaho2t0HzXBJBRPpnd+ddzWX4hgv7jQrqPS5FivShEUhGdp9R74pNXGnZnnXiTxDJ9r/sPTpYob1tkF5cQfcs4ycCGP8A2znHHP0xx6NqmnJP4autOxuRrVogD3+XFeO6H4H8RN4w0kXGmT2+j2t0J3kldS8jL8298HqSBx2zXuvWlHzHKy2PjRLy5sbe8sVbas5VZR67SePzr3T4E6SLbw3famy/PeThFP8AsJx/MtXn+t/C7xU+vag1ppTyWzXMhicMPmXccHr6V714M0dtB8I6bp0ibZYoh5g/2jyf1qIRd9TSclbQ8V+O/wDyPNn/ANg6P/0ZJXpvwh/5JzYf78n/AKFXI/FzwXr/AIi8WW15pWnvcQJZJEzhgMMHc459iK7v4baTe6J4JtLHUIDBcxs+5CemTxTinzMmTXIjzD4z+G7nS7mLULNAulXLlpUjXGJz1ZvXI6emPfmT4K+MTa3zeG72UCCfL2pY/dfuv4/zr2jW9Htde0e5028XdDOhU8fdPYj3FfOb/C3xnp+ps1rp7ubeXMU8bjBweGHP40pJqV0OLTjZn05XnPiXwPpeo+N4vEFyq3QKJGtkh/1869N3sBjOew5qt4w8aaxoXw3t5bu2ez1u6b7MQcfKQMs4/D9TW1Not8vw1s7DRZ/Lumt499woy7BsGRl/2jkn6mrdnoQk1qcp4u8UNqEzaHYyRBCy2+oXcPy+YxPy28Z/POOwNeraZZxadplrZwxrHHDEqKijAUAV4r4c8D+Im8aaVLd6U9lpFlIXRWYHGB1bB5YnGTXtOp6jb6TplzqF0+2C3jMjn2HaiPdhLsjj/HM02vapYeDLN2Auz5+oMp+5bqeh9NxwKh8XaBFpV5b67a2hmso7X7DqFtGMk2/ZgPVc/l9K1PA+nXBtbjxBqUe3UtWYSsp/5ZRfwRj6D9TXWEBgQQCDwQadrhex8ueI/h5qOmRjUdJ/4mujS/PFdWw37V/2gOn1rlrXTb69uVt7Wznmmc4VEjJJr6fn8CpbXMlz4e1S50aWQ7njiAeFj6mM8fkRVdvCPiW8zFfeLdkDcOLKzWJ3H+8ScVm6Zoqh5p8M/B9xa/EK1aWRXk06JpbsRncsTsCqxlh1bnJx0xivoGsvQvD+neHLAWenQeWhO52Jyzt6se5rUq4qyM5SuwoooqiQoopodS5QMNwGSM80AOooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigDzv4xeGptd8JpdWoLT6e5m2D+JCMMB78A/hUfwd8WDWvDK6Vcy7r3TwEGerRfwn8Bx+FejsqupVgCpGCD3FfPniWxn+FvxJttV07J0+5YuI+2wn54z/ADH4elRLR3LjquU+hK5DVwvifxRFoYO/TtP23GoAdJHPMcR9v4iPpW/f6oltocmoxDzAYg8Sjq5I+UD3JIFV/DejnSNLxMQ97cubi7l/vyt1/AcAewqiUM8Ra8NEjsoYkja6vZvIgWV9iDgksx7AAfyqvpPiC5m11tIvzZySmDz4p7N8owzgqQSSCOPrmk8XeH5daXTrq3htrifT7jzhb3I/dzKVKsp4ODg5Bx1FP0Czljunmk8NWOkjZgNEyNIxz/sDGPxo6hpYw7fxlr1z4VbxGumWaWcAZ5o2kbe6KxDFfTAGeetWfFGpayup+Gm0t4Ut7u5A2uzAuTG7bWx/DgA/UUWXhrUYfhddaA6Ri/ktp41Xf8u5y2OfxFW9c0jUpLDQZ7GGOe60uZJWgaQL5g8tkIDdAfmz+FLUehPqmvXVhPp+mr9jXUrqNpHaWQrFGq43H1PJAApNO8SS3NnqyzLbteaaPnMD7o5AVypHcZwRj2qpruh3eo3ema0dLs7u5t4XjmsLhlKkPgnaxGNwK9frV2y0+dtEv4hotnpcs6FUhgZST8uBuKgDOfrTFoR6JqviDWdKTUTZWdvFcQLJbxu7FsnHLY6AjsKpfD2+1u+8H2t1ftFcb4S0bl2Mjtk/eJrodBs5dP8AD2nWc4Amgto43AORuCgHmud0DRtcsPCd14dkjjtjDBJDaXySht5Odrbeq4yOtAFhvEGq2Gr6fbajHpzw3s3k4tpSZIW2kjIPUcHnirttdxN411G0FpEssVlDKbgffcMzjafYbf1rmrPwrqBudGkGg6dp/wBhuFeeZJA8s2FIJBA6HOeTn2rp7fS7mPxlqOpsq/Zp7KCFDu53K0hPH/AhRqN2MRPFWv3GiXOswaZaC0tXkDo8h3yhGIJXsOnfr7Vs6rrl1brpS6faJcSaixVA77QvyF8k+mBVSx0O+t/BF7pbon2qU3BVQwx87sV5+hFXG0u6Mvh1gq4sc+f83T90U49eTQLQzbfX/EU+q3miCwsvt9sqytcb28ny2zt4+9uJBGPbOe1Tw+Lwvg641u8tdk1s7wywI2QZFbbgE9icfnVyy0u5g8Zarqbqv2a5tbeKMhuSyF93H/AhWT/wid1d+ENV0mdo4p7m7mnhZvmXl9y59vUUahoT2/iS/h1bTbW//s6VNQcxr9jmLNC4Qths/eGFIyMduKBruu3+q6tY6ZY2mLCYJ507nD5UNtwOc89enTrSaPYXUeoQNN4R0uwMf37qJ4yeh5QKuevrjitHRNMubHVtcuJ1UR3l0ssRDZyoRRz6cg0Acz4g8TalqPwxTW9MC2ksjRiUbzujPmqpCke+R9DXa6Y181kh1AQCc/8APEkrjt171yUXhPUW+GMugP5SX24uoLZUkS+YoJHrgD8a6vSZb6bT0bULNbSccGJZRJgDvkUIGXqKKKYgooooAKKKKACiiigAooooAK8y+N+mrdeDI7wLl7S4Ugj0bg16bXK/EXT5tV8E3tjbIXnnaOONR3YuoH86UldDi7Mz/DkreI4tGjR86fplvHJMQf8AW3G35V+ijJPuRXdVk+GtCt/DegWul24G2FPmYD7zdz+JrWoQMKKKKYgooooAKKKKACiiigAooooAKKKKACiiigAooooAKKKKACiiigArL1vWBpFsknkyyFnUDZGzAAsAc46da1KgvLdbq0khZQ2RkBiQMjkdOetAGdo2t/2rc30XkyoIJyiFomUFdqnnPfJNXpNTsIXZJb23RlOCrSAEUzS7A6faGN5TLNI7SyyH+J2OT9B2A9AKmeztZHLvbQs56syAk0ARXmoR22kXOox7Zo4YHmG1uGCgng/hVD+3WvRbrpMSzySENIZNyoidT82ME9vxz7VoX1hHe6Vc6eD5Uc8Lw5QfdDAjgfjVaztdXhaJJruzaBMAqkDBmA993FIZZvbm5twn2aya5LZziRUC/UmmaRqP9qWP2nyTF87JjcGB2nGQR1HHWk1HTm1LZE91LHa/8tYo/lMvsW6gfSjTdJg0nzI7MtHatgpb/wAEZ77fQH06UxF+mB45GZQysyH5gDkqfen1GkEUckkkcSI8pDSMqgFyBjJPfgAUASVzl54muLeXVjHpbNBpkDSSytMBvcLuCADPUcnPTI4ro65+60S8nj1CxWWEWN/IXlcg+YqsAGUdj0OD2z7UDRrWd/De2QuUyi4+dXGChHUH3FR6TdzX9mbqRVWOV2MIA58vopPuev40mr2Ut/pFxZW8vktOvllxwVUkBse+3OPesu18OXOnI9hYXQi0t3V9pLNJGAACqkngHbn8TSA1ru9kt9R0+3VFZLl3Ryeq4QsCPyx+NXCQqknoBk1n6nZ3E0tpc2hj8+2csEkJCuGUqRkdOoP4VJYw3ytLLfXCOz4CwxrhIwM9D1JOeSfQcUxFdtft3Yra291dkdTDEcD8TgVftbmO8tY7iLOxxkbhgj2IqG+gvZ1WOzu0tVOd7+Vub/gOeAfqDU1papZWkdvGWKxjGWOSfcn1oAkd1jRndgqqMkk4AFKCGUMpBBGQR3pssUc0TxSoskbgqyMMhgeoI705VVECIoVVGAAMACgCpqt29jpc9zEqtKi/IrdCxOBn8TWNP4ma38RpYObb7M27lBI0uVAyMYwOT6ngVs6paPfabNbxsFdgCpPQEEEfyrGn0DVp/EQ1H+2Wjhj3eTEIlIUEAbSCPY85zz2pDRs6hePaJbtGqt5k6RkH0Y44/nVyqOp2k11bR+QyCeGRZU3/AHSQeh+vNFlHqJmea9liCkYSCEZC+5Y8k/lTETXF9b2ssMc8qxmYkIWOASOcZqdmVELsQFAySewrC1HS9UvdbtrlLm1FpbMXSOSLcSxUqc/n1rdHTnHvQBhaRq8lzqMkEt0JYpVMlsTatESoPOCSQ3Uc8VvVl29ldS6qL+9Ma+SjR28MZyFDEZYn1IA+nNalABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAFFFFABRRRQAUUUUAf//Z/+ICsElDQ19QUk9GSUxFAAEBAAACoGxjbXMEMAAAbW50clJHQiBYWVogB+MACgAXAAQAOAAGYWNzcE1TRlQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAPbWAAEAAAAA0y1sY21zAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANZGVzYwAAASAAAABAY3BydAAAAWAAAAA2d3RwdAAAAZgAAAAUY2hhZAAAAawAAAAsclhZWgAAAdgAAAAUYlhZWgAAAewAAAAUZ1hZWgAAAgAAAAAUclRSQwAAAhQAAAAgZ1RSQwAAAhQAAAAgYlRSQwAAAhQAAAAgY2hybQAAAjQAAAAkZG1uZAAAAlgAAAAkZG1kZAAAAnwAAAAkbWx1YwAAAAAAAAABAAAADGVuVVMAAAAkAAAAHABHAEkATQBQACAAYgB1AGkAbAB0AC0AaQBuACAAcwBSAEcAQm1sdWMAAAAAAAAAAQAAAAxlblVTAAAAGgAAABwAUAB1AGIAbABpAGMAIABEAG8AbQBhAGkAbgAAWFlaIAAAAAAAAPbWAAEAAAAA0y1zZjMyAAAAAAABDEIAAAXe///zJQAAB5MAAP2Q///7of///aIAAAPcAADAblhZWiAAAAAAAABvoAAAOPUAAAOQWFlaIAAAAAAAACSfAAAPhAAAtsRYWVogAAAAAAAAYpcAALeHAAAY2XBhcmEAAAAAAAMAAAACZmYAAPKnAAANWQAAE9AAAApbY2hybQAAAAAAAwAAAACj1wAAVHwAAEzNAACZmgAAJmcAAA9cbWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABHAEkATQBQbWx1YwAAAAAAAAABAAAADGVuVVMAAAAIAAAAHABzAFIARwBC/9sAQwADAgIDAgIDAwMDBAMDBAUIBQUEBAUKBwcGCAwKDAwLCgsLDQ4SEA0OEQ4LCxAWEBETFBUVFQwPFxgWFBgSFBUU/9sAQwEDBAQFBAUJBQUJFA0LDRQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQU/8IAEQgA5wJaAwERAAIRAQMRAf/EAB0AAQACAgMBAQAAAAAAAAAAAAAHCAUGAQMEAgn/xAAZAQEAAwEBAAAAAAAAAAAAAAAAAgMEAQX/2gAMAwEAAhADEAAAAbUgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEP03azGWxyjMd1I6OIAo0CV7atvnAYOMvgiqq3xu8kz20ZiXAIYpuw/Jelz4PFzu6zhKNtQAgmi/H87IFlcjWVgAAAAAAAAAAAAAAAAAAAAVnzaa8UaNg7G/wDvwDSoTori3Cx2jPZHRmGK52puXX6HIgqu4L1bcO6zgIDovq5m1dhb/Xjh6m6Hart5nC823CBh49/PrD6HyXJ145WtqAAAAAAAAAAAAAAAAAAAAAjGq2l2TZyfoJu8/NS5C9N1SMusS1bVcXXjFX82rQK57bOMJ03cF6tuHdZwieq2nmTZ1ljdGeyWjNDVN1RcuvsP0K3+fke8EPU3VBy6/a5+hG/z/V0AAAAAAAAAAAAAAAAAAAAB4+d/PTB6HnLla8cq21Vlzaa+UaM52M/30WC0ZxUvLrham62mrJUrLr4L1bcPWUmxbfE7N91Nr9WTkxvO/nxg9DpLj68csW1Cq2XVBNN8x202815AAB8n0AAAAAAAAAAAAAAAAAACkuPbHVdlj9GeyGjNTPHs02M7V6cvg52YbqcVHv5+4fQ6S/27BQHDv4Lk68dVMurA8lLFtVw9WPs6ApZj2xnXZPl9Fo9OUUlx7cNHt29mLMS4BwQDRfA9GjEc7scozVbTPV+fv6AAAAAAAAAAAAAAAAArfn0Vwz6ZUsquXsx0Bw79/nXYfRnj2uzeJwx/O0yybNslC+W7D+cXn+jwZjvMPzsiTruhsxevoAQJRfVvNq3KUL27sPm4oli32i05ZLsq9PQFd8+itGfSABIE67m7MeS7wAAAAAAAAAAAAAAAARxXZSfHtzXeXz3YKX49lvteTFc7U7Lrn6/Pr0ZVtz6Z1uotTqy/nF5/o8A3KULL6c2yyjuM4ADW4yoLh38n6B7vP1iM9bjLZZRkCysDCx7QfDv8bvAABMdtNvNeQAAAAAAAAAAAAAAAAefj888HoeR28OzFiud2aUPX1RzFuk+2rH87E1Vtv9WSX7qfzi8/0eDY5Rtdpy+crtn0Wr1Zd0nAAUVxbtKhO32rJJdtUe12ZvvN9srAq1l1RBVd395rsZAAfRf3dg2CUQAAAAAAAAAAAAAAABSzHt1GErc68ng53apQ2qcfzu8/0NrnHGc7r0ZfoLu8/Ly5+cXn+jwXX2YpIsrptj2apGfLl6NuH19AVszaa6UaLd6snv7yG6brKac2ySiNZjKruXViedy0uRRVaAALm68cpW1AAAAAAAAAAAAAAAACCaL87KPsK5UaLj68eT7yjmLdpcJ9JuU4Xr24eD84vP8AR4L1bcO6zhElVtO8mwWCvz2d05gNDrnFdd0gTrjuFmDj22GrKBUvLrsJfniSq319V4z6MPzoHJl+8uhsxbvOAAAAAAAAAAAAAAAAA8XOxrXZA1F/aXL2YxVHLqg6m8T7fRaLTl4Pzi8/0eC9W3Dus4cFLMe2NK7PW5e3dh2eUeDU4S1eM9PhOIarpZtpsVozjS4Tg2i+02rL1cVXzapPsr0OE43rt9nebzOvUITuXsx8gAAAAAAAAAAAAAAAAFRcmvWYyyPeXP2YxAtF9Ws2oXH145Ytq4Pzi8/0eC9W3Dus4DV4Soni3eR2SLK7q7MVac2nf7K+wrdn06tGVvdWSUrahUbJrtDpy5iXB5+K+UaNPhPKd5ied9vVnNOXKd4AAAAAAAAAAAAAAAAAIhpuiSq2ULappupGmQnXnPoFp9WXJd5wVHyaxZfTm2KUQIWpui+q0ThfRTDHtvhtwfBBNOjER7avVl9veR1XZoVdlgtGcAAeLnfT3nYAAAAAAcHIAAAAAAAAAAAAAAAAAAAAANOhOiOLdcLVjl26oAfBVDLrtVpyejrg5AODkjCuyT7KxwcgHBG9dkiTr7euDk6OI2hbKFlQ4OQcHJwcg4OQDg5I3rskGdff0AAAAAAAAAAAAOsolh3fRenbh7ugIVpu2KUZIsrieq3WYy63ZJsqhOm/oLHX56l5tU3207ROEZV29hOV1FT82qbbaYMpvle2qQp1xhXZi+SsfozQDRo2+cI5rsxPO2k0Za8UaeDHc79uTNdTj+d0eFnyS/bTXWjR6CwN+esGbVKFlU630AAAAAAAAAAAAARpVZSzJts5ozWC0Zx5+Kz59VoNOUVTzat9nXq8ZytZViud5Ml3kVV22Y0Zqy59O1ShqsZ2FvzwfTfYW/PXTPosBfnwnJRfXbH1dltNWSt+fTu869ilHSYWSTZVFtVs830Vnz6ZxuojWu3TIT3WdeF5KXraY+rs26UcJzunxnPV1Hv7wAAAAAAAAAAAAAVSy6odquvvtwZiXILovkuyraZxFeaNG5Sh6e89Ri+d5Mh3ka12SNZXgIy+TOyju84QnTfYG/PANF+zSjq8ZbDKMR1XW41ZK359O7zr2KUdKhOSLK4uqtni+itOfTOF1EZ129HGclHJ95n5Rj+uzbpwwcZa7GWwSjLdtQAAAAAAAAAAAAAxEe/n9h9Cz2nLO99EH0XznfQB8mownmpR9rnw6c+zgwnJbLKOrRlkXMtLmO53J950ca9yWySjrEJZiXMn3mK53vO5zzu+tzxu5HvMTzuRc8buR7zUoTyfY5TvPK76HOp3vc1zktplEAAAAAAAAAAAAACluPZt04yDOvf7K9klEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVwz6NNhORLK59voAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAhum6sGbTfLdhyPeAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARdVbrUZTtfQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANVhLZpx7AAAAAAAAAAAAAAAAAAAAAAAAAAADxc7jOd+DY5RAAxnO+1zSoT3uyGM53xc7sEogAAAYGMvDzu0zh9mvxl6XMvLg1OEtsnEAAAAADw87rUZavGUs21fRqcJbZOIAAEZ1WbdOOelEAAAAAAARPVbpEJ5nvJ2vo0mE8Zzua7zb5wr7n0bNOG9zhsMox/XZHddlhNGcAYGMs9KIHBWvNp3myv7JZtqham6abqQIkqtlu2oaLCesQn1kg2V7JKIGBjLPSiBHldnBFdVs0XU7hOESVWy3bUBoNdmelHYJR8XOxNVbk+8lO2oAAAAAAAdHEJU3y7bTl5cx/O/B6HPX1B9F+82V5rvMv2MOVXfRuc4bpOAGFj3NS4AIjqt6edmC6nH87WvNpla2rqJVtqiCm7cpwyPY5yXMXzsX1WyPZXnZRAwse5qXAI8rs85FFV03XUbpOEQU3b5ZXyZ+Ua8Z9EyXU7NKIx/OxdVbMN1IAAAAAAAGCjLOyiAAMVzuP53Pdj39fJ9AAAAA0yE+9zbJxw0e5HvNHhZus6/X1o0J8cb1ZAY7nfS56OgAAB4+MXyWH53dpw+jToTx3OyFZX8kdV2bhKGXlwRrXZI9lf2AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//xAAzEAABAwMCAwYFAwUBAAAAAAAFAwQGAQIHABAUFTYREhMXIFAWMTVAYDAyNCEiIzM3Jf/aAAgBAQABBQL8NkWQrY8V83kdR/I6J0rsura3R83kdebyOovIk5MO2NF0QY9Ir4Ylrk+hB75utdebrXQgjaXG7lsnsRz/AM3Wum2VEni73KVGDvzeR1FZ0jJnnoIZUQZPvN5HUTl/xVf7Xl1h3XGgDvgDm00d8FFtsQu/67EEWt1kulTiWkBKCbQltC+ldshzTg7NWWXKXwWF2gEMojeDkOoS/wCXSjcw+oMFXVrdXWNRvARn2vIzDjotsFecwEays68GPbYxdcPKdsnHnDgkrdbF2+KmHEG9oX0rqdTG2Ptb77lL9Y5hl3f1lIbxcf0nfVK8a8oQH7ZRIcLHNMmt7541b2NG3tbxta9aLo3N19Y0ecVFdZedd53SneqcYcsMY/hvLrdpI6sCF7rq33YsYcNHtoX0rLJQjGR7x4sQdagMJ5qpSnZTRJlaSHrJXIK6xkQ4yMbZae1UL6xiIuenvV3qez5AYcBKdYhebZKdcTK4834o9dC0FpUqqrOX1K9tC7zlwtZa9wroEw5WE2Dm24CCGjLg8Q1BoZdIHCadqKe+RBvLpRrEhDwyO2QXdHcsjcdcSQgJFNwrHeteykpyZY1q8k5Z9dQi7pVhMjA+4DlRJe5FdNyl7Hl1htjR5wsq1IXXGnccR5wQMSQY8NVmUrRjbKArKLRTJTzhIrqKMOZyKvy2elXD9DUOiSsmeNGyLJt6MtDfFH6h7/lsl05cWtGw0Y7lRhS9rBhTay9Ntvk2V3I+qKzB1GnA4ggUZ+xZBYcfFdBXnLy5J1wQ6JxZeTvh6rJkvNCzgLHhzOzw8aHVjFmXnn9usTMPGLV+W8XjS8lfkHlAiQ2xrGmvokY3m4PVK9lQr7mYmdLK2R0cihjyPRwCqiruZKJhRjx2o/d+rG8lqLKexOELXKDtvczdassvkkNfu0ouzjoC0E2kLZF2EKlFCrnFLvwZDk55xMp1i5hwsbr8tgIJxICDlL4PDW0aQIRRd5LDEXkraSM/RMhvKpJrFr/io4SdtRzYVRN3fFTSsipvlKQcU8CMeZl5F/Q96bbq21AEebBfYsisOBlIUM5Ov3Di2FgmyKENHxYguWC32UUsdoVaOoW64OUyJ3xx6lK3VDsaDRVfltABzdlG9SFIpIpQXJpXJRk+rHSrV0m9bb5cG9l/z1jeOOAjC8arKDU7kikhKRwXyUJtIzVgAPBwd8mPNEvhubZID3DZD6sa31uiXsWSo8uYcN0GOOwjC24MwLFH06NC2VBo7U5acHK261zZete2sOYcykuq/LaF9K6yOJXeA9sXyaqK+84G80jMBhVqNg4i6k5nIM372oUy4Etvkg5cYMxQDbHg2U45W/QxZLIUVKCXQZ3v89ERqgy6FMajov7E9c0ZMxjK62+RyB3NizOqKL/bLLPwje2JGHiENV+W0L6V1WnbSdxn4fLaaOlGTmOHUpCK1WvdoPkrMwRL2OpQUm8vSDNmLZII1xa2Veu9peepHgmMY/V+/wBKpWLpHATyAlmB8JOmhjE6tly0FOIXM8em3d1wkVAEYqEcTE/8vZJ3IXZ4y8WsjrbG7TipXtlxr3xe2MmHBxjVfltC+ldpICTkIp21VYudQaTVjpW26l1MlS6+5fGgujGN5Bki0fGjmSTRu/fLEnWNWnDRTaZEVZdKBAxIOO2cN0naJ/Fn99huVxfVMrkqUcT2QmNBcbkiy40Y3ENPZDcRX4zyrMagcMdRt3tLgt58F5VF9eVRfQ1nQcP28qi+vKovqOj1BQTecQS8+58qi+vKovoHa/jcaXWvcrRbs+G5EAQkDQrj46WdUxUX7WTWxiz1OpByEHi2O+Ej6rmLe+tidqdPepincrF9Y0NWkAPovvonY4qrkmWN0LGqGu30du0smV0ZebdvpmUuuitqV/ipa7dnFlyiEPjJECv6+3ft9HbtMpbdFbEFfHQ+6vstVslIK+PGIoeujphFWxwlvk2QcvGQSO8gC6nUrVBpowAu8Rjh8kDkU3cKNYsBeSCVDzQ85Bbxr7nQaYBX4l6GiRpgTmMlpGhQ+JGpE2CGiEZkpK+qY4AaOGG0SjJMC+nIQgIqHiJtB1KKlOXVgBlwnFzZULJ7v24rIun9+SHazONirpBNGZHnePiDVxa7bHZCSGzd/DJDazEzY0YYm4udAM4YeukIOcSqsbYNYOZKoBCZaNSeSq3oR6OlD8gZHAZyHpRsxz0LOghATUNETSS33c8jXxAJrTsri6SeMjs4XsaoRttfN5dtMVHV2Q+PnGl4/JTMin/SGMulMmU7Ypj7pDKv1fWXL7qvqPpvSj4BJjpor9LxDZbw2swfsafxZBIG0cYoS2SFrKrv3GQb/wBmIP8AZlHpeDdJ5ap/4UX6bQ/61rEtKcwk9O2N4k+h5KvWul3HzjVwmSmJBK+msTdPTynbEsY9K5f/ANLD+D95kqK8udMHqo16IJpmBusmGFPCjQSyPiNsjCnLMmwySGdN2c+HEi0/6Qxn0pkvpPH3R+Wmylqo2fCii+TQCpUaBySOWYt5+OfFSv0vEP8AC1lxoooxDZAFukctsllWjTIoZIPYUWMzy/8AZiD/AGZR6Xg/SmWvoEX6bQ/6zrEv8+T9OYk+h5OCLrUFZKFOmrafDHxOV9NYm6dnfSWMOlcttL1RwXIAtw2+8LjrCwxZG5utiR9VUZffROyLIUk0l3rSl1FogGXvZCWQ3Tlsk8QaM0GCDtmi/QbNkmaDlsk8RZRoYOX07iwl8owDsRlLraX2sRjUZbpZFNyk1i4pk4UTtWsRiohBwsMauHWmIpmM08ZIEEW7dNqi9HtiSSSViCVBza17pkKZjrlUrF02Q5sNS05iQd2oxCsBmlkrHCTIe2GpOG6TtFoyQYILIpuEm0XFM3H3uRR3ASnESnYUyMavRZx0PaBD/hGXmmsaPkhxeEtFZEb/AAnKqPiRoMPXLEBzBIWx/CclU7Yli+O8Gy/CpII54PTTtRT93euqMmbEva+CR4tz0N6bCTZR+sragiNl7QoT0sTaNtN5ANduP0SB1gLRpKB/JrbqX26PGEwIoS6WejdgEgTO0/VfO7GDNvJkr435it1bra963QqQJkyPrJO5O2eBCKpRh9hJhx29ES2kHwhChxvlOnkyFD3t2QwVug0rGnl9OijkbkLmUsfaECEhqGvgIH4pUawdyT0EDjIUvvWneonEBxaV5GbJoQ+Nu3oR5o5X4ll+8F/yvtjh58MdeDKzmnMKftEI4SuLg90jjJcpvkBaqMRUdvQgIzICi8iAOTDmuo3/AJ5rvLyqwZAWfYmb9PXPBM29JNJbIuUfpmPsF0bXKBGt8fj4hhQUL0uPaur6DGdNItEG9dIk2wjIN81CWaEm2ZxJZa1uitIycprdj3l6MXNrGGu74MyJreiDK2N3c/d2kELad20k+sGMI5EHcjQhMgtdxqNlnMhkWoKpRq9OydiARCu3L8bogUaikSE0vMaBDeTiN0wzJEjvkBGq0ReyiwJFjhkuoYj8oRP11G76MpmYkDIE3AEViw2++idkvlrUuKClRhFPZ8/bjW0NtVMGfsWwRm0Iep6KZkdWRkSnpFBNtZqlKW0/SMxIebXDRceCu0YFImx7dCxqg8gYV87atEWKGjUPYmnQmFjBC2z0c2I2IN0mqf6Dxom/aWAWdokZCxIl73adujkVZH7xsFFjnGrraX2pwMcmumIZIvdloQg/K2WWpWfin//EACwRAAEDAwMEAQQCAwEAAAAAAAEAAhEDEBIhMTITICJBUDBAUWAjYTNCQ3H/2gAIAQMBAT8B/TW08hK6SdTxE9nSXSTm4m4EmFGsBdKNyukukiIMdgpErpLpf2hSn2uknMx7RSldJOZj8ZSPqztRdmrr1bj+kxuIko7ZXfyvTZ7N3vy0VIyLPEt7AJMXqGXfGUzDrkQbUt71eN6TdJXJVTpF38rMZleo/wBC1I63Ig3pDWx0W/xg0vUHlalZpkSqj58Rduoj1aqdbv5JrcigItUfGguDBm9QQ69IaWqmBHx1My21Ue7U+Kdss/HELh/7YCTcmTNyMnwgMRFnvx7aZltqo0m9PinOxCJnXtbT/KxAUBFjSnUvx8LSPq1QeNm6BVHQITSBqmNy8iqnJUx5WcYHYBFnuxW/bSOsWeJbckNC1eZPbTb7Pc5gciI+DpmHWIkIalOdijJ1KYJKJ9BVGwqX5tVOkdrnYhAT5ORl2va0wZuRBhM3R/kKc70OwCTCGnfUbIn4bi5Dy8nJzpTd0BCq7KnxtVOvY44iVzMlavMBaNEJzce1hltqo8kNdAjp4BOGOnZSb7RMCU3bvcIMfB0zLUTiJXMyuZgJwgxd+rU3QWJkz2VDLrNhrdEB7Kc3ILbspH1ao6VOI03TG4iSnGTN2jIwnuxGi5NVMyO+py+DpuiZWtQo6+LUAGBEyZszVt3mG9r+VqZg63qt99jDDk9/oIgNH9qmz2U8yOym2BKc7Iqk70j/ABulAzt2gynmXfBjVE/6tTWhgXrI3pbXqnSO1/K7HZC26c3ExctIElDxEpjJ8ijroFV00uxuRVV0CLtcKggotczZCr+Vm1Go1Sam2yccBp8KxoaJXLVVON6W96h8u1/K7XYmVvZ7chamz2VUMuVNuRRPoICFU5XYMGyUTJnsbV/Khjl0gsGhGoBsiZ3+FD/RXVanvDtrsOJldVq6rUTJv1WrqtTjJnsY/HQrqtXVanQ52lncimuxQqNC6oR1sxuRVV3rvn5xnIWqCDPd/jb9FrMvoMZl3PcHbfYsZl9612QlObkO2m2TKe7I2Y2dSuoPQTmgjIJnJODWmUC1+iIgphB2Rc0jZMbkUXNboAiA5uQQ3Tg0alOcHbJhB2Re38JsTquo38JwBbkLVQBCp6uRxYhjUFmtBbqg9u0IsaNSg5rtIT24lMbkVm0bBEBzcgm7pwa3UoFr9IThiYTCDsi9v4+8Y7E2qt99jvBsXZwUU1k0CAmclU5KnyVTkqWxtSUU0HMaICG6q2o+7NbksGjcrTDS1b0qXJP5Klunciv+dquwTeQVXdU+KimpaAQE3kFV3TOSqclR9o7/AHtN06IiURBi1Mf7JxyM3pnTEo03IsIElM5KpyVPkqnJUvwjTIVN0GE6mfS6ZAkobqrakjTKpFdN0qIYRat6VLkn8lS3TuRX/O1XYJvIKruqZ9FGmfS6ZAkpvIKryTOSq8lS3Rpn70GDNqo1mzvFuPbm5Ek2mVtcuJtkQiSd7Ek3yJtkVNiSd1MWBi0+rEk2Jne2bkSTYmbTNsifvqZlqq7KmPZTjkZ/SaX4VQSE/wARiP0qlyRMCUTOv6VT5Kq71+ltOJn5kaoiDCcMTHdGk2LCBNoKxP0g0lYmYu0ZGEdDdzcfrDVY6wunctgT9AYIiPsWlv4RxyTy2bYE6rpuRaW72iWCVDB7RM26jkCcZd2gE7duZDZKp8k6D5CzfFs9j/V2tB3K8Asx7CcIMdmJieynyWhJlBog6p2PqzuI7GCUWkb2Gq8GpwEZD7IeRyRMmbSVJvBLBCwciC3e2IbyXUndOEbdgJHa/wBFU9PKwEmE54boE9vlonDERZ/oprS5HQ6WAJ2QZGrk4yZ7JMR2U+SDZdCAEFObjZ2rQg0u2ThBizGQUQRvcCU/QBv2UmI7wSFkfrB5CLi6wMGbB7gt7B5CLybgxt9LZZGZReTpdri1F5N8ypO184ED9W//xAAuEQABAwMEAQMEAQQDAAAAAAABAAIRAxASICExMkETIlAwQFFgQyMzQlJhYnH/2gAIAQIBAT8B/TXPxML1U2pJjR6q9VNdkLkwp2kr1JXqr1UDInQagC9VeovUheqmvy0movVTXZfGVR5s3Y3f1vSuU52WwQ5i7Ot3v8C7GQqg3sww7QTAvTED4yoJbcbi1Xi9Pteod4XVUxvdnWz343ps8m1QbXG96h2tz8hT62q2IgpjY3N3bGbUxtdnVOdiubMZO5uRIvTO16vNqY3n454h1qVqnZN5WHukrv8A+WOwuBAuDi1EzvZjMtNQQ61I7xd/ZNbkgI0uqfhZEqUHEIVPz8LVHm1PtZ25VNsmU4E7J7sdgmdVUPts0SdBM2a3LVVHmzTBuBkV0EDTUd41NdigZ+DeJbYbFHhNbkhA2CeYCH5KpmVVtSG86WtyKO3tah7dtLhIuDIT+EP6YTW+ToJgSuddN0GPhuzUfbsE0QncImVS5VTtamNtAGS6CAtmCSt3GU12Wlwg2pnZHbcof7FNOW+io7wgJKdzraZE/B1BDkBK6CF0ElNMibs7J25sBA0MG1nS5yJ8BNOJXOiqPNqbYUZHdPdkYCaIEXccRKYMiurlUEHXT6/B1GzwtqYQ23ciS8oCBZ/a7BJ0s62qDa9N3jQ8SExnkoHI/wDCe/wEzY6KhkwmjEKo3yh72wiI0kQmCG/BnZAf5OTnF5X/AFF6vN6Q3nSzrd7cTbhNOQuHAmAjLjCe6NghtuVT33u44hU2yZuQWGQg5r+UaX4WDlg5QGcpoyPwr3EmEfbsqfa9Xi9MbaWdbuGQux2JtUd4VMQE92IQ/JRMqn1u85OgICBGh1P8KXtXqlZuKFMnlAR8KW+QvTKYzHm7hkIXpFekUNr+kV6RTRAjQ9mW4XpFekUJaN7N4Cc3JFjivSKG1nugKm3zrj5x/W1MyNX9x30XOx+g52OprSOfsXOx+9cMSmnE6ajoEJjcRZ7o2CwPkppIOJT+EMnbIhzEDITgRyg108pzsQg0u3JQJacSjwgSdgmtITwRyg135TpjZYH8ppIMG1Mp/CGTkZZYkhyLXcoPJ2Ra4bymmQnuxWBPJQJaYKdwmlx2CIc3dNMiU8EcoNd+fvHtyFqbvGhvvdN3d1L1DiZKf1VPqqnVM6qpzaqpeiHEyUeFStV8WJxWTjwFvlvakqnCZ1VThN4X8lqadwqfCqdlL1DiZKdwqfCf1VPqqqH3tRsboGEDIm1Q+E0YiL1BvkhUCzBMBP6qn1VTqmdVUQeCqglCoPKzEwjwqVqqDwqizEKZdNqSqcJnVVOE3hfyWpp3Cp8KoPKFQLMEwncKnwn9VT6qog8fekSItSO1m+45acQgALcLm+IFsQUABaIviLYhRYABc2Im0ebQBaItiEABaItxbEffVBDlS5VQ+E0QI/SaqpmCme45H9Kq8ICdkBH6VU6qm3z+luE7fMnZAyJTTInVPiwcCYtIWQ+kSAshE3JgShuLh0/WOyy2lepcOkx9A5IGfsXByGWKYHRbMBeo1BwPFph6l5QEWwaiBMDSSBpxBdAVTqmyPabH3OjQzzckjwveVgfBTTInRImND+q3AEIuMjZNnzZvY6HGEHA8WK9zk0mcT9kfaMUBAi0KBeYeZWbUCDxbIu6rCOE0zzoIB0s8hP39tiYTWl26Y7bdNORmzPIRcAhuN7Exyi+dmoCBGiBM6H9VlDZRJkJrsrN2cUXAIGRZzpCBB4uTCZucvsoEzrIBWI+sWgoNAsRIi2DSuLFoKDALkT9LlQIhBgFy0OQYBfAKBzfCTJ/Vv//EAFAQAAIBAgIFBQsEEAUDBQAAAAECAwQRABIFEBMhMSIyQVFxFCAjQlJhgZGhscFzkrLRBhUkMzVAQ1BTYnJ0wuHw8TA0YILSY5PiJURUosP/2gAIAQEABj8C/wBGyUT0TSZQCHDcbjH4Pf5+IqLuVoDJezFr9F9ckrc1FLHH4Pf5+Pwe/wA/BqkjMWVyhQm/9cdclXNchdwVeLHoGO7q5O4Rlzsjnm4WmpdGySszWXl+3H+Ql+cMf5Gb5wxT1iqUWZc2U9HeSU8cL1Qj3GRCLXx/kZvnDCQw6Nnklc2VQRvxNTS6NdZImKMNoMfg9/n4kphTmndUzi7Xv3tRTrRNKInKZw/G2Pwe/wA/FRkpWgSEC7Fr8fzZQ1oHOUxN6N4951UE/AJMpPZffr0jJwvFk+du+OvSNKf1ZB7j8NaT1eXZ0zbUF+Cm3HC0lGG7kDWjjHGQ9eKbQ1Kwkqp3ArKheheJjX469G/Ja30ZQv4dvv0i+IOrt1KiAszGwA6cCqqlDV8g/wC2OrAqAORVIG/3DcfhqoJL2Vn2R/3bu8q6o/ko2b04JO8nVHIRZ6ljKezgPd7fzZUMBdoCJR8fYTro6n9LErHttqih6Zph6gCfq1on6eJk+Pw1jQ8BOyUKXVeLseA92GgjIOlpVtLIP/br5I/W68T1RG6ni3ftN/K+vRvyWruenINfKN3/AEx14Z2JZmNyT06o9L1i5QN8EZ6f1tS1IHLpZL/7TuPw1K6mzKbg4pqleE0av6xr2APKqZAvoG/6tUFPHz5XCD04igj3JGoRewfmyanfmSoUPpxJE+50YqdUSXuYHaP4/HVo+m8lGkPpNvhiw44q6X9HIQOzC6X0h4OS14kbdkHlHXX1ZIk0tPI2yHHudOAb9q3qwWJuTxJxJUEcqokJ9A3fXr0b8lgyGz1L7oous9fZiSoncySyG7MdS6QrU+41PIQ/lD9WLDhqqaV+bNGUw8bizocpHn1JGTyqdzH6OI9+ukpfFiizelj/ACGrutk8DSqWv0ZuA7/iPzPWWFlltMPTx9t9WkaQnyZV9x+GqdeiFFj9l/jjR8R4NOgPZfFTpirytDyWjjPC4XicGCFmj0HA3hJRu7obqHmxuxV1X6KJnHqw8sjF5HN2Y9J1UdLwMcQB7en266GqqDuEXJXpY9WJKupa7NwXoUdQ1d0VAK0EZ3/9Q9QwqIoRFFgo6O8qCBZKjww9PH231VlGTuljEg7R/fXWlTdY7R+ob/bfAgh5MY3yS9CDEdLTJljT1k9Z7y54Yam0VaWUbjOeaOzrwTNXznzK2UezFxUzX+UOBs66Vh5Mpzj24WLScWwb9NHzfSOjCyROskbbwym4P5koK0DrhY+0fHVCvATo0fx+Gqvn4h5mt2X3Yir7ZaWma5Y+M3UMU1HFLsKB7mqdecRuso7cDRGirRzBcpKfkh9eKIyhgwzC7dIzG2J1vYzusY9/w1UFPa6mUM3YN593eUsMjeCpkyRp0DVyrpRRnwknwGI4IEEcUYyqq9He0tco3wvs27D/AG9uqgmvZdpkbsO746pZ35kalz2DDJELyzOXd+hd+8nEFBQx7evnNo08aR/KPmxEsr7SUKAzdZ7z7U0r5SRedh1eT3wFzLRseXCfeMR1VM+0ikFwfzHV2F2htMPRx9l9VHU8NlKrHsvipqP0UTP6hi29KVN8svw7cDRNIApgizFV4KPP5zioqaYDa7lzHxb7r4bS2k7vBm5EZPKqH+rrONIrO3KWRXVRwVSLWHm5ONHUoPlSn3D46qqrI3QR5R2t/Y96IY+RCu+WXyRiDQGgowa5x6Ih0u2KPR81XnnmY2Mrb5H4nva2ltdnjOX9riPbquOOKSq/SxKx7enE0ECl56phAijpv/K+FEqibSNQfvac6R+hR5hh9J6SIl0pPx6oV8le8qKyXmxre3WegYlqJjmllYsx78UMrfctSbC/iv0fmOSF96SKVPYcTQPz4nKH0aoUSTI9VAis/VwzfHFPobQ8Ik0hLujTq63bD5pDPVzHPPO3F2xWR1CNJDs87IvE5d/wxtHASNRljiXmxr1DEsPRNCfWDf68SR9EEax/H46tuRyqmQv6Bu+B7xKWnHnZ+hB14p6HRNKZ6qdtmhtxbpZsS1lZJ3RXz75JDzpX6h5sSV1TPsIouW83iwr0Ww7w3DxNlZX53mPp72thAshfaJ2Hfq2BPKp5CvoO/wCJwauqKqkO/MejsxL9k2lBsFC/c6Sfko+vtOKuusY6TabKBD1Di3pv7O8TRkTeDg5Utul+r0Yo6U82WVVPZffjSItlC1DqB1DN3wINiOnFHV+NJGC3b0+38x1JAss4Ew9PH2g4Slplux4t0KOs4o6GmV6uqbwUEfS7cb9mKjSulZdvpGf74/ST5C4iragZXnLMFHirfcMMrbwwscTQtxjcofRjRz9cuT527440hPxDTNbsvuwAN5OKSl/RRKp7bd5SyQx5ZJ1zyN0k6qiCq8DsCeP3uGPysLQUN0oIje54zN5bYjqk3x82RPKXEc8LZ4pFzKw7yir1HG8Ln2j46pZ6klHqsp2Pkgdfrw89bydE0blYYD+VYcWPmwujqBjJSIQqrH+UfFJR+NGnK/a4n2656tucosi+U3Rhqmq8JBEdrMW8dugYijk3LBVAXPk34+rEk4HgKrwinz+N/Xn7+mB8V3A+d+Y9GPSx55WYwn3j44AA29bLusvOmfqHmxLpfTsoNUbvb9CDbkL6hgKgsn5OO/JjXrOKalXeIYwl+uw1aQXoZ9p84X+OI5k50bBh6MXxQQ2uokzt2Lv+He6N+S1SS0u5ks0yqN8iD6tf2onbwcnKgPUekd5WRgXeNdqvau/3Xwul9JKFAGeKN+j9Y4Wpp2MGh6RjZv8A5DcPVh9FaPfk82aVfojFDBs//UZ/CuzfkYePrb3HvE0dT3eOnOWy+NJ/W7EVN+WPLlbrbCaWgW9hknt7G+Hqx3BNIE0lTWsx83BvThqeriMUg9R7O9iSbdM6Z2j6UvwvigiYWcpnP+43+P5jnqCpcRIXyrxNsSfZFp0iOULeKJuFOn14Snp0bYZrQw/xHFJoWhYSbaZFq6lfym/eo/VHt101R0TQ29IP8xrrKwjdFGIx2n+3e6N+S1WO8YLRL9xz8qPzda6oqiFsssbBlPnxFVx7mO6RPJbq1XO4Ymo6S9RslvJKOYPNiTRcYem0ZTkd1S8DKeOQY+02irRuq5HZPyY6h58JpGtQSVD76Wmbp/Xbze/GkdLVDGSVvBZ26TxPw1zVAPh25EQ/Ww+lagZkhPIzeM/X6NTRyKHRhZlPSMLpTRxzUl7b/Fv4rYFNVxotR+hk4g/qnBfRtQJE/Rzbj68WOj5G/Y5XuwB3JsV8qU2x3RVyLpDS1vBQ+Kp68NU1V3gD7SeQ9P6v5lbRcKOsMMuzEQ4yP14egpmD10gtVVC+L/01+OKc9EKtIfVb466Go/RylPWP/HWkhHKqHaT0cB7u90b8lrlpH3NxjfyW6MSQTLkljbKynUNo33HPyZR1dTYBBuD04bRNI+VF+/svSfJwk1vCVTGQ9nAf158RrTLaapuol8j+ePttpIbRCfAQNxnb/jh6ids0jezzYgYixmdpPbb4a4tH0nLjibYx9Rbxm/rqxBRw8yJbX6z0nW0UyLLE24qw3HBm0TLl6dhIfccZJ1laNf06Z19eOVRQ39ONjTLsr9FPHysd0aUdqeNt7ZzeRsJTUsYiiXo6/wAy1lbovIK2r3GWQ22Qtvy+c9eOfT/PxUz1ZjLOgRMhv07/AIa5qSLKJiVZC3C4OOfT/Pxz6f5+KalXhDGqeoa+fT/Pxz6f5+KOklsZIkynLw7yOroiiVHNlz7gw6Djn0/z8c+n+ficaSKSdyIWjZWvdQOGJJZDmkdizHrONF5eHc0f0cRxTjNsn2oUG2bzYM0r0yjmpGrclF6AMffKf52IaePmRIEHo1OUa1TP4OLzdZw+lp15cnIhv1dJ7+7U8RPnQYsihR5h+e9JBOOxJ1LSn79Sck+deg/11d6WY5VAuScZIrx0MI4noTr7TiOGJckaDKqjoH+BSQClE+2FyS9rb/8AApCtMKjb5uL5bWt9eEfhmF+8kRGyOykBurFS9bX91JINy5mO/r3/AIjSlaYVG2LcXy2tb68RyWtnUNb8bZGGZWFiMTUpvs+dE3WuIqneYjyJV61wkkbB0cZlYdI7wUETeHqudboT+f14XaLaqn5cnm6hqhpKIZq+o5u6+UYE1XpyaOqO/IpJA9uPtFpeTbhzaOU7+zf1HFfLDI0UgVbMhsRyhiGgpZ2p4Ib7asZjmY3J49mIayPSL1MDNlNySL9RBxDUxnZmeK/7JxSR1tea15ByWLE5d/nxBPUaaeohQ3aPMxzY2ygPUSHJEp6+vC1ukNMTUxlGZY1vuHZcWwug9JTmqgkIEUzcd/D6sVTKbMImII7MHRFHPK00shd6h3JKJYdPRiZquv7rp3jsFzsbNfz4pTW6QauEpfJcnk8MUdRJpt3gVldos7bx1YC6IA7qeQKWNuSvXjaz6ek7p6gWy+vC6G0pK0wk3ctsxUkXG/BxpPumplny7O20ctbnYLwSvC+1UZo2scQxRVLUNDCgRp7nNK3Tv6cU8prWq6WToZiVbrG/hiKdOZIocdhxXU9HnqHliWKGEm6qxCm9vXh65tLPJVqM5iVyPQMRaLpE2mkWNjVHoTrwdJJpaSd4+VJZ23fXiOoltt1Jjkt1jCCEBqyfdHfo6zgVNfpqeCd+Vs1ucvtFsQ6G0lOaunn+9yMb9hv7MaRkjYo6wOQy8RuwNGUUzrlYtNWSMSQD0XwmkItKSVCBgHOY7u0HFNWWys45QHQw3HFM1bpBq1ZWfICTyeGKKofTbtApRzFnbevV+OFol+7KflR/rda6m0TO3Lj5UJPSvSNck0rZI41zMx6BifStQv3JA11U/wD1X464u5kWWoTZbFH4X4+/H4PpPWP+WKCvraSKEwsl2jcWsGv140j2L9MYh+Uf34m+UT340f2P9M40X+yfpatGx+LkYjtviw0dR27R/wAsUVXW0cMRhKjNG43ANfrxWfIv7saRewzZ1F/Xq0V2y/w4h/YGO6akk3NkReLHG20foZRAea0h4+7Gj30lAtPVbSO6Jwtg9mNK9kf8WD8smNHfsfE4pT090j6LY0X+7R/RGKj5H/8AMatJ/sr7zjSn7tJ9E4q/3j+EY0ekah3EabNW4E5zj8H0nrH/ACxous0hRwxLTSqS0bDm5rnpxpT93f3Yqf3k/RXGkf2R9IYj+VfGi+2T+HFP8mvu/HftnTL9zzt4QDxX/niGqgbLLE2YYp6yLmSre3UekaqfQ1LdqiqILAdV9w9J92IaRd7jlSN5TdOuk07SLm2WXPboIO44VppjTS+NG6ndiChpBLOZSfCZbKN2NI9i/TGIflH9+J/209+NH9j/AE2xo2rVbouZCeo8Rilp4nfuifds8h5JxDVU6F5aUnMo4lT/AGxGlfIaaqQWa6khvPinoaQSVDStl2gWyjFZ8i/uxpH5RfdqoKhRdInZW817fVigp8791y5ItnkO5uHHFBUIC0MTMHt0Xtb3YifOVlRAO5lXffqxoysmpjS7R0yoeobvffB7MaV7I/4sH5ZMaO+T+JxS/vI+i2NF/u0f0cVPyP8AAurSn7K+840p+6yfROKv94/hGKXStKpZ6fc+XiBe4OENVIaWoty0Km1/NinoqTaVDytbOFso9eNKfu7+7FR+9N9FcaR/YH0hhPlXxQ1Ci6RSMG81/wC2KCnLuKt8kWzyHc3Dj+O1NJJzZUK9h6Dh4nFnRipHnxWUhP3mQOOxv7YLMcqgXJOK37IJF8BG2xpgfMOP9dfeEEXB6MZ30dDm8wt7sfctLFB50XfhoZo1libircDgQ08SwxDgqDBhqIlmiPFXG7CwwRrFEvBFG4YaKeNZY24q4uMbanooopRwYDeNReaghZzxIFr+rH3LSxQedV3+vBVhdTuIOGWlp0gDG5yC19TRyoskbcVYXBwJ4aGJJRvDW4YKOodDuKsLg426aPhEg6bfDEdTJTxvUR8yQjeNT9y00cGfnZBa+NjUxLNHxyuMLFCgjjXcFXgMCOqhSdAb5XF9+FjjUIiiyqOAGDViBO6iLGW3K1O1LTRwF+cUW18NHIodGFmU8CMGOlgSBCbkILb9WeTR8JbzC3uxelpIoT5Srv8AXho5FDxuLMp4EY2VLCkEd75UFt+GhmQSRNuKtwOBDTxLDEPFQYaOVFkjbcVYXBwJ4aGJJQbhrcPx6oIFknAmHp4+0HFdH5UIPqP88RaJpeVWVpy5V45f5/XinowblBym626f9E6Oqh+tGfePjitnmbLElIzMf9y4qvsirF3ZslOp6P7D/RSP+jnU+wjEVFTkhpzlPZx3+rENLALRRLlH+iqnzOn0sNpOZfCz7o79Cfz/ANFrR8I3lQyH9UG5wqIMqKLADoH54nqGBZYo2kIHmF8JpFUIVotpkOKauMeyMoPIve1iR8O+kollBqo1ztH1DDyPzUBY2F8CkjDZZFzQzeLJbiPMRq8LUxR/tOBgQQ11PLKeCLICf8IyVNVHGvbvOE0o0pSjc2DMp43twwGU3U7wRqnrJd+QclfKPQMU1RPFsJZEzGO/DXUgRPTzU0mzkik4j/GnqZOZEhc+jCaYlhkjjIvswMzcbYC0+jq6dzwCx4BtbzHVX0RheCopGsVfxh0H/AmamoqWpoweQuazkevCzzUslFJcgxScfxHSEkWk4lotmx2Bj35cu8Xws0NdTJRCnc7Nl5WXfjR0kekIo6DnbDZ3OXNvGqalqajYyxWuGU4/zZPZE31YeGjmLyKuYgoV3atJvS0EmkJDAiZI+jcu/HgdGU9Cp8aeTNgeCiWoc7SUx8C5HKI6tTSNRB2Y35Tt9eNH6L0RTRxTU8onqJ4/EA6P683e08NVOIpJzaMHp7yxxJSUkJjoKH/MPmJzv5P9efDxxoI443SyqNw34j0HXRvLHb7lq1G5l6jqpNFcaOi8PUdRboH9dZ7z7Iqjy65l9V/r1rDS6InrwVvtE5t+rHhJIdDU56E5Un9erDT0enKx6xBmAla6t5rYo6t+fInKt18D3kmjknBq4xdo+8ryOJCr62GNFrQaONeBEquFaxXkjGhp/tRLTzx51jhkb77fEzaUpYaVN2zVGufTq+ySfydnH7P/AB7zR9Qkuzi7sRJt3ib74lWjnExjtmsNU1QUaQRoWyoN5x3R3QmhqVvvcYXM5HnxW6F0lKKieBRLHOBbMv8ARH4jJE/MdSpxH9jdPL3dpCpzRRgC2WNjxOKWkBzbGMJfr1ZpqaGZut0Bx/lIP+2MExQxxk9KKBq0w9bMtMskMeRn3A7lx+EYT2G+Hko5dqiNlJykb8PK5siKWY+bBptB0701Odz10wtbsws+i66aHSaC5lY7pT58SrVwGnraZ9nMtt1+sd5BLU06zSQHNGT0d7pyklOWsFa8hB4lTwOKfQlMRJWVUq3VfFXrOAOrFRVScyFC5xV6VqqiWDujM8YjNi7dfZiN6yoUTQXSVpG37uF/RivrI3b7UxJsYh0O3lf116tO0DnLMlY0lj0qen2YzTSZpjzIU3s2Ip6um7kmffsr3sOjUJaudIEJsC544ai0BBJVTuMpqCtkj8+KWjvmMSWJ6z095JXpTqtXILNL195XgcQFb1MMaOrNntmmSNUW9hcr0nGhKipoYi0cjNDHTyBzJwuN2JYhDLTVMX3yKVbW1fZDSynK8zJMl+kb/rwZaqYL5KDnN2DCVU9MaUuTljbjl6DhnY2VRcnEYipqkwioRxO8fg2scH7XSRHrRBlI9Gt56mVYol4lsaS0/Ihjin8DThvIHT7B+JVFckX3VPzpDv8AV347qpYp7cC6Xtjdo6m9MYOMkUaxJ5KCw1WAsP8ADWeVXiqBu20DZWwz00RMzcZpDmc6paOoLiKS18hseN8RwxLljjUKo82GqJKXlsbsFYgHCQwRrFEvBV1Cpcy09Ta21p2yk9uNukbT1H6aoOZtarVQJOqm4Di+MkMaRJ5KLYf4M1NKLxSqUbsOI9GvFt6VFyhZd+BVU9NaUc0licuL23np1RyzZ4qiPcs0LZWxtyslZOOD1LZ7airC4O4jCMHqe50faClMvgr9mO646aNKm2XaKLHXJWaQqpq1M+aOnbciebARFCqNwA6P9K//xAArEAEAAQMCBQQCAgMBAAAAAAABEQAhMUFREGFxgaEgkbHwwdFQ8TBA4WD/2gAIAQEAAT8h/wDGurwxAybdTtX9H/VRX3DRIoeOKkw4cglr+j/qv6P+qVUysBAfgcbBJZZ4ObQHDb0p0HnypufrIk3bWu7UQXl4DEJNLL6D7YiB6g3jgwF6bcprV5VAGNq/o/6qy4tUIg/J6YSEcBNE45V/R/1RhhBKTKDw/wAZhKbc19DbhfGTvQ+E8bhSQ9xxr4aH9+IBy4VaIn0FpBuDuxmfBSLltmC6bAMtW2Kc8PF/Lxxy0KyaebxwNCwaVOArAUK3m0c93t1srSX6Fhd+Ewew39qPb0IFjZ1BY94pW1Eq6vDOM4z/AMMv4x40H7HAMVdqXq4J8zwhRsacweeK/wDB7GcfmmWOScgbN2p0LBmTX3atMVfKaLaweFXPDxfy8GHPt83z2KdGxeVOV4SNWPX5vLb34X5gN+pfx4Q0gJolYM48oGOMVEg/e+T3cDSnruooXIcciD+M8Ng4j80SUE9kYeE9SX94+DwhJxDoD504hKYComLGuq3iKgZC3rg91NOOi0sWdc4INF6QE6USrVlwY723mrnh4v5aiANldxyVvjyw8HYiUfF+PmgIAFgOGeoTtJE9qk6SrQMPC5Y/nP1DtxJjp/MT44RtDMJcyDrde3qWK/vv4eHSPmY8Bd2Ce/AxsyC8nl0BaTzoz4pnOREg8sjFXmT7INbb90oJFJuVdYGYbiTzT80syploJYM1YD2e58jTnhY38HVsCpoCguj5HAPfvYfgt2jjANgBgPRZqR93ZwYOkXdh8ePGVQD6mUBmyEf2dioY2z3Sar6AZIF1an+yHnpfljrUqU1PsQKgRbiT5pMN7g8qPMlrz8zyog4WcOT/AAl/h0OW2U/aPk8LtSNdT4RWA2q0LfJU9QsoL5A+3ZPfSofv/wDaLWWqXh7RUK+SaXh8JWgA+9ZVk6U54Wg9Jg1erwksFO/+Z8VogqAD05eIp2/Z4EtyC3d/l24NLCzyJfipK8NhZI71zMOdW5I/5VqIZxbu+/oTmDr3FjuLvb1GC5i/pfmhcwg+HZP4PwwRn+TguFDo4J8TQSdpHqP4rO6cmbOai3iPygJcxezUCYT3L8lDdmuYeJ+i2aG8mNEYHoIWqDNEvt8nDfQK2zfr3KzdKc8R4YaS37nQqKzk11Z31+xTYbuxkqbE/O76dJRPJ+EUkMNmkJIFxKEdl5ShZ7zWc1T6dz2UswG3Uf8AQdd6DE3NoNrn9ni9eElyu4wV19ootJHqsa/Mtru+Pb+DD2Ae4Q0NUdRVD8cB3Ile6HjQRQ6vnf3GxX3geAsXijwJIxpo00MEeDBfZqQGxhyA8Ughnw6fDhhJu1+mtZulOeFzG3RzKrZwqykr6E9tipxumPxIVY5W/htnPsZWnBnHFmrGzzPp7NiGNHSY7cJGRD+18+xRD3TnUR3OO9S9QMc8R673tTDY1NDKc12ehfea8yFuw+7yotHJ7vwTQjyBJACA7B6kbKkGRqYmYY7fE/wfhwSooMq/t1SbVP1bVG5bBfihK3WXQcv9bFCowKpJ7Qe9FlKBuNeWrRR+Kv8AwA+xqvBc/kR4BRkSIA1oEmktRc+81m6U54Q/DbfqtjQ4QN3ScAvdskM60LtiCNb+A0Kmcaz1MnXUot5GoD6NMx0T6+lAqC7UM4hF5EPM6KGBsoC33YZD+6AItHe5hg96GCAluq/KeMQ7IWrh90GjdcyQjKdW7yGs7/dzA9yaWL0btdZv62JjoST+f4N5cZ8A3F0CKysaEOV2B9u0zeDyAiDdi+srJOR4al+l1pbrJuQnvwsXENzg+arVcr3UlIyZW61P0E2sn8O/DN0pzw8X8vBH5uTkiXLesdeMoSijr9Fz16+jvsJ5HvB3rACM4M3/AB70FuiKGN9mfumhld87t8+1XI4UxFgaEZ0Df0J/q3T2fb8qi0NhauexjtQdlRDT7Ki8uK5Vs6As8+1Yhkzh3Wp6AUAStR7m6Qwc0QxzKtzg3Ip+L+DdjnGYEwe1KT4ny3f95R2iH1/L8Heui/UX7m/44wQRMu6p8cTP0C7svjz4ZulOeHi/l4AwCWR1pGAVcw/wfCcORwtQyVEiC8x5/Tk8DRALq00pRHrQS1W+LWasxCGwA5MJL9SK6Qf7xdOtE0H4f7dDVypnyAvKceEDJtXh7Xe1J+VHdLn3PdNuDrTEyJkan2cWcMuVs/moNyyxvNft3KyScWnpg+KZc8QFH4myMnbPigFxx9EjY3exWxuLHMg645FAAAgND+ESeDGhiX4KntkmQ6p8u1TOT4uPI4xyZR5T8Vkx7v8AUe/DN0pzw8X8vGL1yZp5fh5NKfa0BOAg0hpP1PiaBsKQYSkm2br/AIhr7U34MOsGH2JovRWnACX3WqYtWRz68jl1xUvv30BoDQNqS1ET2PA4pXhTUexbO1B5gm5rHNZeInxu4KlHOcBH31960SUDdjN96jqd5HxTNytnq7s+KkYT7HO/tWKiYyt11f4V8h2gnPdeSlmVnq/VaJ3Kl0rcuJ1kAYAPxNf279V/bv1UdF4msBPBJGmX879V/bv1SQl1Uy5eiBZ4FAeQx7bV/bv1X9u/VT77mkCPpEe1KVSXUZWgf+wQmnUgboASboM0DWAjBYcWClCRN5/qhWjpuI4ZqlFlJ4TzFa2COj81t2d/XzIEh+K5XOiP8wjhn+N5E1bF3wPBuoeN1FfxekG9JCADWjiR40pv1P42oYA+AAgOCDKegDhngZpbYk2eKDLHoEcM06FU/gZ/pVsLGO0nBBrw5rmDpZqBjYcGXEEcM8ZJib8ITE34oMoegDh4O8SJ4AaeIEEk/wC2ZNR2EclASpzNfHth5lDfBLVz3M9qEoVCRLj6LTxxqa/utSY2HPn9E8rwNZktSgY1VsdGgD7eN2mPgqYkx+QpO84L3mpqBiSDsnWhMyGiiGuyCDbNSnYmuEtrDf4o7fUS85D7PxSuKsdLKSDjsghtDak2hIW5cj9Vf2O9JiQFL4YjRqy3RcHDTXM1AR3qEkxcBEriZ9yK2pwIBmOSahTBX235xMmNqlVKxDRYtrlql/6AKZutmPelwMZHg9xHYqPO8rgoahxFOHMw0dAhZwuicYKuf3pFe0lOaH0QLoX+G9BRboAymTmUnsvvIk+aXlpLCNx/6phtcfrqFp5RFSZBANK7Sc36atQvdGYJyS2UXWxsxX7iNMmBK4JlO570X54ZhowC5FWUgKK8wK+SQ/24n5ISVxorrgFAmudr+1T5rAycSESbUT5XMZD5Cp0iF7brOJkxtUvxLJYbW2Lf7gyADHkfk05lIgkJZGr2ILn9Dno8uIwFMQBK0tZNibfFl/3jKMYycADc1OvCyCeMSL7E1bvAaAiMzUJaYQqpnofvtnDJwEOJAfgoEACAKMOQvJdDe6tfYb65LV7xFnEn6nakvgBWKF3PpMdxWVJ6gdgOWvJV9zvX6znQCEi+orawJqU0QBlMGnNGhCxlBSSazytKEh8q5eqBwsj4MHgCQmuK+q30SSL56yMk36X9jWvstqffbP8AdwJiGs2vT5VGABemnRxWLt+1dhk4b4hHxfY91R+gg6uX46BxYzbRTfm5OO3OoAmuKXJCGifkRtKdb6bcRvP223hQcpZDaQk639qYGYmwE3ce1LERHMFKdEeaJVWeI0Jvs1swuGc3vX2G+vpd3BWKkDRhWHEi5hHIia3uos3z7iriMcxBENI51k7Xt2ZTrZ7K8lX3O9frOdee4Qr6LZXjfRNG3kaT4HbT4Is+9GzUEm4oMUrV5XYrLY6V9Vv4k6H0m9PBYQaJDWWyObhHIif90ci6H6Aw9qmlcWgYalVXDoDb3fvQb0koANa8bTMePl7egywIUSNL5Be8faBRMIJCEXVzQChg80TipYQJzUEqWUUYodAxFalYYvKnai2vBOhOOF5Mkr6rJqFOREafyo/BUCRNqgveb5z4GHSDgcxptewpK3JxQ25sAbJQtXSXQeWFBeGJPXs92s0o2Y2djHy0tT0Uwk1oNvw0BUZVmEN3loBpiYBgKOZ1VjET24YXF1QhgxMosjVrIyx3eKSSHFIH263/AIUhoPD/AHUo9BMoyNMUiWAd3gozew8hTI8UiEtCkCHA5jUWmSnLcnH+8XeIjZQbJeBaSQhPAbHlbpS+e0ta69//ABJwC9/7UDRP5sJSrL2C0W9jqv8A4oYi8r1/KoqBHME5PIXdqgmwO/N5uf8AxRq3PhVvc4xfe7vAb/8Ai0bboFy0ObEd6OeVjgsH8xm+iEiQPak3umXIG3inkGj1BPUApHXLh+PepViaRQEtjNTkw2wneuLO3B5t2bRWbGRDoT/iJMiQZ9ALtZa01XIWTkaP4UwCcBijmYVt7lRM+vl+PHFXtc43j4fb/Nos/wCYE1Ir/hBbxvmtCfRv5q6CZOocN8pFXDyc9z/BZpTPeuXaoUNtsTU3P9FVyjHIwM5vUDZFcASJjNmr9uuSZGSNb668EGw0SZJsxfNfP401EHrQJuczhMoCURllZtTY70AdhHxTFa52KEnBjHAV6VqrrNM+JB993/PpRyJ0srHbJd9BJcEhq/pSSNplsEeOSgJVxAWWO9KaavBSeWh9xNHOg4+6fcP0ejk0jouIUM8+BJuYY/7U2MyXIolqClZuL+aP8DulFsdx9FuR+Ni2uNT0M5HstviagwLlhAxDM3pKvmkEAQY0mu9iT+cnlw6q+cehOqlUIs/DQYBUwCZi6Xw8DaJMyMmArXGuyoy/50q762E4z9M/6JhSJmyQ1mhkcxOzZb/qoQhLeC778DxiQPTulDQB0/XQFWhSJ24BuMbYzQ9qGl+jYp30hsFOpVr1yTAJaTwVrRrHfzyKztIHmIeb1qarC3PiPovDonf+cFn0gOQLEJBuWfesxlZRsu1p7NCTgRWPsDeDHfFM5VkwYfI2PxSXxMASul0UAeR9pgo9nsOAagm02IPrJTERLqXyPzUYxKckmXaOFrGwEtjegp4wCNrn+qs/LPjIvdfREUrpkW0xoegnJ90t8DQF3+2nILNc3jx8IdiiseMs7uA6BHZbTHtpoFF1K7ULAeZNy51KLEwjAGahXmFBJh99Kj4i5/VWpxBIsq+y0IHQKFgn6Lz/AKQE7E1URiWC3ruIzAS6GmJn/Uko6KaH2ikkho2ILAEB/jAteRzZdatLDix1/XC6UZxAF+pQ8DF0BBUTedN90PxRF3g8BwHZ5Yr7L1e5ckGdzTvHGDLzYHehhXgRdj/CwIsGYIaK0NcFtZ36VcxeCZbDQDIM0LvA6SLGTadqIX5S5dMe/AoB5GEpMYC1JZH+9IWpqWDmYzji6PJGFyDeO1GIeHgGwf8Alf/aAAwDAQACAAMAAAAQEkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkCSk6SkU0HkBHK0kiRkkkkkkkkkkkkkkkkkkkkkCrkNsksppkNF9kk8skkkkkkkkkkkkkkkkkkkkkCp8NoknBplFE1gkV/kkkkkkkkkkkkkkkkkkkkkGVkZakkppvskGpkdckkAEkkkkkkkkkkkkkkkkkElkZWDRhtdjkgskn8kFlu8kkkkkkkkkkkkkkkkEN0LtyvBurckhrjgckdtt8kkkkkkkkkkkkkkkkEtU8ttvBt5kkkJ+ykj5ttvkkkkkkkkkkkkkkkkE/u3ikuBt18kkFVKkixtttkkkkkkkkkkkkkkkkEkZvHhPBti38k1wckKYttt0kkkkkkkkkkkkkkkEjKIixMBphtsk8wskiM1toMkkkkkkkkkkkkkkkEgL8ltkBpkl5gewsg0fzQLkkkkkkkkkkkkkkkkEk78htMBpkfsjsF0j8jrfkkkkkkkkkkkkkkkkkEk3skbknYkhbufDkmkkgBkkkkkkkkkkkkkkkkkEkkkkkkkkkkkFckgnkkklkgglckYgkkkkkkkrkEkkkkkkkkkkkj/AJJTGwddVRJUhnoID9s6QCQVpBJJJJJJJJJJJI6pOJCwtlASZI/YhmRWJQnK17JBJJJJJJJJJJJJOXF5Aqls6+Yp/wCkZ3lwWe2u/mQSSSSSSSSSSSSRqjSSItN8QsCclwHcMS+BPx52QSSSSSSSSSSSSSeIySSSSSSSSSSSSSSSSSSSSSQSSSSSSSSSSSSSWmSSSSSSSSSSSSSSSSSSSSSSQSSSSSSSSSSSSSJiSSSSSSSSSSSSSSSSSSSSSSQSSSSSSSSSSSSSLSSSSSSSSSSSSSSSSSSSSSSSQSSSSSSSSSSSSScySSSSSSSSSSSSSSSSSSSSSSQSSSQSSSSdySSSSQZSDyeSQSSSSQETySSTiSSSQSSSQly3RGRaSTSQa2ESWQpSSaSAMSyRCA6SSSQSSSRryTzVO8STySHALCZOHKSeSAyTSCmSaSSSQSSSSaSSSliQSSSSRxteFyRySSSMGQCCuSiSSSQSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSSST//EACkRAQACAgICAQQCAgMBAAAAAAEAERAxIUEgUWFAUHGhMGCBkbHR8MH/2gAIAQMBAT8Q/pvAGX9xeRkLal/cv7jVOXqR9xGi4X9y/uXXgItal/cUFsUBIv7jm78UA3L+5xeftnE4C0yKDJ05TrtB7iNUtGv+87s2YtS5TU4H1i4PCoy4j19sqPnNwYF3yLt6yBbDnbr/AJlB9s7sXLdTXgVFfeNywM2X9YVFYtrftisMGy8VW94PC4oPAAVdH7xZX1ndHq6gCjHyzNBA2WY5j3mpOPyr7dQY1YGhFTZYEADbt+sVBAAoxc5Ogh0MVKNxb5fCg+MXDIUIFjHdvG/mTWJ8E2BEOZRGn7Juwu/DApIXsMuVvqKogFUuHxi5fAEp3gT8xVW+NSwsDAW0SxMPSCNLx4X+UT8xHT9joMXBBQQz8wB7oJjEvv8A+IVah3hUPbxK5ll1Syg48aPK4glV0RPDogJ1ngxCAFHnxTZ9jGm4NlmHlXqBanEs/BEhSEagu8NW94sr68BsQbV4J6QEqkI6p8aJxRb3AqF/2YdO3hQX7lxGn8edn9jUHxDsQF1wRUNZCcdTUGwYLCCkxceBEHrCI9o19kKiIqnw3YE6OpSvZC7CW+VJHF7ReU7Jxvrz3fYyIhfgzl6MbsMHREsrFg+O7B05WlfCoZfOhu36w1g9H7fDmvc5idmBoaYJvxByJcP2MWCf+rcsTG1f4Mu2ZqHi3Z3mzCApiWPARW7yuozil/7ogBzQk4D3gabJ2DiN6Q+sG7gO5erhB0/ZVwwLW11/3HSy+Rm6nrx3ZShBBZjWbMcUuI9QOTqIv/sgCiO1kIDMsijZOid0nzw57D65xHf2UVGkwEBkIrIWD4gDjwMdGQoveBRRP3IisgNGFKVxudEsa+dvcu/vaqzH5147hVzuKrb/AAVVvX8HJ51HwOGDAK+h5PNVEpr6vUII4iJTT4cw0TU6MHfQRFrgwdIgYmR/iXNKlkPUFUVHARwXUU5ErTTNEVqhxSmXtKjBCPxso4OGfPACEoZeVLZYFUxKaYFYs9Ed6o5LgSb7RFtcEqzSQ2Ri1X+I5aLWL2lRgm31m804oa5BWiIM7cgtep8jBdJrzW3I1WfIxCk0Tcx/8I7iKiPD5JQV+MaYG6b/AMT9yOuZ+5Nf4hLrPkZfjc/cmv8AE1Yto2fW1r7IARjMsHatEvMjVATwXFENc3TVNsZTASuiEy7g3sRU4Jom5hgpCq9QhRikIIb8A3Tf+J+5HXM/cmv8Qy+6HexFSH7k1fiasDBEKr19axCDZZKhG46jvvxA4ubRgo2RStgqsiq2wUbIFS4NZm0Y2DgUbImpYNai5SwQUPGNoglZFVtiKxi3yy1cuMbRg1yROSwBpm0YNNkRWsFGyKVsFOSJqX66g+IeDL3qJaf0k9wwB7jB/pUoK51ESv6VqljXr+mIW+fvAsGF2nkseiBbUsTAmiIlp/EjQT83NYUBCIGUpzv+YKAi+NlzaZYOj/AEFqMJ0N/QkQeUfGnNy4E5wCAT44dYwECqdq0dfGOi4RNvXiKo14tscuo1uwj/ALDHL7uvDiH4yBdEvTywRoKlmPBDh48BZgWyoUuRAKveOB+AtH1NSwLBHTVsYO36EablLfAS6wA0z5oq7cMME6jlQFtEOWrfU5KPEN8uHwEQd+JUDVQWVowgCIBalVBuCK3g2B6inEJQrwrQmy0Sy8C3Jx4KjFb0hwGLy2Y5MjFCBUbm4nM+HUVEoT19EsFo89Iz54q7/lJo1OMcPUiq2wShiqtwTWyF11lNkVeX+EVWR4HcDs54Q1Bq0ZvPn3FizxkdBU3/AFX/xAAnEQEAAgICAgEEAgMBAAAAAAABABEQMSFBIFFhMEBQcWChgZHwsf/aAAgBAgEBPxD+G8oJX1A4mVouV9SvqFYZM2wpoQuoJT1KepVeByglPUCtBG6klfUNVXiIpUr6nP4/GchgqHKpOXsyDb1HfRAAO+86M1YtyrbuVX94oHwuHPI+/wAZYfGXQ4VVy6pl2mPGjf8A5Lk+s6MUKN+JXX9Y1FQc1V94CwQKKPxiWJEprCvB8hi4PDSu7P8AWKr+86IYvuKq3HxTNgRKaxdX1lWDF/xfjrjD2YVqCySipWujT+8Oxi224qTJisd2xYt1Arg8LD5xQsnaiKiAaPGviXaZb3NMw3iRHk/CaMFX7YVrE9AlCNdwRNqLlC+cVJ4IAesOviABR42BhUuFotiVEa7BhYc+FfHydfEAWfg7jDoYqTHXxEkldID/AL5i3uPRixeJKCKpslAJ8bMzUMbxO4Dl2xB73wJlFVb58g0/g0sqJTWKRPcQTfKfzAKuIriqsd09Yqv78HVESgeWfKJdowhx43Ji6vqIEKM3t08LmvUqCbfOi/BrCO6ItI5YAm+Ncm4lNRUIrXFQeBBTvAYPUL4ItkEFnhowQ29y12hG6CUWVpHKsDhemcr789H4NGQHyJw92AUBgUoNN4oTx0YVuZqb+FjKpJYaf3ihQdv/AJ4cM6nGTqxFzZEdPinBlAfg1RZ/xalAIUJ/kyKLmxeLRnUacCqyDYZRQ4jwG4JmA/6IVLzzk5jhL4Z1qgNQ3aIdQbqU75Me9/C0LECm+4LGRwc1X9+OjI0MRGnGw1jlrOR9xuDuAD/piK2ChlJBEMoJTO2dVnwx4pGbkDR+Fe3a42S5cayooHiqAvC12ZW59Ytts/rQBTFLcIoBjVbZUX86epr83sxxvryb4NQAKPoXgr6HG4hyeDqMtr+x43EGy/u9zjJzkG+Tw4h3NxtwvuMFL5MLUjSMKP8Amcxc5IjgK4YLHMQbgYycFDrozy3KS1wyLwn7WX8vLL9m7Y04yjQ0S2N2QbLjkJS5cwKu4TDnmUONwFcN1oqaQH+6caZRRSWuGR+8ajZi4vlaLYLHozfSfCRPCbMhqmrGxPhIOCbJo5DRDFsOdC0e2NnDomqaf1DbG7Ns3S1Knwkpw1Ns3zZg6TQ+9tV1EVkIhh+D3KTJACJOYEQ2ZDVC8MWA3FFnUYe0GAmyaOBwMeB3CoMDixorHbDomv8Ac0/qG2N2bf1N0Vo9RJzxAgTbN/7mzAbBjwO/vbpRKaliMG1f48V+poCIJTABREBTAAoiCUwVYYeUk0hgGhhB4YC2E3A26iFtMaAiApgAUQOCQK4JS+HODQIl8QHAwvsmkIl8MAKIglMAFEQeGAth99YfMXIlJXbKb+EjpgIvqBX+FQuWVO4Ao/hWyVF+/wCF041+YVFwim8lL9otFykMIbYI0P0hLWfqZvBso0FyV/j6yorAc8o6HIJ2PoIrRxGFpX2NBR4h5B4lAjxhUiz5I7WCkoudAqGPnHdUQT14qAu/EqjggChEv+jHE6nhyX85cotK28RAtLlH4BuTnwdKXTLjW4RPWscn8GI/M2LCouG66IBdH2KWVLU+VlRgh2T4IAawBinyQ24Wi2PDHHucVvmOeHJ4KCmvFUpu46A24oKwRbuWc2oqjWOKnuE8xtgrAC1NEuVXgC4OfA2o0oeiQeHeODYTbGuSpqHxHhQBbLMu/sgl289gT4YAa+q7bua3BXIFFEWWkAFGHb7jd95DYgBwfRQFM/UROwzzjuLXvNTKmhzlFhc1/Ff/xAArEAEAAQMEAgIBBQEBAQEBAAABEQAhMRBBUWFxgSCRoTBAULHwwdFg4fH/2gAIAQEAAT8Q3f8A4wy0VObqyQNkL5FpWiVNuwwAMjDuNekFDOT6HWtWOWtoM2TZR96nrHOluB7p9AuCgPvCt9IF5Ft5YzapysksV2UIJFgDLaoSDuBSfuv9T/2iPweElSFLbaqAqwG9QJgvDmrYrTiRjmv9T/2mMMSqgAmnNnhIcoSCWkSyaVn/AFYYNJAQk3iePiWS9MlZNiyOtKywdBR0EAvDfXP8WZawuEzFx9pomRvTIxh7Y96xFNnN5sOuG3WX8TfzrlAQaB1JaYOcLJcKJ7tJPYdrcwMt20CyNBcP4v4tisnn49LIuTEmcwDd2PLakYkWVQAuqoRV6ASAGz8zB4Wlpdj0BBZPzJd6XhhpWBJE9HwQIAjeCL7oPdKRI9KjKumG9M6TwkfL+LMtW4FwXCa9M9aCoRhLiUV36eEj6g9aW456Z/GH76znNMWygf8AedQxQgUe0ZQG6RmCGbIOAtwbTA4sLq1c8wTI/wBDesnn4dFaqgQEtH7DZSWxCjMiiqUN1VVdB4XCkRAXAmTuxgE1ZrjCUgL7rxoW5nyKEfSFQ1RQcg9FT1rebQLC3XxDdEJQRE2pfF66kv6EvoP4sy0QsjETev8AFF1tHuwfY6XziK3j+qD1ptm+uZg/7u0kwoGVbBTwYSvJ+ag2WAIoMkQhhYGW6RpdN9AC8DLN4leCnl/aJMqrlXesZx3hR+j9qyedeiMqEuiuOSUV3sF2mZObumxwBABYADGlq+Yk7KchfkRgaCSoBABgDSJCRhM3HkkTspR+Zs0D4R0sD1FkRPERa5OKXLBX+DOhmoG9M+B04/IBKgctCMCPEKGf4Qy6bOjmMpfX66RZgSPn6Lkv+bFpegVanWWf/XUdvESynLSTNzK2IQ0PEl494CUzmhYD4SRobQPkic+wHupHVlGSjyrSECpgDejXITN2V9p91k86QjU/J8P3WM7ArYpyEgzEWNsJ9qrd0CfTMHeT8DBYu2L/AGLNQAsAER8MIu0ssz8v7NLUrCWtw7UfHXWTANnAJ6odfBZsy68rG48AoDu8KFXlFl8BAB8DgFUIAMq0ZrOWUskl3/4UlY+X/d5tV03zE/aiZUvAHDeDwlML0IqeUkOxHMFF8eAQwhZP4Iy6Q5gR3q/Om5ubW02vsHvSDr37aX4KK5qtoB95FE4A5Qfx3iZCV6xEX2oHZaOkGB3JmW5MrpIXDgoCBW6Ku3irgSIbwx/ZfemGKjkZgfJPdfnqyedF7sw5kKbtl4A20EkYIh3jtkt9l3YTD1CjaO2ZlbrK3+N10oLwynoQd6LsWUwBqvQaDqIbSW+lSEyOsy2ID5KgStFyKKFgUN1PgADlo9QFgAAwwMmO/gtjkaBk0xIdCMKfIN+GdAW8mP6wdkDRXLmyGUSI3Ef4Ey6RmB2M7hpUv1R2R9we6QwJWxSrpF0GRmVs3I4uuLz1QLKJ5i5uyOSXCDlkBwmFEQNpRZiGXndslSKuFZ25hKtKT1FDgJQBzOVXnEz4G6F/4SOBTuNT8tWTzqloJRm4OYk3M2BSWiXIR2TO4nLeIhAqBUgKFZExtIJbnwMUPkKRowIMI7NP4aIQiYSg0QB3T9EXqgAu7Nux3XteOHBEArIDhKgkDI+EklMK9gwjNyW78AYF9mXse19k019hN3KHATAbAFIoRHh+TZoQuCw8Fr7Xt/AmXTuMr4h9LUYoFEQ38y0w8MxZCN0BDdgtUTxNhStw1llieCQFhp+bjE3JoO13gFWbMkC6wqSe6GF2P9KoyuUq3atfz0z+NNbSOQNhV7pj660x6SRCoD4lCn5asnnRsMsuitzwbGVQM0EqWE0uAgJBYiFkRpTsgUST3V6AlMAi2+MSoWWdju55aVJbJixLLE2sQbfG6nYBEGLon7tLPxyZSBfECgj2JFCsZiUBdkGWmbMPiZFW4hBgXSUFsAELuCARiwbrrY3ZLFwufynektIk5BJHZUMKNuK82AB0fIOinYAyI7I1EtsXBIjwH+AMuu04wyyPtvumYLgUK9IPtYCVCpqSISgim4U2ETvWeIHFySODAWgyYCD2V/jcd76XKm2KEqouAQn01ONejMl/mk5z5TaLjVjJvkqiInEClSwBRuhZbAPdJ7r8tWTzoZRI5LpeBgjAS5VWgsILdHcduy2gGA2Ek0yAd4e3ctTo9KWcWuGTkNlprtuWNI9eNvhgZMDeU/aP1UYBRgAlWj2rDwz4hLoRN7F0c0rk7ZZFkLWZLuWMk8IDMYcWRMkISQW8WpO5ZdRq2U//AIPjm7GEbU735Ej8lfDgblcCfcQfBTqZ0MI2QV//AIx82gWQv8Ur+AMuq2vgWA2knV5rLY4zECuqfQzeBVNXDIPsSIusksqjODiIr4gsl8QWAoPQcECBe4X3pGcZcLSBPQ9NOYDNhFk9hTmlqMq5atpSklEg9Og/LVk8/DpDuFEJQMgQUxCshrLYickb1REdH4MHeISEgOwoQO0IDkCsALh8tqnBUlLxJ22nLDmsuKkyjgLbZn/VCKaQdmgzZCrwULjXnLHAggZZg770LxORikJ3AD1LdpJivTBYTxMn/qhSE3BuwsY8KY3LhDDOwxU5Pg5BEAEq0i6jS6Lx2eETXkFwNlQAROQD1/AGXWEdYxqx3WwqfWdjNAOSSbTLGWKJKuRhdx2JEqtpr5PsWAgPIBJ3EtgatD48By+r61uuCJa7Dsg8d9Py1ZPPw6HJFCkDkSi0G5lTJ3RPyB0dwExMEibklzcpLIRZICbq4rcHQL4qUAGVaUCY2owLd4IMLlqFJWKYY+4wX4gqAZScQInN52S5SKN0XIptzLNg4KshmSQnhgCBgYINQARyyFsbhF9N6wvfOaVXMJTyt2gSvqDIA5EUpDT8JOAMrD0mAUzA3DjL2jhuGDBTxgqUbYE9qVaBDErPaSk4JBu8qZelT/lC+6t5L28ZCaWqMBCvoCwwvAUbY0AQBx/AGX4BIFJWcUyT6mW7aL7vCeH4weUhYasuwIxDT0/W4Cnhj8JI+9b+1hMCB4iLT+WrJ5+PSxTbpQPpu8iUA2nLuh8nDuaBcMhlZgDlrPKyQoOiHZQSI7lACQgqiYpsJ3WVhEk6qmUkcSHyqNDcT3pIPCy7QzAGrw2Vt8rfWSrTl5pBCWCsKAFgKTmphCjL9uOk1cuoDlF1Gyzyd6uKQRGR2gnnVloxnEI/fSTSWnS+XIeXBjGVJlzghHDY8RoHE9yGfZ/um8OxFrtIx7A0AD1O/WVm4lycqC9G5RnOTdf6A/gTL8II8OcdwLMJsQoXZpEmMqytZr4hoWWEXj96rjWwgmUGJj96owcloJgSHsi+9IkZSKQtBo0LkYQK3ISX+D89OoTIDilyezRGjk5b0SqQuoHcRtdm6g3SR5VaI4XVv8UzUkH8DxdeUuZKsWgkf2WL7ZW60EM0GXBzWPcpiGKF7Yl0EujhRaB51HlzpbexG5sHO5QeNj5EERJHamrHd+6GnTo99R+tKwQzD+1Mv7g/1LTJj05ezpVwi6CfPsfGOZZw0qdgBajGhCY23iZY2LrNoMM+QCB4A0SgDwvwkYIcM6MTUiyCIE2Zya4E8mKGSS5qLIDpolWwaAYxNPjHKa7EizYMT70QBAuy6JiBYlUIelH1QyCMgmr2qMWzN2xooEtihZAdM6pBAW030EgHSb6pgg8sVnVFAUyDog9aQJW00+ERvXc4ibKE7xOpl/cGOEORkTpFKXQ4Hns53YPcUvCeTmkg3QD3DdqEOSJAB3ER+DPykq0Y/qeQoZGd4tpf81zQ8+cgWF5uDJcZgGRNcgV5kCMNo2mjSQJysC9oBBshe1aawSBJEW5rPGn+CNMEk5IEociLBtkgQwBmzdRSxgb4RDu+d0aJZxIIG4ujbinO0g8KSyumcZzW4gmuEhLp3YyotM0BClvBLkkIgCwkw0rKwVWOzchHYYLpD+6FgDsiDQxPFBgGYZKXULlmN6TE4R4LBIyzTv2ckqJbsf8AQUrXcJYiWA3WvRWKtCdTncA3GytTCR07GDClZDiqSPyyBpQW0QyzCAw+qPtlzF5FuuRwUh+XI++QMMG9QyLPri3JZUEA3K05jMAlkmbKJ9jCUsZtsofxCr4qUM4lwF1rtWJqLN8KBIhADYEkDiraMKAkBiBULIggNDTcBzgJMCpIhbaBojB4MDKJtLjZUoPW5w45CIA3eA0SoKRQSDygMFRNBFOIvQM5MNzFGzkdLYBcRwlPqt0cRTYGCSm0Cq4lqE0Jw4Sd0sTWJJ5wQdKJ0lKneyyILEFr/hT8qKFLyJDgbX1Mv7kH7mGDPqA9DlpEzkCEeGt+5ypJFcrYHJtqTrCkIkeAaOHCUzUcbA4VGdZUkiEObAiRhfQOmG5S9OCNjMBGklwAUoMsyX0H1Q0FaOzAn6X7pXKWL0GaODFZ3NqF+HKz8qAQDAVf6sV0YSkUt9aOyXFsjPXcTeNP9Div+NxopBBIwVgULAqtg9VYSEI4QPSSn3YHIL5pO6/1ONZipqAXgIuotPeEBuBkPwfVItZd2pwBUimGGT7aQCJI2RqBUuIuGP8AB9UQAJoeRj8lJhm2OvZeRm8SQhBcsZNA5y//ABcIZCgOdMgigRsLoQf2/dDaAYeRh+wpkFkDOrfjdLGX90SciDI27XnqRuFLoP8AwquuQlG4pTORIDLkHYp40hPldbgex+kNqCdEVwx7QgGonuyS2XZeJm4IGym6oqnDcWCZhGeQxTp+KiyLatmzvQT/ALfLXYCDAQUgicIW+dHJqB3qHJAiSn6qI0gAcIXViOFbU59PEYE1iyWBFS5epukyrkqYotsRm/wdxZnu3hPbwSieU5pLnlvv+GdkcbUr+HCgLFgb5wob1iEGjXDHItKI4xUGgEwopQQRTHDav9Tj9OYqwq91ytI/hQ64ChgyPPiLgaLM6BoXEFOBh5KwqnyqEkHQfhkgJf8AO41JTs9d24JRPKc0U0V3ldk5pkcbTbUy/umzChzakOxDujf8w5oHwjTyCdWBI6leXUcyzBpU7AC1KKSHlBQcIx/sfA6BgoDZEclO8pJdPk/BTmFg28Qy9tDOMdIIkjwg+QpEqAjlKg3VzTzHBGKVDuIM041wgiqgOVV7Wh5tHHLKIkyO1SWqVUJCtOClosui1auQbqUnbWVCgwcKuPLUwfIhEKHIjFHQ4cAEDDMGnTcPcgEakBXLsYpEbIEU05YhDKLJ017dTNZFKbIW2oLCgoRQbEKHCtIBEkbI0wLE3L10bFg2lo/NwNsg7nNQPLv4gDFFnqZCEBOGAnhaNV/cIACwAAFBdWQQQG5gHgDR5rigRVBjYVt3QHf7BEBsiKJ3TCplUgFRlgHooGAUQjvSSBl03KILVsn2BDiRZ1NDciuEgDkRikMLJoAKjLATwHFQqdtmJhHsH1RahMGkrBu811CVhIBE80ePzRHcFIhwgRtqZf3cC+8FkFfbPdLP3Oco/wDX7pF34MtHTa8ihZmsYtN1JDoP44y/u911H5LX/d6c+mWIUG64DdQogI3VhLuiBd05P48y/u7xnVggfZ+qRsJrFAxmMzrvFcwS8hnmSU7q/wAeZf3aKyB5j/61dIe2C3PCE+V/IDL+7gxG8PpUJ4S4GgK1fBAA2AA/kDL+hE8EGdElpSBR0M5ryWlsomiiETGkYgSN2DPyNymZmQTbfwhyUwTdAHQAqgbArtTR8cxEYWQuMYluTRCq0Fkcy1LLcTkyBc+P0cUnWAGDtOXoFq36rDNQXIREE4p2eRSokR3EdCiQNwaC9olhgF2o2YtqcyJQZkMJJMbamNREiskil4OldL8JFib/AKKfJviNYdsQdtXwbiA0DIslazNDkpBDvEzfqmXUaCJCYezQViiC6ZY4Ig7Jv+g7xqkUF1A3WPCcquynxWFEFdlDDb9Ey/oW315hyKqAXb7YqfGhO3uZIgZ3KXhpSooYvKCWQ40Tw1gLmJEATHNKJL/3JRz0n5FASG4W50XNeUkmpBICYylB4FRB83B7VP2waKQaqNkEBbQhDviQrQMu9FPBNFxysqRhwhux8M3N0CuIIJCwXz8Bulg5HNRWwlCZHS4Cl9yhX4XFkAWKIwZdZym1R1YxLQFipjgDtG0LioABGOtZ/wBzqh+DqcgahIEEwAWYwp4kMEe5YfaoI5BBpkATEEg6ok/kYaEGwqDv4QW2cGJMQkhICpN/gw6RDgV9qDXQ7EQkJbC0XzSG0hI2CEBNnJSTQLzSgI2Yc20Lth3pv9PgZ6NoHSowQGSG2aZOoHMSAEtidIYCto3JLEVG9jR4NZJ5zthdAUmFQaEAk4pmDMC/oGX9BrzZIVwHpa2Q6oIQWAUSZXDaOWGBAIR7TJ96QDTP7gUhUKbwCl1sjCJhQSaQ5hfO6Fso9PFIxxtI+pVauPoQWBKQly1POABSpILsA2KYiZJgfCYzd2ExmpO7kMHJDkW9OYQ4CEiuQvEscoi6ykxOGccCAlLhbHxNHv6Dpl5Fk481N1dE7VGEivsu1TmITPARSVxNiGYh7UDtKe9WOafBahlJhEKc3yaNLUzKa5RaERtbA+JdC7kDzo1uMSxEciB/9qss9dsoOCd0BS+r1ySSQRZkSSdI+mL2qwZUCwcUj/gR6UUuXhYlDLhGCi3CZBOyw6+E7s0WUZMFJEBYu/BB0DHFCDtY/UJm9iJHn2k+d5ZXDBYhYvLmKamIYawJgk22eQ0Ub6mUEsxHbh4pq4UFtgLrO+DdCl/6xuZMCGBj2WSlosfA0p6AahomreFGWRAN1yhkbCC7MWRuauDfHTwGUwBdbFST2aNkHectZ2/RMv6JHjw0gF4zQkMwbAHyScBBdmEJDoaHxT/MlJFiQYeYA2oEARIR3o5nwYHAGNACbZ/RBO0sDsAEgWlJi0xRkMViGSeB3gTvMaWMIzwwQmGZG1YxgDlB6AqZLrobKlArmyoK2+n8bq3VurLoaV0FkgFIgWmzEEwBRom9o0AH2HOtr5O60gPSlfiHqkAH6L+w/hIgdmGzs01UeJyUIBFzeEbRS58dYkVjDCksptQaYAgAYF3iX70zYMMNZwRkrcklhJaWeBBAwkCRshTbRXNQZUQibiVdQxGUATAqx7UYTdrYRYEwuk2zrIhZ/TJIQwtdF5vR2PlzSAFgDY/RMv8A8Z//2Q==';

		doc.addImage(img, 'JPEG', 20, 16, 75, 27);
		doc.setFont('Helvetica');
		doc.setFontSize(13);
		doc.setFontType("bold");
		doc.text(100, 20, 'WKV ENTERTAINMENT');
		doc.setFontSize(12);
		doc.setFontType("normal");
		doc.text(153, 19.8, '(002458475-T)');
		doc.setFontSize(11);
		doc.text(100, 27, 'No. 29-1, Jalan Semenyih Sentral 3,');
		doc.text(100, 32, 'Semenyih Sentral, 43500 Semnyih, Selangor.');
		doc.setFontType("bold");
		doc.text(100, 37, 'Telephone :');
		doc.text(100, 42, 'Email :');
		doc.setFontType("normal");
		doc.text(123, 37, '+603 - 8210 7011');
		doc.text(114, 42, 'wkvmusicstore@gmail.com');

		doc.setLineWidth(1);
		doc.line(20, 48, 190, 48);

        doc.setFontSize(9);
		doc.text(20, 58, ('Inv. No : '+'xxx'));
		doc.text(20, 66, 'Company');
		doc.text(43, 66, 'xxx-company');
		doc.text(20, 71, 'Address');
		doc.text(43, 71, 'xxx-address');

		doc.setFontType("bold");
		doc.text(112, 71, 'Sales Person');
		doc.text(140, 71, ':');
		doc.text(112, 76, 'Mobile');
		doc.text(140, 76, ':');
		doc.text(112, 81, 'Email');
		doc.text(140, 81, ':');

		doc.text(20, 91, 'Attn');
		doc.text(35, 91, ':');
		doc.text(37, 91, 'xxx-client-attn');
		doc.text(20, 96, 'Email');
		doc.text(35, 96, ':');
		doc.text(37, 96, 'xxx-client-email');
		doc.text(20, 101, 'Tel');
		doc.text(35, 101, ':');
		doc.text(37, 101, 'xxx-client-tel');
		doc.text(20, 106, 'Fax');
		doc.text(35, 106, ':');
		doc.text(37, 106, 'xxx-client-fax');
		doc.text(20, 111, 'Mobile');
		doc.text(35, 111, ':');
		doc.text(37, 111, 'xxx-client-mobile');

		doc.setFontType("normal");
		doc.text(142, 71, 'xxx-sales');
		doc.text(142, 76, 'xxx-sales-mobile');
		doc.text(142, 81, 'wkvmusicstore@gmail.com');

		doc.text(112, 91, 'Date');
		doc.text(140, 91, ':');
		doc.text(142, 91, 'xxx-date');
		doc.text(112, 96, 'Total Page(s)');
		doc.text(140, 96, ':');
		doc.text(142, 96, 'xxx-pages');

        doc.setLineWidth(0.1);
		doc.line(20, 120, 190, 120);
		doc.line(20, 127, 190, 127);
		doc.line(30, 120, 30, 234);
		doc.line(128, 120, 128, 234);
		doc.line(161, 120, 161, 234);
		doc.line(20, 120, 20, 234);
		doc.line(190, 120, 190, 234);
		doc.line(20, 234, 190, 234);
		
        doc.setFontType("bold");
        doc.setFontSize(8);
        doc.text(23, 125, 'No');
        doc.text(70, 125, 'Description');
        doc.text(137, 125, 'Unit Price');
        doc.text(168, 125, 'Sub Total');
        
        
        
        doc.setFontSize(9);
        doc.setFontType("normal");
		doc.text(20, 238, ('Ringgit Malaysia : ' + 'xxx-money'));
        
        doc.setFontType("bold");
        doc.setFontSize(8);
        doc.setDrawColor(0);
        doc.setFillColor(220,220,220);
        doc.rect(20, 241, 170, 14, 'F');
        doc.text(25, 245, 'Terms & Conditions');
        doc.text(64, 249, 'WKV ENTERTAINMENT');
        doc.text(67, 253, '5624  1451  6618');
        doc.setFontType("normal");
        doc.text(25, 249, '* Make all payment payable to');
        doc.text(25, 253, '* Bank information :   - Maybank :');
        
        doc.setFontSize(10);
		doc.setFontType("bold");
		doc.line(20, 270, 60, 270);
		doc.text(20, 275, 'xxx-sales');
		doc.text(20, 280, ('H/P : ' + 'xxx'));
		doc.text(20, 285, ('Email : ' + 'wkvmusicstore@gmail.com'));
        
        doc.line(112, 270, 180, 270);
        doc.text(112, 275, 'Name : ');
        
        doc.setFontSize(25);
        doc.setFont("times");
		doc.setFontType("bolditalic");
		doc.text(22, 270, 'xxx-sales');
		doc.setProperties({
			title: 'xxx',
			subject: 'xxx',
			author: 'xxx',
			keywords: 'WKV Entertainment, Invoice',
			creator: 'WKV Entertainment'
		});
		
		window.plugins.socialsharing.share(doc.output());
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
				x += '<li><label class="item-checkbox item-content"><input type="checkbox" ' + (select ? 'checked="checked"' : '') + ' name="evcw-checkbox" value="' + crews[i]['user_id'] + '" data-sn="' + crews[i]['short_name'] + '" />';
				x += '<i class="icon icon-checkbox"></i><div class="item-inner"><div class="item-title' + (leaveApproved ? ' colorRed' : '') + '">' + crews[i]['short_name'] + '</div></div></label></li>';
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
		var wcrew = [], wcrewsn = [];
		
		for(var i=0; i<$('input[name="evcw-checkbox"]:checked').length; i++){
			wcrew.push($('input[name="evcw-checkbox"]:checked:eq('+i+')').val());
			wcrewsn.push($('input[name="evcw-checkbox"]:checked:eq('+i+')').data('sn'));
		}
		
		$('input.evt-crew-edit').data('uname', wcrew.join(','));
		$('input.evt-crew-edit').val(wcrewsn.join(', '));
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
			var failed_toast = apps.toast.create({
								   icon: '<i class="material-icons">sentiment_very_dissatisfied</i>',
								   text: 'Barcode scanner not supported.',
								   position: 'center',
								   closeTimeout: 2000
							   });
			failed_toast.open();
		}
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
	
	$('button.apkl_add').on('click', function(){
		apps.popup.close('.popup-apkl', true);
		apps.popup.open('.popup-apklp', true);
		$('.popup-backdrop').addClass('backdrop-in');
		
		$('.popup-apklp .stepper').each(function(i){
			var id = $(this).data('id');
			apps.stepper.create({
				el: '.popup-apklp .stp-' + id + '.stepper'
			});
		});
		
	});
	
	$('#picl-btn').on('click', function(){
		var x = '', crews = $('body').data('crew');
		
		for(var i = 0, j=0; i < crews.length; i++){
			if(crews[i]['user_level'] == 0){
				x += '<li>';
				x += '<a href="#" class="item-link item-content" data-num="' + i + '" data-jnum="' + j + '" data-uid="' + crews[i]['user_id'] + '" data-dname="' + crews[i]['nc_name'] + '" data-comp="' + crews[i]['nc_pos1'] + '" data-con="' + crews[i]['nc_contact'] + '">';
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
		$('#picl_con').val('');
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
		$('#picl_con').val($(this).data('con'));
		apps.popover.open('.picl-popover');
	});
	
	$('.picl_ok').on('click', function(){
		var dnm = $('#picl_dname').val(), comp = $('#picl_comp').val(), con = $('#picl_con').val();
		
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
					'con' : con,
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
								x += '<a href="#" class="item-link item-content" data-num="' + crew.length + '" data-jnum="' + $('.pic_list ul li').length + '" data-uid="' + uid + '" data-dname="' + dnm + '" data-comp="' + comp + '" data-con="' + con + '">';
								x += '<div class="item-inner"><div class="item-title">' + dnm + '<div class="item-footer">' + con + (sys.isEmpty(comp) ? '' : (' (' + comp + ')')) + '</div></div></div></a></li>';
								
							var ncrew = {
								'clocked_in' : '0',
								'clocked_time' : '2019-01-01 00:00:00',
								'nc_name' : dnm,
								'user_id' : uid,
								'nc_contact' : con,
								'nc_pos1' : comp,
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
					'con' : con,
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
							var x = '<a href="#" class="item-link item-content" data-num="' + pnum + '" data-jnum="' + jnum + '" data-uid="' + $('#picl_dname').data('uid') + '" data-dname="' + dnm + '" data-comp="' + comp + '" data-con="' + con + '">';
								x += '<div class="item-inner"><div class="item-title">' + dnm + '<div class="item-footer">' + con + (sys.isEmpty(comp) ? '' : (' (' + comp + ')')) + '</div></div></div></a>';
							
							crew[pnum]['nc_contact'] = con;
							crew[pnum]['nc_pos1'] = comp;
							
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
		
		$('iframe#gmap').attr('src', ('https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center='+loc+'&zoom=17'));
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
	
	$('#ivtk-btn').on('click', function(){
		$('.ivt_list ul').find('li').remove();
		
		var searchbar = apps.searchbar.create({
				el: '.popup-ivtk .searchbar',
				searchContainer: '.popup-ivtk .list.ivt_list',
				searchIn: '.eqls'
			});
			
		var inv = $('body').data('inv'), equip = [], place = {};
		
		for(var i=0; i < inv.length; i++){
			var point = inv[i].point;
			equip[i] = ((sys.isEmpty(inv[i].brand) ? '' : ( inv[i].brand + ' ')) + inv[i].description);
			
			if(!sys.isEmpty(point)){
				var pnt = JSON.parse(point.replace(/\\/g, ""));
				
				for(var j=0; j < pnt.length; j++){
					var tmp_c = $('.eqls[name="' + pnt[j].p + '"]').text(),
						tmp = {
								'name': equip[i],
								'qty' : pnt[j].q
							  };
					if(sys.isEmpty(place[pnt[j].p])){
						place[pnt[j].p] = [];
						
						var x = '';
						
						x += '<li><a href="#" class="item-link item-content"><div class="item-inner"><div class="item-title">' + sys.capFirst(pnt[j].p);
						x += '<span name="' + pnt[j].p + '" class="eqls"></span></div></div></a></li>';
						
						$('.ivt_list ul').append(x);
					}else{
						tmp_c += ', ';
					}
					place[pnt[j].p].push(tmp);
					$('.eqls[name="' + pnt[j].p + '"]').text((tmp_c + equip[i]));
					$('.eqls[name="' + pnt[j].p + '"]').data('equip', place[pnt[j].p]);
				}
			}
		}

		var autoSearch = apps.autocomplete.create({
			openIn: 'dropdown',
			inputEl: '.ivtk-search',
			limit: 5,
			source: function(query, render){
				var results = [];
				
				if(query.length === 0){
					render(results);
					return;
				}
				
				for(var i = 0; i < equip.length; i++){
					if (equip[i].toLowerCase().indexOf(query.toLowerCase()) >= 0) results.push(equip[i]);
				}
				
				render(results);
			},
			off: { blur }
		});
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
				share += (i+1) + '. ' + (sys.isEmpty(inf[i].description) ? '' : (inf[i].description + ', ')) + (inf[i].venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf[i].venue).loc_name : inf[i].venue) + '.\n';
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
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-title item-label">Standby Time</div><div class="item-input-wrap"><input class="evtd_sbtm" type="text" autocomplete="off" value="' + ((inf.time==null) ? '' : inf.time) + '"></div></div></div></li>';
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
						time = $('input.evtd_sbtm').val(),
						venue = sys.locToPid($('input.evtd_venue').val()),
						desc = $('input.evtd_desc').val(),
						price = $('input.evtd_price').val(),
						paid = $('.evtd_paid input')[0].checked,
						band = $('input.evtd_band').val(),
						crew = (($('input.evtd_crew').data('uname') == null) ? '' : $('input.evtd_crew').data('uname')),
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
								inf.car_in = ((cin == '') ? null : cin);
								inf.car_out = ((cout == '') ? null : cout);
								inf.remarks = ((rmk == '') ? null : rmk);
								
								$('tr[name="' + trName + '"]').data('info', inf);
								$('div.details-popover').data('info', inf);
								
								if(parseInt($('body').data('user_level'))>=8 && (sys.ldToShort(ld) != 'ST')){
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
									if((md5(ld+time+venue+desc+band+crew+cin+cout+rmk)) != $('.details-popover').data('md5')){
										var rcrew = ((inf.crew).split(',')), receivers = [];
										
										for(var i=0; i < rcrew.length; i++){
											rcrew[i] = sys.uidToPyid(rcrew[i]);
										}
										receivers = rcrew.filter(function(str){
											return (!sys.isEmpty(str))
										});
										
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
						$('.popup-stht .list ul').html(x);
						
						$('.popup-stht .list ul .tt').each(function(){
							apps.tooltip.create({
								targetEl: $(this),
								text: sys.commasToNextLine($(this).data('rmk'), 'h')
							});
						});
					}else{
						$('.popup-stht .list ul').html('<li class="item-content"><div class="item-inner">No history found.</div></li>');
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
					$('.popup-stht .list ul').html('<li class="item-content"><div class="item-inner">No history found.</div></li>');
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
	
	$('.popup-stht .list ul').on('click', 'a', function(){
		var x = '';
		
		x += '<span class="dialog-label">In</span>: ' + $(this).data('in') + '<br/>';
		x += '<span class="dialog-label">Out</span>: ' + $(this).data('out') + '<br/>';
		x += 'Duration : ' + $(this).find('.item-after').text() + '<br/><br/>';
		x += '<strong>' + $(this).data('venue') + '</strong><br/>';
		x += '<iframe width="100%" height="250" frameborder="0" style="border:0;" src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=' + $(this).data('location') + '&zoom=17"> </iframe>';
		
		apps.dialog.alert(x, '');
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
	
	$('div.popup-staa .block img, #update a.button').on('click', function(){
		window.open("market://details?id=com.wkv.manage", "_system");
	});
	
	DATA = {
		'usr' : usr,
		'pwd' : pwd,
		'version' : APP_VERSION
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
			
			STORAGE.setItem('level', inf['level']);
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
					var task = inf['task'], x = '', sameAs = 0;
					
					for(var i=0; i<task.length; i++){
						if(task[i]['date'] != sameAs){
							x += '<div class="timeline-item">';
							x += '<div class="timeline-item-date">' + task[i]['date'].substr(8,2) + ' <small>' + sys.toMonth(task[i]['date']) + '</small></div>';
							x += '<div class="timeline-item-divider"></div>';
							x += '<div class="timeline-item-content">';
						}
						
						x += '<div class="timeline-item-inner tsk' + task[i]['primary_id'] + '" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '">';
						
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
					$('#task_tl').data('inf', task);
					$('#task_tl').html(x);
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
			
			setTimeout(function(){ sys.loading(0) }, 3000);
		}
	});
	
	if(typeof cordova != 'undefined'){
		cordova.plugins.notification.local.on("click", function (notification){
			if(notification.data.eventID == 'alrl'){
				var DATA = {
						'usr' : STORAGE.getItem('usr')
					}
				var post_data = "ACT=" + encodeURIComponent('alr_chk')
							  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
				
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					success: function(str){
						if(str==='204 No Response'){
							$('.popup-alrl .list ul').html('<p style="margin-left:10px;">No leave request found.</p>');
						}else{
							var inf = JSON.parse(str);
							
							if(inf['reply']==='200 OK'){
								var x ='', leave = inf['leave'];
								
								for(var i=0; i < leave.length; i++){
									x += '<li><a href="#" class="item-link item-content" data-num="' + i + '" data-pid="' + leave[i].primary_id + '" data-reason="' + leave[i].clock_location + '" data-status="' + leave[i].status + '">';
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
					}
				});
				
				var searchbar = apps.searchbar.create({
						el: '.popup-alrl .searchbar',
						searchContainer: '.popup-alrl .list.alr_list',
						searchIn: '.item-title, .item-after'
					});
					
				apps.popup.open('.popup-alrl');
			}
		}, this);
	}
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
	'unameToSname' : function(str){
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
					url: 'https://app.wkventertainment.com/',
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
			geoCount = 120;
			
			var DATA = {
					'usr' : STORAGE.getItem('usr'),
					'loc' : $('iframe#gmap').data('loc')
				};
			var post_data = "ACT=" + encodeURIComponent('msg_chk')
						  + "&DATA=" + encodeURIComponent(sys.serialize(DATA));
						  
			if(STORAGE.getItem('usr')){
				$.ajax({
					type: 'POST',
					url: 'https://app.wkventertainment.com/',
					data: post_data,
					success: function(str){
						var inf = JSON.parse(str);
					
						if(inf['reply']==='200 OK'){
							if(inf['new']){
								navigator.vibrate(500);
								
								apps.notification.create({
									icon: '<img src="https://app.wkventertainment.com/icon.png" width="16px" height="16px"/>',
									title: 'WKV',
									titleRightText: 'now',
									subtitle: inf['title'],
									text: inf['text'],
									on:{
										click: function(){
											$('div.notification').slideUp();
										}
									}
								}).open();
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