var width = 960,
    height = 500;

var centroid = d3.geo.path()
    .projection(function(d) { return d; })
    .centroid;


//set up projections for both maps
var projection = d3.geo.orthographic()
    .scale(248)
    .clipAngle(90);

var projection1 = d3.geo.equirectangular()
    .translate([width / 2, height / 2])
    .scale(160); 


//create path generators for each projection
var path = d3.geo.path()
    .projection(projection);

var path1 = d3.geo.path()
    .projection(projection1);



//create graticules (latitude/longitude lines)
var graticule = d3.geo.graticule()
    .extent([[-180, -90], [180 - .1, 90 - .1]]);

var graticule1 = d3.geo.graticule()
      .extent([[-180, -90], [180 - .1, 90 - .1]])
      .step([10,10]);



//append svg to both div
var svg = d3.select("#globe").append("svg")
    .attr("width", width)
    .attr("height", height);

var svg1 = d3.select("#map1").append("svg")
      .attr("height", height)
      .attr("width", width)
      .attr("class","map1")
      .append("g");


//create path for graticules
var line = svg.append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);

var line1 = svg1.append("path")
        .datum(graticule1)
        .attr("class","graticule")
        .attr("d",path1)

svg.append("circle")
    .attr("class", "graticule-outline")
    .attr("cx", width / 2)
    .attr("cy", height / 2)
    .attr("r", projection.scale());





//citylabel original pos






//rotation function for globe
var rotate = d3_geo_greatArcInterpolator();



//use queue function to load data so that we can
//read both the topojson file
//and the csv input file
queue()
  .defer(d3.json, "readme-world-110m.json")
  .defer(d3.csv, "flight_plan.csv")
  .await(ready);



//main function, takes in topojson file as world
// and csv as flightPlans
function ready(error, world, flightPlans) {
  var countries = topojson.object(world, world.objects.countries).geometries;
  
  var i = -1;
  var n = flightPlans.length;


  //draw countries on the map using d3 geoProjections
  //and geoProjection path generators created earlier
  var country = svg.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path);

  var country1 = svg1.selectAll(".country")
      .data(countries)
    .enter().insert("path", ".graticule")
      .attr("class", "country")
      .attr("d", path1);



  //go ahead and create all flightPlan destination
  //points, but set them to invisible to start
  //they will be highlighted in the transition
  var flightPlan = svg.selectAll(".flightPlan")
      .data(flightPlans)
      .enter().append("circle")
        .attr("class", "flightPlan")
        .attr("r", 5)
        .attr("cx",function(d){
	  			var coords = projection([d.LONGITUDE, d.LATITUDE]);
	  			return coords[0];
	  		})
	  		.attr("cy",function(d){
	  			var coords = projection([d.LONGITUDE, d.LATITUDE]);
	  			return coords[1];
	  		});


  var flightPlan1 = svg1.selectAll(".flightPlan1")
      .data(flightPlans)
      .enter().append("circle")
        .attr("class", "flightPlan1")
        .attr("r", 5)
        .attr("cx",function(d){
          var coords = projection1([d.LONGITUDE, d.LATITUDE]);
          return coords[0];
        })
        .attr("cy",function(d){
          var coords = projection1([d.LONGITUDE, d.LATITUDE]);
          return coords[1];
        });




  //create a point to represent the plane during travel 
  var travelPoint = svg.append("circle")
      .attr("class","travelPoint")
            .attr("r",15)
      .attr("cx",width/2)
      .attr("cy",height/2);



  //start location at start of first travel location for flat map
  var travelPoint1 = svg1.append("circle")
      .attr("class","travelPoint1")
      .attr("r",15)
      .attr("cx",projection1([0,0])[0])
      .attr("cy",projection1([0,0])[1]);
      //.attr("cx",projection1([flightPlans[0].LONGITUDE, flightPlans[0].LATITUDE])[0])
      //.attr("cy",projection1([flightPlans[0].LONGITUDE, flightPlans[0].LATITUDE])[1]);



  //create city label for globe
  var cityLabel = svg.append("text")
      .attr("class","cityLabel")
      .attr("x", width / 2)
      .attr("y", height * 3 / 5);


  //similarly, for flat-map only, create all text labels in correct
  //location, but only set them visible in the transition
  var cityLabel1 = svg1.selectAll(".cityLabel1")
      .data(flightPlans)
      .enter().append("text")
        .attr("class", "cityLabel1")
        .attr("x",function(d){
          var coords = projection1([d.LONGITUDE, d.LATITUDE]);
          return coords[0];
        })
        .attr("y",function(d){
          var coords = projection1([d.LONGITUDE, d.LATITUDE]);
          return coords[1];
        })
        .text(function(d){ return d.CITY + ", " + d.COUNTRY })
        .attr("dx",0)
        .attr("dy",30);





  step();

  function step() {
    if (++i >= n) i = 0;

    var flightPlanCountryID = +flightPlans[i].COUNTRY_ID;
    // console.log(i)
    // console.log(flightPlanCountryID)
    // console.log(countries[flightPlanCountryID].id)

    //update text label for globe only
    cityLabel.text(flightPlans[i].CITY + ", " + flightPlans[i].COUNTRY);

    



    //turn country of interest red
    country.transition()
        .style("fill", function(d, j) { return j === flightPlanCountryID ? "green" : "#b8b8b8"; });
    country1.transition()
        .style("fill", function(d, j) { return j === flightPlanCountryID ? "green" : "#b8b8b8"; });



    //make point of next location gold with black stroke
    flightPlan.transition()
        .style("fill", function(d, j) { return j === i ? "gold" : "none"; })
        .style("stroke", function(d, j) { return j === i ? "black" : "none"; });

    flightPlan1.transition()
        .style("fill", function(d, j) { return j === i ? "gold" : "none"; })
        .style("stroke", function(d, j) { return j === i ? "black" : "none"; });

    cityLabel1.transition()
        .style("fill", function(d, j) {return j === i ? "black" : "none"; });



    // Set flight time
    var myDelay = 250;
    var flightTime = +flightPlans[i].FLIGHT_TIME_FROM_PREVIOUS_LOCATION * 400;


    //use tween function to make
    //point get larger then smaller
    travelPoint.transition()
      .delay(myDelay)
      .duration(flightTime)
      .tween("test", function(){
        return function(t){
          travelPoint.attr("r", 35 * Math.min(Math.sin(Math.PI * t) * 0.7, 0.4));
        };
      });

    //move travel point for the flat map. Use tween function to make 
    //point get larger then smaller
    travelPoint1.transition()
      .delay(myDelay)
      .duration(flightTime)
      .tween("test",function(){
        return function(t){
          travelPoint1.attr("r", 35 * Math.min(Math.sin(Math.PI * t) * 0.7, 0.4));
        };
      })
      .attr("cx",projection1([flightPlans[i].LONGITUDE, flightPlans[i].LATITUDE])[0])
      .attr("cy",projection1([flightPlans[i].LONGITUDE, flightPlans[i].LATITUDE])[1]);


    d3.transition()
        .delay(myDelay)
        .duration(flightTime)
        .tween("rotate", function() {
          //var point = centroid(countries[i]);
          var point = [flightPlans[i].LONGITUDE, flightPlans[i].LATITUDE];
          rotate.source(projection.rotate()).target([-point[0], -point[1]]).distance();
          return function(t) {
            projection.rotate(rotate(t));
            country.attr("d", path);
            line.attr("d", path);
            flightPlan.attr("cx",function(d){
    	  			var coords = projection([d.LONGITUDE, d.LATITUDE]);
    	  			return coords[0];
    	  		});
            flightPlan.attr("cy",function(d){
    	  			var coords = projection([d.LONGITUDE, d.LATITUDE]);
    	  			return coords[1];
    	  		});
          };
        })
      .transition()
        .each("end", step);
  }
};







//written by Mike Bostock
//https://bl.ocks.org/mbostock/4183330
var d3_radians = Math.PI / 180;

function d3_geo_greatArcInterpolator() {
  var x0, y0, cy0, sy0, kx0, ky0,
      x1, y1, cy1, sy1, kx1, ky1,
      d,
      k;

  function interpolate(t) {
    var B = Math.sin(t *= d) * k,
        A = Math.sin(d - t) * k,
        x = A * kx0 + B * kx1,
        y = A * ky0 + B * ky1,
        z = A * sy0 + B * sy1;
    return [
      Math.atan2(y, x) / d3_radians,
      Math.atan2(z, Math.sqrt(x * x + y * y)) / d3_radians
    ];
  }

  interpolate.distance = function() {
    if (d == null) k = 1 / Math.sin(d = Math.acos(Math.max(-1, Math.min(1, sy0 * sy1 + cy0 * cy1 * Math.cos(x1 - x0)))));
    return d;
  };

  interpolate.source = function(_) {
    var cx0 = Math.cos(x0 = _[0] * d3_radians),
        sx0 = Math.sin(x0);
    cy0 = Math.cos(y0 = _[1] * d3_radians);
    sy0 = Math.sin(y0);
    kx0 = cy0 * cx0;
    ky0 = cy0 * sx0;
    d = null;
    return interpolate;
  };

  interpolate.target = function(_) {
    var cx1 = Math.cos(x1 = _[0] * d3_radians),
        sx1 = Math.sin(x1);
    cy1 = Math.cos(y1 = _[1] * d3_radians);
    sy1 = Math.sin(y1);
    kx1 = cy1 * cx1;
    ky1 = cy1 * sx1;
    d = null;
    return interpolate;
  };

  return interpolate;
}