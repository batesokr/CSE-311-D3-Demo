/** 
  Code taken from http://bl.ocks.org/NPashaP/9796212
  and augmented by Keith Batesole (2014)
 
  Code is meant to provide helper functions in
  creating a bipartite graph. 
*/

// Create an anonymous function and calling it
!function(){
    // The class containing all information on the bipartite graph
    var bP={};
    
    // Attributes for creating the bipartite graph
    var width = 1100, height = 610, margin ={b:0, t:40, l:170, r:100};

    // Various configurations for calcuating the position of the bipartite graph
    var b=30, bb=150, buffMargin=1, minHeight=14;

    // The relative positions for the three columns (bar title, count, percentage)
    var c1=[-130, 40], c2=[-50, 200], c3=[-10, 250]; 

    // The colors of each main bar
    var colors =["#3366CC", "#DC3912", "#FF9900","#109618", "#990099", "#0099C6"];

    // The duration used for transitions
    var duration = 400;

    /*
      Given two data-sets, creates a cross-product and fills
      it with the data. 
     
      Data is an array of data, which itself is an array of values
     
      p is the value that maps between two nodes of the bipartite graph
    */
    bP.partData = function(data, p){
	var sData={};
	
	// The two sets of keys, on for each side of the bipartite graph, 
	// where the keys are sorted
	sData.keys = [
	    d3.set(
		data.map(function(d){ return d[0]; })
	    ).values().sort(function(a, b){ 
		    return ( a<b ? -1 : a>b ? 1 : 0);
		}),
	    
	    d3.set(
		data.map(function(d){ return d[1]; })
	    ).values().sort(function(a, b){ return ( a<b ? -1 : a>b ? 1 : 0);})
	];

	// Create a cross-product of both keys with default values
	sData.data = [
	    sData.keys[0].map( function(d){ 
		return sData.keys[1].map( function(v){ return 0; }); 
	    }),
	    
	    sData.keys[1].map( function(d){ 
		return sData.keys[0].map( function(v){ return 0; }); 
	    }) 
	];
	
	// Fill in the cross product with the data values
	data.forEach(function(d){ 
	    sData.data[0][
		sData.keys[0].indexOf(d[0])
	    ][
		sData.keys[1].indexOf(d[1])
	    ] = d[p];
	    
	    sData.data[1][
		sData.keys[1].indexOf(d[1])
	    ][
		sData.keys[0].indexOf(d[0])
	    ] = d[p]; 
	});
	
	// Return the cross product of values, which serves as the data
	// for the bipartite graph
	return sData;
    }
    
    
    /*
      Given the cross product of two data sets, it
      fills in the SVG template with the bipartite
      graph. 

      data may contain multiple cross products so
      multiple bipartite graphs may be made. 

      SVG is the DOM element for the SVG template
      to be filled in. 

      _colors is the colors to use for the bars

      _duration is the duration to use for the transitions
     */
    bP.draw = function(data, _colors, _duration){
	// Set the colors and duration if passed in
	colors = (typeof _colors !== 'undefined' ? _colors : colors);
	duration = (typeof _duration !== 'undefined' ? _duration : duration);
	
	// Creation an SVG node which will contain the bipartite graph
	var svg = d3.select("body")
	    .append("svg")
	    .attr('width', width)
	    .attr('height', (height + margin.b +margin.t))
	    .append("g")
	    .attr("transform", "translate(" + margin.l + "," + margin.t + ")");
	
	// Iterates through each cross product
	data.forEach(function(biP, s){
	    // Creates a container node for the bipartite graph
	    svg.append("g")
		.attr("id", biP.id)
		.attr("transform","translate("+ (550*s)+",0)");
	    
	    // Calculate the data needed to draw the bipartite graph
	    var visData = visualize(biP.data);

	    // Draw the two bars
	    drawPart(visData, biP.id, 0);
	    drawPart(visData, biP.id, 1);

	    // Draw the edges
	    drawEdges(visData, biP.id);

	    // Draw the header
	    drawHeader(biP.header, biP.id);
	    
	    // Add callbacks for hover animations
	    [0,1].forEach(function(p){
		d3.select("#" + biP.id)
		    .select(".part" + p)
		    .select(".mainbars")
		    .selectAll(".mainbar")
		    .on("mouseover",function(d, i){ 
			return bP.selectSegment(data, p, i); 
		    })
		    .on("mouseout",function(d, i){ 
			return bP.deSelectSegment(data, p, i); 
		    });
	    });
	});
    }
    
    // Callback when a main-bar is moused over
    // Data is the two data sets used for creating the bipartite graph
    // m is whether it is the left or right side (0 or 1)
    // s is which mainbar it is (id)
    bP.selectSegment = function(data, m, s){
	data.forEach(function(k){
	    // Create a new bipartite graph based on the selected main-bar zoomed in
	    var newdata =  {keys: [], data: []};

	    newdata.keys = k.data.keys.map( function(d){ return d;});
	    
	    newdata.data[m] = k.data.data[m].map( function(d){ return d;});
	    
	    // Filter the other side from the selected main-bar based on the main-bar
	    newdata.data[1-m] = k.data.data[1-m].map( function(v){ 
		return v.map(function(d, i) { 
		    return (s == i ? d : 0);
		});
	    });
	    
	    // Calculate the positions for a new bipartite graph based on the main-bar selected 
	    // and transition to it
	    transition(visualize(newdata), k.id);
	    
	    // Select the main-bar that is hovered over
	    var selectedBar = d3.select("#" + k.id)
		.select(".part" + m)
		.select(".mainbars")
		.selectAll(".mainbar")
		.filter(function(d, i){ return (i == s); });
	    
	    // Change the style of the main bar selected
	    selectedBar.select(".mainrect").style("stroke-opacity",1);
	    selectedBar.select(".barlabel").style('font-weight','bold');
	    selectedBar.select(".barvalue").style('font-weight','bold');
	    selectedBar.select(".barpercent").style('font-weight','bold');
	});
    }
    
    // Callback when a main-bar is moused out
    // Data is the two data sets used for creating the bipartite graph
    // m is whether it is the left or right side (0 or 1)
    // s is which mainbar it is
    bP.deSelectSegment = function(data, m, s){
	data.forEach(function(k){
	    // Transition back to the original bipartite graph
	    transition(visualize(k.data), k.id);
	    
	    // Select the main-bar that was hovered over
	    var selectedBar = d3.select("#"+k.id).select(".part"+m).select(".mainbars")
		.selectAll(".mainbar").filter(function(d,i){ return (i==s);});
	    
	    // Change the main-bar back to the way it was
	    selectedBar.select(".mainrect").style("stroke-opacity",0);
	    selectedBar.select(".barlabel").style('font-weight','normal');
	    selectedBar.select(".barvalue").style('font-weight','normal');
	    selectedBar.select(".barpercent").style('font-weight','normal');
	});
    }


/*
 *******************************************************
 HELPER FUNCTIONS 
 ******************************************************
*/

    function visualize(data){

	// Object that holds the data on how to create the bipartite graph
	var vis ={};

	// Calculate the positions needed for placing the bipartite graph
	// a is the sum of values for each entry in a data set
	// s is 
	// e is the height
	// b is the buffer
	// m is the minimum height
	function calculatePosition(a, s, e, b, m){
	    var total=d3.sum(a);
	    var sum=0, neededHeight=0, leftoverHeight= e-s-2*b*a.length;
	    var ret =[];
	    
	    // Iterate through the sum of each entry
	    a.forEach(function(d){ 
		var v = {};
		// Calculate the percentage of the total sum each entry takes up
		v.percent = (total == 0 ? 0 : d/total); 
		// The total sum of the entry
		v.value=d;
		// Calculate the height for this entry
		v.height = Math.max(v.percent*(e-s-2*b*a.length), m);
		( v.height == m ? leftoverHeight -= m : neededHeight += v.height );
		// Push the calculated positions for this entry 
		ret.push(v);
	    });
	    
	    // How much to scale if the calculated height needed is above what was estimated
	    var scaleFact = leftoverHeight / Math.max(neededHeight,1), sum=0;
	    
	    // Iterate through each calculated position of an entry, recalculating based on the scale
	    ret.forEach(function(d){ 
		d.percent = scaleFact * d.percent; 
		d.height = (d.height == m ?  m : d.height*scaleFact);
		d.middle = sum + b + d.height/2;
		d.y = s + d.middle - d.percent*(e-s-2*b*a.length)/2;
		d.h = d.percent * (e-s-2*b*a.length);
		d.percent = (total == 0 ? 0 : d.value/total);
		sum += 2*b+d.height;
	    });
	    
	    // Return the calculated positions for each entry
	    return ret;
	}

	// Calculate the positions for the two bars from the two data sets, one for each side
	vis.mainBars = [ 
	    // The first data set
	    calculatePosition( data.data[0].map(function(d){ return d3.sum(d);}), // The sum of each entry 
			       0, 
			       height, 
			       buffMargin, 
			       minHeight),
	    // The second data set
	    calculatePosition( data.data[1].map(function(d){ return d3.sum(d);}), // The sum of each entry 
			       0, 
			       height, 
			       buffMargin, 
			       minHeight)
	];
	
	// Create the subBars that make up each bar for each side
	vis.subBars = [[],[]];
	vis.mainBars.forEach(function(pos,p) {
	    pos.forEach(function(bar, i) {
		calculatePosition(data.data[p][i], bar.y, bar.y+bar.h, 0, 0).forEach(function(sBar,j){ 
		    // Key 1 and key 2 map between the two data sets
		    sBar.key1 = (p==0 ? i : j); 
		    sBar.key2 = (p==0 ? j : i); 
		    vis.subBars[p].push(sBar); 
		});
	    });
	});

	// Sort the subbars by key1 then by key2
	vis.subBars.forEach(function(sBar){
	    sBar.sort(function(a,b){ 
		return (a.key1 < b.key1 ? -1 : (
		    a.key1 > b.key1 ? 1 : (
			a.key2 < b.key2 ? -1 : (
			    a.key2 > b.key2 ? 1: 0 
			)
		    )
		))
	    });
	});
	
	// Create the edges between each sub-bar
	vis.edges = vis.subBars[0].map(function(p,i){
	    return {
		key1: p.key1,
		key2: p.key2,
		y1: p.y,
		y2: vis.subBars[1][i].y,
		h1: p.h,
		h2: vis.subBars[1][i].h
	    };
	});

	// The keys for the two data sets
	vis.keys = data.keys;

	// Return the object needed to create the visualization
	return vis;
    }
    
    // Draws the bars
    // Data is the calculations used to draw the bars
    // id is the id for the container node for the bipartite graph
    // p is the id for the side being drawn, 0 for left, 1 for right
    function drawPart(data, id, p){
	// Adds a container node to the container node for all bars being drawn, both main bars and sub-bars
	d3.select("#" + id)
	    .append("g")
	    .attr("class", "part" + p)
	    .attr("transform", "translate("+( p*(bb+b))+",0)");
	
	// Add a container node inside the container node for the main bars
	d3.select("#" + id)
	    .select(".part" + p)
	    .append("g").
	    attr("class", "subbars");
	
	// Add a container node inside the container node for the bars for the sub-bars
	d3.select("#" + id)
	    .select(".part" + p)
	    .append("g")
	    .attr("class", "mainbars");
	
	// Add each bar, add a container node
	var mainbar = d3.select("#" + id)
	    .select(".part" + p)
	    .select(".mainbars")
	    .selectAll(".mainbar")
	    .data(data.mainBars[p])
	    .enter()
	    .append("g")
	    .attr("class","mainbar");

	// Create the rectangle for each bar
	mainbar.append("rect")
	    .attr("class", "mainrect")
	    .attr("x", 0)
	    .attr("y", function(d){ return d.middle - d.height/2; })
	    .attr("width", b)
	    .attr("height", function(d){ return d.height; })
	    .style("shape-rendering", "auto")
	    .style("fill-opacity", 0)
	    .style("stroke-width", "0.5")
	    .style("stroke", "black")
	    .style("stroke-opacity", 0);
	
	// Add the title to the bar
	mainbar.append("text")
	    .attr("class", "barlabel")
	    .attr("x", c1[p]) // positions for column 1
	    .attr("y", function(d){ return d.middle + 5;})
	    .text(function(d, i){ return data.keys[p][i];})
	    .attr("text-anchor", "start");
	
	// Add the total count to the bar
	mainbar.append("text")
	    .attr("class", "barvalue")
	    .attr("x", c2[p]) // positions for column 2
	    .attr("y",function(d){ return d.middle + 5;})
	    .text(function(d, i){ return d.value ;})
	    .attr("text-anchor", "end");
	
	// Add the percentage to the bar
	mainbar.append("text")
	    .attr("class", "barpercent")
	    .attr("x", c3[p]) // positions for column 3
	    .attr("y", function(d){ return d.middle + 5;})
	    .text(function(d, i){ return "( " + Math.round(100 * d.percent) + "%)" ;})
	    .attr("text-anchor","end")
	    .style("fill","grey");
	
	// Create the rectangles for the sub-bars
	d3.select("#"+id).
	    select(".part" + p)
	    .select(".subbars")
	    .selectAll(".subbar")
	    .data(data.subBars[p])
	    .enter()
	    .append("rect")
	    .attr("class", "subbar")
	    .attr("x", 0).
	    attr("y", function(d){ return d.y})
	    .attr("width",b)
	    .attr("height", function(d){ return d.h})
	    .style("fill", function(d){ return colors[d.key1]; });
    }
    
    // Draws the edges between each sub-bar
    // data is the calculations for drawing the bipartite graph
    // id is the id to the container node for the bipartite graph
    function drawEdges(data, id){
	// Create a container node for the edges
	d3.select("#"+id)
	    .append("g")
	    .attr("class", "edges")
	    .attr("transform", "translate(" + b + ",0)");

	// Draws each edge
	d3.select("#" + id)
	    .select(".edges")
	    .selectAll(".edge")
	    .data(data.edges)
	    .enter()
	    .append("polygon")
	    .attr("class", "edge")
	    .attr("points", edgePolygon)
	    .style("fill", function(d){ return colors[d.key1]; })
	    .style("opacity", 0.5)
	    .each(function(d) { this._current = d; });
    }
    
    // Helper function is creating the polygon representing an edge between two sub-bars
    // d is the sub-bar
    function edgePolygon(d){
	return [0, d.y1, 
		bb, d.y2, 
		bb, d.y2 + d.h2, 
		0, d.y1 + d.h1]
	    .join(" ");
    }

    // Draws the header
    // header is the name of the bipartite graph
    // id is the id to the container node
    function drawHeader(header, id){
	// Create the text for the header
	d3.select("#" + id)
	    .append("g")
	    .attr("class", "header")
	    .append("text")
	    .attr("x", 108)
	    .attr("y", -20)
	    .text(header[2])
	    .style("font-size", "20")
	    .style("text-anchor", "middle")
	    .style("font-weight", "bold");
	
	// Draw a sub-header for each side of the bipartite graph
	[0,1].forEach(function(d){
	   // Create a container node for the sub-header
	    var h = d3.select("#" + id)
		.select(".part" + d)
		.append("g")
		.attr("class", "header");
	    
	    // Create the header text for column 1
	    h.append("text")
		.text(header[d])
		.attr("x", (c1[d] - 5))
		.attr("y", - 5)
		.style("fill", "grey");
	    
	    // Create the header text for column 2 and 3
	    h.append("text")
		.text("Count")
		.attr("x", (c2[d] - 10))
		.attr("y", - 5)
		.style("fill", "grey");
	    
	    // Draw a line underneath the sub-header
	    h.append("line")
		.attr("x1", c1[d] - 10)
		.attr("y1", - 2)
		.attr("x2", c3[d] + 10)
		.attr("y2", -2)
		.style("stroke", "black")
		.style("stroke-width", "1")
		.style("shape-rendering", "crispEdges");
	});
    }

    // Transition between two bipartite graphs - i.e. when a main-bar is hovered over
    // Data is the calculations for the new bipartite graph
    // id is the cotainer node for the bipartite graph
    function transition(data, id){
	// Transition each side of the bipartite graph then the edges
	transitionPart(data, id, 0);
	transitionPart(data, id, 1);
	transitionEdges(data, id);
    }

    // Transition a side of the bipartite graph
    // data is the calcuations for the new bipartite graph
    // id is the container node for the bipartite graph
    // p is which side of the bipartite graph (0 for left, 1 for right)
    function transitionPart(data, id, p){
	// Select all the main-bars of a particular side
	var mainbar = d3.select("#" + id)
	    .select(".part" + p)
	    .select(".mainbars")
	    .selectAll(".mainbar")
	    .data(data.mainBars[p]);
	
	// Transition the position and size of the main-bars
	mainbar.select(".mainrect")
	    .transition()
	    .duration(duration)
	    .attr("y", function(d){ return d.middle - d.height/2; })
	    .attr("height", function(d){ return d.height;});
	
	// Transition the position of main-bar titles
	mainbar.select(".barlabel")
	    .transition()
	    .duration(duration)
	    .attr("y", function(d){ return d.middle+5; });
	
	// Transition the positions and text of the main-bar count
	mainbar.select(".barvalue")
	    .transition()
	    .duration(500)
	    .attr("y", function(d){ return d.middle + 5;})
	    .text(function(d, i){ return d.value ;});
	
	// Transition the position and text of the main-bar percentage
	mainbar.select(".barpercent")
	    .transition()
	    .duration(500)
	    .attr("y", function(d){ return d.middle + 5;})
	    .text(function(d, i){ return "( " + Math.round(100 * d.percent) + "%)" ;});
	
	// Transition the position and size of the sub-bars
	d3.select("#"+id)
	    .select(".part" + p)
	    .select(".subbars")
	    .selectAll(".subbar")
	    .data(data.subBars[p])
	    .transition()
	    .duration(duration)
	    .attr("y", function(d){ return d.y })
	    .attr("height", function(d){ return d.h });
    }
    
    // Transition a side of the bipartite graph
    // data is the calcuations for the new bipartite graph
    // id is the container node for the bipartite graph
    function transitionEdges(data, id){
	// Create a new container node for the edges
	d3.select("#" + id)
	    .append("g")
	    .attr("class", "edges")
	    .attr("transform", "translate(" + b + ",0)");

	// Transition to the new edges
	d3.select("#" + id)
	    .select(".edges")
	    .selectAll(".edge")
	    .data(data.edges)
	    .transition()
	    .duration(duration)
	    .attrTween("points", arcTween)
	    .style("opacity", function(d){ 
		return (d.h1 == 0 || d.h2 == 0 ? 0 : 0.5);
	    });
    }

    // Helper function in transitioning between edges
    // a is the new edge
    function arcTween(a) {
	// create an interpolation between two edges
	var i = d3.interpolate(this._current, a);
	this._current = i(0);  
	return function(t) {
	    return edgePolygon(i(t));
	};
    }

    // Creating a bP object
    this.bP = bP;
}();