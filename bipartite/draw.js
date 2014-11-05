var file = 'Miami Application Portfolio.csv';

// Fetch data from server
// in data.js
data = get_data(file, function(data) {
    // Using the data, turn it into data ready to be used for a bipartite graph
    // in data.js
    data1 = create_bipartite_data(data, 'Category', 'Service Provider');
    //data2 = create_bipartite_data(data, 'Category', 'Hosting');
    
    // An array of the bipartites graphs to create
    var bipartite_info = [ 
	{
	    // The two data-sets to use
	    data: bP.partData(data1, 2),
	    // The id that will be used for the bipartite graph
	    id: file.replace(/\s+|\..+/g, ''),  
	    // The headers, where the first two are sub-headers and the last the top header
	    header: ['Category', 'Service Provider', file.replace(/\..+/g, '')]  
	}, 
	/*{
	    data: bP.partData(data2, 2), 
	    id: 'Sales', 
	    header: ['Category', 'Hosting', file.replace(/\..+/g, '')]
	}*/
    ];
    
    // Create the bipartite graph
    bP.draw(bipartite_info);
});
 