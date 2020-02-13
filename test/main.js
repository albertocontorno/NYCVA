barChart_margin = {top: 20, right: 20, bottom: 30, left: 80};
const barChartSvg = d3.select("#barchart_avgPrizePerZone").append("g").attr("transform", "translate(" + barChart_margin.left + "," + barChart_margin.top + ")");

scatterPlot_margin = {top: 10, right: 30, bottom: 30, left: 60};
const scatterPlotSvg = d3.select("#location_scatter_plot").append("g").attr("transform", "translate(" + scatterPlot_margin.left + "," + scatterPlot_margin.top + ")");

d3.csv("./NYC_AirBnB_announcements.csv").then(function(data){

    plotPricePerHoodChart(data);
    plotLocationScatterPlot(data);

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



function plotLocationScatterPlot(data_) {
    var data = data_.filter(d => d.price < 500)
    function unpack(rows, key) {
        return rows.map(function(row) {
            return row[key];
        });
    }
    console.log("LENGTH", data.length)
    
    var color_scale = d3.scaleLinear()
            .domain([d3.min(data, function(d){return +d.price}),  d3.max(data, function(d){return +d.price})])
            
    var accent = d3.interpolateRdYlGn;


    console.log((color_scale(150)))
    console.log((color_scale(144)))
    console.log([d3.min(data, function(d){return +d.price}),  d3.max(data, function(d){return +d.price})])
    console.log(d3.schemeRdYlGn)
    var quantileScale_ = d3.scaleQuantile().domain([0, 500]).range(d3.schemeRdYlGn[11].reverse())
    console.log(quantileScale_.quantiles(), quantileScale_(75))

    function unpackColor(rows, key){
        return rows.map(function(row) {
            return quantileScale_(+row[key]);
        });
    }


    var plotData = [
        {
            type: "scattermapbox",
            text: unpack(data, "price"),
            lon: unpack(data, "longitude"),
            lat: unpack(data, "latitude"),
            //marker: { color: function(d){return accent(d)}, size: 4 }
            marker: {color: unpackColor(data, 'price')}
        }
    ];

    var layout = {
        dragmode: "zoom",
        mapbox: { style: "open-street-map", center: { lat: 40.75, lon: -73.94 }, zoom: 13 },
        margin: { r: 0, t: 0, b: 0, l: 0 },
    };

    Plotly.newPlot("scatter_map_container", plotData, layout);
}
