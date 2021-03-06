var file = "MyCard Data Flows - Sheet1.csv";
var radius = 11;
var link_distance = 100;
var charge = -100;
var theta = 0.0;
var gravity = .00001;

// Fetch the data from the server
// in data.js
data = get_data(file, function(data){
	// Turn the data into a graph
	graph = get_graph(data);

	// Draw the graph
	draw_flow(graph);
    });

function draw_flow(graph) {
    // Set the height and width to the viewing window
    var height = $(window).height();
    var width = $(window).width();

    // Create a roulette of colors
    var fill = d3.scale.category20();

    // Set parameters for the force beween graph nodes
    var force = d3.layout.force()
	.size([width, height])
	.linkDistance(link_distance)
	.charge(charge)
	.theta(theta)
	.gravity(gravity)
	.on("tick", tick);
    
    // Create the SVG node
    var svg = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

    // Create the legend in upper-left corner
    var protocols = [];
    for (protocol in graph.protocols) { 
	protocols.push({
		"name": protocol,
		    "id": graph.protocols[protocol]
		    }); 
    }
    var legend = svg.append("g")
	.attr("class", "legend")
	.attr("translate", "0, 0");

    console.log(protocols);
    
    legend.selectAll(".legend")
	.data(protocols)
	.enter()
	.append("line")
	.attr("x2", 8)
	.style("stroke", function(d) { return d3.rgb(fill(d.id % 20)); });

    // Setup nodes being able to be dragged
    var drag = force.drag()
	.on("dragstart", dragstart);

    // Add the nodes to the force layout
    force.nodes(graph.nodes)
	.links(graph.links)
	.start();
    
    // Create the DOM nodes for the links
    var link = svg.selectAll(".link")
	.data(graph.links)
	.enter()
	.append("line")
	.attr("class", "link")
	.attr("title", function(d) { return d.purpose; })
	.style("stroke", function(d) { return d3.rgb(fill(d.index % 20)); });

    // Create a node for the nodes
    var node = svg.selectAll(".node")
	.data(graph.nodes)
	.enter()
	.append("g")
	.attr("class", "node")
	.call(drag)
	.on("dblclick", dblclick);
	
    // Inside the node, create a circle
    node.append("circle")
	.attr("class", function(d) { return d.name; })
	.attr("r", radius)
	.attr("cx", -8)
	.attr("cy" -8);
    

    // Inside the node, create text
    node.append("text")
	.attr("dx", 12)
	.attr("dy", ".35em")
	.text(function(d) { return d.name; });

    // Ends the positioning of nodes from dragging
    function dblclick(d) {
	d3.select(this).classed("fixed", d.fixed = false);
    }
    
    // Begins the positioning of nodes by dragging
    function dragstart(d) {
	d3.select(this).classed("fixed", d.fixed = true);
    }

    // Updates the simulation for the force layout
    function tick() {
	// Update the link
	link.attr("x1", function(d) { return d.source.x; })
	    .attr("y1", function(d) { return d.source.y; })
	    .attr("x2", function(d) { return d.target.x; })
	    .attr("y2", function(d) { return d.target.y; });
	
	// Update the node
	node.attr("transform", function(d) {
		return "translate(" + d.x + "," + d.y + ")"; 
	    });
    }
}

function get_graph(data) {
    // Figure out how many types of nodes and links here are
    var graph = {
	"nodes" : [],
	"links": [],
	"apps": {},
	"protocols": {}
    };
    var idn = 0, idl = 0;
    for (i in data) {
	if (typeof(graph.apps[data[i]['From']]) == 'undefined') {
	    graph.apps[data[i]['From']] = idn;
	    idn++;
	}
	if (typeof(graph.apps[data[i]['To']]) == 'undefined') {
	    graph.apps[data[i]['To']] = idn;
	    idn++;
	}
	if (typeof(graph.protocols[data[i]['Type']]) == 'undefined') {
	    graph.protocols[data[i]['Type']] = idl;
	    idl++;
	}
    }
    console.log(graph);
    
    // Create the nodes
    for (node in graph.apps) {
	graph.nodes.push({
		"name": node,
		    "index": graph.apps[node],
		    });
    }

    // Create the links
    for (i in data) {
	graph.links.push( {
		"type": data[i]['Type'],
		    "index": graph.protocols[data[i]['Type']],
		    "purpose": data[i]['Purpose'],
		    "source": graph.apps[data[i]['From']],
		    "target": graph.apps[data[i]['To']]
		    });
    }

    return graph;
}

function get_static_graph() {
    return {
	"nodes": [
		  {"x": 469, "y": 410},
		  {"x": 493, "y": 364},
		  {"x": 442, "y": 365},
		  {"x": 467, "y": 314},
		  {"x": 477, "y": 248},
		  {"x": 425, "y": 207},
		  {"x": 402, "y": 155},
		  {"x": 369, "y": 196},
		  {"x": 350, "y": 148},
		  {"x": 539, "y": 222},
		  {"x": 594, "y": 235},
		  {"x": 582, "y": 185},
		  {"x": 633, "y": 200}
		  ],
	    "links": [
		      {"source":  0, "target":  1},
		      {"source":  1, "target":  2},
		      {"source":  2, "target":  0},
		      {"source":  1, "target":  3},
		      {"source":  3, "target":  2},
		      {"source":  3, "target":  4},
		      {"source":  4, "target":  5},
		      {"source":  5, "target":  6},
		      {"source":  5, "target":  7},
		      {"source":  6, "target":  7},
		      {"source":  6, "target":  8},
		      {"source":  7, "target":  8},
		      {"source":  9, "target":  4},
		      {"source":  9, "target": 11},
		      {"source":  9, "target": 10},
		      {"source": 10, "target": 11},
		      {"source": 11, "target": 12},
		      {"source": 12, "target": 10}
  ]
	    };
}