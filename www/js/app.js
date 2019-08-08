var $$ = Dom7;
var sys = new Object();
var STORAGE = window.localStorage;
var apps = new Framework7({
			  root: '#app',
			  id: 'com.wkv.manage',
			  name: 'WKV',
			  theme: 'md',
			  version: "1.0.157",
			  rtl: false,
			  language: "en-US"
		  });
var geoToken = true, geoCount = 120, APP_VERSION = 10157;

var app = {
    initialize: function() {
        this.bindEvents();
    },
	
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },
	
    onDeviceReady: function(){
        app.receivedEvent('deviceready');
		
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
									
									x += '<div class="timeline-item-inner" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '">';
									
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
							sys.loading(0);
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
							
							apps.popup.open('.popup-event');
							
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
										
										if(parseInt($('body').data('user_level'))>=9 && inf1.lock==0){
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
											x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row"><button class="evtd_sve button col button-fill" data-eid="' + inf.primary_id + '">Save</button>';
											x += '<button class="evtd_dlt button col button-fill" data-eid="' + inf.primary_id + '">Delete</button>';
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
											$('.details-popover button.evtd_sve').data('trName', trName);
											$('.details-popover button.evtd_sve').on('click', function(){
												var pid = $(this).data('eid'),
													ld = $('input.evtd_ld').val(),
													time = $('input.evtd_sbtm').val(),
													venue = sys.locToPid($('input.evtd_venue').val()),
													desc = $('input.evtd_desc').val(),
													price = $('input.evtd_price').val(),
													paid = $('.evtd_paid input')[0].checked,
													band = $('input.evtd_band').val(),
													crew = $('input.evtd_crew').data('uname'),
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
														sys.loading(0);
														
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
															
															if(parseInt($('body').data('user_level'))>=8){
																if(paid){
																	$('tr[name="' + trName + '"] td.tb-pic').removeClass('tb-not-paid');
																	$('tr[name="' + trName + '"] td.tb-pic').addClass('tb-paid');
																}else{
																	$('tr[name="' + trName + '"] td.tb-pic').removeClass('tb-paid');
																	$('tr[name="' + trName + '"] td.tb-pic').addClass('tb-not-paid');
																}
															}
															$('tr[name="' + trName + '"] td.tb-ld').text(sys.ldToShort(ld));
															$('tr[name="' + trName + '"] td.tb-venue').text((venue == '' ? '-' : (venue.indexOf('#PID#') != -1 ? sys.pidToLoc(venue).loc_name : venue)));
															$('tr[name="' + trName + '"] td.tb-venue').data('pid', venue);
															$('tr[name="' + trName + '"] td.tb-desc').text((desc == '' ? '-' : desc));
															$('tr[name="' + trName + '"] td.tb-band').text((band == '' ? '-' : band));
															$('tr[name="' + trName + '"] td.tb-crew').text((crew == '' ? '-' : sys.unameToSname(crew)));
															$('tr[name="' + trName + '"] td.tb-cin').html((cin == '' ? '-' : sys.carToTcar(cin)));
															$('tr[name="' + trName + '"] td.tb-cout').html((cout == '' ? '-' : sys.carToTcar(cout)));
															
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
	sys.eventCheck(usr, (new Date().getMonth()), new Date().getYear()+1900);
	
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
		if(($(this).val()).toLowerCase()=='setup'){
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
								
								x += '<div class="timeline-item-inner" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '">';
								
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
		var today = ((((new Date).getYear()+1900)) + '-' + (sys.pad((new Date).getMonth()+1)) + '-' + (sys.pad((new Date).getDate()))), pic = [];
		
		$('#rprt_from').val(today);
		$('#rprt_to').val(today);
		
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
		var from = $('#rprt_from').val(),
			to = $('#rprt_to').val();
		
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
								
								x += '<li class="item-content"><div class="item-inner"><div class="row small-font"><div class="tt col-10 ' + (inf['sales'][i].paid=='1' ? 'tb-paid' : 'tb-not-paid') + '" data-pid="' + inf['sales'][i].primary_id + '" data-rmk="' + inf['sales'][i].remarks + '">' + (j+1) + '</div><div class="col-20">' + (inf['sales'][i].date).substr(0,10) + '</div><div class="col-45">' + sys.pidToLoc(inf['sales'][i].venue).loc_name + '</div><div class="col-15">RM ' + tprice + '</div></div></div></li>';
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
	})
	
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
	
	$('.panel-evt-rmk textarea').on('paste keyup', function(){
		var x = sys.commasToNextLine($(this).val(), 'r');
		
		$('.details-popover input.evtd_rmk').val(x);
	});
	
	$('.details-popover').on('click', 'input.evtd_crew', function(){
		$('.evt-crew-edit').removeClass('evt-crew-edit');
		
		var crews = $('body').data('crew'),
			work = (sys.isEmpty($('input.evtd_crew').data('uname')) ? [] : ($('input.evtd_crew').data('uname').indexOf(',') != -1 ? $('input.evtd_crew').data('uname').split(',') : [$('input.evtd_crew').data('uname')])),
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
		
		window.plugins.socialsharing.share(share);
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
	
	$('#brcsn-btn').on('click', function(){
		cordova.plugins.barcodeScanner.scan(
			function(result){
				alert("We got a barcode\n" + 
					  "Result: " + result.text + "\n" + 
					  "Format: " + result.format + "\n" + 
					  "Cancelled: " + result.cancelled);
			}, function (error) {
				alert("Scanning failed: " + error);
			}, {
				preferFrontCamera : false, // iOS and Android
				showFlipCameraButton : true, // iOS and Android
				showTorchButton : true, // iOS and Android
				torchOn: false, // Android, launch with the torch switched on (if available)
				saveHistory: false, // Android, save scan history (default false)
				prompt : "Place a barcode inside the scan area", // Android
				resultDisplayDuration: 2000, // Android, display scanned text for X ms. 0 suppresses it entirely, default 1500
				formats : "QR_CODE,DATA_MATRIX", // default: all but PDF_417 and RSS_EXPANDED
				orientation : "portrait", // Android only (portrait|landscape), default unset so it rotates with the device
				disableAnimations : true, // iOS
				disableSuccessBeep: false // iOS and Android
			}
		);
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
		
		var mpixel = parseFloat(locs['loc_range']) * 0.25;
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
		
		var mpixel = parseFloat(range) * 0.25;
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
		
		$('span.lpoint_tl, span.lpoint_tr').css('top', ((133 - 25)+'px'));
		$('span.lpoint_tl, span.lpoint_bl').css('left', ((123 - 25)+'px'));
		$('span.lpoint_tr, span.lpoint_br').css('left', ((123 + 25)+'px'));
		$('span.lpoint_bl, span.lpoint_br').css('top', ((133 + 25)+'px'));
		
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
				searchIn: '.item-title',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
						sys.loading(0);
						
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
						sys.loading(0);
						
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
				sys.loading(0);
			}
		});
		
		var searchbar = apps.searchbar.create({
				el: '.popup-alrl .searchbar',
				searchContainer: '.popup-alrl .list.alr_list',
				searchIn: '.item-title, .item-after',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
			});
	});
	
	$('.alr_list').on('click', 'a.item-link', function(){
		$('#alrd_date').val($(this).find('.item-after').text());
		$('#alrd_date').data('pid', $(this).data('pid'));
		$('#alrd_date').data('num', $(this).data('num'));
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
				searchIn: '.eqls',
				on: {
					search(sb, query, previousQuery){
						console.log('');
					}
				}
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
						sys.loading(0);
						
						if(str==='200 OK'){
							var success_toast = apps.toast.create({
												   icon: '<i class="material-icons">hearing</i>',
												   text: 'Leave request pending for approval.',
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
				url: 'https://app.wkventertainment.com/',
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
							
							if(parseInt($('body').data('user_level'))>=9 && inf1.lock==0){
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
								x += '<li><div class="item-content item-input"><div class="item-inner"><div class="item-input-wrap row"><button class="evtd_sve button col button-fill" data-eid="' + inf.primary_id + '">Save</button>';
								if(parseInt($('body').data('user_level'))>=9){
									x += '<button class="evtd_dlt button col button-fill" data-eid="' + inf.primary_id + '">Delete</button>';
								}
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
							
							if(parseInt($('body').data('user_level'))>=8){
								$('.details-popover button.evtd_sve').data('trName', trName);
								$('.details-popover button.evtd_sve').on('click', function(){
									var pid = $(this).data('eid'),
										ld = $('input.evtd_ld').val(),
										time = $('input.evtd_sbtm').val()
										venue = sys.locToPid($('input.evtd_venue').val()),
										desc = $('input.evtd_desc').val(),
										price = $('input.evtd_price').val(),
										paid = $('.evtd_paid input')[0].checked,
										band = $('input.evtd_band').val(),
										crew = $('input.evtd_crew').data('uname'),
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
											sys.loading(0);
											
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
				  + 'Venue : ' + (inf.venue.indexOf('#PID#') != -1 ? sys.pidToLoc(inf.venue).loc_name : inf.venue) + '\n'
				  + 'PIC : ' + inf.pic + '\n'
				  + (sys.isEmpty(inf.band) ? '' : (inf.band + '\n'))
				  + 'Setup : 3pm\n' 
				  + 'Sound Check : 5pm\n\n'
				  + (sys.isEmpty(inf.car_in) ? '' : ('Use : ' + inf.car_in + '\n'))
				  + (sys.isEmpty(inf.remarks) ? '' : ('Remarks : ' + sys.commasToNextLine(inf.remarks, 'n') + '\n'));
		window.plugins.socialsharing.share(share);
	});
	
	$('.popover-backdrop').on('click', function(e){
		if($('.details-popover').css('display')=='block'){
			if(this === e.target){
				if(parseInt($('body').data('user_level')) > 7){
					var trName = $('.details-popover button.evtd_sve').data('trName'),
						inf = $('div.details-popover').data('info'),
						pid = $('.details-popover button.evtd_sve').data('eid'),
						ld = $('input.evtd_ld').val(),
						time = $('input.evtd_sbtm').val(),
						venue = sys.locToPid($('input.evtd_venue').val()),
						desc = $('input.evtd_desc').val(),
						price = $('input.evtd_price').val(),
						paid = $('.evtd_paid input')[0].checked,
						band = $('input.evtd_band').val(),
						crew = $('input.evtd_crew').data('uname'),
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
							sys.loading(0);
							
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
		var DATA = {
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
				if(str==='204 No Response'){
					$('.popup-stht .list ul').html('<p style="margin-left:10px;">No work history found.</p>');
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
						$('.popup-stht .list ul').html(x);
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
			
			if(inf['level']>8 && inf['leave']){
				apps.notification.create({
					icon: '<img src="https://app.wkventertainment.com/icon.png" width="16px" height="16px"/>',
					title: 'WKV',
					titleRightText: 'now',
					subtitle: 'Pending leave request',
					text: ('From ' + sys.unameToSname(inf['leave'].toString())),
					on:{
						click: function(){
							$('div.notification').slideUp();
							$('#alrl-btn')[0].click();
						}
					}
				}).open();
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
						
						x += '<div class="timeline-item-inner" data-locpid="' + (sys.isEmpty(task[i]['venue']) ? 0 : (task[i]['venue'].indexOf('#PID#') != -1 ? task[i]['venue'] : 0)) + '" data-rmk="' + task[i]['remarks'] + '">';
						
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
			
			for(var i=1; i<=parseInt(inf['level']); i++){
				if($('.ltlevel'+i).length > 0){
					$('.ltlevel'+i).remove();
				}
			}
			
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
				var x = str.replace(/,,/g, '<br/>'), pattern = new RegExp(/\`(.*?)\`/g);
				
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