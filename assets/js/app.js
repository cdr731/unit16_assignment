//--------FUNCTION DEFINITIONS-------------

// initial default axes
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

// function for updating scale when axis label is clicked
function axisScale(acsData, chosenAxis, whichAxis) {
  switch(whichAxis) {
    case "x_axis":
      var range1 = 0;
      var range2 = splotWidth;
      break;  
    case "y_axis":
      var range1 = splotHeight;
      var range2 = 0;
      break;        
  }
  var linearScale = d3.scaleLinear()
    .domain([d3.min(acsData, d => d[chosenAxis]) * 0.9,
      d3.max(acsData, d => d[chosenAxis]) * 1.1])
    .range([range1, range2]); 
  return linearScale;
}

// function for updating axis variable when axis label is clicked
function renderAxes(newScale, theAxis, whichAxis) {
  switch(whichAxis) {
    case "x_axis":
      var selectAxis = d3.axisBottom(newScale);
      break;
    case "y_axis":  
      var selectAxis = d3.axisLeft(newScale);
      break;
  }
  theAxis.transition()
    .duration(1000)
    .call(selectAxis);      
  return theAxis;
}

// function for updating circles group and transitioning
function renderCircles(circlesGroup, newScale, chosenAxis, cpos) {
  circlesGroup.transition()
    .duration(1000)
    .attr(cpos, d => newScale(d[chosenAxis]));
  return circlesGroup;
}

// function for updating tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
  switch(chosenXAxis) {
    case "poverty":
      var xlabel = "Poverty (%):";
      break;
    case "age":
      var xlabel = "Age (Years):";
      break;
    case "income":
      var xlabel = "Income ($):";
      break;
  }
  switch(chosenYAxis) {
    case "obesity":
      var ylabel = "Obesity (%):";
      break;
    case "smokes":
      var ylabel = "Smokes (%):";
      break;
    case "healthcare":
      var ylabel = "Healthcare (%):";
      break;
  }
  var toolTip = d3.tip()
    .attr("class", "tooltip")
    .offset([80, -60])
    .html(function(d) {
      return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}
        <br>${ylabel} ${d[chosenYAxis]}`);
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

//--------END OF FUNCTIONS, MAIN FUNCTION-------------

function makeResponsive() {
  
  // if SVG area is empty, remove it and add resized scatter plot
  var svgArea = d3.select("#scatter").select("svg");
  if (!svgArea.empty()) {
    svgArea.remove();
  }
  
  // SVG parameters
  var svgHeight = window.innerHeight;
  var svgWidth = window.innerWidth;

  // margins
  var margin = {
    top: 20,
    right: 20,
    bottom: 100,
    left: 100
  };

  // scatter plot area = SVG area minus margins
  var splotHeight = svgHeight - margin.top - margin.bottom;
  var splotWidth = svgWidth - margin.left - margin.right;

  // create SVG container
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // append SVG group and transform to the margins
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // data retrieval
  d3.csv("/assets/data/data.csv").then(function(err, acsData) {
    console.log(acsData);
    if (err) throw err;
    
    // parse data
    acsData.forEach(function(data) {
      data.poverty = +data.poverty;
      data.age = +data.age;
      data.income = +data.income;
      data.healthcare = +data.healthcare;
      data.obesity = +data.obesity;
      data.smokes = +data.smokes;
    });

    var xLinearScale = axisScale(acsData, chosenXAxis, "x_axis");
    var yLinearScale = axisScale(acsData, chosenYAxis, "y_axis");
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append axes
    var xAxis = chartGroup.append("g")
      .classed("x-axis", true)
      .attr("transform", `translate(0, ${splotHeight})`)
      .call(bottomAxis);
    var yAxis = chartGroup.append("g")
      .classed("y-axis", true)
      .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
      .data(acsData)
      .enter()
      .append("circle")
      .attr("cx", d => xLinearScale(d[chosenXAxis]))
      .attr("cy", d => yLinearScale(d[chosenYAxis]))
      .attr("r", 10)
      .attr("fill", "skyblue")
      .attr("opacity", ".5");
  
    // create x-axis group labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${splotWidth / 2}, ${splotHeight + 20})`);
    var povertyLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 20)
      .attr("value", "poverty")
      .classed("active", true)
      .text("In Poverty (%)");
    var ageLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 40)
      .attr("value", "age")
      .classed("inactive", true)
      .text("Age (Median)");   
    var incomeLabel = xlabelsGroup.append("text")
      .attr("x", 0)
      .attr("y", 60)
      .attr("value", "income")
      .classed("inactive", true)
      .text("Household Income (Median)");    

    // create y-axis group labels
    var ylabelsGroup = chartGroup.append("g")
      .attr("tranform", "rotate(-90)")
    var obesityLabel = ylabelsGroup.append("text")
      .attr("x", -(splotHeight / 2))
      .attr("y", -margin.left)
      .attr("value", "obesity")
      .classed("active", true)
      .text("Obesity (%)");
    var smokesLabel = ylabelsGroup.append("text")
      .attr("x", -(splotHeight / 2))
      .attr("y", -margin.left - 20)
      .attr("value", "smokes")
      .classed("inactive", true)
      .text("Smokes (%)");
    var healthcareLabel = ylabelsGroup.append("text")
      .attr("x", -(splotHeight / 2))
      .attr("y", -margin.left - 40)
      .attr("value", "healthcare")
      .classed("inactive", true)
      .text("Lacks Healthcare (%)");

    // updateToolTip function
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x-axis labels event listener
    xlabelsGroup.selectAll("text").on("click", function() {
      var value = d3.select(this).attr("value");
      
      if (value !== chosenXAxis) {
        chosenXAxis = value;
        xLinearScale = axisScale(acsData, chosenXAxis, "x_axis");
        xAxis = renderAxes(xLinearScale, xAxis, "x_axis");
        circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, "cx");
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        switch(chosenXAxis) {
          case "poverty":
            povertyLabel.classed("active", true).classed("inactive", false);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", false).classed("inactive", true);
            break;
          case "age":
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", true).classed("inactive", false);
            incomeLabel.classed("active", false).classed("inactive", true);
            break;
          case "income":
            povertyLabel.classed("active", false).classed("inactive", true);
            ageLabel.classed("active", false).classed("inactive", true);
            incomeLabel.classed("active", true).classed("inactive", false);
            break;
        }
      }
    });

    // y-axis labels event listener
    ylabelsGroup.selectAll("text").on("click", function() {
      var value = d3.select(this).attr("value");
      
      if (value !== chosenYAxis) {
        chosenYAxis = value;
        yLinearScale = axisScale(acsData, chosenYAxis, "y_axis");
        yAxis = renderAxes(yLinearScale, yAxis, "y_axis");
        circlesGroup = renderCircles(circlesGroup, yLinearScale, chosenYAxis, "cy");
        circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
        
        switch(chosenYAxis) {
          case "obesity":
            obesityLabel.classed("active", true).classed("inactive", false);
            smokesLabel.classed("active", false).classed("inactive", true);
            healthcareLabel.classed("active", false).classed("inactive", true);
            break;
          case "smokes":
            obesityLabel.classed("active", false).classed("inactive", true);
            smokesLabel.classed("active", true).classed("inactive", false);
            healthcareLabel.classed("active", false).classed("inactive", true);
            break;
          case "healthcare":
            obesityLabel.classed("active", false).classed("inactive", true);
            smokesLabel.classed("active", false).classed("inactive", true);
            healthcareLabel.classed("active", true).classed("inactive", false);
            break;
        }
      }
    });
  });
} // end of function

makeResponsive();

// window resize event listener
d3.select(window).on("resize", makeResponsive);

