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
    left: 180
  };
  

  
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

// Import Data
d3.csv("assets/data/data.csv").then(function(healthData) {
  

    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(d) {
      d.poverty = +d.poverty;
      d.healthcare = +d.healthcare;
    });


    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.poverty) * 0.8, d3.max(healthData, d => d.poverty) * 1.2])
      .range([0, chartWidth]);

    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d.healthcare) * 0.8, d3.max(healthData, d => d.healthcare) * 1.2])
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
    var circlesGroup = chartGroup.selectAll(".stateCircle")
    .data(healthData)
    .enter()
    .append("circle")
    .classed("stateCircle", true)
    .attr("cx", d => xLinearScale(d.poverty))
    .attr("cy", d => yLinearScale(d.healthcare))
    .attr("r", 10)
    // .attr("fill", "skyblue")
    .attr("opacity", ".90");


    // Append the circle with text inside
    chartGroup.selectAll(".stateText")
    .data(healthData)
    .enter()
    .append("text")
    .classed("stateText", true)
    .attr("dx", d => xLinearScale(d.poverty))
    .attr("dy", d => yLinearScale(d.healthcare)+10/2.5)
    .text(d => d.abbr)
    .attr("font-size", 9)




    // Step 6: Initialize tool tip
    // ==============================
    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([80, -60])
      .html(function(d) {
        return (`${d.state}<br>
                Poverty: ${d.poverty}% <br>
                Obesity: ${d.obesity}%`)
      });

      // Step 7: Create tooltip in the chart
    // ==============================
    chartGroup.call(toolTip);

    // Step 8: Create event listeners to display and hide the tooltip
    // ==============================
    circlesGroup.on("mouseover", function(data) {
      toolTip.style("opacity", 1)
      d3.select(this)
        .style("stroke", "black")
        .style("opacity", 1);
      toolTip.show(data, this)
      })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.style("opacity", 0)
        d3.select(this)
          .style("stroke", "none")
          .style("opacity", 0.8)
        toolTip.hide(data);
      });



  
    

    // Create axes labels
    chartGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left - 240)
      .attr("x", 0 - (svgHeight / 2))
      .attr("dy", "1em")
      .attr("class", "axisText")
      .text("Lacks Healthcare (%)");

      chartGroup.append("text")
      .attr("transform", `translate(${chartWidth / 3}, ${chartHeight + margin.top + 5})`)
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