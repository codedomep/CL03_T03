const svg = d3.select("svg"),
    margin = {top: 40, right: 20, bottom: 70, left: 80}, // Increased margins
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the data from the CSV file
d3.csv("visualization_data.csv").then(data => {
    data.forEach(d => {
        d.year = +d.year;
        d.InfantDeaths = +d.InfantDeaths;
        d.avoidableDeaths = +d.avoidableDeaths;
        d.totalDeaths = d.avoidableDeaths;
        d.otherDeaths = d.totalDeaths - d.InfantDeaths;
    });

    x.domain(data.map(d => d.year));
    y.domain([30000, d3.max(data, d => d.totalDeaths) + 250]);

    // Append the x-axis
    g.append("g")
        .attr("class", "axis axis--x")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x))
      .append("text")
        .attr("class", "axis-title")
        .attr("x", width / 2)
        .attr("y", 45) // Adjusted y position for x-axis label
        .style("text-anchor", "middle")
        .text("Year");

    // Append the y-axis
    g.append("g")
        .attr("class", "axis axis--y")
        .call(d3.axisLeft(y).tickValues(d3.range(30000, d3.max(data, d => d.totalDeaths) + 500, 250)))
      .append("text")
        .attr("class", "axis-title")
        .attr("transform", "rotate(-90)")
        .attr("y", -60) // Adjusted y position for y-axis label
        .attr("x", -height / 2)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Total Deaths");

    // Add graph title
    svg.append("text")
        .attr("class", "graph-title")
        .attr("x", (width / 2) + margin.left)
        .attr("y", 20) // Adjusted y position for graph title
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Visualization of Deaths by Year");

    g.selectAll(".bar")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.totalDeaths))
        .attr("width", x.bandwidth())
        .attr("height", d => Math.abs(y(30000) - y(d.totalDeaths)))
        .attr("fill", "red")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.year}<br/>Infant Deaths: ${d.InfantDeaths}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });

    g.selectAll(".bar.other")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar other")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.totalDeaths))
        .attr("width", x.bandwidth())
        .attr("height", d => Math.abs(y(30000) - y(d.otherDeaths)))
        .attr("fill", "blue")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.year}<br/>Infant Deaths: ${d.InfantDeaths}<br/>Total Avoidable Deaths: ${d.totalDeaths}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", d => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        });
}).catch(error => {
    console.error("Error loading the data: ", error);
});
