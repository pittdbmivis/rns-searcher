var WIDTH = 800, // width of the graph
	HEIGHT = 2000, // height of the graph
	MARGINS = {top: 20, right: 20, bottom: 20, left: 60}, // margins around the graph
	xRange = d3.scale.linear().range([MARGINS.left, WIDTH - MARGINS.right]), // x range function
	yRange = d3.scale.linear().range([HEIGHT - MARGINS.top, MARGINS.bottom]), // y range function
	rRange = d3.scale.linear().range([5, 20]), // radius range function - ensures the radius is between 5 and 20
	/*colors = [	// array of colors for the keywords
		"#981C30",
		"#989415",
		"#1E4559",
		"#7F7274",
		"#4C4A12",
		"#ffffff",
		"#4B0612",
		"#1EAAE4",
		"#AD5E71",
		"#000000"
	],*/
	colors = [	// array of colors for the keywords
	"blue",
	"green",
	"skyblue",
	"red",
	"orange",
	"limegreen",
	"yellow", 
	"navy",
	"gold",
	"tan"
    ],
	//sparql_url = "http://localhost:8890/sparql-cors/?default-graph-uri=http%3A%2F%2Fufl.edu%2Fvivo-data%23&format=application/json&query=",
	sparql_url = "http://lnx02.dbmi.pitt.edu/fred/?default-graph-uri=http%3A%2F%2Fvivo.demo.org%2Fvivo%23&format=application/json&query=",
    
	w = 960,
    max_author_count = 20,
    author_lane_height = 100,
    linewidth = 3,
    h = author_lane_height * max_author_count,
    p = 30,
    //minDate = new Date('01\/01\/97'),
    minDate = new Date('01\/01\/2000'),
    maxDate = new Date('12\/31\/2012'),
    x = d3.time.scale().domain([new Date(2000, 0, 1), new Date(2010, 11, 30)]).range([125, w]),
    y,
    tooloffx = -194,
    tooloffy = -97,
    buboffx = -204,
    buboffy = -107,
    
	empty_topic_string = "No Keyword Selected",
	currentTopic, // name of the topic. Used to track when the topic changes
	keywordList =[empty_topic_string, empty_topic_string, empty_topic_string, empty_topic_string, empty_topic_string ], //the list of keyowrds selected in the checkbox
	rawAuthorData =[], // the raw data from SPARQL
	drawingAuthorData =[], //a filtered list of authors
	rawDocData =[], //the entire dataset
	drawingDocData =[], // to be shown on the screen, a filtered version of rawDocData
	followupList = [], //an array containing the list of the 
	xAxis = d3.svg.axis().scale(x).tickSize(-HEIGHT,0,0).ticks(15).orient('bottom').tickFormat(d3.time.format('%Y')), // x axis function
	xAxis2 = d3.svg.axis().scale(x).tickSize(2,0,0).ticks(15).orient('top').tickFormat(d3.time.format('%Y')), // x axis function
	yAxis = d3.svg.axis().scale(yRange).tickSize(10).orient("right").tickSubdivide(true);  // y axis function
/*	vis =  d3.select("body").append("svg:svg")
       .attr("class", "chart")
	   .attr("width", w + p * 2)
	   .attr("height", h + p * 2);
	   //.append("svg:g")
	   //.attr("transform", "translate(" + p + "," + p + ")");
*/
	

//runs once when the visualisation loads
function init () {
//	jQuery("#throbber").hide();
	vis = d3.select("#visualisation");

/*	var xAxis = vis.append("svg:g").append("svg:axis")
	//chart.append("svg:axis")
		.scale(x)
		.orient('bottom')
		.ticks(15)
		.tickFormat(d3.time.format('%Y'))
		.tickSize(6, 0, 0)
		;	    
*/
	
	// add in the top x axis
	vis.append("svg:g") // container element
		.attr("class", "x axis") // so we can style it with CSS
		.attr("transform", "translate(0,16)") // move into position
		.call(xAxis2); // add to the visualisation

	// add in the bottom x axis
	vis.append("svg:g") // container element
		.attr("class", "x axis") // so we can style it with CSS
		.attr("transform", "translate(0," + HEIGHT + ")") // move into position
		.call(xAxis); // add to the visualisation

/*
 *
 * 	vis = d3.select("#visualisation");
	// add in the x axis
	vis.append("svg:g") // container element
		.attr("class", "x axis") // so we can style it with CSS
		.attr("transform", "translate(0," + HEIGHT + ")") // move into position
		.call(xAxis); // add to the visualisation

	// add in the y axis
	vis.append("svg:g") // container element
		.attr("class", "y axis") // so we can style it with CSS
		.call(yAxis); // add to the visualisation

 */	
	
}

//call it!!
init();

//called every time a form field has changed
function update () {
	// filter the data according to the selections on the screen
	filterData();
	//redraw the resulting data
	redraw();
}

// helper function
function getDate(d) {
    return new Date(d.jsonDate);
}

//helper function
function convertToClass(d) {
	var temp = d.replace(/ /g,"_");
	temp = temp.replace(",","");
	return temp;
}

function convertToPercent(fraction) {
	fraction = fraction * 100;	
	return fraction.toFixed(1) + '%';
}

//draw the data to be shown on the screen

//NOTE: try adding author_lane_height to the y1 and y2 variables
//this should bump them down to the lower part of the lane instead of the top

function redraw() {
	y = d3.scale.linear().domain([0, max_author_count]).range([0, h]);
	var laneline = vis.selectAll("line.laneline").data(drawingAuthorData);
	laneline.enter()
		.append('line')
		.attr('x1', 125)
		.attr('class', 'laneline')
		.attr('y1', function(d,i) { return d3.round(y(i)) + 0.5 + author_lane_height; })
		.attr('x2', w-25)
		.attr('y2', function(d,i) { return d3.round(y(i)) + 0.5 + author_lane_height; })
		.attr('stroke', 'lightgray' )
	laneline.exit()
		.remove();
	
	var lanetext = vis.selectAll("text.lanetext").data(drawingAuthorData);
	lanetext.enter()
		.append('text')
		.attr('class', 'lanetext')
		.text(function(d) { return d.name; })
		.attr('y', function(d,i) { return y(i + .5); })
		.attr('dy', '0.5ex')
		.style("width", function(d) { return 300 + "px"; })
		.attr("bla", function(d) { if (d.has_grant === true) {
			addGrants(d); }
		})
		.on('click', function(d) 
			{$( "#dialog-form" )
			   .data('authorname', d.name )
			   .data('authorid', d.authorid )
			   .dialog( "open" );})

	lanetext.append("title")
    	.text(function(d) { 
    		var output = "TOP KEYWORDS:\n";
    		var keywords = getTopKeywords(decodeURIComponent(d.authoruri));
    		var keywordlen = keywords.length < 8 ? keywords.length : 8;
    		for (var i=0; i < keywordlen; i++) {
    			  output = output + keywords[i].keyword + "\n";
    		}
    		if (d.overview !== '') {
    		  output = output + "\nRESEARCH OVERVIEW\n" + d.overview;
    		} 
    		return output;
    	});
	lanetext.exit()
		.remove();
	
	var affiliationtext = vis.selectAll("text.affiliationtext").data(drawingAuthorData);
	affiliationtext.enter()
		.append('text')
		.attr('class', 'affiliationtext')
		.text(function(d) { 
			var affiliation = (d.authoruri.indexOf("ufl") != -1) ? 'University of Florida' : 'Cornell University';
			return affiliation; })
		.attr('y', function(d,i) { return y(i + .55) + 7; })
		.attr('dy', '0.5ex')
		.style("width", function(d) { return 300 + "px"; })
	affiliationtext.exit()
		.remove();
	
	addDocs();

}

function addAuthorToList(author_data) {
	followupList.push(author_data);
	drawFollowupList();
}

function removeAuthor(authorid) {
	//var i = followupList.indexOf(authorid);
	//followupList.splice(i,1);
	var i=0, index = -1;
	for (i=0; i < followupList.length; i++) {
		var currid = followupList[i].id;
		if (authorid == currid) {
			index = i;
		}
	}
	followupList.splice(index,1);
	drawFollowupList();
}

function drawFollowupList() {	
	$("#followuplist").children().remove();
	var container = $('#followuplist');
	var i=0;
	for (i=0; i < followupList.length; i++) {
		var html = '<ul title="Notes:\n' + followupList[i].notes +'"><img onclick="removeAuthor(\'' + followupList[i].id.trim() +'\');" src="images/delete_icon.gif" />' + followupList[i].name + '</ul>';
		container.append($(html));	
	}
}


function addGrants(author_data) {
	var author_id = author_data.authorid;
	var author_uri = decodeURIComponent(author_data.authoruri);

    var get_grant_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> SELECT distinct ?uri ?label ?rolelabel ?grantAdmin ?timeline_prop ?datetime "
    	     +" WHERE {?uri rdf:type vivo:Grant . ?uri rdfs:label ?label . ?uri vivo:relatedRole ?grantAdmin ."
             + " ?grantAdmin ?p <" + author_uri + "> . ?p rdfs:label ?rolelabel . ?uri vivo:dateTimeInterval  ?timeline . ?timeline ?timeline_prop ?time_entry .  ?time_entry vivo:dateTime ?datetime ." 
             +	" FILTER (str(?datetime) > '1999-01-01T00:00:00-04:00') } " 
             + "ORDER BY ?uri";

    
    var result = false;
    var grant_data_set = [];
	jQuery.ajax({ url: sparql_url + encodeURIComponent(get_grant_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){
			data.results.bindings.forEach (function (grant_data, index) {
				data_entry = {
						grantid : extractIdFromURI(grant_data.uri.value) + "_" + author_id,
				        title : grant_data.label.value,
						rolelabel : grant_data.rolelabel.value,
						is_start : grant_data.timeline_prop.value === "http://vivoweb.org/ontology/core#start" ? true : false ,
						datetime : grant_data.datetime.value
				};
				//edit the roles returned by VIVO:
				if (data_entry.rolelabel == "co-principal investigator role of") {
					data_entry.rolelabel = "Co-Principal Investigator";
				} else if (data_entry.rolelabel == "principal investigator role of") {
					data_entry.rolelabel = "Principal Investigator";
				} /*  This was just a check to see if there were other roles in the data
				  else {
					console.log("Found a new one: " + data_entry.rolelabel);
				}*/
				grant_data_set.push(data_entry);	
		   });
	   }
	});

	//to jitter these icons, perhaps have two icons (left and right) representing the
	//start and end of the grants
	var grantimage = vis.selectAll("image.grantimage").data(grant_data_set);
	var grant_count = grant_data_set.length;
	var grant_position = [];
	grantimage.enter()
    	.append('svg:image')
		.attr('class', 'author_grant_image')
		.attr('class', function(d) { return d.grantid; })
		.classed('author_grant_image', true)
		.attr("x", function(doc) {
       //hack to handle dates missing timezones
       var t_date = doc.datetime;
       if (t_date.indexOf('T') == -1) 
       {
         t_date = doc.datetime.substring(0,10) + 'T00:00:00-04:00';
       } 
return x(new Date(t_date)); })
		//I want to jitter the y value to avoid overlaps (as much as possible)
		.attr('y', function(d,i) {
			var grant_range = author_lane_height - 18;
			var grant_scale = d3.round(grant_range/grant_count);
			var index = i % 2 == 0 ? i : i-1;
			//remove the "n" from the start of the grantid
			//var grantid = d.grantid.substring(1);
			var y_value = grant_scale * index;
			return y(author_data.author_index) + y_value + 18;
		})
		.attr('width', 18)
		.attr('height', 18)
		.attr('opacity', 0.5)
		.on("mouseover", function(d){selectGrant(d);})
        .on("mouseout", function(d){deselectGrant(d);})
		.attr('xlink:href', function(d) { return d.is_start === true ? 'images/grant_left2.png' : 'images/grant_right2.png';});

	grantimage.append("title")
	  .text(function(d) {
		  var ret_text = d.title + ' \nRole: ' + d.rolelabel;
		  return ret_text;
	   });

	grantimage.exit()
	  .remove();
}

function selectGrant(p) {
	var grantid = p.grantid;
	var grantpair = d3.selectAll("." + grantid);
	jQuery.each(grantpair, function(index, value) {
		  var leftx = value[0].x.baseVal.value;
		  var rightx = value[1].x.baseVal.value;
		  if (rightx < leftx) {
			  leftx = rightx;
			  rightx = value[0].x.baseVal.value;
		  }
		  //problem: this line is picking up the css line class
		  var grantline = vis.append("svg:g")
		    .append("svg:line")
		    .attr('class', 'grantline')
		  	.attr('id', grantid)
		  	.attr('x1', leftx+ 6)
		  	.attr('x2', rightx + 12)
		  	.attr('y1',value[0].y.baseVal.value + 8)
		  	.attr('y2',value[0].y.baseVal.value + 8)
		  	.attr('stroke-width', '4')
		    .on("mouseover", function(){selectGrant(p);})
            .on("mouseout", function(){deselectGrant(p);})
            .attr('opacity', 0.5)
			.attr('stroke', '#4B9028' );
		  grantline.append("title")
			  .text(function(d) {return p.title + ' \nRole: ' + p.rolelabel;});		  	
	   });
	d3.selectAll("." + grantid).attr("opacity", 1.0);
}

function deselectGrant(p) {
	var grantid = p.grantid;
	d3.selectAll("." + grantid).attr("opacity", 0.5);
	d3.selectAll("#" + grantid).remove();
}



function addDocs() {
	//NOTE: The each is causing a problem.  The laneline is not being updated.
	//therefore, the each is not being called.
	
	//NOTE: Try creating each rect with keyword as their class
	//then delete the rects where class=keyword whenever a keyword is deselected
	
	//.each(addDocs)
	//I need to walk through each author
	d3.selectAll("rect.docs").remove();
	d3.selectAll("rect.totaldocs").remove();
	d3.selectAll("doctotaltext").remove();

	//var lane = d3.select(this);
	drawingAuthorData.forEach (function(author, index) {	
		var data = filterByAuthor(author);
		var docrect = vis.append('g').selectAll("rect.docs").data(data);
		var docwidth= 9;
		var min_docheight = 5;
		docrect.enter()
		 .append("svg:rect")
		 //adjust the x position and move it back a few pixels
		 .attr("x", function(doc) { 
			    //create an array to "jitter" the x position
			    //this jitter array positions the rectangles on either side
			    //of the first rectangle
			    var jitter = [0,-1,1,-2,2,-3,3];
	            var index = keywordList.indexOf(doc.keyword);
			    return x(new Date(doc.year))+ (jitter[index] * docwidth); })
		 .attr("y",function (doc) { 
			 			var i = d3.round(y(author.author_index));
			 			//try introducing a floor for the y value.  if doc.percentage is
			 			//less than 10%, then just subtract the height of the 
			 			//lane and floor height (5)
			 			var y_value = d3.round(i + (100-(doc.percentage*100))) +10;
			 			if (y_value > (i + author_lane_height)) {
			 				y_value = (i + author_lane_height) - min_docheight;
			 			}
			 			return y_value;
		 })
		// .attr("y", function (doc) {return d3.round(y(author.author_index)) + author_lane_height;})
		 .attr("height",function (doc) {
			    //set the height based on the percentage of docs, but put a "floor" on the value
	 			var rect_height = d3.round(doc.percentage*100)-10;
	 			return rect_height > 0 ? rect_height : min_docheight;
         })
		 .style("fill", function(doc) { 
			              var index = keywordList.indexOf(doc.keyword);
			              return colors[index];
		 })
		 .attr("width", docwidth)
		 //add a class representing the doc keyword
		 .attr('class', function(doc) { return convertToClass(doc.keyword); })
		 .attr('authorid', author.authorid)
		 .attr('year', function(doc) { return doc.year; })
		 .attr('opacity', 0.5)
        
		 .classed("docs", true);
		docrect.append("title")
		   .text(function(d) {
			   var output = '';
			   var docList = loadDocsByYear(this, decodeURIComponent(author.authoruri), d.year, d.keyword);
			   var plural = docList.length > 1 ? 's' : '';
			   //calculate the oveall number of docs for a given year
			   //using the percentage and number of docs with a matching keywords
			   var totalForYear = d3.round(docList.length/d.percentage);
			   output = docList.length + " Publication" + plural + " out of " + totalForYear + " for " + d.year.substring(0,4) + "\n";
			   jQuery.each(docList, function (index, value) { 
				   output = output + "\nTitle: " + value.title + "\n";
				   //output = output + "Journal: " + value.journaltitle + "\n";
			   });
			   return output;
		   });

	
		docrect.exit()
			.remove();

	});
}

function docmouseover(d, i) { 
/*	   var name = $(this).attr('name');
	   
	    var m = d3.svg.mouse(this); 
	    var fo = vis.append("svg:foreignObject")
	      .attr('x', m[0])
	      .attr('y', m[1])
	      .attr("width", 200)
	      .attr("height", 200)
	    fo.append("div")
	      .html("<span style='color:red'>Hello</span> <span style='color:blue'>world</span>!"); 
*/	}

function docmouseout(d, i) { 
	   d3.select("text.name") 
       .text("");
/*	   d3.select("text.name") 
	       .text(""); 
	   d3.select("text.pace") 
	       .text(""); 
	   d3.select("text.route") 
	       .text(""); 
	  d3.select("text.finaltime") 
	       .text(""); */
	   d3.select("rect.bub") 
	       .attr ("width", 0) 
	     .attr ("height" , 0); 
}

function docmousemove(d,i) { 
    var m = d3.svg.mouse(this); 
    tooloffx2 = tooloffx; 
    buboffx2 = buboffx; 
    // if x is to big, put the text on the other side of the mouse 
    if ( m[0] > 450 ) { 
        tooloffx2 = tooloffx - 176; 
        buboffx2 = buboffx -176; 
    } 
    d3.select("rect.bub") 
          .attr ("x", m[0] + buboffx2) 
        .attr ("y" , m[1] + buboffy); 
    d3.select("text.name") 
        .attr("x", m[0] + tooloffx2 ) 
        .attr("y", m[1] + tooloffy ); 
 /*   d3.select("text.route") 
        .attr("x", m[0] + tooloffx2 ) 
        .attr("y", m[1] + tooloffy + 16 ); 
    d3.select("text.pace") 
        .attr("x", m[0] + tooloffx2 ) 
        .attr("y", m[1] + tooloffy + 30 ); 
    d3.select("text.finaltime") 
        .attr("x", m[0] + tooloffx2 ) 
        .attr("y", m[1] + tooloffy + 44 );*/ 
}
//filter the dataset shown on the screen based on the selected
//checkboxes
function filterData() {
	var i=0;
	drawingDocData = []; //clear the filtered data array
	$("#keywordlist").children('ul').each(function () {
		var retList =[];
		var topic = this.textContent;
		if (this.textContent != empty_topic_string) {
			retList = rawDocData.filter(function (data_item) {
				return data_item['keyword'] == topic;  
			});
			drawingDocData = drawingDocData.concat(retList);
		}
	});
}

//generate an set of checkboxes.  Each checkbox contains a related topic to the main search_topic.
//The checkboxes are listed in alphabetic order.
function generateKeywordBoxes(search_topic) {
	 var sparql_part1 = "prefix vivo: <http://vivoweb.org/ontology/core#> select ?keyword count(?keyword) as ?keycount where { ?document_uri vivo:informationResourceInAuthorship ?author_uri . " 
		  +" ?author_uri vivo:linkedAuthor ?linked_author . ?document_uri vivo:freetextKeyword ?keyword . ?document_uri vivo:freetextKeyword '";
	  //var sparql_part2 = "'} order by DESC(?keycount)";
	  var sparql_part2 = "'} order by ?keyword";
	  var keyword_stats = new Array();
	  
	jQuery.ajax({ url: sparql_url + encodeURIComponent(sparql_part1 + search_topic + sparql_part2),
		async:false,
		dataType: 'json', 
		success: function(json){

		    $("#cblist").children().remove();
		    //return a list of 
			for (i=0; i< json.results.bindings.length;i++) {
				keyword_object = json.results.bindings[i];
				//remove very common topics
				//if (keyword_object.keyword.value != 'Humans') { 
				//  keyword_stats.push(keyword_object);
				//}
			   var container = $('#cblist');
			   var inputs = container.find('input');
			   var id = inputs.length+1;
			   
			   //don't add a checkbox for the search_topic
			   //that way, the user cannot uncheck the search topic
			   var checked = '';
			   if (search_topic != keyword_object.keyword.value) {
				   var html = '<li><input type="checkbox" id="cb'+i+'" value="'+keyword_object.keyword.value+'" onclick="changeKeyword(this.checked,\'' +  keyword_object.keyword.value +'\')" ' + checked + ' /> <label for="cb'+i+'">'+keyword_object.keyword.value+'</label></li>';
				   container.append($(html));
			   }
									

			}
			/* for( i=0; i < length; i++){
			  myArray[i];
			}*/  
			return keyword_stats; 
	   }
	});
	return keyword_stats;
}

function changeKeyword(isChecked, keyword) {
	if (isChecked) {
		selectKeyword(keyword);
	} else {
		removeKeyword(keyword);
	}
	//call update if it is the first time 
	//this is being called, otherwise just update the docs shown
	if (this.currentTopic === keyword) {
	  //update adds authors, grants, docs, etc.
	  update();
	} else {
	  //just update the docs
	  updateDocs();
	}
}

//just add documents to the screen.
//this function assumes the authors are already on the screen
function updateDocs() {
	// filter the data according to the selections on the screen
	filterData();
	addDocs();
    
}

//add a keyword to the first available space in the list of keywords
function selectKeyword(keyword) {
	var i=0;
	for (i=0; i < keywordList.length; i++) {
		if (keywordList[i] == empty_topic_string) {
			keywordList.splice(i,1,keyword);
			break;
		}
	}

	drawKeywordList();
}

//remove a keyword from the list of keywords
function removeKeyword(keyword) {
	var i = keywordList.indexOf(keyword);
	keywordList.splice(i,1,empty_topic_string);
	drawKeywordList();
	
	//remove the rects for the keyword
	var class_keyword = convertToClass(keyword);
	var docrect = vis.selectAll("rect." + class_keyword);
	docrect.remove();
	var doctext = vis.selectAll("text." + class_keyword);
	doctext.remove();
/*
 * 
 * 		var docrect = vis.append('g').selectAll("rect.docs").data(data);
		docrect.enter()
		 .append("svg:rect")
		 .attr("x", function(doc) { return x(new Date(doc.year)); })
		 .attr("y",d3.round(y(author.author_index)) - 25.5)
		 .attr("height", 15)
		 .style("fill", function(doc) { 
			              var index = keywordList.indexOf(doc.keyword);
			              return colors[index];
		 })
		 .attr("width", 40)
		 //add a class representing the doc keyword
		 .attr('class', function(doc) { return convertToClass(doc.keyword); })
		 //.attr(convertToClass(doc.keyword), true)
		 .classed("docs", true);

 */	
}

function drawKeywordList() {	
	$("#keywordlist").children().remove();
	var container = $('#keywordlist');
	var i=0;
	for (i=0; i < keywordList.length; i++) {
		var html = '<ul style="color:' + colors[i] +';">' + keywordList[i] + '</ul>';
		container.append($(html));	
	}
}

//given an author's id
function hasGrant(author_uri) {
	//prefix vivo: <http://vivoweb.org/ontology/core#> select count(distinct ?document_uri2) as ?doc_count ?year where { ?document_uri2 vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <http://vivo.ufl.edu/individual/n26873> . ?document_uri2 vivo:Year ?year  }
	//group by ?year 
	//"n3623" Ache, Barry W
    var has_grant_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> SELECT ?uri WHERE { ?uri rdf:type vivo:Grant . ?uri vivo:relatedRole ?grantAdmin . ?grantAdmin ?p <" + author_uri +"> .   } ";

    var result = false;
	jQuery.ajax({ url: sparql_url + encodeURIComponent(has_grant_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){
			data.results.bindings.forEach (function (grant_data, index) {
				result = true;	
		   });
	   }
	});
	return result;	
}

//clear all the existing data 
//from the screen
function clearData() {

	d3.select("#waiting").style.display = "block";
	//clear the backend data
    rawDocs = [];
    rawDocData = [];
    rawAuthorData =[];
    drawingDocData = [];
	keywordList =[empty_topic_string, empty_topic_string, empty_topic_string, empty_topic_string, empty_topic_string ];
    
    //clear visualizations
    vis.selectAll("line.laneline").remove();
    vis.selectAll("text.lanetext").remove();
    vis.selectAll("text.affiliationtext").remove();
    vis.selectAll("image.laneimage").remove();
    vis.selectAll("image.grantimage").remove();
    vis.selectAll("rect.docs").remove();
    vis.selectAll("rect.totaldocs").remove();
    vis.selectAll("rect.doctotaltext").remove();
    //I think this is removing the text from the axes...
    vis.selectAll("text.doctext").remove();
    vis.selectAll("image.author_grant_image").remove();
    
}


function processData (topic) {
	currentTopic = topic;

	//NOTE: I may need to set this to the rawAuthorData, then filter
	//the drawingAuthorData to remove authors with no matching docs
	//$("#visualisation").modal();
	//$.modal($("#meshtopic"));
	drawingAuthorData = loadAuthors(topic);
    generateKeywordBoxes(topic);
    changeKeyword(true, topic);

}

function extractIdFromURI(uri) {
	return uri.substring(uri.lastIndexOf('/')+1,uri.length);
}


//NOTE: in the Florida data dump, the set of papers with an abstract
//appears to be disjoint from the set of papers with a year
function loadDocsByYear(rect, authoruri, year, keyword) {

	var processed = [],
	currid = '',
	currindex = 0;
	var docs_for_year_sparql_query = "PREFIX vivo: <http://vivoweb.org/ontology/core#> SELECT DISTINCT ?document_uri ?title ?journaltitle ?year WHERE {?document_uri vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <"
			+ authoruri
			+ ">. ?document_uri <http://www.w3.org/2000/01/rdf-schema#label> ?title . OPTIONAL {  { ?document_uri vivo:Year ?year . } UNION { ?document_uri <http://vivoweb.org/ontology/core#dateTimeValue> ?datetime . ?datetime <http://vivoweb.org/ontology/core#dateTime> ?year } } . ?document_uri <http://purl.org/ontology/bibo/pmid> ?pubmedid ."
			+ " ?document_uri vivo:freetextKeyword '" + keyword + "' . "
			+ " OPTIONAL { ?document_uri vivo:hasPublicationVenue ?hasPublicationVenue . ?hasPublicationVenue <http://www.w3.org/2000/01/rdf-schema#label> ?journalTitle . }"
			+ " FILTER(str(?year) = '" + year + "') .}";

	jQuery.ajax({ url: sparql_url + encodeURIComponent(docs_for_year_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){

			data.results.bindings.forEach (function (doc_data, index) {
				var doc_info,
				rawDocs = [];
				doc_info = {
						title : doc_data.title.value,
				        journal : doc_data.journaltitle !== undefined ? doc_data.journaltitle.value : 'N/A',
				};
				processed.push(doc_info);
	
		   });
	   }
	});
	return processed;
}

function loadAuthors(search_topic) {
	var processed = [],
	currid = '',
	currindex = 0;
	// NOTE: I'm trying to use the DISTINCT keyword to remove repeated names
	// I also limit the number of authors returned to correspond with the space on 
	// the screen.  This should improve performance.
	//NOTE: After including the Cornell data, I had to modify this query.  I put an upper limit on the
	//character size of the ?overview.
	//NOTE: I also had to filter out documents where the keyword matches, but the document year is not set.  If
	//I don't include the ?year query and FILTER then some authors appear without any documents (because the ?year is null)
	//The FILTER also avoids returning authors with documents prior to 1999.
	var author_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> select distinct ?linked_author ?author_name bif:substring(?overview, 1, 2000) AS ?overview count(distinct ?document_uri2) AS ?doc_count where {?document_uri vivo:informationResourceInAuthorship ?author_uri . ?document_uri <http://purl.org/ontology/bibo/pmid> ?pubmedid . ?author_uri vivo:linkedAuthor ?linked_author .  ?linked_author <http://www.w3.org/2000/01/rdf-schema#label> ?author_name . ?document_uri vivo:freetextKeyword '"
			+ search_topic
			+ "'  . ?document_uri2 vivo:informationResourceInAuthorship ?author_uri . OPTIONAL {?linked_author <http://vivoweb.org/ontology/core#overview> ?overview .} OPTIONAL {?linked_author <http://vivoweb.org/ontology/core#researchOverview> ?overview .} "
			+ " OPTIONAL {  { ?document_uri2 vivo:Year ?year . } UNION { ?document_uri2 <http://vivoweb.org/ontology/core#dateTimeValue> ?datetime . ?datetime <http://vivoweb.org/ontology/core#dateTime> ?year } }" 
			+ " . FILTER (str(?year) > '1999-01-01T00:00:00-04:00') } group by ?linked_author ?author_name ?overview ORDER BY DESC[?doc_count]"
			+ " LIMIT " + max_author_count;


	jQuery.ajax({ url: sparql_url + encodeURIComponent(author_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){

			data.results.bindings.forEach (function (author_data, index) {
				var author_info,
				rawDocs = [];
				author_info = {
						authorid : extractIdFromURI(author_data.linked_author.value),
						authoruri : encodeURIComponent(author_data.linked_author.value),
				        name : author_data.author_name.value,
						overview : author_data.overview !== undefined ? author_data.overview.value : ''
				};
				//code to supress duplicates
				//the authors may have multiple names, but the id
				//is unique.  Since the author list is sorted,
				//keep track of the current id and compare to prior value
				if (currid !== author_info['authorid'] ) {
					author_info['author_index'] = currindex++;
					author_info['has_grant'] = hasGrant(decodeURIComponent(author_info['authoruri']));
				    processed.push(author_info);
				    currid = author_info['authorid'];
				    rawDocs = loadDocs(decodeURIComponent(author_info['authoruri']));
				    rawDocData = rawDocData.concat(rawDocs);
				}
	
		   });
	   }
	});
	return processed;
}


/*
 * NOTE: I need to make the year stuff OPTIONAL for the Cornell data.  Rework the
 * query to allow the ?year to come from either data source.  They
 * loaded the dates differently from the Florida data:
 * 
 * This works with Cornell data:
 * 
 * prefix vivo: <http://vivoweb.org/ontology/core#> select * where {
?document_uri2 vivo:informationResourceInAuthorship ?author_uri .
 ?author_uri vivo:linkedAuthor <http://vivo.med.cornell.edu/individual/cwid-fbeal> .  
?document_uri2 <http://vivoweb.org/ontology/core#dateTimeValue> ?o .
?o ?p1 ?o2.
 } 
 
 */


function loadDocs(author_uri) {
	var author_id = extractIdFromURI(author_uri);
	var processed = [],
	doc_count = [],
	keyword_count = [];
	doc_count = getDocCount(author_uri);
	keyword_count = getKeywordDocCount(author_uri);
	
	doc_count.forEach (function(total, index) {	
		var doc_percent, keywordyear_list = [];
		var currYear = total['year'];
		keywordyear_list = keyword_count.filter (function (keyword_total) {
			return keyword_total['year'] == currYear;
		});
		//need to do a for loop through year_list
		keywordyear_list.forEach (function(keyword, index) {
			doc_percent = {
				authorid : author_id,
				keyword : keyword['keyword'],
				percentage : keyword['doc_count']/total['doc_count'],
				year : keyword['year']				                                
			};
			processed.push(doc_percent);
		});

	});
	return processed;
}

//return the doc data for a given author
//and given the current set of keywords
function filterByAuthor(author) {
	var authordocs = [], retList = [];
	//first filter by author
	authordocs = rawDocData.filter (function (data_item) {
		return data_item['authorid'] == author.authorid;
	});
	//then filter by all current keywords
	var i=0;
	for (i=0;i<keywordList.length;i++) {
		var docKeyword =[];
		if (keywordList[i] != empty_topic_string) {
			docKeyword = authordocs.filter(function (data_item) {
				return data_item['keyword'] == keywordList[i] ;  
			});
			retList = retList.concat(docKeyword);
		}
	}
	return retList;

}

//return the doc data for a given author
function filterByAuthorKeyword(author_id, keyword, data) {
	var retList = [];
	retList = data.filter (function (data_item) {
		return data_item['authorid'] == author_id && data_item['keyword'] == keyword;
	});
	return retList;
}


//get the count of all documents per year for a given author
//assemble the results into a table with the doc count and year
//for instance: 2010, 10
//this data is used to cacluate the height (using a percentage) of the rectangles
function getDocCount(author_uri) {
	//prefix vivo: <http://vivoweb.org/ontology/core#> select count(distinct ?document_uri2) as ?doc_count ?year where { ?document_uri2 vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <http://vivo.ufl.edu/individual/n26873> . ?document_uri2 vivo:Year ?year  }
	//group by ?year
	var processed = [];
    var doc_count_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> select count(distinct ?document_uri2) as ?doc_count ?year "
    	  + "where { ?document_uri2 vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <" + author_uri +"> . OPTIONAL {  { ?document_uri2 vivo:Year ?year . } UNION { ?document_uri2 <http://vivoweb.org/ontology/core#dateTimeValue> ?datetime . ?datetime <http://vivoweb.org/ontology/core#dateTime> ?year } } "
    	  + ". FILTER (str(?year) > '1999-01-01T00:00:00-04:00') .} group by ?year";

	jQuery.ajax({ url: sparql_url + encodeURIComponent(doc_count_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){

			data.results.bindings.forEach (function (doc_data, index) {
				var document;
				if (doc_data.year != null) {
					document = {
							year : doc_data.year.value,
					        doc_count : doc_data.doc_count.value
					};
				processed.push(document);
				}
	
		   });
	   }
	});
	return processed;
}

//get the count of all documents per year for a given author for a given keyword
//for instance: 2010, 5, "genomics"
//these counts are used to create the rectangles in the display
function getKeywordDocCount(author_uri) {
	var processed = [];
    var doc_count_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> select count(distinct ?document_uri2) as ?doc_count ?keyword ?year where { ?document_uri2 vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <" + author_uri +"> "
     +". OPTIONAL {  { ?document_uri2 vivo:Year ?year . } UNION { ?document_uri2 <http://vivoweb.org/ontology/core#dateTimeValue> ?datetime . ?datetime <http://vivoweb.org/ontology/core#dateTime> ?year } } . ?document_uri2 vivo:freetextKeyword ?keyword  } group by ?keyword ?year";

	jQuery.ajax({ url: sparql_url + encodeURIComponent(doc_count_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){

			data.results.bindings.forEach (function (doc_data, index) {
				//if (doc_data.year != null) {
					var document;
					document = {
							year : (doc_data.year != null) ? doc_data.year.value : '',
					        doc_count : doc_data.doc_count.value,
					        keyword : doc_data.keyword.value
					};
					processed.push(document);
				//}
		   });
	   }
	});
	return processed;
}

//get the top keywords for a given author
//for example: 5, "genomics"
function getTopKeywords(author_uri) {
	var processed = [];
    var doc_count_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> select count(distinct ?document_uri2) as ?doc_count ?keyword where { ?document_uri2 vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <" + author_uri +"> "    
    +". OPTIONAL {  { ?document_uri2 vivo:Year ?year . } UNION { ?document_uri2 <http://vivoweb.org/ontology/core#dateTimeValue> ?datetime . ?datetime <http://vivoweb.org/ontology/core#dateTime> ?year } } . ?document_uri2 vivo:freetextKeyword ?keyword  .  FILTER (str(?year) > '1999-01-01T00:00:00-04:00') } group by ?keyword order by DESC[?doc_count]";

	jQuery.ajax({ url: sparql_url + encodeURIComponent(doc_count_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){

			data.results.bindings.forEach (function (doc_data, index) {
					var document;
					document = {
					        doc_count : doc_data.doc_count.value,
					        keyword : doc_data.keyword.value
					};
					processed.push(document);
		   });
	   }
	});
	return processed;
}

function getDocCountByYear(author_uri) {
	var processed = [];
    var doc_count_sparql_query = "prefix vivo: <http://vivoweb.org/ontology/core#> select distinct ?year count(distinct ?document_uri) AS ?doc_count "
    	 + " where {?document_uri vivo:informationResourceInAuthorship ?author_uri . ?author_uri vivo:linkedAuthor <" + author_uri +"> . ?document_uri <http://purl.org/ontology/bibo/pmid> ?pubmedid "
    	 + ". OPTIONAL {  { ?document_uri vivo:Year ?year . } UNION { ?document_uri <http://vivoweb.org/ontology/core#dateTimeValue> ?datetime . ?datetime <http://vivoweb.org/ontology/core#dateTime> ?year } }  } group by ?year";

	jQuery.ajax({ url: sparql_url + encodeURIComponent(doc_count_sparql_query),
		async:false,
		dataType: 'json', 
		success: function(data){

			data.results.bindings.forEach (function (doc_data, index) {
				if (doc_data.year != null) {
					var document;
					document = {
							year : doc_data.year.value,
					        doc_count : doc_data.doc_count.value,
					};
					processed.push(document);
				}
		   });
	   }
	});
	return processed;
}

