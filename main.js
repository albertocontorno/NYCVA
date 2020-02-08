barChart_margin = {top: 20, right: 20, bottom: 30, left: 80};
const barChartSvg = d3.select("#barchart_avgPrizePerZone").append("g").attr("transform", "translate(" + barChart_margin.left + "," + barChart_margin.top + ")");

scatterPlot_margin = {top: 10, right: 30, bottom: 30, left: 60};
const scatterPlotSvg = d3.select("#location_scatter_plot").append("g").attr("transform", "translate(" + scatterPlot_margin.left + "," + scatterPlot_margin.top + ")");

d3.csv("./NYC_AirBnB_announcements.csv").then(function(data){

    plotPricePerHoodChart(data);
    //plotLocationScatterPlot(data);

});


function plotPricePerHoodChart(data) {
    data = data.sort( (a,b)=> a["price"] - b["price"]);
    console.log(data[0]);

    const dataByHood = d3.nest()
        .key(function(d) { return d["neighbourhood_group"]; })
        .rollup(function(v) { return d3.mean(v, (el) => el["price"]) })
        .entries(data);

    dataByHood.sort( (a,b)=> b["value"] - a["value"]);

    createPricePerHoodChart(barChartSvg, dataByHood);

    window.onresize = createPricePerHoodChart.bind(null, barChartSvg, dataByHood);
}

function createPricePerHoodChart(el, dataByHood){
    let g = el;
    let width = +document.querySelector("#barchart_avgPrizePerZone").clientWidth - barChart_margin.left - barChart_margin.right;
    let height = +document.querySelector("#barchart_avgPrizePerZone").clientHeight - barChart_margin.top - barChart_margin.bottom;

    // Create scale
    const x_scale = d3.scaleLinear()
                  .domain([0, d3.max(dataByHood, (d)=>d["value"])])
                  .range([0, width]);

    // Add scales to axis
    const x_axis = d3.axisBottom().scale(x_scale);
    
    const y_scale = d3.scaleBand()
        .domain(dataByHood.map( el => el["key"]))
        .rangeRound([0, height]).paddingOuter(0.1).paddingInner(0.2)


    const y_axis = d3.axisLeft(y_scale);

    let barChart = new Barchart(dataByHood, width, height, x_axis, y_axis, x_scale, y_scale);
    barChart.dataValueAccessorFn = d => d["value"];
    barChart.dataLabelAccessorFn = d => d["value"];
    barChart.labelFn = d => "$" + Math.fround( d["value"]).toFixed(2);
    barChart.draw(g);
}



function plotLocationScatterPlot(data) {

    scatterPlotSvg.append('svg:image')
        .attr('xlink:href', './New_York_City_.png')
        .attr("width", 800)
        .attr("height", 800)
        .attr("x", -15)
        .attr("y", -15);

    var latAndLong = data.map(function(d) {
        return {
            lat: d.latitude,
            lon: d.longitude
        }
    });

    let height = +document.querySelector("#location_scatter_plot").clientHeight - scatterPlot_margin.top - scatterPlot_margin.bottom;
    let width = +height;

    // Add X axis
    var x = d3.scaleLinear()
        .domain([d3.min(latAndLong, (d)=>+d.lon), d3.max(latAndLong, (d)=>+d.lon)])
        .range([ 0, width ]);
    scatterPlotSvg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    // Add Y axis
    var y = d3.scaleLinear()
        .domain([d3.min(latAndLong, (d)=>+d.lat), d3.max(latAndLong, (d)=>+d.lat)])
        .range([ height, 0]);
    scatterPlotSvg.append("g")
        .call(d3.axisLeft(y));

    // Add dots
    scatterPlotSvg.append('g')
        .selectAll("dot")
        .data(latAndLong)
        .enter()
        .append("circle")
        .attr("cx", function (d) { return x(+d.lon); } )
        .attr("cy", function (d) { return y(+d.lat); } )
        .attr("r", 1.0)
        .style("fill", "#69b3a2");

}
