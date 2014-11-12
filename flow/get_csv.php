<?php
	ini_set('display_errors', 1);
	error_reporting(E_ALL);

	$file = 'data/'.$_POST['data'];
	if (file_exists($file)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/oclet-stream');
		header('Content-Disposition: attachment; filename='.basename($file));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		readfile($file);
		exit;
	}
	$file = 'data/'.$GET['data'];
	if (file_exists($file)) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/oclet-stream');
		header('Content-Disposition: attachment; filename='.basename($file));
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($file));
		readfile($file);
		exit;
	}
	echo "hiii";
?>
