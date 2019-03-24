<?php
	date_default_timezone_set("Asia/Kuala_Lumpur");

	$HOST = 'localhost';
	$USER = 'reeondpo_WNiXl8';
	$PASS = 'HAQgWpByovJA';
	$DATB = 'reeondpo_wkvapp';
	
	$mysqli = new mysqli($HOST, $USER, $PASS, $DATB);
	
	if($mysqli->connect_errno){
		echo "Failed to connect to database: " . $mysqli->connect_error;
	}
	$mysqli->set_charset("utf8");

	function addQuotes($val){
		return '"'.addslashes($val).'"';
	}
?>