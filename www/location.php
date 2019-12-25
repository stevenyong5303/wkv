<?php
	header('Access-Control-Allow-Origin: *');
	header('Access-Control-Allow-Methods: GET, POST, PATCH, PUT, DELETE, OPTIONS');

	include 'functions.php';
	
	if($_POST){
		$sql = ' INSERT INTO 14RuVPJV6GmH_app_act ' .
			   ' (act, user_id, data) ' .
			   ' VALUES ( "", "", ' . addQuotes(json_encode($_POST)) .' ); ';
			   
		$result = $mysqli->query($sql);
	}
	
	echo json_encode($_POST);
?>