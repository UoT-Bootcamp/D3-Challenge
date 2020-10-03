// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // If the SVG area isn't empty when the browser loads,
  // remove it and replace it with a resized version of the chart
  var svgArea = d3.select("body").select("svg");

  // clear svg is not empty
  if (!svgArea.empty()) {
    svgArea.remove();
  }

  // svg container
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

  // margins
  var margin = {
    top: 50,
    right: 50,
    bottom: 50,
    left: 120
  };
  
  // chart area minus margins
  var chartHeight = svgHeight - margin.top - margin.bottom;
  var chartWidth = svgWidth - margin.left - margin.right;
  
  // padding for the text at the bottom and left axes
  var tPadBottom = 70;
  var tPadLeft = 70;


  // chart area minus margins
  var chartHeight = svgHeight - margin.top - margin.bottom - tPadBottom;
  var chartWidth = svgWidth - margin.left - margin.right - tPadLeft;

  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// var chosenXAxis = "poverty";

// // function used for updating x-scale var upon click on axis label
// function xScale(healthData, chosenXAxis) {
//   // create scales
//   var xLinearScale = d3.scaleLinear()
//     .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
//       d3.max(healthData, d => d[chosenXAxis]) * 1.2
//     ])
//     .range([0, width]);

//   return xLinearScale;

// }





// Import Data
d3.csv("assets/data/data.csv").then(function(healthData) {
    
    // console.log(healthData);

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(d) {
      d.poverty = +d.poverty;
      d.healthcare = +d.healthcare;
    });


    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.poverty), d3.max(healthData, d => d.poverty)])
      .range([0, chartWidth]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.healthcare), d3.max(healthData, d => d.healthcare)])
      .range([chartHeight, 0]);

    // Step 3: Create axis functions
    // ==============================
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // Step 4: Append Axes to the chart
    // ==============================
    chartGroup.append("g")
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    chartGroup.append("g")
      .call(leftAxis);

    // Step 5: Create Circles
    // ==============================
    var circlesGroup = chartGroup.selectAll("circle")
    .data(healthData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    .attr("fill", "skyblue")
    .attr("opacity", ".90");

    // var circlesText = chartGroup.selectAll(".stateText")
    // .data(healthData)
    // .enter()
    // .append("text")
    // .classed("stateText", true)
    // .attr("x", d => xLinearScale(d[chosenXAxis])+1)
    // .attr("y", d => yLinearScale(d[chosenYAxis])+2)
    // .text(d => d.abbr)
    // .attr("font-size", 8);
    

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left + 40)
      .attr("x", 0 - (svgHeight / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

      chartGroup.append("text")
      .attr("transform", `translate(${chartWidth / 3}, ${chartHeight + margin.top + 30})`)
      .attr("class", "axisText")
      .text("In Poverty (%)");
  }).catch(function(error) {
    console.log(error);

});
};
// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);