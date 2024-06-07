const svg = d3.select("svg"), // Select the SVG element
      margin = {top: 20, right: 20, bottom: 70, left: 70}, // Define margins
      width = 960 - margin.left - margin.right, // Calculate width
      height = 650 - margin.top - margin.bottom, // Calculate height
      g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`); // Append group element and transform

const x = d3.scaleLinear().rangeRound([0, width]); // Define x scale
const y = d3.scaleLinear().rangeRound([height, 0]); // Define y scale

// Load the data from two CSV files
Promise.all([
    d3.csv("mortality.csv"), // Load mortality data
    d3.csv("birthweight.csv") // Load birthweight data
]).then(data => {
    const [mortalityData, birthWeightData] = data; // Destructure data

    // Process data to synchronize years
    const combinedData = mortalityData.map(md => ({
        year: +md.year, // Convert year to number
        mortalityRate: +md.mortalityRate, // Convert mortality rate to number
        lowBirthWeight: birthWeightData.find(bw => bw.year === md.year)?.lowBirthWeight || 0 // Find corresponding birthweight data
    }));

    x.domain(d3.extent(combinedData, d => d.year)); // Set x domain
    const maxDataValue = d3.max(combinedData, d => Math.max(d.mortalityRate, d.lowBirthWeight)); // Find max data value
    y.domain([0, maxDataValue]); // Set y domain

    g.append("g")
     .attr("transform", `translate(0,${height})`) // Transform x-axis
     .call(d3.axisBottom(x).tickFormat(d3.format("d"))) // Call x-axis
     .append("text")
     .attr("fill", "#000")
     .attr("x", width / 2) // Position x-axis label
     .attr("y", margin.bottom - 16)
     .attr("dy", "0.71em")
     .attr("text-anchor", "middle")
     .style("font", "bold 16px sans-serif")
     .text("Year"); // Set x-axis label

    g.append("g")
     .call(d3.axisLeft(y).tickValues(d3.range(0, maxDataValue + 0.2, 0.2))) // Call y-axis
     .append("text")
     .attr("fill", "#000")
     .attr("transform", "rotate(-90)") // Rotate y-axis label
     .attr("y", 6 - margin.left)
     .attr("x", -height / 2)
     .attr("dy", "0.71em")
     .attr("text-anchor", "middle")
     .style("font", "bold 16px sans-serif")
     .text("Rate"); // Set y-axis label

    const line = d3.line()
                  .x(d => x(d.year)) // Define x for line
                  .y(d => y(d.mortalityRate)); // Define y for line

    const line2 = d3.line()
                   .x(d => x(d.year)) // Define x for second line
                   .y(d => y(d.lowBirthWeight)); // Define y for second line

    g.append("path")
     .datum(combinedData)
     .attr("fill", "none")
     .attr("stroke", "#04a879") // Set stroke color for first line
     .attr("stroke-width", 2.5)
     .attr("d", line); // Draw first line

    g.append("path")
     .datum(combinedData)
     .attr("fill", "none")
     .attr("stroke", "#d83227") // Set stroke color for second line
     .attr("stroke-width", 2.5)
     .attr("d", line2); // Draw second line

    // Tooltip
    const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("opacity", 0)
                      .style("background", "white")
                      .style("border", "3px solid #333")
                      .style("padding", "10px")
                      .style("color", "#333")
                      .style("font", "bold 14px sans-serif"); // Define tooltip

    // Create interactive circles for the lines
    const createCircles = (className, color, dataKey, label) => {
      g.selectAll("." + className)
        .data(combinedData)
        .enter().append("circle")
        .attr("class", className)
        .attr("cx", d => x(d.year)) // Set x position for circles
        .attr("cy", d => y(d[dataKey])) // Set y position for circles
        .attr("r", 5)
        .style("fill", color) // Set fill color for circles
        .on("mouseover", function(event, d) {
          d3.select(this).transition().duration(200).attr("r", 10).style("stroke", "black").style("stroke-width", "2px"); // Enlarge circle on hover
          tooltip.transition().duration(200).style("opacity", 1); // Show tooltip on hover
          tooltip.html(`Year: ${d.year}<br/><span class="bold" style="color:${color};">${label}: ${d[dataKey]}</span>`)
                 .style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(500).attr("r", 5).style("stroke", "none"); // Reset circle on mouse out
          tooltip.transition().duration(500).style("opacity", 0); // Hide tooltip on mouse out
        });
    };

    createCircles("dot1", "#04a879", "mortalityRate", "Mortality Rate"); // Create circles for mortality rate
    createCircles("dot2", "#d83227", "lowBirthWeight", "Low Birth Weight"); // Create circles for low birth weight
}).catch(error => {
    console.error('Error loading or processing data:', error); // Log error
    // Optionally, display an error message on the webpage
    d3.select("body").append("div")
      .attr("class", "error-message")
      .text("Error loading or processing data. Please try again later."); // Display error message
});
