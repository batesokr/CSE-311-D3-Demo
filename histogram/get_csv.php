<?php
	$file = 'Miami Application Portfolio.csv';
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
?>
