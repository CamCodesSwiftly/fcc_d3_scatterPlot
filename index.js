// TODO: FINAL -> Port to codepen.io and submit

const body = document.querySelector("body");
const w = 1000;
const h = 600;
const padding = 50;

fetch(
	"https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json"
)
	.then((response) => response.json())
	.then((data) => {
		console.table(data);
		const timeFormat = d3.timeFormat("%M:%S");
		const timeSpecifier = "%M:%S";
		const dataset = data.map(({ Year, Time, Name, Doping }) => [
			Year,
			d3.timeParse(timeSpecifier)(Time),
			Name,
			Doping,
		]);
		// console.table(dataset);
		const rawTime = data.map((el) => el.Time);
		// * SVG BASE SETUP
		const svg = d3
			.select("body")
			.append("svg")
			.attr("width", w)
			.attr("height", h);
		// * SCALE FUNCTIONS
		const xScale = d3
			.scaleLinear()
			.domain([d3.min(data, (d) => d.Year), d3.max(data, (d) => d.Year)])
			.range([padding, w - padding]);

		const parsedTimeData = data.map((el) =>
			d3.timeParse(timeSpecifier)(el.Time)
		);
		const yScale = d3
			.scaleLinear()
			.domain([d3.max(parsedTimeData), d3.min(parsedTimeData)])
			.range([h - padding, padding]);
		// * AXES
		const xAxisFormat = d3.format("d");
		const xAxis = d3.axisBottom(xScale).tickFormat(xAxisFormat);
		const yAxis = d3
			.axisLeft(yScale)
			.tickFormat((d) => d3.timeFormat(timeSpecifier)(d));
		svg.append("g")
			.attr("transform", "translate(0," + (h - padding) + ")")
			.attr("id", "x-axis")
			.call(xAxis);
		svg.append("g")
			.attr("transform", "translate(" + padding + ", 0)")
			.attr("id", "y-axis")
			.call(yAxis);
		// * TOOLTIP
		let tooltip = d3
			.select("body")
			.data(dataset)
			.append("div")
			.attr("id", "tooltip");
		// * LEGEND
		const legendData = [
			"No Doping Allegations",
			"Rider with Doping Allegations",
		];
		const legend = d3
			.select("body")
			.append("svg")
			.attr("id", "legend")
			.attr("width", 1000)
			.attr("height", 600)
			.attr("transform", "translate(800, -400)");
		const legendItems = legend
			.append("g")
			.attr("class", "legend-items")
			.attr("transform", "translate(20, 20)");
		const items = legendItems
			.selectAll("g")
			.data(legendData)
			.enter()
			.append("g")
			.attr("class", "legend-item")
			.attr("transform", (d, i) => "translate(0," + i * 20 + ")");
		function getColorForCategory(i) {
			return i === 0 ? "red" : "blue";
		}
		items
			.append("rect")
			.attr("x", 0)
			.attr("y", 0)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", (d, i) => {
				// Apply appropriate color for each category
				return getColorForCategory(i);
			});
		items
			.append("text")
			.attr("x", 15)
			.attr("y", 9)
			.attr("dy", "0.35em")
			.text((d) => d);

		// * GRAPH
		svg.selectAll("circle")
			.data(dataset)
			.enter()
			.append("circle")
			.attr("cx", (d, i) => {
				return xScale(d[0]);
			})
			.attr("cy", (d, i) => {
				return yScale(d[1]);
			})
			.attr("r", 6)
			.attr("class", "dot")
			.attr("data-xvalue", (d) => d[0])
			.attr("data-yvalue", (d) => d[1])
			.attr("data-name", (d) => d[2])
			.attr("data-doping", (d) => d[3])
			.attr("fill", (d) => {
				return d[3] === "" ? "green" : "darkred";
			})
			.attr("stroke", "black")
			.attr("stroke-width", 1)
			.on("mouseover", function () {
				const year = d3.select(this).attr("data-xvalue");
				const name = d3.select(this).attr("data-name");
				const doping = d3.select(this).attr("data-doping");

				const time = d3.select(this).attr("data-yvalue");
				const date = new Date(time);
				const formattedTime = `${date.getMinutes()}:${date.getSeconds()}`;

				tooltip.attr("data-year", year);
				tooltip.transition().duration(200).style("opacity", 0.9);
				// prettier-ignore
				return tooltip
				.html("<div id='legend'><p>Year: "+ year + " | Time: " + formattedTime +"</p><p>"+ name + "</p><p>"+ doping +"</p></div>")
				.style("left", (event.pageX + 30) + "px")
                .style("top", (event.pageY + -50) + "px");
				// .style("top","400px");
			})
			.on("mouseout", function () {
				tooltip.transition().duration(200).style("opacity", 0);
			});
	});
