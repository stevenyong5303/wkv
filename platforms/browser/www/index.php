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
				
				case 'tme_chk':
					echo date("Y-m-d H:i:s");
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
					
				case 'clk_in':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_clk ' .
						   ' (user_id, clock_action, clock_location) ' .
						   ' VALUES ( ' . $user_id . ', "IN", "' . $DATA['loc'] .'"); ';
						   
					if($result = $mysqli->query($sql)){
						$sql = ' UPDATE 14RuVPJV6GmH_app_usr ' .
							   ' SET clocked_in = TRUE ' .
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
							   ' SET clocked_in = FALSE ' .
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
					
				case 'clk_add':
					$DATA = unserialize(stripslashes($_POST['DATA']));
					$user_id = addQuotes(strtolower($DATA['usr']));
					
					$sql = ' INSERT INTO 14RuVPJV6GmH_app_clk ' .
						   ' (user_id, clock_action, clock_location) ' .
						   ' VALUES ( ' . $user_id . ', "ADD", "' . $DATA['loc'] .'"); ';
						   
					if($result = $mysqli->query($sql)){
						echo '200 OK';
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
							$row = $result->fetch_array(MYSQLI_ASSOC);
							$result->close();
							
							$report['reply'] = '200 OK';
							$report['clocked'] = $row['clocked_in'];
							$report['level'] = $row['user_level'];
							$report['name'] = $row['nc_name'];
							$report['contact'] = $row['nc_contact'];
							$report['email'] = $row['nc_email'];
							$report['pos1'] = $row['nc_pos1'];
							$report['pos2'] = $row['nc_pos2'];
							
							$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
								   ' (act, user_id, data) ' .
								   ' VALUES ( "' . $_POST['ACT'] . '", ' . addQuotes(strtolower($DATA['usr'])) . ', ' . addQuotes($_POST['DATA']) .' ); ';
								   
							if($result = $mysqli->query($sql)){
								echo json_encode($report);
							}else{
								echo '500 Internal Server Error';
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
		echo '400 Bad Request';
	}
?>