// Set up margins, width, and height for the chart
const margin = { top: 20, right: 70, bottom: 50, left: 50 },
      width = 960 - margin.left - margin.right,
      height = 500 - margin.top - margin.bottom;

// Adjust SVG dimensions to include extra space for the legend
const svgWidth = width + margin.left + margin.right + 150;
const svgHeight = height + margin.top + margin.bottom;

// Append SVG object to the div and set its dimensions
const svg = d3.select("#chart").append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Set up scales for x, y, and bubble size
const x = d3.scaleLinear().range([0, width]);
const y = d3.scaleLinear().range([height, 0]);
const z = d3.scaleSqrt().range([3, 75]);  // Bubble size visibility adjustment

// Define a new scale for radius changes with increased size
const zAdjusted = d3.scaleSqrt()
    .range([3, 75 * 1.20])  // Increase the maximum radius by 20%
    .domain(z.domain().map(d => d * 2));  // Double the effect on domain

// Create x and y axes
const xAxis = svg.append("g").attr("transform", `translate(0,${height})`);
const yAxis = svg.append("g");

// Set up tooltip for interactivity
const tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")  // Set class for CSS styling
    .style("opacity", 0)  // Initially hide tooltip
    .style("background", "#fff")  // White background for readability
    .style("border", "2px solid #333")  // Solid border for visibility
    .style("color", "#333")  // Text color
    .style("font", "14px sans-serif")  // Font styling
    .style("width", "180px");  // Fixed width for consistent appearance

// Define color mapping for different diseases
const colorMap = {
    "DTP": "#d83227",        // Color for DTP
    "Measles": "#04a879",    // Color for Measles
    "Hepatitis B": "#343435" // Color for Hepatitis B
};

// X-axis legend
svg.append("text")
    .attr("class", "axis-legend")  // Assign class for CSS styling
    .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)  // Center the text below the x-axis
    .style("text-anchor", "middle")  // Center the text horizontally
    .text("Immunisation Rate (%)");  // Label for the x-axis
// Y-axis legend
svg.append("text")
    .attr("class", "axis-legend")  // Assign class for CSS styling
    .attr("transform", "rotate(-90)")  // Rotate label for vertical axis
    .attr("y", 0 - margin.left)  // Position label along the y-axis
    .attr("x", 0 - (height / 2))  // Center label along the x-axis
    .attr("dy", "1em")  // Adjust position slightly for better alignment
    .style("text-anchor", "middle")  // Center text alignment
    .text("Mortality Rate (%)");  // Set the text of the label

// Create legend for disease color mapping
const legend = svg.append("g")
    .attr("class", "legend")  // Assign class for CSS styling
    .attr("transform", `translate(${width + 50}, ${height - 100})`)  // Position the legend on the SVG
    .on("mouseover", function() {
        legendBackground.style("stroke", "black");  // Change border color to black on mouseover
    })
    .on("mouseout", function() {
        legendBackground.style("stroke", "#ccc");  // Revert border color on mouseout
    });

// Calculate legend dimensions
const legendPadding = 10;  // Padding around the legend
const legendItemHeight = 20;  // Height of each item in the legend
const legendWidth = 130;  // Width of the legend
const legendHeight = Object.keys(colorMap).length * legendItemHeight + 2 * legendPadding;  // Total height of the legend

// Add a background rectangle for the legend
const legendBackground = legend.append("rect")
    .attr("x", -legendPadding)  // Set x position considering padding
    .attr("y", -legendPadding)  // Set y position considering padding
    .attr("width", legendWidth)  // Set the width of the background
    .attr("height", legendHeight)  // Set the height of the background
    .style("fill", "#fff")  // Background color white
    .style("stroke", "#ccc")  // Border color light grey
    .style("stroke-width", "1px");  // Border width

// Create legend items for each disease
Object.entries(colorMap).forEach(([disease, color], index) => {
    const legendItem = legend.append("g")
        .attr("transform", `translate(0, ${index * legendItemHeight})`)  // Position each legend item
        .attr("class", "legend-item")  // Assign class for styling
        .style("cursor", "pointer")  // Change cursor to pointer on hover
        .on("click", function() {
            // Highlight corresponding bubbles when legend item is clicked
            svg.selectAll(".bubble")
                .filter(d => d.disease === disease)
                .transition().duration(200)  // Short transition to black
                .attr("fill", "black")
                .transition().duration(800)  // Transition back to original color
                .attr("fill", d => d.color);
        });

    const rect = legendItem.append("rect")
        .attr("width", 18)  // Set rectangle width
        .attr("height", 18)  // Set rectangle height
        .style("fill", color)  // Fill color based on disease
        .style("stroke", "#ccc")  // Default stroke color
        .style("stroke-width", "1px")  // Stroke width
        .on("mouseover", function() {
            d3.select(this).style("stroke", "black");  // Change stroke to black on hover
        })
        .on("mouseout", function() {
            d3.select(this).style("stroke", "#ccc");  // Revert stroke color on mouse out
        });

    legendItem.append("text")
        .attr("x", 24)  // Set the x position for the text
        .attr("y", 9)   // Set the y position for the text
        .attr("dy", "0.35em")  // Adjust text position vertically
        .style("text-anchor", "start")  // Align text to the start
        .text(disease);  // Display the disease name

});

// Load data from CSV files
Promise.all([
    d3.csv("Immunisations.csv"),
    d3.csv("Avoidable_Mortality.csv")
]).then(function(files) {
    const immunisations = files[0];  // First dataset
    const mortality = files[1];  // Second dataset

    if (!immunisations || !mortality) {
        throw new Error("Data loading failed: One of the datasets is undefined.");  // Error handling for undefined datasets
    }

    // Convert and structure immunisation data
    const immunisationData = immunisations.map(d => {
        if (!d.year || !d.disease || !d.rate) {
            console.error("Missing data fields in immunisations dataset", d);  // Log error for missing fields
        }
        return {
            year: +d.year,  // Convert year to number
            disease: d.disease,  // Disease name
            rate: +d.rate  // Convert rate to number
        };
    });

    // Convert and structure mortality data
    const mortalityData = mortality.map(d => {
        if (!d.year || !d.disease || !d.mortalityRate) {
            console.error("Missing data fields in mortality dataset", d);  // Log error if data fields are missing
        }
        return {
            year: +d.year,  // Convert year to number
            disease: d.disease,  // Extract disease name
            mortalityRate: +d.mortalityRate  // Convert mortality rate to number
        };
    });

    // Combine data based on year and disease
    const combinedData = immunisationData.map(d => {
        const mortalityEntry = mortalityData.find(m => m.year === d.year && m.disease === d.disease);  // Find matching mortality data
        if (!mortalityEntry) {
            console.error("Matching mortality data not found", d);  // Log error if no matching data found
        }
        return {
            year: d.year,  // Year of data
            disease: d.disease,  // Disease name
            rate: d.rate,  // Immunisation rate
            mortalityRate: mortalityEntry ? mortalityEntry.mortalityRate : 0,  // Use mortality rate if found, else 0
            color: colorMap[d.disease]  // Assign color based on disease
        };
    });

    // Update scale domains based on data
    x.domain([60, d3.max(combinedData, d => d.rate)]);
    y.domain([10, 50]); // Changed this line to set the maximum limit of y-axis to 60
    z.domain([0, d3.max(combinedData, d => d.mortalityRate)]);
    zAdjusted.domain([0, d3.max(combinedData, d => d.mortalityRate) * 2]);  // Double the domain

    // Update axes
    xAxis.call(d3.axisBottom(x)); // Set up the bottom axis using the x scale
    yAxis.call(d3.axisLeft(y)); // Set up the left axis using the y scale

    function update(year) {
        const yearData = combinedData.filter(d => d.year === +year); // Filter data for the selected year
        if (yearData.length === 0) {
            console.error("No data available for the selected year", year); // Log error if no data for the year
        }
        const bubbles = svg.selectAll(".bubble").data(yearData, d => d.disease); // Bind year-specific data to bubbles

        // Enter + update
        const bubblesEnter = bubbles.enter()
            .append("circle")
            .attr("class", "bubble"); // Append new bubbles for new data entries

        bubblesEnter.merge(bubbles)
            .transition().duration(500) // Animate transitions with 500ms duration
            .attr("cx", d => x(d.rate)) // Set the x-coordinate based on immunisation rate
            .attr("cy", d => y(d.mortalityRate)) // Set the y-coordinate based on mortality rate
            .attr("r", d => zAdjusted(d.mortalityRate)) // Set the radius based on adjusted mortality rate
            .attr("fill", d => d.color) // Color the bubble based on the disease
            .attr("stroke", "#fff") // Set bubble border color to white
            .attr("stroke-width", 1.5); // Set bubble border width

        // Set up event handlers for both entering and updating nodes
        bubblesEnter.merge(bubbles)
            .on("mouseover", function(event, d) {
                tooltip.transition().duration(200).style("opacity", .9); // Show tooltip on mouseover with transition
                tooltip.html(`Disease: <span style="color: ${d.color}; font-weight: bold;">${d.disease}</span><br/>
                              <strong style="color: black;">Immunisation: </strong>${d.rate}%<br/>
                              <strong style="color: black;">Mortality Rate: </strong>${d.mortalityRate}`) // Tooltip content
                    .style("left", (event.pageX + 5) + "px") // Position tooltip near the mouse
                    .style("top", (event.pageY - 28) + "px");
                d3.select(this).style("stroke", "black").style("stroke-width", "3px"); // Highlight bubble border on hover
            })
            .on("mouseout", function(d) {
                tooltip.transition().duration(500).style("opacity", 0); // Hide tooltip on mouseout
                d3.select(this).style("stroke", "#fff").style("stroke-width", 1.5); // Reset bubble border after hover
            });

        bubbles.exit().remove(); // Remove bubbles that no longer have corresponding data

        document.getElementById("year-value").textContent = year; // Display the currently selected year
    }

    // Initial update
    update(document.getElementById("year-slider").value); // Initial update based on the current slider value

    // Slider interaction
    document.getElementById("year-slider").addEventListener("input", function() {
        update(this.value); // Update visualization when slider value changes
    });
}).catch(function(error){
    console.error('Error loading or processing data:', error); // Log errors if data loading or processing fails
});
