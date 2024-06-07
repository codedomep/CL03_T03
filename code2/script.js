// Select the SVG element and set up dimensions and margins
const svg = d3.select("svg"),
    margin = {top: 40, right: 20, bottom: 100, left: 100}, // Increased bottom and left margins
    width = +svg.attr("width") - margin.left - margin.right,
    height = +svg.attr("height") - margin.top - margin.bottom;

// Define the x and y scales for the chart
const x = d3.scaleBand().rangeRound([0, width]).padding(0.1),
    y = d3.scaleLinear().rangeRound([height, 0]);

// Append a 'g' element to the SVG, which will contain all other chart elements
const g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Create a tooltip div with initial opacity set to 0
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

// Load the data from the CSV file
d3.csv("visualization_data.csv").then(data => {
    // Convert string data to numbers and calculate derived values
    data.forEach(d => {
        d.year = +d.year;
        d.InfantDeaths = +d.InfantDeaths;
        d.avoidableDeaths = +d.avoidableDeaths;
        d.totalDeaths = d.avoidableDeaths; // Assuming totalDeaths equals avoidableDeaths
        d.otherDeaths = d.totalDeaths - d.InfantDeaths; // Calculate otherDeaths
    });

    // Set the domain for the x-axis using the years from the data
    x.domain(data.map(d => d.year));
    // Set the domain for the y-axis with a minimum of 30000 and a dynamic maximum
    y.domain([30000, d3.max(data, d => d.totalDeaths) + 250]);

    // Append and configure the x-axis
    g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x))
    .append("text")
    .attr("class", "axis-title")
    .attr("x", width / 2)
    .attr("y", 60) // Increased y position for better visibility
    .attr("fill", "#000") // Ensure the text color is visible
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold") // Make the text bold
    .text("Year");

    // Append and configure the y-axis
    g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).tickValues(d3.range(30000, d3.max(data, d => d.totalDeaths) + 250, 250))) // Set ticks to increment by 250
    .append("text")
    .attr("class", "axis-title")
    .attr("transform", "rotate(-90)")
    .attr("y", -50) // Adjusted to not be too far from the y-axis
    .attr("x", -height / 2)
    .attr("dy", "-1.5em") // Adjusted dy for better alignment
    .attr("fill", "#000") // Ensure the text color is visible
    .style("text-anchor", "middle")
    .style("font-size", "16px")
    .style("font-weight", "bold") // Make the text bold
    .text("Total Deaths");

    // blue Bars - Representing Other Deaths
    g.selectAll(".bar.other")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar other")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.otherDeaths))  // Start at the top of other deaths
        .attr("width", x.bandwidth())
        .attr("height", d => y(30000) - y(d.otherDeaths))  // Height calculated correctly
        .attr("fill", "#0100f6")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.year}<br/><span class="bold blue-text">Other Deaths: ${d.otherDeaths}</span><br/><span class="bold black-bold">Total Avoidable Deaths: ${d.totalDeaths}</span>`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(event.currentTarget)
                .style("stroke", "black")
                .style("stroke-width", "3px");
        })
        .on("mouseout", (event, d) => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(event.currentTarget)
                .style("stroke", "none");
        })
        .on("error", (error, d) => {
            console.error("Error processing data for bar: ", d);
            // Optionally, handle the error visually in the chart
        });

    // red Bars - Representing Infant Deaths
    g.selectAll(".bar.infant")
        .data(data)
        .enter().append("rect")
        .attr("class", "bar infant")
        .attr("x", d => x(d.year))
        .attr("y", d => y(d.otherDeaths + d.InfantDeaths))  // Start from the top of other deaths + Infant Deaths
        .attr("width", x.bandwidth())
        .attr("height", d => y(d.otherDeaths) - y(d.otherDeaths + d.InfantDeaths))  // Height of the infant deaths portion only
        .attr("fill", "#df0304")
        .on("mouseover", (event, d) => {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`Year: ${d.year}<br/><span class="bold red-text">Infant Deaths: ${d.InfantDeaths}</span>`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
            d3.select(event.currentTarget)
                .style("stroke", "black")
                .style("stroke-width", "3px");
        })
        .on("mouseout", (event, d) => {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
            d3.select(event.currentTarget)
                .style("stroke", "none");
        })
        .on("error", (error, d) => {
            console.error("Error processing data for bar: ", d);
            // Optionally, handle the error visually in the chart
        });

}).catch(error => {
    console.error("Error loading the data: ", error);
    // Handle the error more visibly if needed, e.g., display a message on the webpage
    d3.select("body").append("p")
        .text("Failed to load data. Please try again later.")
        .style("color", "red")
        .style("font-size", "16px");
});
