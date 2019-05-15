// Unit 16 Assignment - Data Journalism and D3
// by Christopher Reutz

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
    top: 100,
    right: 150,
    bottom: 100,
    left: 100
  };

  // scatter plot area = SVG area minus margins
  var height = svgHeight - margin.top - margin.bottom;
  var width = svgWidth - margin.left - margin.right;

  // create SVG container
  var svg = d3.select("#scatter")
    .append("svg")
    .attr("height", svgHeight)
    .attr("width", svgWidth);

  // append SVG group and transform to the margins
  var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
  // function for updating scale when axis label is clicked
  function axisScale(acsData, chosenAxis, whichAxis) {
    switch(whichAxis) {
      case "x_axis":
        var range1 = 0;
        var range2 = width;
        break;  
      case "y_axis":
        var range1 = height;
        var range2 = 0;
        break;        
    }
    var linearScale = d3.scaleLinear()
      .domain([d3.min(acsData, d => d[chosenAxis]) * 0.95,
        d3.max(acsData, d => d[chosenAxis]) * 1.05])
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
      .offset([-8, 0])
      .html(function(d) {
        return (`<strong>${d.state}</strong><br>${xlabel} ${d[chosenXAxis]}
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

  // data retrieval
  d3.csv("assets/data/data.csv", function(err, acsData) {
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
      .attr("transform", `translate(0, ${height})`)
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
      .attr("r", 14)
      .attr("fill", "steelblue")
      .attr("opacity", ".65");
  
    // create x-axis group labels
    var xlabelsGroup = chartGroup.append("g")
      .attr("transform", `translate(${width / 2}, ${height + 20})`);
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
    var ylabelsGroup = chartGroup.append("g");
    var obesityLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "obesity")
      .attr("dy", "4em")
      .classed("active", true)
      .text("Obesity (%)");
    var smokesLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "smokes")
      .attr("dy", "2.5em")
      .classed("inactive", true)
      .text("Smokes (%)");
    var healthcareLabel = ylabelsGroup.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left)
      .attr("x", 0 - (height / 2))
      .attr("value", "healthcare")
      .attr("dy", "1em")
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

// initial default axes
var chosenXAxis = "poverty";
var chosenYAxis = "obesity";

makeResponsive();

// window resize event listener
d3.select(window).on("resize", makeResponsive);

