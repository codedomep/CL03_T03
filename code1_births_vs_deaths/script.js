const svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 50, left: 50},
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

const x = d3.scaleLinear().rangeRound([0, width]);
const y = d3.scaleLinear().rangeRound([height, 0]);

// Load the data from two CSV files
Promise.all([
    d3.csv("mortality.csv"),
    d3.csv("birthweight.csv")
]).then(data => {
    const [mortalityData, birthWeightData] = data;

    // Process data to synchronize years
    const combinedData = mortalityData.map(md => ({
        year: +md.year,
        mortalityRate: +md.mortalityRate,
        lowBirthWeight: birthWeightData.find(bw => bw.year === md.year).lowBirthWeight
    }));

    x.domain(d3.extent(combinedData, d => d.year));
    y.domain([0, d3.max(combinedData, d => Math.max(d.mortalityRate, d.lowBirthWeight))]);

    g.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")))
     .append("text")
     .attr("fill", "#000")
     .attr("x", width / 2)
     .attr("y", margin.bottom - 16)
     .attr("dy", "0.71em")
     .attr("text-anchor", "middle")  // Center the text
     .style("font", "bold 16px sans-serif")
     .text("Year");

    g.append("g")
     .call(d3.axisLeft(y).ticks(d3.max(combinedData, d => Math.max(d.mortalityRate, d.lowBirthWeight)) / 0.5))
     .append("text")
     .attr("fill", "#000")
     .attr("transform", "rotate(-90)")
     .attr("y", 6 - margin.left)
     .attr("x", -height / 2)  // Adjust x position for centered alignment
     .attr("dy", "0.71em")
     .attr("text-anchor", "middle")  // Center the text
     .style("font", "bold 16px sans-serif")
     .text("Rate");

    const line = d3.line()
                  .x(d => x(d.year))
                  .y(d => y(d.mortalityRate));

    const line2 = d3.line()
                   .x(d => x(d.year))
                   .y(d => y(d.lowBirthWeight));

    g.append("path")
     .datum(combinedData)
     .attr("fill", "none")
     .attr("stroke", "steelblue")
     .attr("stroke-width", 2.5)
     .attr("d", line);

    g.append("path")
     .datum(combinedData)
     .attr("fill", "none")
     .attr("stroke", "orange")
     .attr("stroke-width", 2.5)
     .attr("d", line2);

    // Tooltip for interactivity
    const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("opacity", 0);

    // Create circles for the first line
    g.selectAll(".dot1")
      .data(combinedData)
      .enter().append("circle")
      .attr("class", "dot1")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.mortalityRate))
      .attr("r", 5) // Visible circle radius
      .style("fill", "black");

    // Create invisible circles for hover interaction on the first line
    g.selectAll(".dot-hover1")
      .data(combinedData)
      .enter().append("circle")
      .attr("class", "dot-hover1")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.mortalityRate))
      .attr("r", 10) // Increased radius for hover
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", (event, d) => {
        tooltip.transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(`Year: ${d.year}<br/>Mortality Rate: ${d.mortalityRate}<br/>Low Birth Weight: ${d.lowBirthWeight}`)
               .style("left", (event.pageX) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });

    // Repeat for the second line
    g.selectAll(".dot2")
      .data(combinedData)
      .enter().append("circle")
      .attr("class", "dot2")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.lowBirthWeight))
      .attr("r", 5) // Visible circle radius
      .style("fill", "black");

    g.selectAll(".dot-hover2")
      .data(combinedData)
      .enter().append("circle")
      .attr("class", "dot-hover2")
      .attr("cx", d => x(d.year))
      .attr("cy", d => y(d.lowBirthWeight))
      .attr("r", 10) // Increased radius for hover
      .style("fill", "none")
      .style("pointer-events", "all")
      .on("mouseover", (event, d) => {
        tooltip.transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(`Year: ${d.year}<br/>Mortality Rate: ${d.mortalityRate}<br/>Low Birth Weight: ${d.lowBirthWeight}`)
               .style("left", (event.pageX) + "px")
               .style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", () => {
        tooltip.transition()
               .duration(500)
               .style("opacity", 0);
      });
});

