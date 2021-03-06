    var owner = 'Owner/Category';
    var type = 'Type';

//var columns = ['Type', 'Owner/Category', 'Functional Contact', 'SME(s)', 'Servers', 'DBMS', 'Programming Language',
//	       'Vendor Name/Contact'];
var columns = ['Category', 'Service Provider', 'Hosting'];

var histogram = {};
for(i in columns){histogram[columns[i]] = {};}

// Use AJAX to get the CSV file
$.get("get_csv.php", function(csv_file) {
    // Parse the CSV file step by step
    Papa.parse(csv_file, {
	header: true,
	step: function(row) {
	    update_histogram(row.data[0]);
	},
	complete: function(results) {
	    create_sidebar();
	    create_bar_chart('.chart', histogram[columns[0]]);
	}
    });
});

// Create the sidebar for querying which field to use
function create_sidebar() {
    // Add each column of the histogram to the sidebar
    var sidebar = $('.nav.nav-sidebar');
    for(column in histogram) {
	sidebar.append('<li><a href="#">'+column+'</a></li>');
    }

    // Make the first one active
    $('.nav.nav-sidebar li:first-child').addClass('active');

    // Add an event to all the categories
    $('.nav.nav-sidebar li').click(function() {
	// Determine the column clicked
	var col = this.children[0].innerHTML;

	// Create a new chart
	$('.chart').empty();
	create_bar_chart('.chart', histogram[col]);
    
	// Update which sidebar was selected
	$('.nav.nav-sidebar li.active').toggleClass('active');
	$(this).toggleClass('active');
				  
    });
}

// Updates a histogram
function update_histogram(row) {
    // Add each category to an associate array to count
    for(column in histogram) {
	var cell = row[column];
	if(cell.trim().length != 0) {
	    if(isNaN(histogram[column][cell])) {
		histogram[column][cell] = 1;
	    } else {
		histogram[column][cell]++;
	    }	
	}
    }
}

function merge_sort_copy(A, B, begin, end) {
    for(var i = begin; i < end; i++) {
	A[i] = B[i];
    }
}

function merge_sort_combine(A, begin, middle, end, B, histogram) {
    var left = begin;
    var right = middle+1;
    for(var j = begin; j <= end; j++) {
	if(left <= middle && (right > end || histogram[A[left]] >= histogram[A[right]])) {
	    B[j] = A[left];
	    left++;
	} else {
	    B[j] = A[right];
	    right++;
	}
    }
}

function merge_sort_split(A, begin, end, B, histogram) {
    if((end+1) - (begin+1) == 0) return;

    var middle = Math.floor((end + begin) / 2.0);
    merge_sort_split(A, begin, middle, B, histogram);
    merge_sort_split(A, middle+1, end, B, histogram);
    merge_sort_combine(A, begin, middle, end, B, histogram);
    merge_sort_copy(A, B, begin, end);
}

function merge_sort(A, B, histogram) {
    return merge_sort_split(A, 0, A.length-1, B, histogram);
}

function get_sorted_keys(histogram) {
    // Obtain the keys
    var keys = [];
    $.each(histogram, function(key) { keys.push(key); });   

    // Perform a simple merge sort
    var sorted_keys = [];
    sorted_keys.length = keys.length;
    merge_sort(keys, sorted_keys, histogram);
    return sorted_keys;
}

var margin, width, height, x, y, xAxis, yAxis, x_max;
// Creates a chart based of a histogram
function create_bar_chart(chart_dom, histogram) {
    // Obtain the keys and the maximum value
    var x_keys = get_sorted_keys(histogram);
    x_max = d3.max(x_keys, function(key) { return histogram[key]; });
    x_max = Math.ceil(x_max/10)*10;

    // parameters used for creation of the chart
    var margin = {top: 30, 
		  right: 100, 
		  bottom: 0, 
		  left: 10};    
    var width = x_max * Math.sqrt(10000/x_max) - margin.right - margin.left;
    var height = x_keys.length * Math.sqrt(10000/x_keys.length) - margin.top - margin.bottom;

    // The x and y domain/range
    x = d3.scale.linear()
	.range([0, width])
	.domain([0, x_max]);

    y = d3.scale.ordinal()
	.rangeRoundBands([0,height], .1)
	.domain(x_keys);

    // Create the x-axis
    xAxis = d3.svg.axis()
	.scale(x)
	.orient('top')
	.ticks(Math.ceil(x_max / Math.sqrt(x_max)))
	.tickSize(-height);

    // Create the y-axis
    yAxis = d3.svg.axis()
	.scale(y)
	.orient('right')
	.tickSize(0);

    // Create a bar chart
    var chart = d3.select(chart_dom)
	.attr('width', width + margin.left + margin.right)
	.attr('height', height + margin.top + margin.bottom)
	.append('g')
	.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');

    // Append a rectangle to fill in a background-color
    chart.append('rect')
	.attr('class', 'chart-background')
	.attr('height', height)
	.attr('width', width);

    // Append the x-axis
    var gx = chart.append('g')
	.attr('class', 'x axis')
	.call(xAxis);

    gx.selectAll("g")
	.filter( function(d) { return d; })
	.classed("minor", true);

    gx.selectAll('text')
	.attr('x', 4)
	.attr('dx', -4);
    
    // Create the bars
    var bar = chart.selectAll('.bar')
	.data(x_keys)
	.enter().append('g')
	.attr('transform', function(d, i) { return 'translate(0,' + y(d) + ')'; });

    bar.append('rect')
	.attr('class', 'bar')
	.attr('width', function(d) { return x(histogram[d]); })
	.attr('height', y.rangeBand());
    
    // Append the y-axis
    chart.append('g')
	.attr('class', 'y axis')
	.call(yAxis);
}