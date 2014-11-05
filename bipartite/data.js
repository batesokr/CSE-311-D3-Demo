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


/*
  Based on csv data, turn it into data ready to be used for a bipbartite graph

  Data is the data that will be used, an array of objects
  cat1 is the first category
  cat2 is the second category
*/
function create_bipartite_data(data, cat1, cat2) {
    var clean_data = [];
    var hash_check = {};
    var hash_data = {};
    
    // Create a hash set of the cross-product of the two columns
    var val1, val2;
    for (i in data) {
	// Obtain the values for the two columns
	val1 = data[i][cat1];
	val2 = data[i][cat2];

	// Check if they have been used yet
	if (typeof hash_data[val1] === 'undefined') {
	    hash_data[val1] = {};
	}

	if (typeof hash_check[val2] === 'undefined') {
	    hash_check[val2] = 0;
	}

	if (typeof hash_data[val1][val2] === 'undefined') {
	    hash_data[val1][val2] = 0;
	}
	    
	hash_data[val1][val2]++;
    }
 
    // Transform the hash into an array
    for (k1 in hash_data) {
	for (k2 in hash_check) {
	    clean_data.push(
		[ k1, k2, (typeof hash_data[k1][k2] === 'undefined' ? 0 : hash_data[k1][k2]) ]
	    );
	}
    }

    return clean_data;
}