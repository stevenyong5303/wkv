<?php
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');

	include 'functions.php';
	
	if($_POST){
		if(isset($_POST['ACT'])){
			switch($_POST['ACT']){
				case 'event_add_through_whatsapp_message_system':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$desc = ($DATA['desc'] == 'NULL' ? 'NULL' : ('"' . $DATA['desc'] . '"'));
					$ld = ($DATA['ld'] == 'NULL' ? '"Dinner"' : (($DATA['ld'] == 'L' || $DATA['ld'] == 'Lunch') ? '"Lunch"' : '"Dinner"'));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_evt ' .
						   ' (date, pic, description, luncheon_dinner) ' .
						   ' VALUES ( "' . $DATA['year'] . '-' . $DATA['month'] . '-' . $DATA['day'] . ' 00:00:00", "' . $DATA['PIC'] . '", ' . $desc . ', ' . $ld . '); ';
						   
					if($result = $mysqli->query($sql)){
						echo '200 OK';
					}else{
						echo '500 Internal Server Error';
					}
					break;
					
				case 'msg_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$report['new'] = false;
					
					$sql = ' SELECT primary_id, title, text FROM 14RuVPJV6GmH_app_not ' .
						   ' WHERE notify_flag = TRUE ' .
						   ' AND user_id = "' . strtolower($DATA['usr']) . '" ' .
						   ' AND date < "' . date("Y-m-d H:i:s") . '" ' .
						   ' ORDER BY `date` ASC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$report['title'] = $row['title'];
							$report['text'] = $row['text'];
							$result->close();
							
							$sql = ' UPDATE 14RuVPJV6GmH_app_not ' .
								   ' SET notify_flag = FALSE ' .
								   ' WHERE primary_id = ' . $row['primary_id'] . '; ';
							   
							if($result = $mysqli->query($sql)){
								$report['new'] = true;
							}else{
								echo '406 Not Acceptable';
							}
						}else{
							$report['new'] = false;
						}
					}else{
						echo '400 Bad Request';
					}
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
						   ' (act, user_id, data) ' .
						   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
					if($result = $mysqli->query($sql)){
						$report['reply'] = '200 OK';
					}else{
						echo '500 Internal Server Error';
					}
					
					echo json_encode($report);
					break;
				
				case 'tme_chk':
					echo (date("Y/m/d") . ' ' . date("H:i:s"));
					break;
					
				case 'evt_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					if(($DATA['month']+1)<10){
						$DATA['month'] = '0'.($DATA['month']+1);
					}else{
						$DATA['month'] = $DATA['month']+1;
					}
					$yearMonth = $DATA['year'].'-'.$DATA['month'];
					
					$sql = ' SELECT * FROM 14RuVPJV6GmH_app_evt ' .
						   ' WHERE cancelled_flag = FALSE ' .
						   ' AND event = TRUE ' .
						   ' AND date BETWEEN "' . $yearMonth . '-01 00:00:00" AND "' . $yearMonth . '-31 23:59:59"; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$report[substr($row['date'], 8, 2)] = 1;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								if($report[substr($row['date'], 8, 2)]>0){
									$report[substr($row['date'], 8, 2)]++;
								}else{
									$report[substr($row['date'], 8, 2)] = 1;
								}
							}
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'evt_lck':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					
					if($DATA['level']<9){
						$report['reply'] = '200 OK';
						$report['lock'] = 0;
						echo json_encode($report);
					}else{
						$sql = ' SELECT event, locked FROM 14RuVPJV6GmH_app_evt ' .
							   ' WHERE primary_id = ' . $pid . '; ';
							   
						if($result = $mysqli->query($sql)){
							if($row = $result->fetch_array(MYSQLI_ASSOC)){
								$result->close();
								
								if(($row['locked'] == '0') || ($row['locked'] == strtolower($DATA['usr']))){
									$sql = ' UPDATE 14RuVPJV6GmH_app_evt ' .
										   ' SET locked = ' . addQuotes(strtolower($DATA['usr'])) . ' ' .
										   ' WHERE primary_id = '.$pid.'; ';
									
									if($result = $mysqli->query($sql)){
										$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
											   ' (act, user_id, data) ' .
											   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
											   
										if($result = $mysqli->query($sql)){
											$report['reply'] = '200 OK';
											$report['lock'] = 0;
											echo json_encode($report);
										}else{
											echo '500 Internal Server Error';
										}
									}else{
										echo '500 Internal Server Error';
									}
								}else{
									$report['reply'] = '200 OK';
									$report['lock'] = $row['locked'];
									echo json_encode($report);
								}
							}else{
								echo '204 No Response';
							}
						}else{
							echo '400 Bad Request';
						}
					}
					break;
					
				case 'usr_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' SELECT user_id, nc_name, clocked_in, clocked_time, short_name, user_level, nc_contact, nc_pos1 FROM 14RuVPJV6GmH_app_usr ' .
						   ' WHERE user_level >= 0 ' . 
						   ' ORDER BY `user_level` DESC, `nc_name` ASC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$status[$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$status[$i] = $row;
								$i++;
							}
							
							$result->close();
							$report['status'] = $status;
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['reply'] = '200 OK';
							}else{
								$report['reply'] = '500 Internal Server Error';
							}
							echo json_encode($report);
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'clk_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' SELECT clock_action, clock_in_out, clock_location, status FROM 14RuVPJV6GmH_app_clk ' .
						   ' WHERE user_id = ' . addQuotes(strtolower($DATA['target'])) . ' ' .
						   ' AND ( clock_action = "IN" OR clock_action = "OUT" ) ' .
						   ' AND clock_in_out >= "' . date('Y-m-d', strtotime("-6 week")) . ' 00:00:00" ' .
						   ' ORDER BY `clock_in_out` DESC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$work[$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$work[$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['work'] = $work;
								$report['reply'] = '200 OK';
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'clk_in':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_clk ' .
						   ' (user_id, clock_action, clock_location, status) ' .
						   ' VALUES ( ' . $user_id . ', "IN", "' . $DATA['loc'] . '", "' . $DATA['lname'] . '"); ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
							   ' SET clocked_in = TRUE, ' .
							   ' clocked_time = NOW() ' .
							   ' WHERE user_id = '.$user_id.'; ';
							   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '406 Not Acceptable';
						}
					}else{
						echo '406 Not Acceptable';
					}
					break;
					
				case 'clk_out':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_clk ' .
						   ' (user_id, clock_action, clock_location) ' .
						   ' VALUES ( ' . $user_id . ', "OUT", "' . $DATA['loc'] .'"); ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
							   ' SET clocked_in = FALSE, ' .
							   ' clocked_time = NOW() ' .
							   ' WHERE user_id = '.$user_id.'; ';
							   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '406 Not Acceptable';
						}
					}else{
						echo '406 Not Acceptable';
					}
					break;
					
				case 'ssn_chk':
				case 'lgn_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					$user_password = addQuotes($DATA['pwd']);
					
					$sql = ' SELECT * FROM 14RuVPJV6GmH_app_usr ' .
						   ' WHERE user_id = '.$user_id.' ' .
						   ' AND user_password = '.$user_password.'; ';
						   
					if($result = $mysqli->query($sql)){
						if($result->num_rows==1){
							if($DATA['version'] >= 10154){
								$row = $result->fetch_array(MYSQLI_ASSOC);
								$result->close();
								
								$report['reply'] = '200 OK';
								$report['clocked'] = $row['clocked_in'];
								$report['time'] = $row['clocked_time'];
								$report['level'] = $row['user_level'];
								$report['name'] = $row['nc_name'];
								$report['contact'] = $row['nc_contact'];
								$report['email'] = $row['nc_email'];
								$report['pos1'] = $row['nc_pos1'];
								$report['pos2'] = $row['nc_pos2'];
								
								$sql = ' SELECT user_id, nc_name, clocked_in, clocked_time, short_name, user_level, nc_contact, nc_pos1 FROM 14RuVPJV6GmH_app_usr ' .
									   ' WHERE user_level >= 0 ' . 
									   ' ORDER BY `user_level` DESC, `nc_name` ASC; ';
									   
								if($result = $mysqli->query($sql)){
									if($row = $result->fetch_array(MYSQLI_ASSOC)){
										$i = 0;
										$status[$i] = $row;
										$i++;
										
										while($row = $result->fetch_array(MYSQLI_ASSOC)){
											$status[$i] = $row;
											$i++;
										}
										
										$result->close();
										$report['status'] = $status;
									}else{
										echo '204 No Response';
									}
								}else{
									echo '400 Bad Request';
								}
								
								$sql = ' SELECT * FROM 14RuVPJV6GmH_app_loc ' .
									   ' WHERE cancelled_flag = FALSE ' .
									   ' ORDER BY `loc_state` ASC, `loc_category` ASC, `loc_name` ASC; ';
									   
								if($result = $mysqli->query($sql)){
									if($row = $result->fetch_array(MYSQLI_ASSOC)){
										$i = 0;
										$location[$i] = $row;
										$i++;
										
										while($row = $result->fetch_array(MYSQLI_ASSOC)){
											$location[$i] = $row;
											$i++;
										}
										
										$result->close();
										$report['location'] = $location;
									}else{
										echo '204 No Response';
									}
								}else{
									echo '400 Bad Request';
								}
								
								
								if($report['level'] > 3){
									$sql = ' SELECT date, venue, description, time, crew, remarks FROM 14RuVPJV6GmH_app_evt ' .
										   ' WHERE cancelled_flag = FALSE ' .
										   ' AND date BETWEEN "' . date("Y-m-d") . ' 00:00:00" AND "' . date("Y-m-d", strtotime("+1 week")) . ' 23:59:59" ' .
										   ' ORDER BY `date` ASC, `time` ASC; ';
								}else{
									$sql = ' SELECT date, venue, description, time, crew, remarks FROM 14RuVPJV6GmH_app_evt ' .
										   ' WHERE cancelled_flag = FALSE ' .
										   ' AND date BETWEEN "' . date("Y-m-d") . ' 00:00:00" AND "' . date("Y-m-d", strtotime("+2 day")) . ' 23:59:59" ' .
										   ' ORDER BY `date` ASC, `time` ASC; ';
								}
								
								if($result = $mysqli->query($sql)){
									if($row = $result->fetch_array(MYSQLI_ASSOC)){
										$i = 0;
										$task[0] = 'none';
										$crewl = explode(',', $row['crew']);
										
										if(in_array(strtolower($DATA['usr']), $crewl)){
											$task[$i] = $row;
											$i++;
										}
										
										while($row = $result->fetch_array(MYSQLI_ASSOC)){
											$crewl = explode(',', $row['crew']);
											
											if(in_array(strtolower($DATA['usr']), $crewl)){
												$task[$i] = $row;
												$i++;
											}
										}
										
										$result->close();
										$report['task'] = $task;
									}else{
										$report['task'][0] = 'none';
									}
								}else{
									echo '400 Bad Request';
								}
								
								$sql = ' SELECT * FROM 14RuVPJV6GmH_app_inv ' .
									   ' ORDER BY `category` ASC, `brand` ASC, `description` ASC; ';
								
								if($result = $mysqli->query($sql)){
									if($row = $result->fetch_array(MYSQLI_ASSOC)){
										$i = 0;
										$inventory[$i] = $row;
										$i++;
										
										while($row = $result->fetch_array(MYSQLI_ASSOC)){
											$inventory[$i] = $row;
											$i++;
										}
										
										$result->close();
										$report['inventory'] = $inventory;
									}else{
										$report['inventory'][0] = 'none';
									}
								}else{
									echo '400 Bad Request';
								}
								
								$leave = false;
								if($report['level'] > 8){
									$sql = ' SELECT primary_id, status FROM 14RuVPJV6GmH_app_clk ' .
										   ' WHERE clock_action = "LRQ" ' .
										   ' AND clock_in_out >= "' . date('Y-m-d') . ' 00:00:00" ' .
										   ' ORDER BY `clock_in_out` ASC; ';
										   
									if($result = $mysqli->query($sql)){
										if($row = $result->fetch_array(MYSQLI_ASSOC)){
											if($row['status']==0){
												$leave = true;
											}
											
											while($row = $result->fetch_array(MYSQLI_ASSOC)){
												if($row['status']==0){
													$leave = true;
													break;
												}
											}
											
											$result->close();
										}
									}
								}
								$report['leave'] = $leave;
								
								$report['car'] = array('Avanza', 'City', 'Dmax', 'Elantra', 'Kancil', 'Kembara', 'Myvi', 'Mazda', 'Lorry', 'New Lorry', 'YX Avanza', 'Own Car', 'Grab Car','Arasu Lorry', 'Jason Lorry');
								
								$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
									   ' (act, user_id, data) ' .
									   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
									   
								if($result = $mysqli->query($sql)){
									echo json_encode($report);
								}else{
									echo '500 Internal Server Error';
								}
							}else{
								$report['reply'] = '426 Upgrade Required';
								echo json_encode($report);
							}
						}else{
							$report['reply'] = '406 Not Acceptable';
							$report['clocked'] = '0';
							
							echo json_encode($report);
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'loc_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
				
					$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
						   ' SET login_location = "'.$DATA['lat'].', '.$DATA['lon'].'", ' .
						   ' login_date = CURRENT_TIMESTAMP ' .
						   ' WHERE user_id = '.$user_id.'; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
							   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '406 Not Acceptable';
					}
					break;
					
				case 'cal_get':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$date = strtotime($DATA['date']);
					
					$date_str = date('Y-m-d', $date);
					
					$sql = ' SELECT * FROM 14RuVPJV6GmH_app_evt ' .
						   ' WHERE cancelled_flag = FALSE ' .
						   ' AND event = TRUE ' .
						   ' AND date BETWEEN "' . $date_str . ' 00:00:00" AND "' . $date_str . ' 23:59:59"; ';
					
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$report[$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$report[$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'evc_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					$car_in = ($DATA['cin'] == '' ? 'NULL' : addQuotes($DATA['cin']));
					$car_out = ($DATA['cout'] == '' ? 'NULL' : addQuotes($DATA['cout']));
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_evt ' .
						   ' SET car_in = '.$car_in.', ' .
						   ' car_out = '.$car_out.' ' .
						   ' WHERE primary_id = '.$pid.'; ';
					
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'evd_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					$luncheon_dinner = ($DATA['ld'] == '' ? 'NULL' : addQuotes($DATA['ld']));
					$time = ($DATA['time'] == '' ? 'NULL' : addQuotes($DATA['time']));
					$venue = ($DATA['venue'] == '' ? 'NULL' : addQuotes($DATA['venue']));
					$description = ($DATA['desc'] == '' ? 'NULL' : addQuotes($DATA['desc']));
					$price = ($DATA['price'] == '' ? 'NULL' : addQuotes($DATA['price']));
					$paid = ($DATA['paid'] ? 'TRUE' : 'FALSE');
					$band = ($DATA['band'] == '' ? 'NULL' : addQuotes($DATA['band']));
					$crew = ($DATA['crew'] == '' ? 'NULL' : addQuotes($DATA['crew']));
					$car_in = ($DATA['cin'] == '' ? 'NULL' : addQuotes($DATA['cin']));
					$car_out = ($DATA['cout'] == '' ? 'NULL' : addQuotes($DATA['cout']));
					$remarks = ($DATA['rmk'] == '' ? 'NULL' : addQuotes($DATA['rmk']));
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_evt ' .
						   ' SET luncheon_dinner = '.$luncheon_dinner.', ' .
						   ' time = '.$time.', ' .
						   ' venue = '.$venue.', ' .
						   ' description = '.$description.', ' .
						   ' price = '.$price.', ' .
						   ' paid = '.$paid.', ' .
						   ' band = '.$band.', ' .
						   ' crew = '.$crew.', ' .
						   ' car_in = '.$car_in.', ' .
						   ' car_out = '.$car_out.', ' .
						   ' remarks = '.$remarks.', ' .
						   ' locked = 0 ' .
						   ' WHERE primary_id = '.$pid.'; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'evd_dlt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_evt ' .
						   ' SET cancelled_flag = TRUE ' .
						   ' WHERE primary_id = '.$pid.'; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'evd_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$desc = ($DATA['desc'] == 'NULL' ? 'NULL' : ('"' . $DATA['desc'] . '"'));
					$ld = ($DATA['ld'] == 'NULL' ? '"Dinner"' : (($DATA['ld'] == 'L' || $DATA['ld'] == 'Lunch') ? '"Lunch"' : '"Dinner"'));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_evt ' .
						   ' (date, pic, description, luncheon_dinner) ' .
						   ' VALUES ( "' . date("Y-m-d", strtotime($DATA['date'])) . ' 00:00:00", "' . $DATA['pic'] . '", ' . $desc . ', ' . $ld . '); ';
						   
					if($result = $mysqli->query($sql)){
						$pid = $mysqli->insert_id;
						
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							$report[0]['band'] = '';
							$report[0]['cancelled_flag'] = '0';
							$report[0]['car_in'] = '';
							$report[0]['car_out'] = '';
							$report[0]['crew'] = '';
							$report[0]['date'] = date("Y-m-d", strtotime($DATA['date'])) . ' 00:00:00';
							$report[0]['description'] = $DATA['desc'];
							$report[0]['luncheon_dinner'] = $DATA['ld'];
							$report[0]['pic'] = $DATA['pic'];
							$report[0]['price'] = '600';
							$report[0]['primary_id'] = $pid;
							$report[0]['remarks'] = '';
							$report[0]['venue'] = '';
							$report['reply'] = '200 OK';
							
							echo json_encode($report);
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'lrq_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					$reason = ($DATA['reason'] == '' ? 'NULL' : addQuotes($DATA['reason']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_clk ' .
						   ' (user_id, clock_action, clock_in_out, clock_location) ' .
						   ' VALUES ( ' . $user_id . ', "LRQ", "' . date("Y-m-d", strtotime($DATA['date'])) . ' 00:00:00", ' . $reason . '); ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
							   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '406 Not Acceptable';
						}
					}else{
						echo '406 Not Acceptable';
					}
					break;
				
				case 'lrq_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					
					$sql = ' SELECT clock_in_out, clock_location, status FROM 14RuVPJV6GmH_app_clk ' .
						   ' WHERE user_id = ' . $user_id . ' ' .
						   ' AND clock_action = "LRQ" ' .
						   ' AND clock_in_out >= "' . date('Y-m-d') . ' 00:00:00" ' .
						   ' ORDER BY `clock_in_out` ASC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$leave[$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$leave[$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['leave'] = $leave;
								$report['reply'] = '200 OK';
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'lrq_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					$status = addQuotes($DATA['status']);
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_clk ' .
						   ' SET status = '.$status.' ' .
						   ' WHERE primary_id = '.$pid.'; ';
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'alr_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' SELECT primary_id, user_id, clock_in_out, clock_location, status FROM 14RuVPJV6GmH_app_clk ' .
						   ' WHERE clock_action = "LRQ" ' .
						   ' AND clock_in_out >= "' . date('Y-m-d') . ' 00:00:00" ' .
						   ' ORDER BY `clock_in_out` ASC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$leave[$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$leave[$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['leave'] = $leave;
								$report['reply'] = '200 OK';
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'whs_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					
					$sql = ' SELECT clock_action, clock_in_out, clock_location, status FROM 14RuVPJV6GmH_app_clk ' .
						   ' WHERE user_id = ' . $user_id . ' ' .
						   ' AND ( clock_action = "IN" OR clock_action = "OUT" ) ' .
						   ' AND clock_in_out >= "' . date('Y-m-d', strtotime("-6 week")) . ' 00:00:00" ' .
						   ' ORDER BY `clock_in_out` DESC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$work[$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$work[$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['work'] = $work;
								$report['reply'] = '200 OK';
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'rpt_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$date_from = $DATA['from'];
					$date_to = $DATA['to'];
					
					$sql = ' SELECT primary_id, venue, date, price, paid, pic, remarks FROM 14RuVPJV6GmH_app_evt ' .
						   ' WHERE cancelled_flag = FALSE ' .
						   ' AND event = TRUE ' .
						   ' AND date BETWEEN "' . $date_from . ' 00:00:00" AND "' . $date_to . ' 23:59:59" ' .
						   ' ORDER BY date ASC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$report['sales'][$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$report['sales'][$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['reply'] = '200 OK';
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							$report['reply'] = '204 No Response';
							echo json_encode($report);
						}
					}else{
						echo '400 Bad Request';
					}	   
					break;
					
				case 'tsk_chk':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' SELECT primary_id, date, time, venue, description, crew FROM 14RuVPJV6GmH_app_evt ' .
						   ' WHERE cancelled_flag = FALSE ' .
						   ' AND event = FALSE ' .
						   ' AND date >= "' . date('Y-m-d') . ' 00:00:00" ' .
						   ' ORDER BY `date` ASC, `time` ASC; ';
						   
					if($result = $mysqli->query($sql)){
						if($row = $result->fetch_array(MYSQLI_ASSOC)){
							$i = 0;
							$report['task'][$i] = $row;
							$i++;
							
							while($row = $result->fetch_array(MYSQLI_ASSOC)){
								$report['task'][$i] = $row;
								$i++;
							}
							
							$result->close();
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								$report['reply'] = '200 OK';
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
							}
						}else{
							echo '204 No Response';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'tsk_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$time = ($DATA['time'] == '' ? 'NULL' : addQuotes($DATA['time']));
					$venue = ($DATA['venue'] == '' ? 'NULL' : addQuotes($DATA['venue']));
					$description = ($DATA['desc'] == '' ? 'NULL' : addQuotes($DATA['desc']));
					$crew = ($DATA['crew'] == '' ? 'NULL' : addQuotes($DATA['crew']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_evt ' .
						   ' (date, time, venue, description, crew, event) ' .
						   ' VALUES ( "' . date("Y-m-d", strtotime($DATA['date'])) . ' 00:00:00", ' . $time . ', ' . $venue . ', ' . $description . ', ' . $crew . ', FALSE ); ';
						   
					if($result = $mysqli->query($sql)){
						$pid = $mysqli->insert_id;
						
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							$report['reply'] = '200 OK';
							$report['pid'] = $pid;
							
							echo json_encode($report);
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'tsk_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					$time = ($DATA['time'] == '' ? 'NULL' : addQuotes($DATA['time']));
					$venue = ($DATA['venue'] == '' ? 'NULL' : addQuotes($DATA['venue']));
					$description = ($DATA['desc'] == '' ? 'NULL' : addQuotes($DATA['desc']));
					$crew = ($DATA['crew'] == '' ? 'NULL' : addQuotes($DATA['crew']));
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_evt ' .
						   ' SET date = "' . date("Y-m-d", strtotime($DATA['date'])) . ' 00:00:00", ' .
						   ' time = ' . $time . ', ' .
						   ' venue = ' . $venue . ', ' .
						   ' description = ' . $description . ', ' .
						   ' crew = ' . $crew . ' ' .
						   ' WHERE primary_id = '.$pid.'; ';
					   
					if($result = $mysqli->query($sql)){
						
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							$report['reply'] = '200 OK';
							
							echo json_encode($report);
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					
					break;
					
				case 'crw_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$tuid = addQuotes(strtolower($DATA['uid']));
					$dname = addQuotes($DATA['dnm']);
					$sname = addQuotes($DATA['snm']);
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_usr ' .
						   ' (user_id, user_level, nc_name, short_name) ' .
						   ' VALUES ( '.$tuid.', 1, '.$dname.', '.$sname.' ); ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'crw_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$tuid = addQuotes(strtolower($DATA['uid']));
					$sname = addQuotes($DATA['snm']);
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
						   ' SET short_name = '.$sname.' ' .
						   ' WHERE user_id = '.$tuid.'; ';
					
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'loc_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$name = addQuotes($DATA['name']);
					$category = addQuotes($DATA['category']);
					$state = addQuotes($DATA['state']);
					$point = addQuotes($DATA['point']);
					$range = addQuotes($DATA['range']);
					$lobby = addQuotes($DATA['lobby']);
					$loading = addQuotes($DATA['loading']);
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_loc ' .
						   ' (loc_name, loc_category, loc_state, loc_point, loc_range, point_lobby, point_loading) ' .
						   ' VALUES ( '.$name.', '.$category.', '.$state.', '.$point.', '.$range.', '.$lobby.', '.$loading.' ); ';
						   
					if($result = $mysqli->query($sql)){
						$report['pid'] = $mysqli->insert_id;
						
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							$report['reply'] = '200 OK';
							
							echo json_encode($report);
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'loc_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$pid = addQuotes($DATA['pid']);
					$name = addQuotes($DATA['name']);
					$category = addQuotes($DATA['category']);
					$state = addQuotes($DATA['state']);
					$point = addQuotes($DATA['point']);
					$range = addQuotes($DATA['range']);
					$lobby = addQuotes($DATA['lobby']);
					$loading = addQuotes($DATA['loading']);
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_loc ' .
						   ' SET loc_name = '.$name.', ' .
						   ' loc_category = '.$category.', ' .
						   ' loc_state = '.$state.', ' .
						   ' loc_point = '.$point.', ' .
						   ' loc_range = '.$range.', ' .
						   ' point_lobby = '.$lobby.', ' .
						   ' point_loading = '.$loading.' ' .
						   ' WHERE primary_id = '.$pid.'; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'pic_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$tuid = addQuotes(strtolower($DATA['uid']));
					$dname = addQuotes($DATA['dnm']);
					$con = addQuotes($DATA['con']);
					$comp = addQuotes($DATA['comp']);
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_usr ' .
						   ' (user_id, user_level, nc_name, nc_contact, nc_pos1) ' .
						   ' VALUES ( '.$tuid.', 0, '.$dname.', '.$con.', '.$comp.' ); ';
					
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'pic_udt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$tuid = addQuotes(strtolower($DATA['uid']));
					$con = addQuotes($DATA['con']);
					$comp = addQuotes($DATA['comp']);
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
						   ' SET nc_contact = '.$con.', ' .
						   ' nc_pos1 = '.$comp.' ' .
						   ' WHERE user_id = '.$tuid.'; ';
					
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'rst_btg':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_inv ' .
						   ' SET point = ' . addQuotes($DATA['point']) . ' ' .
						   ' WHERE primary_id = "' . $DATA['pid'] . '"; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'clr_dt':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_evt ' .
						   ' SET locked = 0 ' .
						   ' WHERE event = TRUE; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'chg_prf':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					$name = addQuotes($DATA['name']);
					$tel = addQuotes($DATA['tel']);
					$email = addQuotes($DATA['email']);
					
					$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
						   ' SET nc_name = '.$name.', ' .
						   ' nc_contact = '.$tel.', ' .
						   ' nc_email = '.$email.' ' .
						   ' WHERE user_id = '.$user_id.'; ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
							   ' (act, user_id, data) ' .
							   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
						   
						if($result = $mysqli->query($sql)){
							echo '200 OK';
						}else{
							echo '500 Internal Server Error';
						}
					}else{
						echo '400 Bad Request';
					}
					break;
					
				case 'rst_pwd':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					$user_password = addQuotes($DATA['old']);
					$new_password = addQuotes($DATA['new']);
					
					$sql = ' SELECT * FROM 14RuVPJV6GmH_app_usr ' .
						   ' WHERE user_id = '.$user_id.' ' .
						   ' AND user_password = '.$user_password.'; ';
						   
					if($result = $mysqli->query($sql)){
						if($result->num_rows==1){
							$row = $result->fetch_array(MYSQLI_ASSOC);
							$result->close();
							
							$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
								   ' SET user_password = '.$new_password.' ' .
								   ' WHERE user_id = '.$user_id.'; ';
								   
							if($result = $mysqli->query($sql)){
								$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
									   ' (act, user_id, data) ' .
									   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
								if($result = $mysqli->query($sql)){
									echo '200 OK';
								}else{
									echo '500 Internal Server Error';
								}
							}else{
								echo '400 Bad Request';
							}
						}else{
							echo '406 Not Acceptable';
						}
					}else{
						echo '400 Bad Request';
					}
					
					break;
					
				case 'log_out':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
						   ' (act, user_id, data) ' .
						   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
					   
					if($result = $mysqli->query($sql)){
						echo '200 OK';
					}else{
						echo '500 Internal Server Error';
					}
					
					break;
				default:
					echo '400 Bad Request';
					break;
			}
		}
	}else{
		if(stristr($_SERVER['HTTP_USER_AGENT'],'iPhone') || stristr($_SERVER['HTTP_USER_AGENT'],'iPad') || stristr($_SERVER['HTTP_USER_AGENT'],'Windows NT 10.0')){ 
?>

<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8" />
	<meta name="format-detection" content="telephone=no" />
	<meta name="msapplication-tap-highlight" content="no" />
	<meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width" />
	<title>WKV</title>
	<link rel="icon" href="icon.png">
	<meta name="apple-mobile-web-app-title" content="WKV" />
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black" />
	<link rel="apple-touch-icon" href="icon.png">
	<link rel="apple-touch-icon" sizes="76x76" href="icon.png">
	<link rel="apple-touch-icon" sizes="120x120" href="icon.png">
	<link rel="apple-touch-icon" sizes="152x152" href="icon.png">
	<link rel="stylesheet" href="framework7/css/framework7.min.css">
	<link rel="stylesheet" href="css/icons.css">
	<link rel="stylesheet" href="css/app.css">
</head>
<body class="color-theme-gray">
	<div id="loading-overlay">
		<div id="particles-background" class="vertical-centered-box"></div>
		<div id="particles-foreground" class="vertical-centered-box"></div>
		<div class="vertical-centered-box">
			<div class="content">
				<div class="loader-circle"></div>
				<div class="loader-line-mask">
					<div class="loader-line"></div>
				</div>
				<svg
	   xmlns:dc="http://purl.org/dc/elements/1.1/"
	   xmlns:cc="http://creativecommons.org/ns#"
	   xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
	   xmlns:svg="http://www.w3.org/2000/svg"
	   xmlns="http://www.w3.org/2000/svg"
	   viewBox="0 0 575 290"
	   height="60"
	   width="100"
	   xml:space="preserve"
	   id="svg2"
	   version="1.1"><metadata
		 id="metadata8"><rdf:RDF><cc:Work
			 rdf:about=""><dc:format>image/svg+xml</dc:format><dc:type
			   rdf:resource="http://purl.org/dc/dcmitype/StillImage" /></cc:Work></rdf:RDF></metadata><defs
		 id="defs6"><clipPath
		   id="clipPath18"
		   clipPathUnits="userSpaceOnUse"><path
			 id="path16"
			 d="M 0,425.2 H 935.43 V 0 H 0 Z" /></clipPath></defs><g
		 transform="matrix(1.3333333,0,0,-1.3333333,0,566.93333)"
		 id="g10"><g
		   id="g12"><g
			 clip-path="url(#clipPath18)"
			 id="g14"><g
			   transform="translate(158.2725,375.2441)"
			   id="g20"><path
				 id="path22"
				 style="fill:#ffffff;fill-opacity:0.5;fill-rule:nonzero;stroke:none"
				 d="m 0,0 h 3.859 v -0.311 c 0,-0.309 -2.745,-3.357 -8.266,-9.127 H -4.696 C -4.696,-5.691 -3.133,-2.547 0,0 M 14.368,0 H 25.713 V -0.311 C 16.955,-10.236 4.798,-23.626 -10.771,-40.454 h -0.282 c 2.034,11.967 3.581,17.942 4.696,17.942 z m 10.234,-5.174 h 0.284 v -0.304 l -36.764,-143.502 -0.558,-0.316 h -26.532 c -0.461,0 -1.935,7.606 -4.434,22.82 -0.17,0.081 -2.569,13.058 -7.176,38.898 l 17.974,19.475 c 0.44,0 2.843,-12.571 7.176,-37.717 0.088,-2.419 0.372,-3.644 0.841,-3.644 0,3.551 3.864,23.812 11.594,60.797 0,2.13 2.035,5.098 6.098,8.824 8.192,9.223 18.683,20.775 31.497,34.669 M -35.09,-54.437 h 0.273 c 1.096,-6.267 1.756,-9.626 1.932,-10.021 0,-0.618 -5.983,-7.297 -17.977,-20.075 -0.442,0 -1.195,3.555 -2.195,10.639 z m -2.501,13.075 h 0.282 c 0.364,-2.023 0.545,-3.342 0.545,-3.948 l -17.688,-19.148 h -0.54 c 0,0.806 -0.185,2.023 -0.552,3.639 z M -45.607,0 c 0.565,0 2.67,-10.643 6.368,-31.926 l -17.693,-19.16 h -0.55 l -2.773,18.841 h -0.287 c 0,-2.943 -1.466,-12.247 -4.41,-27.961 L -90.38,-87.869 h -0.267 c 9.568,55.832 14.732,85.107 15.478,87.869 z m -22.378,-74.802 h 0.273 c 0,-4.059 -1.945,-7.607 -5.804,-10.644 -3.688,-4.347 -10.315,-11.653 -19.909,-21.885 h -0.267 v 0.289 c 0,3.659 1.1,6.197 3.312,7.619 6.732,7.592 14.191,15.805 22.395,24.621 m -7.184,-40.136 v -0.604 c -3.873,-22.297 -5.986,-33.537 -6.361,-33.754 h -24.6 v 0.316 c 10.325,11.546 20.642,22.9 30.961,34.042 m 3.598,20.374 h 0.259 c -1.731,-11.75 -3.202,-17.635 -4.42,-17.635 l -32.335,-35.266 c -0.463,0 -1.381,3.354 -2.75,10.031 25.523,27.862 38.591,42.164 39.246,42.87 m -23.782,-10.339 h 0.28 c 0.351,-2.015 0.567,-3.336 0.567,-3.952 l -18.523,-20.073 c -0.561,1.323 -0.847,2.452 -0.847,3.353 v 0.309 c 5.53,6.268 11.708,13.067 18.523,20.363 M -145.658,0 h 29.298 c 0.563,0 1.827,-5.792 3.864,-17.349 9.594,-46.104 14.836,-72.04 15.77,-77.823 l -19.354,-20.976 h -0.555 c 0,0.51 -9.862,39.132 -29.582,115.837 z" /></g><g
			   transform="translate(260.7407,289.5068)"
			   id="g24"><path
				 id="path26"
				 style="fill:#ffffff;fill-opacity:0.5;fill-rule:nonzero;stroke:none"
				 d="m 0,0 c 1.943,-2.343 16.025,-23.417 42.28,-63.237 v -0.322 H 5.816 c -0.561,0.507 -9.324,14.099 -26.26,40.748 v 0.309 C -14.466,-15.7 -7.656,-8.225 0,0 m -6.062,9.414 c 0.161,-0.101 1.74,-2.433 4.689,-7.006 V 2.12 c -6.001,-6.9 -12.826,-14.386 -20.46,-22.503 -3.125,4.347 -4.697,6.89 -4.697,7.605 z m -6.37,9.114 h 0.277 c 1.1,-1.107 1.662,-2.022 1.662,-2.722 L -30.676,-6.093 h -0.277 c -1.12,1.123 -1.652,2.037 -1.652,2.739 z m -64.676,66.899 h 27.353 c 0.365,-0.106 0.559,-0.31 0.559,-0.612 V 25.228 C -15.107,65.062 2.121,85.117 2.493,85.427 h 35.375 v -0.31 l -87.9,-96.981 c 0.277,0 0.568,-0.309 0.836,-0.914 v -50.155 c 0,-0.409 -0.194,-0.626 -0.559,-0.626 h -27.353 c -0.373,0 -0.55,0.217 -0.55,0.626 V 84.815 c 0.083,0.411 0.269,0.612 0.55,0.612" /></g><g
			   transform="translate(415.9189,375.2441)"
			   id="g28"><path
				 id="path30"
				 style="fill:#ffffff;fill-opacity:0.5;fill-rule:nonzero;stroke:none"
				 d="m 0,0 0.559,-0.311 c -7.916,-25.962 -12.156,-39.318 -12.704,-40.143 l -38.15,-41.644 v 0.309 c 1.487,6.383 8.571,33.647 21.276,81.789 z m -17.413,-57.469 h 0.29 c -0.93,-4.966 -3.127,-8.819 -6.65,-11.569 -10.752,-12.137 -21.551,-24.016 -32.307,-35.556 h -0.284 c 0.645,4.161 2.118,7.302 4.411,9.422 z m -15.182,-48.946 h 0.275 c -8.479,-28.274 -13.004,-42.565 -13.537,-42.881 h -25.438 v 0.316 c 9.395,10.542 22.303,24.709 38.7,42.565 m 7.734,24.931 h 0.273 c -3.767,-13.178 -6.078,-19.958 -6.926,-20.372 l -41.434,-45.309 c -0.474,0 -1.488,3.245 -3.06,9.731 z m -35.942,-23.723 h 0.287 c 0.368,-1.711 0.538,-2.723 0.538,-3.032 v -0.616 c -5.513,-6.385 -11.689,-13.166 -18.506,-20.366 -0.727,1.216 -1.098,2.235 -1.098,3.037 v 0.31 c 6.914,7.807 13.168,14.685 18.779,20.667 M -117.73,0 h 29.568 c 0.652,0 2.586,-6.996 5.826,-20.994 11.23,-42.955 17.674,-68.098 19.338,-75.394 l -19.084,-20.667 h -0.537 c -2.578,8.816 -14.466,47.729 -35.663,116.744 z" /></g></g></g></g>
				</svg>
			</div>
		</div>
	</div>
	<div id="app">
		<div class="statusbar"></div>
		<div class="login-screen" id="lgn">
			<div class="view">
				<div class="page">
					<div class="page-content login-screen-content">
						<div class="login-screen-title">WKV</div>
						<div class="list">
							<ul>
								<li class="item-content item-input">
									<div class="item-media" style="padding-bottom:13px;">
										<i class="icon material-icons md-only">assignment_ind</i>
									</div>
									<div class="item-inner">
										<div class="item-title item-label">Username</div>
										<div class="item-input-wrap">
											<input type="text" name="lgn_usr" autocomplete="off">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-media" style="padding-bottom:13px;">
										<i class="icon material-icons md-only">lock</i>
									</div>
									<div class="item-inner">
										<div class="item-title item-label">Password</div>
										<div class="item-input-wrap">
											<input type="password" name="lgn_pwd" autocomplete="off">
										</div>
									</div>
								</li>
							</ul>
						</div>
						<div class="list inset" style="padding:30px 10px;">
							<ul>
								<li>
									<a id="lgn_sgn" class="button button-fill button-raised">Login</a>
									<div style="display:none;">
										<audio src="https://app.wkventertainment.com/files/music/silent.m4a" controls="true" loop="true"></audio>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="login-screen" id="error">
			<div class="view">
				<div class="page">
					<div class="page-content login-screen-content">
						<div class="toolbar">
							<div class="toolbar-inner">
								<div class="left">Error</div>
							</div>
						</div>
						<div class="block">
							<div class="list">
								<div class="item-content item-input">
									<div class="item-inner">
										<i class="icon material-icons md-only">priority_high</i> No internet connection.
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="login-screen" id="update">
			<div class="view">
				<div class="page">
					<div class="page-content login-screen-content">
						<div class="toolbar">
							<div class="toolbar-inner">
								<div class="left">Update required.</div>
							</div>
						</div>
						<div class="block">
							<div class="list">
								<div class="item-content item-input">
									<div class="item-inner" style="text-align:center;">
										New version available.<br/><br/>
										<a class="button button-fill button-raised"><i class="icon material-icons md-only">android</i></a>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
		<div class="views">
			<div class="view view-main">
				<div class="toolbar tabbar-labels toolbar-bottom-md">
					<div class="toolbar-inner">
						<a id="home-btn" href="#pg-home" class="tab-link tab-link-active">
							<i class="icon material-icons md-only">important_devices</i>
							<span class="tabbar-label">Home</span>
						</a>
						<a id="admin-btn" href="#pg-admin" class="tab-link level8">
							<i class="icon material-icons md-only">security</i>
							<span class="tabbar-label">Super</span>
						</a>
						<a id="schedule-btn" href="#pg-schedule" class="tab-link">
							<i class="icon material-icons md-only">today</i>
							<span class="tabbar-label">Schedule</span>
						</a>
						<a href="#pg-tools" class="tab-link">
							<i class="icon material-icons md-only">work</i>
							<span class="tabbar-label">Tools</span>
						</a>
						<a href="#pg-settings" class="tab-link">
							<i class="icon material-icons md-only">settings</i>
							<span class="tabbar-label">Settings</span>
						</a>
					</div>
				</div>
				<div class="tabs-animated-wrap">
					<div class="tabs">
						<div id="pg-home" class="tab tab-active page-content">
							<div class="block">
								<div class="item-content" align="center">
									<div class="workClock elevation-hover-7 elevation-5 elevation-pressed-2">
										<span class="h1">0</span><span class="h2">0</span> :
										<span class="m1">0</span><span class="m2">0</span> :
										<span class="s1">0</span><span class="s2">0</span>
									</div>
								</div>
								<div class="list">
									<ul>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">alarm</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-clock">Clock In / Out</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
								<div id="lrq_rl"></div>
								<div id="task_tl" class="timeline"></div>
							</div>
						</div>
						<div id="pg-admin" class="tab page-content level8">
							<div class="block">
								<div class="block-title">Administrator</div>
								<div class="list">
									<ul>
										<li class="level19">
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">healing</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="amtl-btn" class="link popup-open" href="#" data-popup=".popup-amtl">Administrator Tools</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">loyalty</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="cntd-btn" class="link popup-open" href="#" data-popup=".popup-cntd">Crew & Vehicle Details</a>
													</div>
												</div>
											</div>
										</li>
										<!-- <li> -->
											<!-- <div class="item-content"> -->
												<!-- <div class="item-media"> -->
													<!-- <i class="icon material-icons md-only">move_to_inbox</i> -->
												<!-- </div> -->
												<!-- <div class="item-inner"> -->
													<!-- <div class="item-title"> -->
														<!-- <a id="ivtk-btn" class="link popup-open" href="#" data-popup=".popup-ivtk">Inventory Tracker</a> -->
													<!-- </div> -->
												<!-- </div> -->
											<!-- </div> -->
										<!-- </li> -->
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">golf_course</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="tskl-btn" class="link popup-open" href="#" data-popup=".popup-tskl">Task List</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">favorite_border</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="status-btn" class="link popup-open" href="#" data-popup=".popup-ustatus">User Status</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div id="pg-schedule" class="tab page-content">
							<div class="block">
								<div class="block-title">Event Schedule</div>
								<div class="block block-strong no-padding">
									<div id="wkv-calendar"></div>
								</div>
								<div class="popover details-popover">
									<div class="popover-inner">
										<div class="list">
											<ul></ul>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div id="pg-tools" class="tab page-content">
							<div class="block">
								<div class="block-title">Tools</div>
								<div class="list">
									<ul>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">flash_on</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-power">3 Phase Information</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">radio</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-audiop">Audio Player</a>
													</div>
												</div>
											</div>
										</li>
										<!-- <li> -->
											<!-- <div class="item-content"> -->
												<!-- <div class="item-media"> -->
													<!-- <i class="icon material-icons md-only">help</i> -->
												<!-- </div> -->
												<!-- <div class="item-inner"> -->
													<!-- <div class="item-title"> -->
														<!-- <a class="link popup-open" href="#" data-popup=".popup-faq">F . A . Q .</a> -->
													<!-- </div> -->
												<!-- </div> -->
											<!-- </div> -->
										<!-- </li> -->
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">center_focus_strong</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="itid-btn" class="link popup-open" href="#">Item Identification</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">info</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="itml-btn" class="link popup-open" href="#" data-popup=".popup-itml">Item List</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">wb_incandescent</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-light">Lighting Address Calculator</a>
													</div>
												</div>
											</div>
										</li>
										<li class="level3">
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">playlist_add_check</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-packl">Packing List</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">border_inner</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-stage">Stage Calculator</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">sync</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-convr">Unit Converter</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
						<div id="pg-settings" class="tab page-content">
							<div class="block">
								<div class="block-title">Profile</div>
								<div class="list">
									<ul>
										<li class="level2">
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">contacts</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-stnc">My Namecard</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">person_pin</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-step">Edit Profile</a>
													</div>
												</div>
											</div>
										</li>
										<li class="level3">
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">event_available</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="lvapv-btn" class="link popup-open" href="#" data-popup=".popup-stla">Leave Approval</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">history</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="wkhs-btn" class="link popup-open" href="#" data-popup=".popup-stht">Work History</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">vpn_key</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a id="btn-stlo" class="link popup-open" href="#">Logout</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
								<div class="block-title">Security</div>
								<div class="list">
									<ul>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">lock_open</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-strp">Reset Password</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
								<div class="block-title">About</div>
								<div class="list">
									<ul>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">developer_mode</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-staa">About this Apps</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">security</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-stpp">Privacy Policy</a>
													</div>
												</div>
											</div>
										</li>
										<li>
											<div class="item-content">
												<div class="item-media">
													<i class="icon material-icons md-only">description</i>
												</div>
												<div class="item-inner">
													<div class="item-title">
														<a class="link popup-open" href="#" data-popup=".popup-sttm">Terms of Use</a>
													</div>
												</div>
											</div>
										</li>
									</ul>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-clock">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Clock In / Out</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<span class="map-locater">&#215;</span>
										<iframe
											id="gmap"
											width="100%"
											height="300"
											frameborder="0"
											style="border:0;"
											data-loc="0,0"
											src="https://www.google.com/maps/embed/v1/view?key=AIzaSyCRKiFjg2CA78cD09yIXuHFCxADjOh75rg&center=3.8995251,102.2320596&zoom=6">
										</iframe>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<a id="loc_refresh" class="button button-raised">Refresh</a>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner" style="text-align:center;">
										<h2 id='app-time'>1970-01-01 00:00:00</h2>
									</div>
								</div>
							</li>
							<li>
								<div class="row">
									<button class="col button button-fill clock-in disabled" >
										<i class="icon material-icons md-only">alarm_on</i> IN
									</button>
									<button class="col button button-fill clock-out disabled">
										<i class="icon material-icons md-only">alarm_off</i> OUT
									</button>
								</div>
							</li>
						<ul>
					</div>
				</div>
			</div>
			<div class="popup popup-amtl level9">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Administrator Tools</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="item-content">
						<div class="list">
							<ul>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">format_shapes</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="abctg-btn" class="link" href="#">Add Barcode Tags</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">delete_sweep</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="clrdl-btn" class="link" href="#">Clear Details Lock</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">recent_actors</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="crewl-btn" class="link popup-open" href="#" data-popup=".popup-crewl">Crew List</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">transfer_within_a_station</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="alrl-btn" class="link popup-open" href="#" data-popup=".popup-alrl">Leave Request List</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">place</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="locl-btn" class="link popup-open" href="#" data-popup=".popup-locl">Location List</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">face</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="picl-btn" class="link popup-open" href="#" data-popup=".popup-picl">Person In Charge List</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">assessment</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="rprt-btn" class="link popup-open" href="#" data-popup=".popup-rprt">Sales Reports</a>
											</div>
										</div>
									</div>
								</li>
								<li>
									<div class="item-content">
										<div class="item-media">
											<i class="icon material-icons md-only">date_range</i>
										</div>
										<div class="item-inner">
											<div class="item-title">
												<a id="rwht-btn" class="link popup-open" href="#" data-popup=".popup-rwht">Work History</a>
											</div>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-cntd level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Crew & Vehicle Details</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="block">
					<div class="item-content">
						<div class="list">
							<ul>
								<li class="searchbar-ignore">
									<label class="item-content">
										<div class="item-inner">
											<div class="item-title">Crew List</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Yong Sze Wei" data-ic="880511-05-5221">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">SW</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Yong Sze Yao" data-ic="920113-10-5303">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Steven</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Ng Pui San" data-ic="970624-43-5158">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">PS</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Foong Yin Xin" data-ic="970106-14-2076">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">YX</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Ng Gun Yin" data-ic="990105-10-7097">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">GX</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Chua Eng Huei" data-ic="021223-14-0215">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Hui Zai</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Aiman Azrie bin Ahmad Faharuddin" data-ic="980205-08-6175">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Aiman</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Ng Yoke Kei" data-ic="000617-10-0678">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Yu Qi</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Lee Yi Ling" data-ic="000625-10-0264">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Yi Ling</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Ng Hon Yao" data-ic="020327-10-1259">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Han Yao</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Ng Pui Yee" data-ic="000628-10-1684">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Xiao Yu</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Khong Jian Ann" data-ic="990301-14-6907">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Jian Ann</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Low Jing Heng" data-ic="990520-14-5955">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Jin Heng</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Nabil Tariq Nazwan bin Ahmad Rashid" data-ic="010913-14-0497">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Nabil</div>
										</div>
									</label>
								</li>
							</ul>
						</div>
						<div class="list">
							<ul>
								<li class="searchbar-ignore">
									<label class="item-content">
										<div class="item-inner">
											<div class="item-title">Vehicle List</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Perodua Kancil" data-ic="BFD 4164">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Kancil</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Perodua Kembara" data-ic="WHA 1688">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Kembara</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Perodua Myvi" data-ic="NBX 8074">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Myvi</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Honda City" data-ic="NBP 3793">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">City</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Hyundai Elantra" data-ic="WYX 1276">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Elantra</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Mazda 2" data-ic="VBY 1276">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Mazda</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Toyota Avanza" data-ic="WB 9048 C">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Avanza</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Toyota Avanza" data-ic="WQA 2417">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">YX Avanza</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Isuzu Dmax" data-ic="WC 6721 T">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Dmax</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Lorry (Inokom)" data-ic="WRG 3155">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">Old Lorry</div>
										</div>
									</label>
								</li>
								<li>
									<label class="item-checkbox item-content">
										<input type="checkbox" name="cnv-checkbox" data-fn="Lorry (Hino)" data-ic="WXB 5356">
										<i class="icon icon-checkbox"></i>
										<div class="item-inner">
											<div class="item-title">New Lorry</div>
										</div>
									</label>
								</li>
							</ul>
						</div>
					</div>
				</div>
				<div class="fab fab-right-bottom">
					<a href="#" class="cnv-share">
						<i class="icon material-icons md-only">share</i>
					</a>
				</div>
			</div>
			<div class="popup popup-ustatus level9">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">User Status</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="item-content">
						<div class="list">
							<ul id="user-status"></ul>
						</div>
					</div>
				</div>
			</div>
			<div class="panel panel-right panel-cover level8">
				<div class="panel-status content-block">
					<div class="toolbar">
						<div class="toolbar-inner">
							<div class="left status-name"></div>
							<div class="right"><a class="link panel-close" href="#">Close</a></div>
						</div>
					</div>
					<div class="block">
						<div class="item-content">
							<div class="list">
								<ul></ul>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="panel panel-left panel-cover level8">
				<div class="content-block panel-evt-rmk">
					<div class="toolbar">
						<div class="toolbar-inner">
							<div class="left">Remarks</div>
							<div class="right"><a class="link panel-close" href="#">Close</a></div>
						</div>
					</div>
					<div class="block list">
						<textarea></textarea>
					</div>
				</div>
				<div class="content-block panel-evt-crew">
					<div class="toolbar">
						<div class="toolbar-inner">
							<div class="left">Crew List</div>
							<div class="right"><a class="link panel-close" href="#">Close</a></div>
						</div>
					</div>
					<div class="block">
						<form class="searchbar">
							<div class="searchbar-inner">
								<div class="searchbar-input-wrap">
									<input type="search" placeholder="Search">
									<i class="searchbar-icon"></i>
									<span class="input-clear-button"></span>
								</div>
								<span class="searchbar-disable-button if-not-aurora">Cancel</span>
							</div>
						</form>
					</div>
					<div class="block">
						<div class="list evt-crew">
							<ul></ul>
						</div>
					</div>
				</div>
				<div class="content-block panel-evt-car">
					<div class="toolbar">
						<div class="toolbar-inner">
							<div class="left">Vehicle List</div>
							<div class="right"><a class="link panel-close" href="#">Close</a></div>
						</div>
					</div>
					<div class="block">
						<form class="searchbar">
							<div class="searchbar-inner">
								<div class="searchbar-input-wrap">
									<input type="search" placeholder="Search">
									<i class="searchbar-icon"></i>
									<span class="input-clear-button"></span>
								</div>
								<span class="searchbar-disable-button if-not-aurora">Cancel</span>
							</div>
						</form>
					</div>
					<div class="block">
						<div class="list evt-car">
							<ul></ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-crewl level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Crew List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<button class="button button-raised button-fill crewl_add" style="margin: 10px auto -20px;width: calc(100% - 30px);">
					<i class="icon material-icons md-only">add</i>
				</button>
				<div class="list crew_list">
					<ul></ul>
				</div>
				<div class="popover crewld-popover">
					<div class="popover-inner">
						<div class="list">
							<ul>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Display Name</div>
										<div class="item-input-wrap">
											<input id="crewld_dname" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Short Name</div>
										<div class="item-input-wrap">
											<input id="crewld_sname" type="text" value="" autocomplete="off" required validate>
											<span class="input-clear-button"></span>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="row">
											<button class="col button button-fill crewld_ok">OK</button>
											<button class="col button button-fill popover-close">Cancel</button>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-locl level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Location List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="searchbar-backdrop"></div>
				<div class="block searchbar-hide-on-search">
					<button class="button button-raised button-fill locl_add" style="margin: 10px auto -20px;width: calc(100% - 30px);">
						<i class="icon material-icons md-only">add</i>
					</button>
				</div>
				<div class="searchbar-found list loc_list">
					<ul></ul>
				</div>
				<div class="popover locld-popover">
					<div class="popover-inner">
						<div class="list">
							<div>
								<span class="lpoint lpoint_tl">&#215;</span>
								<span class="lpoint lpoint_tr">&#215;</span>
								<span class="lpoint lpoint_bl">&#215;</span>
								<span class="lpoint lpoint_br">&#215;</span>
								<div class="lmap"></div>
							</div>
							<ul>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Name</div>
										<div class="item-input-wrap">
											<input id="locld_name" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Category</div>
										<div class="item-input-wrap">
											<input id="locld_cat" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Area</div>
										<div class="item-input-wrap">
											<input id="locld_state" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Point (Latitude, Longitude)</div>
										<div class="item-input-wrap">
											<input id="locld_point" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Range (Metre)</div>
										<div class="item-input-wrap">
											<input id="locld_range" type="number" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Main Lobby (Latitude, Longitude)</div>
										<div class="item-input-wrap">
											<input id="locld_lobby" type="text" value="" autocomplete="off">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Loading Bay (Latitude, Longitude)</div>
										<div class="item-input-wrap">
											<input id="locld_loading" type="text" value="" autocomplete="off">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="row">
											<button class="col button button-fill locld_ok">OK</button>
											<button class="col button button-fill popover-close">Cancel</button>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-picl level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Person In Charge List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="searchbar-backdrop"></div>
				<div class="block searchbar-hide-on-search">
					<button class="button button-raised button-fill picl_add" style="margin: 10px auto -20px;width: calc(100% - 30px);">
						<i class="icon material-icons md-only">add</i>
					</button>
				</div>
				<div class="searchbar-found list pic_list">
					<ul></ul>
				</div>
				<div class="popover picl-popover">
					<div class="popover-inner">
						<div class="list">
							<ul>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Display Name</div>
										<div class="item-input-wrap">
											<input id="picl_dname" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Company</div>
										<div class="item-input-wrap">
											<input id="picl_comp" type="text" value="" autocomplete="off">
											<span class="input-clear-button"></span>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Contact Number</div>
										<div class="item-input-wrap">
											<input id="picl_con" type="tel" value="" autocomplete="off" required validate>
											<span class="input-clear-button"></span>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="row">
											<button class="col button button-fill picl_ok">OK</button>
											<button class="col button button-fill popover-close">Cancel</button>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-rprt level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Sales Reports</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="list">
					<ul>
						<li class="item-content item-input">
							<div class="item-inner">
								<div class="item-title item-label">From</div>
								<div class="item-input-wrap">
									<input id="rprt_from" type="date" value="" autocomplete="off" required validate>
								</div>
							</div>
						</li>
						<li class="item-content item-input">
							<div class="item-inner">
								<div class="item-title item-label">To</div>
								<div class="item-input-wrap">
									<input id="rprt_to" type="date" value="" autocomplete="off" required validate>
								</div>
							</div>
						</li>
						<li class="item-content item-input">
							<div class="item-inner">
								<div class="item-title item-label">Person In Charge</div>
								<div class="item-input-wrap">
									<input id="rprt_pic" type="text" value="" autocomplete="off">
								</div>
							</div>
						</li>
					</ul>
				</div>
				<div class="block" style="z-index:0;">
					<button class="button button-raised button-fill rprt_gen" style="margin: 10px auto -20px;width: calc(100% - 30px);">
						<i class="icon material-icons md-only">timeline</i>
					</button>
				</div>
				<div class="rprt-result list noselect" style="z-index:0;">
					<ul></ul>
				</div>
			</div>
			<div class="popup popup-tskl level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Task List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="searchbar-backdrop"></div>
				<div class="block searchbar-hide-on-search">
					<button class="button button-raised button-fill tskl_add" style="margin: 10px auto -20px;width: calc(100% - 30px);">
						<i class="icon material-icons md-only">add</i>
					</button>
				</div>
				<div class="searchbar-found list tsk_list">
					<ul></ul>
				</div>
				<div class="popover tskld-popover">
					<div class="popover-inner">
						<div class="list">
							<ul>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Date</div>
										<div class="item-input-wrap">
											<input id="tskld_date" type="date" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Standby Time</div>
										<div class="item-input-wrap">
											<input id="tskld_time" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Venue</div>
										<div class="item-input-wrap">
											<input id="tskld_venue" type="text" value="" autocomplete="off" required validate>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Description</div>
										<div class="item-input-wrap">
											<input id="tskld_desc" type="text" value="" autocomplete="off">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Crew</div>
										<div class="item-input-wrap">
											<input id="tskld_crew" type="text" value="" autocomplete="off">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="row">
											<button class="col button button-fill tskld_ok">OK</button>
											<button class="col button button-fill popover-close">Cancel</button>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-alrl level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Leave Request List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="searchbar-backdrop"></div>
				<div class="block searchbar-hide-on-search"></div>
				<div class="searchbar-found list alr_list">
					<ul></ul>
				</div>
				<div class="popover alrld-popover">
					<div class="popover-inner">
						<div class="list">
							<ul>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Date</div>
										<div class="item-input-wrap">
											<input id="alrd_date" class="disabled" type="text" value="">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">User</div>
										<div class="item-input-wrap">
											<input id="alrd_user" class="disabled" type="text" value="">
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Reason</div>
										<div class="item-input-wrap">
											<textarea id="alrd_reason" class="disabled" value=""></textarea>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Status</div>
										<div class="item-input-wrap">
											<textarea id="alrd_status" value="" autocomplete="off"></textarea>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="row">
											<button class="col button button-fill alrd_ok">OK</button>
											<button class="col button button-fill popover-close">Cancel</button>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-ivtk level8">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Inventory Tracker</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input class="ivtk-search" type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="searchbar-backdrop"></div>
				<div class="block searchbar-hide-on-search"></div>
				<div class="searchbar-found list ivt_list" style="z-index:0;">
					<ul></ul>
				</div>
				<div class="popover ivtld-popover">
					<div class="popover-inner">
						<div class="list">
							<ul>
								
							</ul>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-event">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left"><span class="event_date"></span>&emsp;-&emsp;Event List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="data-table">
					<table class="event_list"></table>
					<div class="evts_input level8 fab-morph-target">
						<div class="block-title">Event Information</div>
						<div class="list">
							<ul>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Person In Charge</div>
										<div class="item-input-wrap">
											<input id="evts_ipic" type="text" placeholder="" autocomplete="off" required validate>
											<span class="input-clear-button"></span>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">Description</div>
										<div class="item-input-wrap">
											<input id="evts_idesc" type="text" placeholder="" autocomplete="off">
											<span class="input-clear-button"></span>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">L/D</div>
										<div class="item-input-wrap input-dropdown-wrap">
											<select  id="evts_ild" placeholder="" autocomplete="off">
												<option value="Dinner">Dinner</option>
												<option value="Lunch">Luncheon</option>
											</select>
										</div>
									</div>
								</li>
								<li class="item-content item-input">
									<div class="item-inner">
										<div class="row">
											<button class="col button button-fill evts_ok">OK</button>
											<button class="col button button-fill fab-close">Cancel</button>
										</div>
									</div>
								</li>
							</ul>
						</div>
					</div>
					<div class="fab fab-right-bottom level3 ltlevel8">
						<a href="#" class="leave_app">
							<i class="icon material-icons md-only">event_busy</i>
						</a>
					</div>
					<div class="fab fab-right-bottom level8">
						<a href="#">
							<i class="icon material-icons md-only">view_headline</i>
							<i class="icon material-icons md-only">close</i>
						</a>
						<div class="fab-buttons fab-buttons-top">
							<a href="#" class="evts_prev">
								<i class="icon material-icons md-only">skip_previous</i>
							</a>
							<a href="#" class="evts_next">
								<i class="icon material-icons md-only">skip_next</i>
							</a>
							<a href="#" class="leave_app">
								<i class="icon material-icons md-only">event_busy</i>
							</a>
							<a href="#" class="evts_shr">
								<i class="icon material-icons md-only">share</i>
							</a>
							<div class="fab fab-morph evts_add level9" data-morph-to=".evts_input">
								<a href="#">
									<i class="icon material-icons md-only">add</i>
								</a>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-power">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">3 Phase Information</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w85">
												<span class="badge">L1</span>
											</span>
											<i class="icon material-icons md-only" style="color:#FF0000;">lens</i>&emsp;<i class="icon material-icons md-only" style="color:#AA7700;">lens</i>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w85">
												<span class="badge">L2</span>
											</span>
											<i class="icon material-icons md-only" style="color:#FFFF00;">lens</i>&emsp;<i class="icon material-icons md-only" style="color:#999999;">lens</i>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w85">
												<span class="badge">L3</span>
											</span>
											<i class="icon material-icons md-only" style="color:#0000FF;">lens</i> 
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w85">
												<span class="badge">N</span>
											</span>
											<i class="icon material-icons md-only">lens</i> 
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w85">
												<span class="badge">Earth</span>
											</span>
											<i class="icon material-icons md-only" style="color:#22AA00;">lens</i> 
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-audiop">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Audio Player</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div>
						<div id="audiop_plyr" class="item-content">
							<span>No song selected</span>
							<div class="item-inner">
								<audio src="" controls="true" loop="true"></audio>
							</div>
						</div>
					</div>
					<div id="audiop_slist" class="list accordion-list">
						<ul>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Acoustic / Folk</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-acousticbreeze.mp3">Acoustic Breeze</a></li>
												<li><a href="#" data-url="bensound-adaytoremember.mp3">A Day to Remember</a></li>
												<li><a href="#" data-url="bensound-buddy.mp3">Buddy</a></li>
												<li><a href="#" data-url="bensound-cute.mp3">Cute</a></li>
												<li><a href="#" data-url="bensound-happiness.mp3">Happiness</a></li>
												<li><a href="#" data-url="bensound-smallguitar.mp3">Small Guitar</a></li>
												<li><a href="#" data-url="bensound-smile.mp3">Small</a></li>
												<li><a href="#" data-url="bensound-sunny.mp3">Sunny</a></li>
												<li><a href="#" data-url="bensound-sweet.mp3">Sweet</a></li>
												<li><a href="#" data-url="bensound-tenderness.mp3">Tenderness</a></li>
												<li><a href="#" data-url="bensound-ukulele.mp3">Ukulele</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Cinematic</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-adventure.mp3">Adventure</a></li>
												<li><a href="#" data-url="bensound-betterdays.mp3">Better Days</a></li>
												<li><a href="#" data-url="bensound-birthofahero.mp3">Birth of a Hero</a></li>
												<li><a href="#" data-url="bensound-deepblue.mp3">Deep Blue</a></li>
												<li><a href="#" data-url="bensound-enigmatic.mp3">Enigmatic</a></li>
												<li><a href="#" data-url="bensound-epic.mp3">Epic</a></li>
												<li><a href="#" data-url="bensound-evolution.mp3">Evolution</a></li>
												<li><a href="#" data-url="bensound-memories.mp3">Memories</a></li>
												<li><a href="#" data-url="bensound-newdawn.mp3">New Dawn</a></li>
												<li><a href="#" data-url="bensound-november.mp3">November</a></li>
												<li><a href="#" data-url="bensound-ofeliasdream.mp3">O Felia's Dream</a></li>
												<li><a href="#" data-url="bensound-onceagain.mp3">Once Again</a></li>
												<li><a href="#" data-url="bensound-photoalbum.mp3">Photo Album</a></li>
												<li><a href="#" data-url="bensound-pianomoment.mp3">Piano Moment</a></li>
												<li><a href="#" data-url="bensound-sadday.mp3">Sad Day</a></li>
												<li><a href="#" data-url="bensound-slowmotion.mp3">Slow Motion</a></li>
												<li><a href="#" data-url="bensound-theduel.mp3">The Duel</a></li>
												<li><a href="#" data-url="bensound-tomorrow.mp3">Tomorrow</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Corporate / Pop</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-adventure.mp3">Adventure</a></li>
												<li><a href="#" data-url="bensound-clapandyell.mp3">Clap and Yell</a></li>
												<li><a href="#" data-url="bensound-clearday.mp3">Clear Day</a></li>
												<li><a href="#" data-url="bensound-creativeminds.mp3">Creative Minds</a></li>
												<li><a href="#" data-url="bensound-elevate.mp3">Elavate</a></li>
												<li><a href="#" data-url="bensound-energy.mp3">Energy</a></li>
												<li><a href="#" data-url="bensound-funday.mp3">Funday</a></li>
												<li><a href="#" data-url="bensound-funkyelement.mp3">Funky Element</a></li>
												<li><a href="#" data-url="bensound-happiness.mp3">Happiness</a></li>
												<li><a href="#" data-url="bensound-hey.mp3">Hey</a></li>
												<li><a href="#" data-url="bensound-inspire.mp3">Inspire</a></li>
												<li><a href="#" data-url="bensound-littleidea.mp3">Little Idea</a></li>
												<li><a href="#" data-url="bensound-perception.mp3">Perception</a></li>
												<li><a href="#" data-url="bensound-straight.mp3">Straight</a></li>
												<li><a href="#" data-url="bensound-sweet.mp3">Sweet</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Electronica</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-dance.mp3">Dance</a></li>
												<li><a href="#" data-url="bensound-dreams.mp3">Dreams</a></li>
												<li><a href="#" data-url="bensound-dubstep.mp3">Dub Step</a></li>
												<li><a href="#" data-url="bensound-endlessmotion.mp3">Endless Motion</a></li>
												<li><a href="#" data-url="bensound-erf.mp3">Erf</a></li>
												<li><a href="#" data-url="bensound-house.mp3">House</a></li>
												<li><a href="#" data-url="bensound-moose.mp3">Moose</a></li>
												<li><a href="#" data-url="bensound-popdance.mp3">Pop Dance</a></li>
												<li><a href="#" data-url="bensound-scifi.mp3">Sci Fi</a></li>
												<li><a href="#" data-url="bensound-summer.mp3">Summer</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Jazz</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-allthat.mp3">All That</a></li>
												<li><a href="#" data-url="bensound-hipjazz.mp3">Hip Jazz</a></li>
												<li><a href="#" data-url="bensound-jazzcomedy.mp3">Jazz Comedy</a></li>
												<li><a href="#" data-url="bensound-jazzyfrenchy.mp3">Jazzy Frenchy</a></li>
												<li><a href="#" data-url="bensound-love.mp3">Love</a></li>
												<li><a href="#" data-url="bensound-romantic.mp3">Romantic</a></li>
												<li><a href="#" data-url="bensound-theelevatorbossanova.mp3">The Elevator Bossa Nova</a></li>
												<li><a href="#" data-url="bensound-thejazzpiano.mp3">The Jazz Piano</a></li>
												<li><a href="#" data-url="bensound-thelounge.mp3">The Lounge</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Rock</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-actionable.mp3">Actionable</a></li>
												<li><a href="#" data-url="bensound-anewbeginning.mp3">A New Beginning</a></li>
												<li><a href="#" data-url="bensound-beyondtheline.mp3">Beyond The Line</a></li>
												<li><a href="#" data-url="bensound-extremeaction.mp3">Extreme Action</a></li>
												<li><a href="#" data-url="bensound-goinghigher.mp3">Going Higher</a></li>
												<li><a href="#" data-url="bensound-happyrock.mp3">Happy Rock</a></li>
												<li><a href="#" data-url="bensound-highoctane.mp3">High Octave</a></li>
												<li><a href="#" data-url="bensound-punky.mp3">Punky</a></li>
												<li><a href="#" data-url="bensound-rumble.mp3">Rumble</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Urban / Groove</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-allthat.mp3">All That</a></li>
												<li><a href="#" data-url="bensound-badass.mp3">Badass</a></li>
												<li><a href="#" data-url="bensound-downtown.mp3">Downtown</a></li>
												<li><a href="#" data-url="bensound-funkysuspense.mp3">Funky Suspense</a></li>
												<li><a href="#" data-url="bensound-funnysong.mp3">Funny Song</a></li>
												<li><a href="#" data-url="bensound-groovyhiphop.mp3">Groovy Hip Hop</a></li>
												<li><a href="#" data-url="bensound-hipjazz.mp3">Hip Jazz</a></li>
												<li><a href="#" data-url="bensound-retrosoul.mp3">Retro Soul</a></li>
												<li><a href="#" data-url="bensound-sexy.mp3">Sexy</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">World / Others</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="bensound-brazilsamba.mp3">Brazil Samba</a></li>
												<li><a href="#" data-url="bensound-countryboy.mp3">Country Boy</a></li>
												<li><a href="#" data-url="bensound-creepy.mp3">Creepy</a></li>
												<li><a href="#" data-url="bensound-india.mp3">India</a></li>
												<li><a href="#" data-url="bensound-instinct.mp3">Instinct</a></li>
												<li><a href="#" data-url="bensound-littleplanet.mp3">Little Planet</a></li>
												<li><a href="#" data-url="bensound-psychedelic.mp3">Psychedelic</a></li>
												<li><a href="#" data-url="bensound-relaxing.mp3">Relaxing</a></li>
												<li><a href="#" data-url="bensound-scifi.mp3">Scifi</a></li>
												<li><a href="#" data-url="bensound-theelevatorbossanova.mp3">The Elevator Bossa Nova</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Event</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="DJ Happy Birthday.mp3">Happy Birthday (DJ)</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">MRM</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list links-list">
											<ul>
												<li><a href="#" data-url="Bossa Nova.m4a">Bossa Nova</a></li>
												<li><a href="#" data-url="Ballad Swing.m4a">Swing (Ballad)</a></li>
												<li><a href="#" data-url="Slow Swing.m4a">Swing (Slow)</a></li>
												<li><a href="#" data-url="Up Tempo Swing.m4a">Swing (Up Tempo)</a></li>
											</ul>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-faq">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">F.A.Q.</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-itml">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Item List</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<form class="searchbar">
						<div class="searchbar-inner">
							<div class="searchbar-input-wrap">
								<input class="itml-search" type="search" placeholder="Search">
								<i class="searchbar-icon"></i>
								<span class="input-clear-button"></span>
							</div>
							<span class="searchbar-disable-button if-not-aurora">Cancel</span>
						</div>
					</form>
				</div>
				<div class="searchbar-backdrop"></div>
				<div class="block searchbar-hide-on-search"></div>
				<div class="searchbar-found list itm_list">
					<ul></ul>
				</div>
			</div>
			<div class="popup popup-light">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Lighting Address Calculator</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">create</i> Fixture Legend
										</div>
										<div class="item-input-wrap">
											<select id="ltcl_nme">
												<option value="PAR" selected>Par Can</option>
												<option value="Gobo">LED 200 (Gobo Beam)</option>
												<option value="Wash">LED Zoom (Wash)</option>
												<option value="LT Beam">LT Beam</option>
												<option value="EF Beam">EF Beam</option>
												<option value="CN Beam">CN Beam</option>
												<option value="Profile">Profile Light</option>
												<option value="City">City Light</option>
												<option value="S City">Small City Light</option>
												<option value="Blinder">Blinder</option>
											</select>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">dialpad</i> Fixture DMX Channel
										</div>
										<div class="item-input-wrap">
											<input id="ltcl_ads" type="number" autocomplete="off" placeholder="0" value="8" disabled>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">format_list_numbered</i> Quantity
										</div>
										<div class="item-input-wrap">
											<input id="ltcl_qty" type="number" autocomplete="off" placeholder="">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<div class="row">
												<button id="ltcl_add" class="button col button-fill">Add</button>
												<button id="ltcl_clr" class="button col button-fill">Clear All</button>
											</div>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
					<div id="ltcl_spc" class="block noselect" data-dmx="1"></div>
				</div>
			</div>
			<div class="popup popup-packl level3">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Packing List for Equipment</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list accordion-list">
						<ul>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Sound</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list">
											<ul>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Cable Box (2T2M)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">14 u&emsp;-&emsp;XLR</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;XLR (Short)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Monitor Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Wired Microphone</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Duct Tape</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Speaker Cloth</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;2 CH DI Box</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Audio Jack</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Guitar Jack</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Grey Long Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Round Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">5 u&emsp;-&emsp;1 to 5 Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">6 u&emsp;-&emsp;Power Cord</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Cable Box (4T2M)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">20 u&emsp;-&emsp;XLR</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;XLR (Short)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;Monitor Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Wired Microphone</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Duct Tape</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Speaker Cloth</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;2 CH DI Box</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Audio Jack</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Guitar Jack</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;Grey Long Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">5 u&emsp;-&emsp;Round Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">5 u&emsp;-&emsp;1 to 5 Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbs-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">8 u&emsp;-&emsp;Power Cord</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Equipment (2T2M)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Speaker</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Speaker Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Book Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;Microphone Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Mixer</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 set&emsp;-&emsp;Wireless Microphone</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Laptop / MP3 Device</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqmd-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Trolley</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Equipment (4T2M)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">6 u&emsp;-&emsp;Speaker</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Speaker Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Book Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;Microphone Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Mixer</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 set&emsp;-&emsp;Wireless Microphone</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Laptop / MP3 Device</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Trolley</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Light</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list">
											<ul>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Cable Box (Medium)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">14 u&emsp;-&emsp;XLR</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;XLR (Short)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Duct Tape</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Grey Long Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Round Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">5 u&emsp;-&emsp;1 to 5 Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;Power Cord</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Cable Box (Big)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">20 u&emsp;-&emsp;XLR</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;XLR (Short)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Duct Tape</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Grey Long Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Round Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">5 u&emsp;-&emsp;1 to 5 Extension</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbbl-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;Power Cord</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">LED Screen</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list">
											<ul>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Cable Box (4m x 2m)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;100m LAN Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">20 u&emsp;-&emsp;Short LAN Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;LED Power Cord</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Short HDMI Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;USB Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Laptop</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;NovaStar K4</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Power Cord</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;DB Box</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;3 Phase Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Tape</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">6 u&emsp;-&emsp;Cable Ramp</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Cable Box (6m x 3m)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;100m LAN Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">40 u&emsp;-&emsp;Short LAN Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;LED Power Cord</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Short HDMI Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;USB Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Laptop</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;NovaStar K4</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Power Cord</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;DB Box</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;3 Phase Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Tape</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="cbled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">6 u&emsp;-&emsp;Cable Ramp</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Equipment (4m x 2m)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;LED Panel Box (Full)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Cabinet (Single)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;3m Platform</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Tie Down</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">20 u&emsp;-&emsp;Cabinet Screw</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">15 u&emsp;-&emsp;Butterfly</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 set&emsp;-&emsp;Tools</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Water Container</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Equipment (6m x 3m)</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">6 u&emsp;-&emsp;LED Panel Box (Full)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">6 u&emsp;-&emsp;Cabinet (Double)</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;3m Platform</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;Tie Down</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqled-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">30 u&emsp;-&emsp;Cabinet Screw</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">25 u&emsp;-&emsp;Butterfly</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 set&emsp;-&emsp;Tools</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="eqbg-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">4 u&emsp;-&emsp;Water Container</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</li>
							<li class="accordion-item">
								<a href="#" class="item-content item-link">
									<div class="item-inner">
										<div class="item-title">Karaoke</div>
									</div>
								</a>
								<div class="accordion-item-content">
									<div class="block">
										<div class="list">
											<ul>
												<li class="accordion-item">
													<a href="#" class="item-content item-link">
														<div class="item-inner">
															<div class="item-title">Karaoke</div>
														</div>
													</a>
													<div class="accordion-item-content">
														<div class="block">
															<div class="list">
																<ul>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Monitor Screen</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Monitor Adapter</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Monitor Stand</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Monitor Screen Screw</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Karaoke Screen</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Transaudio Key</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;MyWay System</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;HDMI to VGA Converter</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;VGA Spliter</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Spliter Adapter</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;Internet Receiver</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 u&emsp;-&emsp;USB to LAN Cable Converter</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">3 u&emsp;-&emsp;VGA Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">2 u&emsp;-&emsp;RCA Cable</div>
																			</div>
																		</label>
																	</li>
																	<li>
																		<label class="item-checkbox item-content">
																			<input type="checkbox" name="krok-checkbox"/>
																			<i class="icon icon-checkbox"></i>
																			<div class="item-inner">
																				<div class="item-title">1 Lot&emsp;-&emsp;Extension</div>
																			</div>
																		</label>
																	</li>
																</ul>
															</div>
														</div>
													</div>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-stage">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Stage Calculator</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">swap_horiz</i> Column
										</div>
										<div class="item-input-wrap">
											<input id="stcl_col" type="number" name="column" autocomplete="off" placeholder="In pieces">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">swap_vert</i> Row
										</div>
										<div class="item-input-wrap">
											<input id="stcl_row" type="number" name="row" autocomplete="off" placeholder="In pieces">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w200">
												<i class="icon material-icons md-only">apps</i>
												Board
											</span>
											<span id="stcl_board" class="badge">0</span>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w200">
												<i class="icon material-icons md-only">border_left</i>
												Side
											</span>
											<span id="stcl_side" class="badge">0</span>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w200">
												<i class="icon material-icons md-only">settings_input_component</i>
												Leg
											</span>
											<span id="stcl_leg" class="badge">0</span>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w200">
												<i class="icon material-icons md-only rotate-180">format_strikethrough</i>
												Shoe
											</span>
											<span id="stcl_shoe" class="badge">0</span>
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<span class="w200">
												<i class="icon material-icons md-only">crop_free</i>
												Stage Size
											</span>
											<span id="stcl_size" class="badge">0 ft&emsp;x&emsp;0 ft</span>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-convr">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Unit Converter</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">sync</i> <span class="convr-u1">Foot (ft)</span>
										</div>
										<div class="item-input-wrap">
											<input id="convr1" type="number" name="column" autocomplete="off" placeholder="1">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">sync</i> <span class="convr-u2">Metre (m)</span>
										</div>
										<div class="item-input-wrap">
											<input id="convr2" type="number" name="column" autocomplete="off" placeholder="0.3048">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">straighten</i> Length
										</div>
									</div>
								</div>
								<label class="item-radio item-content">
									<input type="radio" name="convr-radio" value="fttom" checked/>
									<i class="icon icon-radio"></i>
									<div class="item-inner">
										<div class="item-title">ft &emsp;<i class="icon material-icons md-only">compare_arrows</i>&emsp; m</div>
									</div>
								</label>
								<label class="item-radio item-content">
									<input type="radio" name="convr-radio" value="intomm" checked/>
									<i class="icon icon-radio"></i>
									<div class="item-inner">
										<div class="item-title">in &emsp;<i class="icon material-icons md-only">compare_arrows</i>&emsp; mm</div>
									</div>
								</label>
								<label class="item-radio item-content">
									<input type="radio" name="convr-radio" value="mtopx" />
									<i class="icon icon-radio"></i>
									<div class="item-inner">
										<div class="item-title">m &emsp;<i class="icon material-icons md-only">compare_arrows</i>&emsp; px</div>
									</div>
								</label>
							</li>
							<li>
								<div class="item-content">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">photo_size_select_small</i> Area
										</div>
									</div>
								</div>
								<label class="item-radio item-content">
									<input type="radio" name="convr-radio" value="ft2tom2" />
									<i class="icon icon-radio"></i>
									<div class="item-inner">
										<div class="item-title">ft <sup>2</sup> &emsp;<i class="icon material-icons md-only">compare_arrows</i>&emsp; m <sup>2</sup></div>
									</div>
								</label>
							</li>
							<li>
								<div class="item-content">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">flash_on</i> Power
										</div>
									</div>
								</div>
								<label class="item-radio item-content">
									<input type="radio" name="convr-radio" value="wtoA" />
									<i class="icon icon-radio"></i>
									<div class="item-inner">
										<div class="item-title">w &emsp;<i class="icon material-icons md-only">compare_arrows</i>&emsp; A</div>
									</div>
								</label>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-stnc">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">My Namecard</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div data-space-between="50" class="swiper-container swiper-init demo-swiper">
						<div class="swiper-wrapper">
							<div class="swiper-slide">
								<img src="ncb.png" class="ncb-img">
							</div>
							<div class="swiper-slide">
								<span class="ncf-pos1"></span>
								<span class="ncf-pos2"></span>
								<span class="ncf-name"></span>
								<span class="ncf-tel"></span>
								<span class="ncf-email"></span>
								<img src="ncf.png" class="ncf-img">
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="popup popup-step">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Edit Profile</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">face</i> Name
										</div>
										<div class="item-input-wrap">
											<input id="edpf_name" type="text" autocomplete="off">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">phone</i> Contact Number
										</div>
										<div class="item-input-wrap">
											<input id="edpf_tel" type="tel" autocomplete="off">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">mail_outline</i> Email
										</div>
										<div class="item-input-wrap">
											<input id="edpf_eml" type="email" autocomplete="off">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<div class="row">
												<button id="edpf_chg" class="button col button-fill">Save Profile</button>
											</div>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-stla level3">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Leave Approval</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
						
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-stht">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Work History</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-strp">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Reset Password</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div class="list">
						<ul>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">fingerprint</i> Current Password
										</div>
										<div class="item-input-wrap">
											<input id="rspw_old" type="password" autocomplete="off">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">lock_open</i> New Password
										</div>
										<div class="item-input-wrap">
											<input id="rspw_new" type="password" autocomplete="off">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-title item-label">
											<i class="icon material-icons md-only">verified_user</i> Confirm Password
										</div>
										<div class="item-input-wrap">
											<input id="rspw_cfn" type="password" autocomplete="off">
										</div>
									</div>
								</div>
							</li>
							<li>
								<div class="item-content item-input">
									<div class="item-inner">
										<div class="item-input-wrap">
											<div class="row">
												<button id="rspw_chg" class="button col button-fill">Reset Password</button>
											</div>
										</div>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>
			<div class="popup popup-staa">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">About This Apps</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<div align="center">
						 <img src="icon.png" alt="WKV Logo" height="128" width="128">
						 <span style="color:#999;position:absolute;top:40px;font-size:12px;">&emsp;Version 1.0.154</span>
					</div>
					<p>WKV Application serves as a platform for of WKV’s member to obtain basic information and calculation method can easily obtain by accessing to the application.</p>
					<p>For general usage, clock in and clock out is built in the application for employees of WKV to check in whenever they report to event venue.</p>
					<p>This application includes information of power supply, Lighting Address Calculator is included in this application to simplify the process of obtaining the lighting address. Accessories of stage can be calculated by just key-in the size of stage and auto generate the quantity of accessories required. Unit Converter is included to ease the conversion process. Personal e-Name Card is also customize for all WKV Members.</p>
					<p>By accessing to the application, members of WKV can easily obtain the information needed.</p>
				</div>
			</div>
			<div class="popup popup-stpp">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Privacy Policy</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<p><strong><u>Contact WKV - Privacy Concerns Reports</u></strong></p>

					<p>If you have any questions about this Privacy Policy, or if you believe that your privacy has been compromised in the course of using the Services, please contact WKV at: <strong>wkv.malaysia@gmail.com</strong> You may send WKV other requests, responses, questions and complaints by email at: <strong>wkv.malaysia@gmail.com</strong></p>

					<p><strong><u>Your consent is important</u></strong></p>
					<p>When you request information from WKV Application, you may be required to provide WKV with your personal data. In doing so, you consent to its use by WKV in accordance with this Privacy Notice. Your personal data may have otherwise been provided to the WKV.</p>
					<p>We may collect your sensitive personal data (including location, data related to information obtained from WKV Applications and etc.) if you apply for certain function. We will only use your sensitive personal data to provide the service(s) you signed up for. If we collect, use, maintain or disclose your sensitive personal data, we will ask for your explicit consent.</p>
					<p>You have the choice, at any time, not to provide your personal data/sensitive personal data or to revoke your consent to WKV processing of your personal data/sensitive personal data. However, failure to provide such personal data/sensitive personal data or revocation of your consent to process personal data/sensitive personal data provided may result in WKV being unable to provide you with effective and continuous information.</p>

					<p><strong><u>What types of personal data do we collect?</u></strong></p>
					<p>Personal data refers to any information that relates directly or indirectly to an individual, who is identified or identifiable from that information or from that and other information in the possession of WKV, including any sensitive personal data and expression of opinion, video recordings made through close circuit security surveillance cameras placed for security reasons and audio recordings about the individual.</p>
					<p>The types of personal data we collect may include, but is not limited to your name, address, other contact details, age, identity card, images, videos and location history.</p>
					<p>The personal data we collect can be either obligatory or voluntary. Obligatory personal data are those that we require in order to provide you with our services. If you do not provide us with obligatory personal data, we would not be able to provide you with our services. Voluntary personal data are those that are not mandatory in order for us to provide you with our services. If you do not provide us with voluntary personal data, you can still sign up for our services. Obligatory and voluntary personal data differ for each products and services and will be indicated in the application forms.</p>

					<p><strong><u>How do we collect your personal data?</u></strong></p>
					<p>
						We obtain your personal data in various ways, such as:<br/>
						i.&emsp;When you are a member of WKV, an account will be created for you. From the account and information provided, data will be obtained.<br/>
						ii.&emsp;We may also obtain your personal data when you participate using any of the functions or tools from the application.<br/>
						iii.&emsp;From video recordings from close circuit security surveillance cameras and audio recordings.<br/>
						iv.&emsp;From publicly available sources.
					</p>

					<p><strong><u>To whom do we disclose your personal data?</u></strong></p>
					<p>
						Your personal data held by us shall be kept confidential. However, in order to provide you with effective and continuous services and subject at all times to any laws (including regulations, standards, guidelines and/or obligations), we may need to disclose your personal data to:<br/>
						i.&emsp;Other Entities within WKV; and/or<br/>
						ii.&emsp;Financial service providers in relation to the services that you have with us; and/or<br/>
						iii.&emsp;Parties authorised and consented to, by you; and/or<br/>
						iv.&emsp;Enforcement regulatory and governmental agencies as permitted or required by law, authorised by any order of court or to meet obligations to regulatory authorities.
					</p>
					<p>The disclosure of your data may involve the transfer of your personal data to places outside of Malaysia, and by providing us your personal data you agree to such a transfer where it is required to provide you the services you have requested.</p>

					<p><strong><u>What is the purpose of processing your personal data?</u></strong></p>
					<p>
						We may process your personal data for the following reasons: <br/>
						i.&emsp;To assess your application for any of our services; and/or<br/>
						ii.&emsp;To manage and maintain your facility; and/or<br/>
						iii.&emsp;To respond to your enquiries and further enhance the functions of WKV apps; and/or<br/>
						iv.&emsp;For internal functions such as evaluating the effectiveness tools in the application; and/<br/>
						v.&emsp;To prevent fraud or detect crime or for the purpose of investigation; and/or<br/>
						vi.&emsp;For security reasons in particular personal data collected from close circuit security surveillance cameras.
					</p>
					<p>In addition, we may also use your personal data for the fulfilment of any regulatory requirements and for any other reasons connected with providing you the services you require.</p>

					<p><strong><u>How do we protect your data?</u></strong></p>
					<p>The security of your personal data is our priority. WKV takes all physical, technical and organisational measures needed to ensure the security and confidentiality of personal data.  If we disclose any of your personal data to our management and we will require them to appropriately safeguard the personal data provided to them.</p>

					<p><strong><u>How long may we retain your personal data?</u></strong></p>
					<p>We will only retain your personal data for as long as necessary to fulfil the purpose(s) for which it was collected or to comply with legal, regulatory and internal requirements. Afterwards we will destruct or permanently delete your data.</p>

					<p><strong><u>Changes to this Privacy Notice</u></strong></p>
					<p>Please note that WKV may update this Privacy Notice from time to time. If there are material changes to this Privacy Notice, we will notify you by posting a notice of such changes on our website or by sending you a notification directly. Do periodically review this Privacy Notice to stay informed on how we are protecting your information.</p>

					<p><strong><u>How can you access / correct / update your personal data?</u></strong></p>
					<p>We are committed to ensure that the personal data we hold about you is accurate, complete, not misleading and up-to-date. If there are any changes to your personal data or if you believe that the personal data we have about you is inaccurate, incomplete, misleading or not up-to-date, please contact us so that we may take steps to update your personal data.</p>
					<p>You have the right to access your personal data. If you would like to request access to your personal data, please contact us.</p>

					<p><strong><u>How may you contact us?</u></strong></p>
					<p>If you need to contact us, you may visit us or contact us via e-mail at <strong>wkv.malaysia@gmail.com</strong></p>
					<p>We provide the Privacy Notice in English. In case there is a discrepancy on how we collect or use your personal data between this Privacy Notice and the terms and conditions of your specific product or service, the terms and conditions of your specific product or service shall prevail.</p>
				</div>
			</div>
			<div class="popup popup-sttm">
				<div class="toolbar">
					<div class="toolbar-inner">
						<div class="left">Terms of Use</div>
						<div class="right"><a class="link popup-close" href="#">Close</a></div>
					</div>
				</div>
				<div class="block">
					<p>Welcome to WKV Application!</p>
					<p>These Terms of Use govern your use of WKV and provide information about the WKV Service, outlined below. When you create an account or use WKV, you agree to these terms.</p>
					<p>The WKV Application is provided to you by WKV Malaysia. These Terms of Use therefore constitute an agreement between you and WKV Malaysia.</p>

					<p><strong><u>The WKV Service</u></strong></p>
					<p>
						We agree to provide you with the WKV Service. The Service is made up of the following aspects (the Service):<br/>
						<strong>•&emsp;Allowing WKV Malaysia members to have an overview of the work schedule.</strong><br/>
						&nbsp;&emsp;WKV allows you to have an overview on upcoming events and better understand each individual work schedule.<br/>
						<strong>•&emsp;Provide a platform for easy use for equipment calculation.</strong><br/>
						&nbsp;&emsp;We develop and use tools and offer resources to members of WKV to fasten the process for preparing equipment needed and obtained information required from the tools. This may ensure least mistakes done during work for WKV members.<br/>
						<strong>•&emsp;Developing an appropriate tool for members of WKV during work out of office.</strong><br/>
						&nbsp;&emsp;Clock in and clock out service is built in the application allowing members of WKV to check in when working at event site. This can ensure members of WKV are presence at the designated event to carry out his or her work.<br/>
						<strong>•&emsp;Providing consistent and seamless event information for event.</strong><br/>
						&nbsp;&emsp;WKV Applications will also include detailed event information and equipment in the application for every user.<br/>
						<strong>•&emsp;Personal e-name card.</strong><br/>
						&nbsp;&emsp;Each member of WKV will have their respective e-name card.
					</p>

					<p><strong><u>The Data Policy</u></strong></p>
					<p>Providing our Service requires collecting and using your information. The Privacy Policy explains how we collect, use, and share information across the WKV Applications. It also explains the many ways you can control your information. You must agree to the Privacy Policy to use WKV.</p>

					<p><strong><u>Your Commitments</u></strong></p>
					<p>In return for our commitment to provide the Service, we require you to make the below commitments to us.</p>

					<p><strong><u>Who Can Use WKV?</u></strong></p>
					<p>
						We want our Service to be as open and inclusive as possible, but we also want it to be safe, secure, and in accordance with the law. So, we need you to commit to a few restrictions in order to be part of the WKV Application Community.<br/>
						•&emsp;You must be at least 13 years old or the minimum legal age.<br/>
						•&emsp;We must not have previously disabled your account for violation of law or any of our policies.<br/>
						•&emsp;You must be a member of WKV.<br/>
					</p>

					<p><strong><u>How You Can't Use WKV?</u></strong></p>
					<p>
						Providing a safe and open Service for a broad community requires that we all do our part.<br/>
						•&emsp;You can't impersonate others and/or disclose information in the WKV Application to others.<br/>
						•&emsp;You can't do anything unlawful, misleading, or fraudulent or for an illegal or unauthorized purpose.<br/>
						•&emsp;You can't do anything to interfere with or impair the intended operation of the Service.<br/>
						•&emsp;You can't attempt to buy, sell, or transfer any aspect of your account (including your username) or solicit, collect, or use login credentials or badges of other users.
					</p>

					<p><strong><u>Permissions You Give to Us</u></strong></p>
					<p>
						As part of our agreement, you also give us permissions that we need to provide the Service.<br/>
						•&emsp;You agree that we can download and install updates to the Service on your device.
					</p>

					<p><strong><u>Additional Rights We Retain</u></strong></p>
					<p>
						•&emsp;If you select a username or similar identifier for your account, we may change it if we believe it is appropriate or necessary (for example, if it infringes someone's intellectual property or impersonates another user).<br/>
						•&emsp;If you use content covered by intellectual property rights that we have and make available in our Service (for example, images, designs, videos, or sounds we provide that you add to content you create or share), we retain all rights to our content (but not yours).<br/>
						•&emsp;You must obtain written permission from us or under an open source license to modify, create derivative works of, decompile, or otherwise attempt to extract source code from us.
					</p>

					<p><strong><u>Content Removal and Disabling or Terminating Your Account</u></strong></p>
					<p>•&emsp;We can remove any content or information on the Service if we believe that it violates these Terms of Use, we are permitted or required to do so by law. We can refuse to provide or stop providing all or part of the Service to you (including terminating or disabling your account) immediately to protect our community or services, or if you create risk or legal exposure for us, violate these Terms of Use or our policies, if you repeatedly infringe other people's intellectual property rights, or where we are permitted or required to do so by law. If we take action to disable or terminate your account, we will notify you where appropriate. If you believe your account has been terminated in error, or you want to disable or permanently delete your account, consult WKV Application Help Center.</p>


					<p><strong><u>Our Agreement and What Happens if We Disagree</u></strong></p>
					<p><strong><u>Our Agreement</u></strong></p>
					<p>
						•&emsp;If any aspect of this agreement is unenforceable, the rest will remain in effect.<br/>
						•&emsp;Any amendment or waiver to our agreement must be in writing and signed by us. If we fail to enforce any aspect of this agreement, it will not be a waiver.<br/>
						•&emsp;We reserve all rights not expressly granted to you.
					</p>

					<p><strong><u>Who Has Rights Under this Agreement.</u></strong></p>
					<p>
						•&emsp;This agreement does not give rights to any third parties.<br/>
						•&emsp;You cannot transfer your rights or obligations under this agreement without our consent.<br/>
						•&emsp;Our rights and obligations can be assigned to others. For example, this could occur if our ownership changes (as in a merger, acquisition, or sale of assets) or by law.
					</p>

					<p><strong><u>Who Is Responsible if Something Happens.</u></strong></p>
					<p>
						•&emsp;Our Service is provided "as is," and we can't guarantee it will be safe and secure or will work perfectly all the time. TO THE EXTENT PERMITTED BY LAW, WE ALSO DISCLAIM ALL WARRANTIES, WHETHER EXPRESS OR IMPLIED, INCLUDING THE IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.<br/>
						•&emsp;We also don’t control what people and others do or say, and we aren’t responsible for their (or your) actions or conduct (whether online or offline) or content (including unlawful or objectionable content). We also aren’t responsible for services and features offered by other people or companies, even if you access them through our Service.<br/>
						•&emsp;Our responsibility for anything that happens on the Service (also called "liability") is limited as much as the law will allow. If there is an issue with our Service, we can't know what all the possible impacts might be. You agree that we won't be responsible ("liable") for any lost profits, revenues, information, or data, or consequential, special, indirect, exemplary, punitive, or incidental damages arising out of or related to these Terms, even if we know they are possible. This includes when we delete your content, information, or account.
					</p>

					<p><strong><u>Unsolicited Material.</u></strong></p>
					<p>We always appreciate feedback or other suggestions, but may use them without any restrictions or obligation to compensate you for them, and are under no obligation to keep them confidential.</p>

					<p><strong><u>Updating These Terms</u></strong></p>
					<p>We may change our Service and policies, and we may need to make changes to these Terms so that they accurately reflect our Service and policies. Unless otherwise required by law, we will notify you (for example, through our Service) before we make changes to these Terms and give you an opportunity to review them before they go into effect. Then, if you continue to use the Service, you will be bound by the updated Terms.</p>
				</div>
			</div>
		</div>
		<div class="popover-backdrop">
			<div class="fab fab-right-bottom evtd_shr level8">
				<a href="#" class="evtd_shr">
					<i class="icon material-icons md-only">share</i>
				</a>
			</div>
		</div>
		<div class="panel-backdrop" style=""></div>
	</div>
	<script src="framework7/js/framework7.min.js"></script>
	<script src="js/jquery-3.3.1.min.js"></script>
	<script src="js/routes.js"></script>
	<script src="js/app.js"></script>
	<script type="text/javascript">
		app.initialize();
	</script>
</body>
</html>

<?php
		}elseif(stristr($_SERVER['HTTP_USER_AGENT'],'android')){
			header("Location: https://play.google.com/store/apps/details?id=com.wkv.manage");
			die();
		}else{
			header("Location: http://www.wkventertainment.com");
			die();
		}
	}
?>