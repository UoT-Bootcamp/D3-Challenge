// The code for the chart is wrapped inside a function that
// automatically resizes the chart
function makeResponsive() {

  // if the SVG area isn't empty when the browser loads,
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
  var chartHeight = svgHeight - margin.top - margin.bottom - 70;
  var chartWidth = svgWidth - margin.left - margin.right - 70;
  
  // Create an SVG wrapper, append an SVG group that will hold our chart,
  // and shift the latter by left and top margins.
  var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // Append group element
  var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Initial Params for X and Y axis
  var chosenXAxis = "poverty";
  var chosenYAxis = "healthcare";

  // function used for updating x-scale var upon click on axis label
  function xScale(healthData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
        d3.max(healthData, d => d[chosenXAxis]) * 1.2
        ])
      .range([0, chartWidth]);

    return xLinearScale;
  }


  // function used for updating y-scale var upon click on axis label
  function yScale(healthData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
      .domain([d3.min(healthData, d => d[chosenYAxis]) * 0.8,
        d3.max(healthData, d => d[chosenYAxis]) * 1.2
        ])
      .range([chartHeight, 0]);
    return yLinearScale;
  }


  // function used for updating xAxis var upon click on axis label
  function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);

    return xAxis;
  }

  // function used for updating yAxis var upon click on axis label
  function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
      .duration(1000)
      .call(leftAxis);

    return yAxis;
  }


  // function used for updating circles group with a transition to
  // new circles
  function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

    circlesGroup.transition()
      .duration(1000)
      .attr("cx", d => newXScale(d[chosenXAxis]))
      .attr("cy", d => newYScale(d[chosenYAxis]));

  return circlesGroup;
  }


  // function used for updating circles group with new tooltip
  function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    // var label;

    if (chosenXAxis === "poverty") {
      xLabel = "Poverty (%)";
    }
    else if (chosenXAxis === "age") {
      xLabel = "Age (Median)";
    }
    else {
      xLabel = "Household Income (Median)";
    }

    if (chosenYAxis === "healthcare") {
      yLabel = "Lacks Healthcare (%)";
    }
    else if (chosenYAxis === "obesity") {
      yLabel = "Obese (%)";
    }
    else {
      yLabel = "Smokes (%)";
    }

    var toolTip = d3.tip()
      .attr("class", "d3-tip")
      .offset([70, 70])
      .html(function(d) {
        return (`${d.state}<br>
                Poverty: ${d.poverty}% <br>
                Obesity: ${d.obesity}%`);
      });

    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data, this);
      })
      // onmouseout event
      .on("mouseout", function(data) {
        toolTip.hide(data);
      });

    return circlesGroup;
  }


  // Retrieve data from the CSV file and execute everything below
  d3.csv("assets/data/data.csv").then(function(healthData) {
    
    // Step 1: Parse Data/Cast as numbers
    // ==============================
    healthData.forEach(function(d) {
      d.poverty = +d.poverty;
      d.healthcare = +d.healthcare;
      d.age = +d.age;
      d.income = +d.income;
      d.obesity = +d.obesity;
      d.smokes = +d.smokes;
    });

    // Step 2: Create scale functions
    // ==============================
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      // .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
      // .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll(".stateCircle")
      .data(healthData)
      .enter()
      .append("circle")
      .classed("stateCircle", true)
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("opacity", ".90");


    // // Append Text to Circles
    // var circleText = circleGroup.selectAll(".stateText")
    //   .data(healthData)
    //   .enter()
    //   .append("text")
    //   .classed("stateText", true)
    //   // .attr("x", d => xLinearScale(d[chosenXAxis]))
    //   // .attr("y", d => yLinearScale(d[chosenYAxis]* .90))
    //   .text(d => (d.abbr))
    //   // .attr("class", "stateText")
    //   .attr("font-size", "9px")
    //   .attr("text-anchor", "middle")
    //   .attr("fill", "white");

    // Create group for three x-axis labels
    var xLabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    // First x-axis label
    var poverty = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 30)
      .attr("value", "poverty") // value to grab for event listener
      .classed("active", true)
      .text("In Poverty (%)");

    // Second x-axis label
    var age = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 50)
      .attr("value", "age") // value to grab for event listener
      .classed("inactive", true)
      .text("Age (Median)");

    // Second x-axis label
    var household = xLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 70)
      .attr("value", "income") // value to grab for event listener
      .classed("inactive", true)
      .text("Household Income (Median)");


    // Create group for three y-axis labels
    var yLabelsGroup = chartGroup.append("g")
      .attr("transform", "rotate(-90)", `translate(${chartHeight / 2}, ${chartWidth + 20})`);


    // First y-axis label
    var healthcare = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -30)
      .attr("value", "healthcare") // value to grab for event listener
      .classed("active", true)
      .text("Lacks Healthcare (%)");

    // Second y-axis label
    var smokes = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -50)
      .attr("value", "smokes") // value to grab for event listener
      .classed("inactive", true)
      .text("Smokes (%)");

    // Third y-axis label
    var obesity = yLabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", -70)
      .attr("value", "obesity") // value to grab for event listener
      .classed("inactive", true)
      .text("Obese (%)");


    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenXAxis) {

          // replaces chosenXAxis with value
          chosenXAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          xLinearScale = xScale(healthData, chosenXAxis);

          // updates x axis with transition
          xAxis = renderXAxes(xLinearScale, xAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenXAxis === "poverty") {
            age
              .classed("active", true)
              .classed("inactive", false);
            poverty
              .classed("active", false)
              .classed("inactive", true);
            income
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "age") {
            age
              .classed("active", false)
              .classed("inactive", true);
            poverty
              .classed("active", true)
              .classed("inactive", false);
            income
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            age
              .classed("active", false)
              .classed("inactive", true);
            poverty
              .classed("active", false)
              .classed("inactive", true);
            income
              .classed("active", true)
              .classed("inactive", false);
          }
        }
    });

    // y axis labels event listener
    yLabelsGroup.selectAll("text")
      .on("click", function() {
        // get value of selection
        var value = d3.select(this).attr("value");
        if (value !== chosenYAxis) {

          // replaces chosenYAxis with value
          chosenYAxis = value;

          // functions here found above csv import
          // updates x scale for new data
          yLinearScale = yScale(healthData, chosenYAxis);

          // updates x axis with transition
          yAxis = renderYAxes(yLinearScale, yAxis);

          // updates circles with new x values
          circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis);

          // updates tooltips with new info
          circlesGroup = updateToolTip(chosenYAxis, circlesGroup);

          // changes classes to change bold text
          if (chosenYAxis === "healthcare") {
            healthcare
              .classed("active", true)
              .classed("inactive", false);
            smokes
              .classed("active", false)
              .classed("inactive", true);
            obesity
              .classed("active", false)
              .classed("inactive", true);
          }
          else if (chosenYAxis === "smokes") {
            healthcare
              .classed("active", false)
              .classed("inactive", true);
            smokes
              .classed("active", true)
              .classed("inactive", false);
            obesity
              .classed("active", false)
              .classed("inactive", true);
          }
          else {
            healthcare
              .classed("active", false)
              .classed("inactive", true);
            smokes
              .classed("active", false)
              .classed("inactive", true);
            obesity
              .classed("active", true)
              .classed("inactive", false);
          }
        }
      });

  });
};

// When the browser loads, makeResponsive() is called.
makeResponsive();

// When the browser window is resized, makeResponsive() is called.
d3.select(window).on("resize", makeResponsive);

