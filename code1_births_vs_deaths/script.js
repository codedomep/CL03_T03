const svg = d3.select("svg"),
      margin = {top: 20, right: 20, bottom: 70, left: 70},
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
        lowBirthWeight: birthWeightData.find(bw => bw.year === md.year)?.lowBirthWeight || 0
    }));

    x.domain(d3.extent(combinedData, d => d.year));
    const maxDataValue = d3.max(combinedData, d => Math.max(d.mortalityRate, d.lowBirthWeight));
    y.domain([0, maxDataValue]);

    g.append("g")
     .attr("transform", `translate(0,${height})`)
     .call(d3.axisBottom(x).tickFormat(d3.format("d")))
     .append("text")
     .attr("fill", "#000")
     .attr("x", width / 2)
     .attr("y", margin.bottom - 16)
     .attr("dy", "0.71em")
     .attr("text-anchor", "middle")
     .style("font", "bold 16px sans-serif")
     .text("Year");

    g.append("g")
     .call(d3.axisLeft(y).tickValues(d3.range(0, maxDataValue + 0.2, 0.2)))
     .append("text")
     .attr("fill", "#000")
     .attr("transform", "rotate(-90)")
     .attr("y", 6 - margin.left)
     .attr("x", -height / 2)
     .attr("dy", "0.71em")
     .attr("text-anchor", "middle")
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
     .attr("stroke", "blue")
     .attr("stroke-width", 2.5)
     .attr("d", line);

    g.append("path")
     .datum(combinedData)
     .attr("fill", "none")
     .attr("stroke", "red")
     .attr("stroke-width", 2.5)
     .attr("d", line2);

    // Tooltip
    const tooltip = d3.select("body").append("div")
                      .attr("class", "tooltip")
                      .style("position", "absolute")
                      .style("opacity", 0)
                      .style("background", "white")
                      .style("border", "3px solid #333")
                      .style("padding", "10px")
                      .style("color", "#333")
                      .style("font", "14px sans-serif");

    // Create interactive circles for the lines
    const createCircles = (className, color, dataKey, label) => {
      g.selectAll("." + className)
        .data(combinedData)
        .enter().append("circle")
        .attr("class", className)
        .attr("cx", d => x(d.year))
        .attr("cy", d => y(d[dataKey]))
        .attr("r", 5)
        .style("fill", color)
        .on("mouseover", function(event, d) {
          d3.select(this).transition().duration(200).attr("r", 10).style("stroke", "black").style("stroke-width", "2px");
          tooltip.transition().duration(200).style("opacity", 1);
          tooltip.html(`Year: ${d.year}<br/><span class="bold" style="color:${color};">${label}: ${d[dataKey]}</span>`)
                 .style("left", (event.pageX + 10) + "px")
                 .style("top", (event.pageY + 10) + "px");
        })
        .on("mouseout", function() {
          d3.select(this).transition().duration(500).attr("r", 5).style("stroke", "none");
          tooltip.transition().duration(500).style("opacity", 0);
        });
    };

    createCircles("dot1", "blue", "mortalityRate", "Mortality Rate");
    createCircles("dot2", "red", "lowBirthWeight", "Low Birth Weight");
});
