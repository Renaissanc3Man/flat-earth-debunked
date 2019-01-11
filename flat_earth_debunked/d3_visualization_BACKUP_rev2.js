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
  // var travelPoint = svg.append("circle")
  //     .attr("class","travelPoint")
  //     .attr("r",15)
  //     .attr("cx",width/2)
  //     .attr("cy",height/2);


  var plane = svg.append("path")
                   .attr("class", "plane")
                   .attr("d", "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z")
                   .attr("transform","translate("+((width/2)+25)+","+((height/2)-25)+") rotate(90)");


  // //start location at start of first travel location for flat map
  // var travelPoint1 = svg1.append("circle")
  //     .attr("class","travelPoint1")
  //     .attr("r",15)
  //     .attr("cx",projection1([0,0])[0])
  //     .attr("cy",projection1([0,0])[1]);
  //     //.attr("cx",projection1([flightPlans[0].LONGITUDE, flightPlans[0].LATITUDE])[0])
  //     //.attr("cy",projection1([flightPlans[0].LONGITUDE, flightPlans[0].LATITUDE])[1]);

  var plane1 = svg1.append("path")
                 .attr("class", "plane1")
                 .attr("d", "m25.21488,3.93375c-0.44355,0 -0.84275,0.18332 -1.17933,0.51592c-0.33397,0.33267 -0.61055,0.80884 -0.84275,1.40377c-0.45922,1.18911 -0.74362,2.85964 -0.89755,4.86085c-0.15655,1.99729 -0.18263,4.32223 -0.11741,6.81118c-5.51835,2.26427 -16.7116,6.93857 -17.60916,7.98223c-1.19759,1.38937 -0.81143,2.98095 -0.32874,4.03902l18.39971,-3.74549c0.38616,4.88048 0.94192,9.7138 1.42461,13.50099c-1.80032,0.52703 -5.1609,1.56679 -5.85232,2.21255c-0.95496,0.88711 -0.95496,3.75718 -0.95496,3.75718l7.53,-0.61316c0.17743,1.23545 0.28701,1.95767 0.28701,1.95767l0.01304,0.06557l0.06002,0l0.13829,0l0.0574,0l0.01043,-0.06557c0,0 0.11218,-0.72222 0.28961,-1.95767l7.53164,0.61316c0,0 0,-2.87006 -0.95496,-3.75718c-0.69044,-0.64577 -4.05363,-1.68813 -5.85133,-2.21516c0.48009,-3.77545 1.03061,-8.58921 1.42198,-13.45404l18.18207,3.70115c0.48009,-1.05806 0.86881,-2.64965 -0.32617,-4.03902c-0.88969,-1.03062 -11.81147,-5.60054 -17.39409,-7.89352c0.06524,-2.52287 0.04175,-4.88024 -0.1148,-6.89989l0,-0.00476c-0.15655,-1.99844 -0.44094,-3.6683 -0.90277,-4.8561c-0.22699,-0.59493 -0.50356,-1.07111 -0.83754,-1.40377c-0.33658,-0.3326 -0.73578,-0.51592 -1.18194,-0.51592l0,0l-0.00001,0l0,0z")
                 .attr("transform","translate("+(projection1([0,0])[0]+25)+","+(projection1([0,0])[1]-25)+") rotate(90)");






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
        .attr("dy",50);



  var prevCoordRawData = [0,0]; //init. use to calculate mph
  var prevCoords1 = [0,0]; //initialize, use later for plane transition
  var gotoCoordRawData = [0,0];
  var gotoCoords1 = [0,0];



  step();
  $(document).click(function(){
    step();
  });

  // step();
  

  function step() {
    if (++i >= n) i = 0;

    //get location of previous coordinates for transition
    //if first position, use last position (n)'s coordinates

    //note: n-1 because indexing starts at zero, i-1 just because we want previous element
    if(i==0){
      prevCoordRawData = [+flightPlans[n-1].LONGITUDE, +flightPlans[n-1].LATITUDE]
    } else {
      prevCoordRawData = [+flightPlans[i-1].LONGITUDE, +flightPlans[i-1].LATITUDE]
    };
    gotoCoordRawData = [+flightPlans[i].LONGITUDE, +flightPlans[i].LATITUDE]

    prevCoords1 = [projection1(prevCoordRawData)[0], projection1(prevCoordRawData)[1]];
    gotoCoords1 = [projection1(gotoCoordRawData)[0], projection1(gotoCoordRawData)[1]];

    var flightTimeRaw = +flightPlans[i].FLIGHT_TIME_FROM_PREVIOUS_LOCATION;

    //calculate distance and mph
    //flatmap = absolute distance
    //globe = 180 degree Longitude corrected with absolute value 
    var flatmapDistance = Math.sqrt(Math.pow(prevCoordRawData[0] - gotoCoordRawData[0],2) + Math.pow(prevCoordRawData[1] - gotoCoordRawData[1],2));
    //its approx 69 miles per unit of long and lat
    var flatmapMPH = (flatmapDistance * 69) / flightTimeRaw;


    console.log(prevCoordRawData);
    console.log(gotoCoordRawData);
    console.log(flatmapDistance);
    console.log(flatmapMPH);


    var flightPlanCountryID = +flightPlans[i].COUNTRY_ID;

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
    var flightTime = flightTimeRaw * 400;


    //use tween function to make
    //point get larger then smaller
    // travelPoint.transition()
    //   .delay(myDelay)
    //   .duration(flightTime)
    //   .tween("test", function(){
    //     return function(t){
    //       travelPoint.attr("r", 35 * Math.min(Math.sin(Math.PI * t) * 0.7, 0.4));
    //     };
    //   });

    plane.transition()
      .delay(myDelay)
      .duration(flightTime)
      .tween("test", function(){
        return function(t){
          var s = 2.25 * Math.min(Math.sin(Math.PI * t) * 0.7, 0.4) + 0.75;
          var xTranslate = ((width/2)+(25 * s))
          var yTranslate = ((height/2)-(25 * s))
          plane.attr("transform","translate("+xTranslate+","+yTranslate+") rotate(90) scale("+s+")");

        };
      });




    //move travel point for the flat map. Use tween function to make 
    //point get larger then smaller
    plane1.transition()
      .delay(myDelay)
      .duration(flightTime)
      .tween("test",function(){
        return function(t){
          var s = 2.25 * Math.min(Math.sin(Math.PI * t) * 0.7, 0.4) + 0.75;
          

          // for the last flight from Tokyo to Hawaii,
          // for the flat map, reverse direction of plane
          // requires different offset after rotating 270 degrees
          if(i===n-1){
            var xTranslate = (prevCoords1[0] + ((gotoCoords1[0]-prevCoords1[0]) * t) - (25 * s));
            var yTranslate = (prevCoords1[1] + ((gotoCoords1[1]-prevCoords1[1]) * t) + (25 * s));
            var myRotation1 = 270;
          } else{
            var xTranslate = (prevCoords1[0] + ((gotoCoords1[0]-prevCoords1[0]) * t) + (25 * s));
            var yTranslate = (prevCoords1[1] + ((gotoCoords1[1]-prevCoords1[1]) * t) - (25 * s));
            var myRotation1 = 90;
          };
          plane1.attr("transform","translate("+xTranslate+","+yTranslate+") rotate("+myRotation1+") scale("+s+")");
        };
      })
      //.attr("transfrom","translate("++","++")")







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
        });
      // .transition()
      //   .each("end", console.log(i)); //originally this called the function iteratively


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