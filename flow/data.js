/**
   Copyright 2014 Keith Batesole
   
   Free to use however anyone wants, because its so simple who cares
 */

/*
  Grab a file from the server and send it to a callback

  file_name is the name of the file to grab. 
  callback is the function that will get called once the data is retrieved
*/
function get_data(file_name, callback) {
    // Use AJAX to get the CSV file
    $.post('get_csv.php', 
	   { data: file_name },
	   function(file) {
	       // Parse the csv file to an object
	       var data = d3.csv.parse(file);
	       
	       // Pass object to a callback
	       callback(data);
	   });
}

