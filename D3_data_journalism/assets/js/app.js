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
    left: 50
  };
  
  // chart area minus margins
  var chartHeight = svgHeight - margin.top - margin.bottom;
  var chartWidth = svgWidth - margin.left - margin.right;
  
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



function yScale(healthData, chosenYAxis) {
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(healthData, d => d[chosenYAxis])])
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

  var label;

  if (chosenXAxis === "poverty") {
    label = "Poverty (%)";
  }
  else if (chosenXAxis === "age") {
    label = "Age (Median)";
  }
  else {
    label = "Household Income (Median)";
  }

  if (chosenYAxis === "healthcare") {
    label = "Lacks Healthcare (%)";
  }
  else if (chosenYAxis === "obesity") {
    label = "Obese (%)";
  }
  else {
    label = "Smokes (%)";
  }


  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>Poverty: ${label} ${d[chosenXAxis]}`);
    });

  circlesGroup.call(toolTip);

  circlesGroup.on("mouseover", function(data) {
    toolTip.show(data);
  })
    // onmouseout event
    .on("mouseout", function(data, index) {
      toolTip.hide(data);
    });

  return circlesGroup;
}


// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(healthData) {
    
    // console.log(healthData);

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
     // xLinearScale function above csv import
    var xLinearScale = xScale(healthData, chosenXAxis);
    var yLinearScale = yScale(healthData, chosenYAxis);



    // // Create y scale function
    //  var yLinearScale = d3.scaleLinear()
    //    .domain([0, d3.max(healthData, d => d.healthcare)])
    //    .range([chartHeight, 0]);


    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(bottomAxis);

      var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

  //   // append y axis
  // chartGroup.append("g")
  // .call(leftAxis);

// append initial circles
var circlesGroup = chartGroup.selectAll(".stateCircle")
  .data(healthData)
  .enter()
  .append("circle")
  .classed("class", "stateCircle")
  .attr("cx", d => xLinearScale(d[chosenXAxis]))
  .attr("cy", d => yLinearScale(d[chosenYAxis]))
  .attr("r", 10)
  .attr("fill", "blue")
  .attr("opacity", ".80");


  // Append Text to Circles
  var textGroup = chartGroup.selectAll(".stateText")
  .data(healthData)
  .enter()
  .append("text")
  .classed("stateText", true)
  .attr("x", d => xLinearScale(d[chosenXAxis]))
  .attr("y", d => yLinearScale(d[chosenYAxis]* .90))
  .text(d => (d.abbr))
  // .attr("class", "stateText")
  .attr("font-size", "9px")
  .attr("text-anchor", "middle")
  .attr("fill", "white");

    // Create group for three x-axis labels
  var xLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var poverty = xLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "poverty") // value to grab for event listener
  .classed("active", true)
  // .text("Hair Metal Ban Hair Length (inches)");

  var age = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    // .text("# of Albums Released");

    var household = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    // .text("# of Albums Released");


     // Create group for three y-axis labels
  var yLabelsGroup = chartGroup.append("g")
  .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var healthcare = yLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "healthcare") // value to grab for event listener
  .classed("active", true)
  // .text("Hair Metal Ban Hair Length (inches)");

  var smokes = yLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "smokes") // value to grab for event listener
  .classed("inactive", true)
  // .text("Hair Metal Ban Hair Length (inches)");

  var obesity = yLabelsGroup.append("text")
  .attr("x", 0)
  .attr("y", 20)
  .attr("value", "obesity") // value to grab for event listener
  .classed("inactive", true)
  // .text("Hair Metal Ban Hair Length (inches)");

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

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      xLinearScale = xScale(healthData, chosenXAxis);

      // updates x axis with transition
      xAxis = renderXAxes(xLinearScale, xAxis);
      // yAxis = renderYAxes(yLinearScale, yAxis);

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
          .classed("active", true)
          .classed("inactive", false);
        poverty
          .classed("active", false)
          .classed("inactive", true);
        income
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
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
    }
  });



  // x axis labels event listener
  yLabelsGroup.selectAll("text")
  .on("click", function() {
    // get value of selection
    var value = d3.select(this).attr("value");
    if (value !== chosenYAxis) {

      // replaces chosenXAxis with value
      chosenYAxis = value;

      // console.log(chosenXAxis)

      // functions here found above csv import
      // updates x scale for new data
      yLinearScale = yScale(healthData, chosenYAxis);

      // updates x axis with transition
      yAxis = renderAxes(yLinearScale, yAxis);

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
          .classed("active", true)
          .classed("inactive", false);
        smokes
          .classed("active", false)
          .classed("inactive", true);
        obesity
          .classed("active", false)
          .classed("inactive", true);
      }
      else {
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
    }
  });

 
















  //   // append y axis
  // chartGroup.append("text")
  // .attr("transform", "rotate(-90)")
  // .attr("y", 0 - margin.left)
  // .attr("x", 0 - (chartHeight / 2))
  // .attr("dy", "1em")
  // .classed("axis-text", true)
  // .text("Number of Billboard 500 Hits");


  // // updateToolTip function above csv import
  // var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  // // x axis labels event listener
  // labelsGroup.selectAll("text")
  //   .on("click", function() {
  //     // get value of selection
  //     var value = d3.select(this).attr("value");
  //     if (value !== chosenXAxis) {

  //       // replaces chosenXAxis with value
  //       chosenXAxis = value;

  //       // console.log(chosenXAxis)

  //       // functions here found above csv import
  //       // updates x scale for new data
  //       xLinearScale = xScale(healthData, chosenXAxis);

  //       // updates x axis with transition
  //       xAxis = renderAxes(xLinearScale, xAxis);

        // // updates circles with new x values
        // circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

        // // // updates tooltips with new info
        // // circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

        // // changes classes to change bold text
        // if (chosenXAxis === "age") {
        //   albumsLabel
        //     .classed("active", true)
        //     .classed("inactive", false);
        //   hairLengthLabel
        //     .classed("active", false)
        //     .classed("inactive", true);
      //   }
      //   else {
      //     albumsLabel
      //       .classed("active", false)
      //       .classed("inactive", true);
      //     hairLengthLabel
      //       .classed("active", true)
      //       .classed("inactive", false);
      //   }
      // }
    // });
});

};

makeResponsive();




  //   // Step 3: Create axis functions
  //   // ==============================
  //   var bottomAxis = d3.axisBottom(xLinearScale);
  //   var leftAxis = d3.axisLeft(yLinearScale);

  //   // Step 4: Append Axes to the chart
  //   // ==============================
  //   chartGroup.append("g")
  //     .attr("transform", `translate(0, ${chartHeight})`)
  //     .call(bottomAxis);

  //   chartGroup.append("g")
  //     .call(leftAxis);

  //   // Step 5: Create Circles
  //   // ==============================
  //   var circlesGroup = chartGroup.selectAll("circle")
  //   .data(healthData)
  //   .enter()
  //   .append("circle")
  //   .attr("cx", d => xLinearScale(d.poverty))
  //   .attr("cy", d => yLinearScale(d.healthcare))
  //   .attr("r", "10")
  //   .attr("fill", "skyblue")
  //   // .attr("opacity", "1");
    

  //   // Create axes labels
  //   chartGroup.append("text")
  //     .attr("transform", "rotate(-90)")
  //     .attr("y", 0 - margin.left + 40)
  //     .attr("x", 0 - (svgHeight / 2))
  //     .attr("dy", "1em")
  //     .attr("class", "axisText")
  //     .text("Lacks Healthcare (%)");

  //     chartGroup.append("text")
  //     .attr("transform", `translate(${chartWidth / 3}, ${chartHeight + margin.top + 30})`)
  //     .attr("class", "axisText")
  //     .text("Hair Metal Band Hair Length (inches)");
  // }).catch(function(error) {
  //   console.log(error);

// });